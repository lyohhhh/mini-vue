class ReactiveEffect {
  private _fn: Function;
  constructor(fn: Function, public scheduler?: Function) {
    this._fn = fn;
  }

  run(): Function {
    // 执行当前方法时 将 this 赋值给 activedEffect
    activedEffect = this;
    return this._fn();
  }
}

// 依赖收集的容器
const targetMap = new Map();

/**
 * @description 收集依赖
 * @param target
 * @param key
 */
export function track<T>(target: T, key: string | symbol): void {
  // 一个target => 一个key => 一个dep
  let depsMap = targetMap.get(target);
  // 初始化时 depsMap 获取不到
  // 需要手动存
  if (!depsMap) {
    depsMap = new Map();
    // 建立映射关系
    targetMap.set(target, depsMap);
  }

  let dep = depsMap.get(key);
  if (!dep) {
    dep = new Set();
    // 建立映射关系
    depsMap.set(key, dep);
  }
  // 将 activedEffect 添加到 dep中
  dep.add(activedEffect);
}

/**
 * @description 触发依赖
 * @param { T } target
 * @param { string | symbol } key
 */
export function trigger<T>(target: T, key: string | symbol): void {
  // 获取 target 的映射 Map
  let depsMap = targetMap.get(target);
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

// 定义一个变量 获取 effect 中的 fn
let activedEffect;

/**
 * @description 创建effect
 * @param { Funciton } fn 监听函数
 * @param { opt }
 * @returns { Function }
 */
export function effect(fn: Function, opt: any = {}): Function {
  const _effect = new ReactiveEffect(fn, opt.scheduler);
  _effect.run();
  // 返回 runner
  return _effect.run.bind(_effect);
}
