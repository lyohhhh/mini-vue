import {
  mutableHandlers,
  readonlyHandles,
  shallowReactiveHandles,
  shallowReadonlyHandles,
} from "./baseHandles";

/**
 * @description 创建响应式对象
 * @param { T } raw
 * @returns { T }
 */
export function reactive<T extends object | unknown>(raw: T): T {
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

export function shallowReadonly<T extends object>(raw: T): T {
  return createActiviedObject(raw, shallowReadonlyHandles);
}

export function shallowReactive<T extends object>(raw: T): T {
  return createActiviedObject(raw, shallowReactiveHandles);
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

/**
 * @description 判断是否为Proxy对象
 * @param target
 * @returns { boolean } 是否是只读对象
 */
export function isProxy(target): boolean {
  return isReactive(target) || isReadonly(target);
}
