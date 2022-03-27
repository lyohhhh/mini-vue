/**
 * 创建组件实例 获取实例
 */
export function createComponentInstance(vnode: VNode): Instance {
  const instance: Instance = {
    type: vnode.type,
    vnode,
  };

  return instance;
}

/**
 * 初始化组件
 */
export function setupComponent(instance: Instance) {
  // TODO
  // 初始化
  // initProps
  // initSlots

  // 初始化一个有状态的组件 -> 函数组件没有状态
  setupStatefulComponent(instance);
}
/**
 * 初始化一个有状态的组件
 */
function setupStatefulComponent(instance: Instance) {
  // 获取组件中的 setup
  const component = instance.vnode.type;

  const { setup } = component;

  if (setup) {
    // 有可能是 object 有可能是 function
    const setupResult = setup();

    handleSetupResult(instance, setupResult);
  }
}

/**
 * 判断 setup 返回的值 不同类型进行不同操作
 */
function handleSetupResult(instance: Instance, setupResult: object | Function) {
  // TODO
  // Function

  if (typeof setupResult === "object") {
    instance.setupState = setupResult;
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
