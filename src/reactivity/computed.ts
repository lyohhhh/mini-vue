import { ReactiveEffect } from "./effect";

class ComputedRefImpl {
  private _dirty: boolean = true;
  private _value: any;
  private _effect: ReactiveEffect;
  constructor(getter: Function) {
    this._effect = new ReactiveEffect(getter, () => {
      if (!this._dirty) this._dirty = true;
    });
  }

  get value() {
    // 设置一个变量 没有改变时 禁止执行 getter
    // 直接从 _value 中拿值
    if (this._dirty) {
      // 关闭通道
      this._dirty = false;
      this._value = this._effect.run();
    }
    return this._value;
  }
}

export function computed(getter) {
  return new ComputedRefImpl(getter);
}
