import { track, trigger } from "./effect";
import { ReactiveFlags } from "./reactive";

/**
 * @description 创建 get
 * @param { boolean } isReadonly 是否是只读对象
 * @returns { any } 获取的值
 */
function createGetter(isReadonly: boolean = false) {
  return function get(target, key) {
    const res = Reflect.get(target, key);

    if (ReactiveFlags.IS_REACTIVE == key) {
      return !isReadonly;
    } else if (ReactiveFlags.IS_READONLY == key) {
      return isReadonly;
    }

    if (!isReadonly) {
      // 依赖收集
      track(target, key);
    }
    return res;
  };
}

/**
 * @description 创建 set
 */
function createSetter() {
  return function (target, key, value) {
    const res = Reflect.set(target, key, value);
    // 触发依赖
    trigger(target, key);
    return res;
  };
}

const get = createGetter();
const set = createSetter();
/**
 * @description 创建响应式对象
 */
export const mutableHandlers = {
  get,
  set,
};

const readonlyGet = createGetter(true);
/**
 * @description 创建只读对象
 */
export const readonlyHandles = {
  get: readonlyGet,
  set(target, key, value) {
    console.warn(`${String(key)} can't update, because this is readonly`);
    return true;
  },
};
