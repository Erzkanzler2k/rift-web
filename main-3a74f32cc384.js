// Веб-клиент Rift.
//
// Сеть и криптография живут в Rust, собранном в wasm: этот файл только
// показывает интерфейс и передаёт команды ядру. Никакого своей криптографии
// здесь нет и быть не должно - иначе браузер и приложение разойдутся.

// Номер сборки подставляет publish.mjs. Он виден в интерфейсе: по нему
// сразу видно, какая версия загружена, - без этого приходилось гадать,
// почему у человека старое поведение при новом файле на сервере.
const BUILD_ID = "3a74f32cc384";

import init, {
  start,
  peer_id,
  connect,
  next_event,
  nickname,
  set_nickname,
  profile,
  send_message,
  messages,
  rooms as rooms_,
} from "./pkg-3a74f32cc384/rift_wasm.js";

const els = {
  peerId: document.getElementById("peer-id"),
  profile: document.getElementById("profile"),
  build: document.getElementById("build"),
  nickname: document.getElementById("nickname"),
  saveNickname: document.getElementById("save-nickname"),
  nicknameStatus: document.getElementById("nickname-status"),
  peerInput: document.getElementById("peer-input"),
  connect: document.getElementById("connect"),
  error: document.getElementById("error"),
  rooms: document.getElementById("rooms"),
  chatTitle: document.getElementById("chat-title"),
  status: document.getElementById("status"),
  messages: document.getElementById("messages"),
  composer: document.getElementById("composer"),
  message: document.getElementById("message"),
};

/** Показывает ошибку в окне. Пустая строка убирает её. */
function showError(text) {
  els.error.textContent = text || "";
}

/**
 * Приводит ошибку к читаемому тексту.
 *
 * Ошибка из ядра приходит объектом, а не строкой. Обычное `String(error)`
 * давало бы «[object Object]» - человеку не сказать ничего.
 */
function errorText(error) {
  if (!error) return "";
  if (typeof error === "string") return error;
  if (typeof error.message === "string" && error.message) return error.message;
  return String(error);
}

/** Список чатов: имя собеседника -> отображаемое имя. */
const rooms = new Map();
let activeRoom = null;

/**
 * Обновляет список чатов из ядра.
 *
 * Список приходит из модуля чата: там комнаты, которые действительно созданы
 * по рукопожатию, а не просто те, кому мы нажали «подключиться».
 */
function refreshRooms() {
  let list = [];
  try {
    list = JSON.parse(rooms_() || "[]");
  } catch (error) {
    showError(errorText(error));
    return;
  }
  rooms.clear();
  for (const item of list) {
    rooms.set(item.peer, { title: item.peer, room: item.room });
  }
  renderRooms();
}

function renderRooms() {
  els.rooms.replaceChildren();
  for (const [peer, item] of rooms) {
    const entry = document.createElement("li");
    entry.textContent = item.title;
    if (peer === activeRoom) entry.classList.add("active");
    entry.addEventListener("click", () => {
      activeRoom = peer;
      els.chatTitle.textContent = item.title;
      renderRooms();
      renderMessages(item.room);
    });
    els.rooms.append(entry);
  }
}

/** Показывает историю комнаты. */
function renderMessages(room) {
  els.messages.replaceChildren();
  let list = [];
  try {
    list = JSON.parse(messages(room) || "[]");
  } catch (error) {
    showError(errorText(error));
    return;
  }
  for (const item of list) {
    addMessage(item.body, item.sender === "я");
  }
}

function addMessage(text, mine) {
  const item = document.createElement("li");
  item.textContent = text;
  if (mine) item.classList.add("mine");
  els.messages.append(item);
  els.messages.scrollTop = els.messages.scrollHeight;
}

els.saveNickname.addEventListener("click", async () => {
  const name = els.nickname.value.trim();
  if (!name) {
    showError("ник не может быть пустым");
    return;
  }
  try {
    set_nickname(name);
    els.nicknameStatus.textContent = `ник: ${name}`;
    showError("");
  } catch (error) {
    showError(errorText(error));
  }
});

els.connect.addEventListener("click", async () => {
  const address = els.peerInput.value.trim();
  if (!address) {
    showError("укажите адрес собеседника");
    return;
  }
  els.connect.disabled = true;
  showError("");
  try {
    // Адрес приводится к виду, который понимает WebSocket-транспорт:
    // /ip4/host/tcp/port/ws
    const normalized = normalizeAddress(address);
    // connect возвращает peer ID собеседника: он узнаётся из рукопожатия.
    const peer = await connect(normalized);
    activeRoom = peer;
    els.chatTitle.textContent = peer;
    refreshRooms();
    els.status.textContent = "подключено";
  } catch (error) {
    showError(errorText(error));
  } finally {
    els.connect.disabled = false;
  }
});

/**
 * Приводит адрес к виду, который понимает транспорт.
 *
 * Человек может вставить то, что показало настольное приложение
 * (`/ip4/1.2.3.4/tcp/4001/p2p/<peer>`), либо просто `ws://host:port`.
 */
function normalizeAddress(address) {
  const trimmed = address.trim();
  if (trimmed.startsWith("ws://") || trimmed.startsWith("wss://")) {
    const url = new URL(trimmed);
    const host = url.hostname;
    const port = url.port || "80";
    // Путь в multiaddr у WebSocket задаётся особым протоколом: обычный
    // /ws всегда означает корень.
    const path = url.pathname && url.pathname !== "/" ? url.pathname : "";
    const scheme = path ? "x-parity-ws" : "ws";
    return `/ip4/${host}/tcp/${port}/${scheme}${path}`;
  }
  return trimmed;
}

els.composer.addEventListener("submit", async (event) => {
  event.preventDefault();
  const text = els.messageInput.value.trim();
  if (!text) return;
  if (!activeRoom) {
    showError("сначала выберите чат");
    return;
  }
  try {
    await send_message(activeRoom, text);
    els.messageInput.value = "";
    showError("");
  } catch (error) {
    showError(errorText(error));
  }
});

/** Читает сетевые события и обновляет окно. */
async function pump() {
  for (;;) {
    let event = "";
    try {
      event = await next_event(1000);
    } catch (error) {
      showError(errorText(error));
      return;
    }
    if (!event) continue;
    if (event.startsWith("connected:")) {
      els.status.textContent = "подключено";
    } else if (event.startsWith("disconnected:")) {
      els.status.textContent = "соединение потеряно";
    } else if (event.startsWith("message:")) {
      // Пришло сообщение: обновляем список чатов и открытый чат.
      const [, room, peer] = event.split(":");
      refreshRooms();
      if (activeRoom === peer) {
        renderMessages(room);
      }
    }
  }
}

async function main() {
  try {
    await init();
  } catch (error) {
    showError(`модуль не загрузился: ${error}`);
    return;
  }

  try {
    await start();
  } catch (error) {
    showError(`узел не поднялся: ${error}`);
    return;
  }

  els.peerId.textContent = peer_id();
  // Профиль виден явно: личность лежит в хранилище браузера, а оно общее
  // для всех вкладок сайта. Второй человек - это вкладка с ?profile=2.
  els.profile.textContent = `профиль: ${profile()}`;
  els.build.textContent = `сборка: ${BUILD_ID}`;

  const saved = nickname();
  if (saved) {
    els.nickname.value = saved;
    els.nicknameStatus.textContent = `ник: ${saved}`;
  }

  els.status.textContent = "готов";
  refreshRooms();
  pump();
  // Чаты появляются после рукопожатия, а оно занимает секунды: обновляем
  // список, пока он не перестанет меняться.
  setInterval(refreshRooms, 2000);
}

main();
