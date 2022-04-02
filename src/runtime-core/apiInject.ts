import { getCurrentInstance } from "./component";

// 注入依赖
// 当父级 key 和 爷爷级别的 key 重复的时候，对于子组件来讲，需要取最近的父级别组件的值
// provides 初始化的时候是在 createComponent 时处理的，当时是直接把 parent.provides 赋值给组件的 provides 的
// 所以，如果说这里发现 provides 和 parentProvides 相等的话，那么就说明是第一次做 provide(对于当前组件来讲)
// 我们就可以把 parent.provides 作为 currentInstance.provides 的原型重新赋值
// 1.获取当前组件的实例
// 2.获取当前组件实例的 provides
// 3.获取当前组件实例的 父组件实例
// 4.provides 和 parentProvides 相等的话，那么就说明是第一次做
// 5.parent.provides 作为 currentInstance.provides 的原型重新赋值
export function provide(key: string | symbol, value: any) {
  const instance = getCurrentInstance();
  if (instance) {
    let { provides } = instance;

    const parentProvides = instance.parent?.provides;
    if (parentProvides === provides) {
      provides = instance.provides = Object.create(parentProvides);
    }

    provides[key] = value;
  }
}

// 获取注入的依赖
// 获取当前组件的父组件的实例
// 因为指向原型链
// 一层一层查找

// TODO
// 之间包含一层虚拟节点 parent 为 null
export function inject(key: string, defaultValue: any) {
  let instance = getCurrentInstance();

  if (instance) {
    const provides = instance.parent?.provides || {};
    if (key in provides) {
      return provides[key];
    } else if (defaultValue) {
      if (typeof defaultValue === "function") {
        return defaultValue();
      }
      return defaultValue;
    }
  }
}
