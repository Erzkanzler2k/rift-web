/* tslint:disable */
/* eslint-disable */

/**
 * Ошибка, понятная человеку: текст из ошибки попадает прямо в окно.
 */
export class WebError {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    readonly message: string;
}

/**
 * Подключается к узлу по адресу вида `ws://host:port`.
 *
 * Адрес - это то, что настольное приложение показывает в «Как меня найти».
 * Соединение идёт напрямую: браузер - клиент, сервера в середине нет.
 */
export function connect(address: string): Promise<string>;

/**
 * Читает один сетевой кадр.
 *
 * JavaScript вызывает это по кругу: кадр либо приходит, либо истекает
 * время. Отдельная подписка на события не нужна - так проще и надёжнее.
 */
export function next_event(timeout_ms: number): Promise<string>;

/**
 * Читает сохранённый ник.
 */
export function nickname(): string | undefined;

/**
 * Peer ID этого узла: его показывают собеседнику.
 */
export function peer_id(): string;

/**
 * Проверка, что модуль загрузился и криптография на месте.
 */
export function self_check(): boolean;

/**
 * Сохраняет ник.
 */
export function set_nickname(name: string): void;

/**
 * Поднимает узел в браузере.
 *
 * Ключ хранится в localStorage: без него при каждой перезагрузке страницы
 * человек получал бы новый peer ID, и его бы никто не нашёл.
 */
export function start(): Promise<void>;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
    readonly memory: WebAssembly.Memory;
    readonly __wbg_weberror_free: (a: number, b: number) => void;
    readonly connect: (a: number, b: number) => any;
    readonly next_event: (a: number) => any;
    readonly nickname: () => [number, number, number, number];
    readonly peer_id: () => [number, number, number, number];
    readonly self_check: () => number;
    readonly set_nickname: (a: number, b: number) => [number, number];
    readonly start: () => any;
    readonly weberror_message: (a: number) => [number, number];
    readonly wasm_bindgen_a27e486965d9a9ff___closure__destroy___dyn_core_608f92abc48d28da___ops__function__FnMut__web_sys_b262037b525d348___features__gen_CloseEvent__CloseEvent____Output_______: (a: number, b: number) => void;
    readonly wasm_bindgen_a27e486965d9a9ff___closure__destroy___dyn_core_608f92abc48d28da___ops__function__FnMut__wasm_bindgen_a27e486965d9a9ff___JsValue____Output_______: (a: number, b: number) => void;
    readonly wasm_bindgen_a27e486965d9a9ff___closure__destroy___dyn_core_608f92abc48d28da___ops__function__FnMut_____Output_______: (a: number, b: number) => void;
    readonly wasm_bindgen_a27e486965d9a9ff___convert__closures_____invoke___wasm_bindgen_a27e486965d9a9ff___JsValue__wasm_bindgen_a27e486965d9a9ff___JsValue_____: (a: number, b: number, c: any, d: any) => void;
    readonly wasm_bindgen_a27e486965d9a9ff___convert__closures_____invoke___web_sys_b262037b525d348___features__gen_CloseEvent__CloseEvent_____: (a: number, b: number, c: any) => void;
    readonly wasm_bindgen_a27e486965d9a9ff___convert__closures_____invoke___wasm_bindgen_a27e486965d9a9ff___JsValue_____: (a: number, b: number, c: any) => void;
    readonly wasm_bindgen_a27e486965d9a9ff___convert__closures_____invoke______: (a: number, b: number) => void;
    readonly __wbindgen_malloc: (a: number, b: number) => number;
    readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
    readonly __wbindgen_exn_store: (a: number) => void;
    readonly __externref_table_alloc: () => number;
    readonly __wbindgen_externrefs: WebAssembly.Table;
    readonly __wbindgen_free: (a: number, b: number, c: number) => void;
    readonly __externref_table_dealloc: (a: number) => void;
    readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;

/**
 * Instantiates the given `module`, which can either be bytes or
 * a precompiled `WebAssembly.Module`.
 *
 * @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
 *
 * @returns {InitOutput}
 */
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
 * If `module_or_path` is {RequestInfo} or {URL}, makes a request and
 * for everything else, calls `WebAssembly.instantiate` directly.
 *
 * @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
 *
 * @returns {Promise<InitOutput>}
 */
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
