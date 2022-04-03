import { ShapeFlags } from "../shared/shapeFlags";
import { createComponentInstance, setupComponent } from "./component";
import { createAppAPI } from "./createApp";
import { Fragment, Text } from "./vnode";

export function createRenderer(options: RendererOptions) {
  const { createElement, patchProp, insert } = options;
  function render(
    vnode: VNode,
    container: HTMLElement,
    parentComponent: Instance | null = null
  ) {
    // 调用 patch 方法以便后续对 vnode 进行操作
    patch(vnode, container, parentComponent);
  }

  // 传入 parentComponent 为了 provide 和 inject
  // 在 父级元素上获取注入的数据
  function patch(
    vnode: VNode,
    container: HTMLElement,
    parentComponent: Instance | null = null
  ) {
    // debugger;
    const { type } = vnode;
    switch (type) {
      case Fragment:
        // Fragment 不创建标签 直接添加在 container 上
        processFragment(vnode, container);
        break;

      case Text:
        // 子节点为字符串
        processText(vnode, container);
        break;
      default:
        if (vnode.shapeFlag & ShapeFlags.ELEMENT_NODE) {
          // 处理 Element
          processElement(vnode, container);
        } else if (vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          // 处理组件
          processComponent(vnode, container, parentComponent);
        }
        break;
    }
  }

  function processComponent(
    vnode: VNode,
    container: HTMLElement,
    parentComponent: Instance | null = null
  ) {
    // 1.先挂载组件
    mountComponent(vnode, container, parentComponent);
  }
  function mountComponent(
    vnode: VNode,
    container: HTMLElement,
    parentComponent: Instance | null = null
  ) {
    // debugger;
    // 1.先创建组件实例 获取实例
    const instance = createComponentInstance(vnode, parentComponent);
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
      patch(subTree, container, instance);
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
   * 处理 Text
   */
  function processText(vnode: VNode, container: HTMLElement) {
    // 获取到 string
    const { children } = vnode;
    // 创建文本节点
    const textNode = (vnode.el = document.createTextNode(children as string));
    // 添加到元素上
    container.append(textNode);
  }

  /**
   * 处理 Fragment
   */
  function processFragment(vnode: VNode, container: HTMLElement) {
    // 省略  const el = await mountTag(vnode);
    //       mountAttributes(vnode, el);
    // 直接将 children 添加在 container 上
    mountChildren(vnode, container);
  }
  /**
   * 挂载到页面上
   * 移除 Promise 防止 createTextVNode 创建在第一个元素上
   */
  function mountElement(vnode: VNode, container: HTMLElement) {
    // const el = await mountTag(vnode);
    // 写死创建节点 使用方法来创建节点
    // 挂载的元素不同
    // const el = document.createElement(<string>vnode.type);
    const el = createElement(vnode.type as string);
    vnode.el = el;
    mountAttributes(vnode, el);
    mountChildren(vnode, el);

    // container.append(el);
    insert(el, container);
  }

  /**
   * 设置 Attributes
   */
  function mountAttributes(vnode: VNode, container: HTMLElement) {
    const { props } = vnode;
    for (let key in props) {
      const val = props[key];

      // // 如果是绑定的事件
      // // 绑定事件
      // // 跳过本次循环
      // if (isEvent(key)) {
      //   const evName = key.slice(2).toLocaleLowerCase();
      //   container.addEventListener(evName, val);
      //   continue;
      // }

      // if (Array.isArray(val)) {
      //   container.setAttribute(key, val.join(" "));
      // } else {
      //   container.setAttribute(key, val);
      // }

      // 使用方法来创建
      patchProp(container, key, val);
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

  return {
    createApp: createAppAPI(render),
  };
}
