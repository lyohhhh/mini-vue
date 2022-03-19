import { track, trigger } from "./effect";

/**
 * @description 创建响应式对象
 * @param { T } raw
 * @returns { T }
 */
export function reactive<T extends object>(raw: T): T {
  return new Proxy(raw, {
    get(target, key) {
      const res = Reflect.get(target, key);
      // 依赖收集
      track(target, key);
      return res;
    },
    set(target, key, value) {
      const res = Reflect.set(target, key, value);
      // 触发依赖
      trigger(target, key);
      return res;
    },
  });
}
