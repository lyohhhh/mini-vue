import { ReactiveEffect } from "./effect";

class ComputedRefImpl {
  // 是否执行 computed 操作管道
  private _dirty: boolean = true;
  private _value: any;
  private _effect: ReactiveEffect;
  constructor(getter: Function) {
    // 实例化 ReactiveEffect
    // 收集依赖时 收集的为 当前实例
    // 因为传入了 scholder -> reactive 触发 set 操作时会将管道开启
    // 每次使用 computed.value 时 拿去到的为最新值
    this._effect = new ReactiveEffect(getter, () => {
      // 执行 开启管道操作
      if (!this._dirty) this._dirty = true;
    });
  }

  get value() {
    // 设置一个变量 没有改变时 禁止执行 getter
    // 直接从 _value 中拿值
    // 管道通过 Reactive set 进行开启
    if (this._dirty) {
      // 关闭通道
      this._dirty = false;
      // 执行 run 方法时 -> activeEffect 指向当前实例
      // 收集依赖时 收集的为 当前实例
      this._value = this._effect.run();
    }
    return this._value;
  }
}

export function computed(getter) {
  return new ComputedRefImpl(getter);
}
