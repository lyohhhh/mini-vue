import { ShapeFlags } from "../shared/shapeFlags";
import { createComponentInstance, setupComponent } from "./component";

export function render(vnode: VNode, container: HTMLElement) {
  // 调用 patch 方法以便后续对 vnode 进行操作
  patch(vnode, container);
}

function patch(vnode: VNode, container: HTMLElement) {
  if (vnode.shapeFlag & ShapeFlags.ELEMENT_NODE) {
    // 处理 Element
    processElement(vnode, container);
  } else if (vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
    // 处理组件
    processComponent(vnode, container);
  }
}

function processComponent(vnode: VNode, container: HTMLElement) {
  // 1.先挂载组件
  mountComponent(vnode, container);
}
function mountComponent(vnode: VNode, container: HTMLElement) {
  // 1.先创建组件实例 获取实例
  const instance = createComponentInstance(vnode);
  // 2.调用 setup
  setupComponent(instance);
  // 3.调用 render
  setupRenderEffect(instance, container);
}
function setupRenderEffect(instance: Instance, container: HTMLElement) {
  if (instance.render) {
    // 返回的 虚拟节点
    // render 函数中可能使用了 this
    // 所以在赋值给实例之前 将 this 指向 proxy 代理的对象上
    // 包括 props 都是通过代理来访问的
    const subTree = instance.render.call(instance.proxy);
    // 对返回的 虚拟节点进行挂载
    // vnode -> element => mountElement
    patch(subTree, container);
    // 将根元素节点 挂载在 setupState 上
    instance.el = subTree.el;
  }
}
/**
 * 处理 element
 */
function processElement(vnode: VNode, container: HTMLElement) {
  mountElement(vnode, container);
}
/**
 * 挂载到页面上
 */
async function mountElement(vnode: VNode, container: HTMLElement) {
  const el = await mountTag(vnode);
  mountAttributes(vnode, el);
  mountChildren(vnode, el);
  container.append(el);
}

/**
 * 创建标签
 */
function mountTag(vnode: VNode): Promise<HTMLElement> {
  return new Promise((resolve) => {
    const el = document.createElement(<string>vnode.type);
    vnode.el = el;
    resolve(el);
  });
}

/**
 * 设置 Attributes
 */
function mountAttributes(vnode: VNode, container: HTMLElement) {
  const { props } = vnode;
  for (let key in props) {
    const val = props[key];

    // 如果是绑定的事件
    // 绑定事件
    // 跳过本次循环
    if (isEvent(key)) {
      const evName = key.slice(2).toLocaleLowerCase();
      container.addEventListener(evName, val);
      continue;
    }

    if (Array.isArray(val)) {
      container.setAttribute(key, val.join(" "));
    } else {
      container.setAttribute(key, val);
    }
  }
}

/**
 * 挂载元素
 */
function mountChildren(vnode: VNode, container: HTMLElement) {
  const { children } = vnode;
  if (vnode.shapeFlag & ShapeFlags.TEXT_CHILDREN) {
    container.textContent = children as string;
  } else if (vnode.shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
    // TODO
    // 数组类型
    (children as VNode[]).forEach((item) => {
      item && patch(item, container);
    });
  }
}

/**
 * 判读是否是事件
 * @returns { boolean } 是| 否
 */
function isEvent(str: string): boolean {
  return /^on[A-Z]/.test(str);
}
