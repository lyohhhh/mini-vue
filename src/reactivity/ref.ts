import { hasChanged, isObject } from "../shared";
import { trackEffects, triggerEffects, isTracking } from "./effect";
import { reactive } from "./reactive";

class Refimpl<T> {
  private _value: T;
  // 收集依赖的箱子
  public dep: Set<typeof this._value>;
  private _rawValue: T;
  constructor(val: T) {
    this._rawValue = val;
    this._value = convert(val);
    this.dep = new Set();
  }

  get value() {
    trackRef(this);
    return this._value;
  }

  set value(newVal) {
    // 判断 newVal 是否改变
    // 改变之后才触发依赖
    // 这里需要 没有改变过的值和之前的值比较
    if (hasChanged(this._rawValue, newVal)) {
      this._rawValue = newVal;
      // 触发依赖在赋值之后触发
      this._value = convert(newVal);
      // 触发依赖
      triggerEffects(this.dep);
    }
  }
}

/**
 * @description 如果是响应式对象就需要 reactive 包裹
 */
function convert(val) {
  return isObject(val) ? reactive(val) : val;
}

/**
 * 收集 dep
 */
function trackRef(ref: Refimpl<unknown>) {
  // 是否处在收集依赖中 是的话则收集依赖
  if (isTracking()) {
    // 收集依赖
    trackEffects(ref.dep);
  }
}

/**
 * @description ref
 */
export function ref<T>(val: T): Refimpl<T> {
  return new Refimpl<typeof val>(val);
}
