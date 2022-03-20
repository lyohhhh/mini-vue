import { mutableHandlers, readonlyHandles } from "./baseHandles";

/**
 * @description 创建响应式对象
 * @param { T } raw
 * @returns { T }
 */
export function reactive<T extends object>(raw: T): T {
  return createActiviedObject(raw, mutableHandlers);
}

/**
 * @description 创建只读对象
 * @param { T } raw
 * @returns { T }
 */
export function readonly<T extends object>(raw: T): T {
  return createActiviedObject(raw, readonlyHandles);
}

function createActiviedObject(raw, baseHandles) {
  return new Proxy(raw, baseHandles);
}
