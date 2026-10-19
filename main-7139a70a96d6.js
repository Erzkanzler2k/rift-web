// Веб-клиент Rift.
//
// Сеть и криптография живут в Rust, собранном в wasm: этот файл только
// показывает интерфейс и передаёт команды ядру. Никакого своей криптографии
// здесь нет и быть не должно - иначе браузер и приложение разойдутся.

import init, {
  start,
  peer_id,
  connect,
  next_event,
  nickname,
  set_nickname,
  profile,
} from "./pkg-7139a70a96d6/rift_wasm.js";

const els = {
  peerId: document.getElementById("peer-id"),
  profile: document.getElementById("profile"),
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

function renderRooms() {
  els.rooms.replaceChildren();
  for (const [id, title] of rooms) {
    const item = document.createElement("li");
    item.textContent = title;
    if (id === activeRoom) item.classList.add("active");
    item.addEventListener("click", () => {
      activeRoom = id;
      els.chatTitle.textContent = title;
      renderRooms();
    });
    els.rooms.append(item);
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
    await connect(normalized);
    const peer = peer_id();
    rooms.set(peer, peer);
    renderRooms();
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
    return `/ip4/${host}/tcp/${port}/ws`;
  }
  return trimmed;
}

els.composer.addEventListener("submit", (event) => {
  event.preventDefault();
  showError("отправка появится вместе с MLS-сессией");
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

  const saved = nickname();
  if (saved) {
    els.nickname.value = saved;
    els.nicknameStatus.textContent = `ник: ${saved}`;
  }

  els.status.textContent = "готов";
  pump();
}

main();
