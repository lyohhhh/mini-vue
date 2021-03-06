import { track, trigger } from "./effect";
import { ReactiveFlags, reactive, readonly } from "./reactive";
import { extend, isObject } from "../shared";
/**
 * @description 创建 get
 * @param { boolean } isReadonly 是否是只读对象
 * @param { boolean } shallow 是否浅层对象
 * @returns { any } 获取的值
 */
function createGetter(isReadonly: boolean = false, shallow: boolean = false) {
  return function get(target, key) {
    // 获取 目标
    const res = Reflect.get(target, key);

    // 判读是否是响应式对象
    if (ReactiveFlags.IS_REACTIVE == key) {
      return !isReadonly;
      // 是否是只读对象
    } else if (ReactiveFlags.IS_READONLY == key) {
      return isReadonly;
    }

    if (shallow && isReadonly) {
      return res;
    }

    // 不是只读对象才收集依赖
    // 只读对象 只能 get 不能 set
    // 手机依赖无作用
    if (shallow && !isReadonly) {
      // 依赖收集
      track(target, key);
      return res;
    }

    if (!shallow && !isReadonly) {
      track(target, key);
    }

    // 对象嵌套 递归收集依赖
    if (isObject(res)) {
      // 如果是 只读属性
      return isReadonly ? readonly(res) : reactive(res);
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

const shallowReactiveGet = createGetter(false, true);

/**
 * @description 创建表层 reactive 对象
 */
export const shallowReactiveHandles = extend({}, mutableHandlers, {
  get: shallowReactiveGet,
});

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

const shallowReadonlyGet = createGetter(true, true);
/**
 * @description 创建表层 readonly 对象
 */
export const shallowReadonlyHandles = extend({}, readonlyHandles, {
  get: shallowReadonlyGet,
  set(target, key, value) {
    console.warn(`${String(key)} can't update, because this is readonly`);
    return true;
  },
});
