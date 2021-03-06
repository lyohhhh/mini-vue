import { proxyRefs } from "../reactivity";
import { shallowReadonly } from "../reactivity/reactive";
import { emit } from "./componentEmits";
import { initProps } from "./componentProps";
import { PublicInstanceProxyHandlers } from "./componentPublicInstance";
import { initSlots } from "./componentSlots";

/**
 * 创建组件实例 获取实例
 */
export function createComponentInstance(
  vnode: VNode,
  parent: Instance | null
): Instance {
  const instance: Instance = {
    type: vnode.type,
    vnode,
    parent,
    setupState: {},
    provides: parent ? parent.provides : {},
    props: {},
    emit: () => {},
    slots: {},
    subTree: {},
    isMounted: false,
  };
  // 使用 bind 将 instance 实例传入
  // 用户 只穿入 event
  instance.emit = emit.bind(null, instance) as any;
  return instance;
}

/**
 * 初始化组件
 */
export function setupComponent(instance: Instance) {
  const { props } = instance.vnode;
  // TODO
  // 初始化
  initProps(instance, props);
  initSlots(instance, instance.vnode.children);
  // 初始化一个有状态的组件 -> 函数组件没有状态
  setupStatefulComponent(instance);
}
/**
 * 初始化一个有状态的组件
 */
function setupStatefulComponent(instance: Instance) {
  // 获取组件中的 setup
  const component = instance.vnode.type;

  // 通过 Proxy 实现 vue2 中挂载原型上的方法
  // this props ....
  instance.proxy = new Proxy<object>(
    { _: instance },
    // 统一 proxy 获取属性
    PublicInstanceProxyHandlers
  );
  const { setup } = component;

  if (setup) {
    // 将当前组件实例赋值
    setCurrentInstance(instance);
    // 有可能是 object 有可能是 function
    // 将 props 传给 setup
    const setupResult = setup(shallowReadonly(instance.props), {
      // 绑定event
      emit: instance.emit,
    });
    // 将当前组件实例清空
    setCurrentInstance(null);
    // 对 setup 返回回来的值进行挂载
    handleSetupResult(instance, setupResult);
  }
}

let currentInstance: null | Instance = null;
/**
 * 获取当前组件实例
 * 必须在当前组件的 setup 中获取
 * 在 setup 中获取的时候 currentInstance 才有值
 */
export function getCurrentInstance(): null | Instance {
  return currentInstance;
}

function setCurrentInstance(instance: Instance | null) {
  currentInstance = instance;
}

/**
 * 判断 setup 返回的值 不同类型进行不同操作
 */
function handleSetupResult(
  instance: Instance,
  setupResult: object | (() => VNode)
) {
  // TODO
  // Function

  if (typeof setupResult === "object") {
    instance.setupState = proxyRefs(setupResult);
  } else if (typeof setupResult === "function") {
    instance.render = setupResult;
  }

  // 保证 render 函数中是有值的
  finishComponentSetup(instance);
}

// 将实例的 render 复制
function finishComponentSetup(instance: Instance) {
  const component = instance.type;
  // 查看是否有 render 函数
  if (component.render) {
    // 有的话
    instance.render = component.render;
  }
}
