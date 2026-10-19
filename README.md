# Rift в браузере

P2P-мессенджер. Ядро написано на Rust и собрано в WebAssembly, поэтому
браузер говорит ровно по тому же протоколу, что и настольное приложение:
те же MLS-сессии, та же история, тот же формат кадров.

Никакого своего сервера: статика лежит на GitHub Pages, а соединения
идут напрямую между узлами.

## Что внутри

- `index.html`, `styles.css`, `main.js` — интерфейс.
- `pkg/` — ядро, собранное в wasm (сборка: `wasm-pack build crates/rift-wasm
  --target web --out-dir ../../web/pkg`).

## Сборка ядра

```shell
rustup target add wasm32-unknown-unknown
npx wasm-pack build crates/rift-wasm --target web --out-dir ../../web/pkg
```
