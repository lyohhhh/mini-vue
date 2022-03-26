import { hasChanged, isObject } from "../shared";
import { trackEffects, triggerEffects, isTracking } from "./effect";
import { reactive } from "./reactive";

class Refimpl<T> {
  private _value: T;
  // 收集依赖的箱子
  public dep: Set<typeof this._value>;
  private _rawValue: T;
  public __v_isRef__: boolean = true;
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

/**
 * @description 判断是否是 ref 对象
 */
export function isRef(ref) {
  return !!ref.__v_isRef__;
}

/**
 * @description 返回 ref 的值
 */
export function unRef(ref) {
  return isRef(ref) ? ref.value : ref;
}

/**
 * @description 修改 ref 不用使用 .value 访问值
 */
export function proxyRefs(proxyWithRefs) {
  return new Proxy(proxyWithRefs, {
    get(t, k) {
      return unRef(Reflect.get(t, k));
    },
    set(t, k, v) {
      if (isRef(t[k]) && !isRef(v)) {
        return (t[k].value = v);
      } else {
        return Reflect.set(t, k, v);
      }
    },
  });
}
