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

export const enum ReactiveFlags {
  IS_REACTIVE = "__v_isReavtive",
  IS_READONLY = "__v_isReadonly",
}

/**
 * @description 判断是否为响应式对象
 * @param target
 * @returns { boolean } 是否是响应式对象
 */
export function isReactive(target): boolean {
  return !!target[ReactiveFlags.IS_REACTIVE];
}

/**
 * @description 判断是否为只读对象
 * @param target
 * @returns { boolean } 是否是只读对象
 */
export function isReadonly(target): boolean {
  return !!target[ReactiveFlags.IS_READONLY];
}
