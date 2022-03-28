import { isObject } from "../shared/index";
import { createComponentInstance, setupComponent } from "./component";

export function render(vnode: VNode, container: HTMLElement) {
  // 调用 patch 方法以便后续对 vnode 进行操作
  patch(vnode, container);
}

function patch(vnode: VNode, container: HTMLElement) {
  if (typeof vnode.type === "string") {
    // 处理 Element
    processElement(vnode, container);
  } else if (isObject(vnode.type)) {
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
    const subTree = instance.render();
    // 对返回的 虚拟节点进行挂载
    // vnode -> element => mountElement
    patch(subTree, container);
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
  if (typeof children == "string") {
    container.textContent = children;
  } else if (Array.isArray(children)) {
    // TODO
    // 数组类型
    children.forEach((item) => {
      patch(item, container);
    });
  }
}
