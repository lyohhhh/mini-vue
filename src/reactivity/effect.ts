import { extend } from "../shared";
import { EffectOptions } from "../types/effect";

// 依赖收集的容器
const targetMap: Map<unknown, any> = new Map();
// 定义一个变量 获取 effect 中的 fn
let activedEffect;
// 定义 是否需要收集依赖
let shouldTrack: boolean = false;
class ReactiveEffect {
  private _fn: Function;
  public deps = [];
  public active = true;
  public onStop?: () => void;
  constructor(fn: Function, public scheduler?: Function) {
    this._fn = fn;
  }

  run(): Function {
    // 判断是否 stop 是的话直接返回 fn
    // 否则 将收集依赖
    if (!this.active) {
      return this._fn();
    }

    shouldTrack = true;
    // 执行当前方法时 将 this 赋值给 activedEffect
    // 需要将 activedEffect 放在 fn 执行之前
    // fn 执行时会执行 get 操作 -> 收集依赖时 activedEffect 为空
    activedEffect = this;
    // 获取 fn 返回值 并且返回
    const result = this._fn();
    // 执行完之后 shouldTrack 为 false 清空全局变量
    shouldTrack = false;
    // 将返回值返回
    return result;
  }

  stop(): void {
    // 清除过了就不再清除
    if (this.active) {
      clearEffect(this);
      // 如果传入了 onStop 执行 onStop 回调
      if (this.onStop) {
        this.onStop();
      }
      this.active = false;
    }
  }
}
/**
 * @description 清除所有effect
 * @param effect
 */
function clearEffect(effect) {
  effect.deps.forEach((dep: Set<ReactiveEffect>) => {
    dep.delete(effect);
  });
  effect.deps.length = 0;
}

/**
 * @description 收集依赖
 * @param target
 * @param key
 */
export function track<T>(target: T, key: string | symbol): void {
  // 是否需要收集依赖
  if (!isTracking()) return;

  // 一个target => 一个key => 一个dep
  let depsMap: Map<typeof key, any> = targetMap.get(target);
  // 初始化时 depsMap 获取不到
  // 需要手动存
  if (!depsMap) {
    depsMap = new Map();
    // 建立映射关系
    targetMap.set(target, depsMap);
  }

  let dep: Set<typeof key> = depsMap.get(key);
  if (!dep) {
    dep = new Set();
    // 建立映射关系
    depsMap.set(key, dep);
  }
  // // 没有 effect
  // if (!activedEffect) return;
  // // 不需要手机依赖
  // if (!shouldTrack) return;

  // 如果 deps 中有 activedEffect
  if (dep.has(activedEffect)) return;
  // 将 activedEffect 添加到 dep中
  dep.add(activedEffect);
  // 反向添加 dep stop方法
  activedEffect.deps.push(dep);
}

function isTracking(): boolean {
  return shouldTrack && activedEffect !== undefined;
}

/**
 * @description 触发依赖
 * @param { T } target
 * @param { string | symbol } key
 */
export function trigger<T>(target: T, key: string | symbol): void {
  // 获取 target 的映射 Map
  let depsMap = targetMap.get(target);

  // 防止为了没有收集依赖 就触发
  if (!depsMap) return;

  // 获取 key 的映射 Set
  let dep = depsMap.get(key);
  // 遍历执行 fn 方法
  for (let effect of dep) {
    // 如果存在 scheduler 执行scheduler
    if (effect.scheduler) {
      effect.scheduler();
    } else {
      // 否则执行 run
      effect.run();
    }
  }
}

/**
 * @description 创建effect
 * @param { Funciton } fn 监听函数
 * @param { opt }`
 * @returns { Function }
 */
export function effect(fn: Function, opt: EffectOptions = {}): Function {
  const _effect = new ReactiveEffect(fn, opt.scheduler);
  _effect.run();
  // 考虑之后的多个参数
  extend(_effect, opt);
  const runner: any = _effect.run.bind(_effect);
  // 绑定当前effect
  runner._effect = _effect;
  // 返回 runner
  return runner;
}

export function stop(runner) {
  runner._effect!.stop();
}
