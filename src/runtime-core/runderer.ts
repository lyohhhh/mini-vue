import { effect } from "../reactivity/effect";
import { EMPEY_OBJECT } from "../shared";
import { ShapeFlags } from "../shared/shapeFlags";
import { createComponentInstance, setupComponent } from "./component";
import { createAppAPI } from "./createApp";
import { Fragment, Text } from "./vnode";

// 使用 createRouterer 接口
// 内部的  createElement, patchProp, insert 可以用户自己定义
export function createRenderer(options: RendererOptions) {
  const {
    createElement: hostCreateElement,
    patchProps: hostPatchProps,
    insert: hostInsert,
    remove: hostRemove,
    setElementText: hostSetElementText,
  } = options;
  function render(
    vnode: VNode,
    container: HTMLElement,
    parentComponent: Instance | null = null
  ) {
    // 调用 patch 方法以便后续对 vnode 进行操作
    patch(null, vnode, container, parentComponent);
  }

  // 传入 parentComponent 为了 provide 和 inject
  // 在 父级元素上获取注入的数据

  // n1 为之前的 vnode
  // n2 为当前的 Vnode
  function patch(
    n1: VNode | null,
    n2: VNode,
    container: HTMLElement,
    parentComponent: Instance | null = null
  ) {
    // debugger;
    const { type, shapeFlag } = n2;
    switch (type) {
      case Fragment:
        // Fragment 不创建标签 直接添加在 container 上
        processFragment(n1, n2, container);
        break;

      case Text:
        // 子节点为字符串
        processText(n1, n2, container);
        break;
      default:
        if (shapeFlag & ShapeFlags.ELEMENT_NODE) {
          // 处理 Element
          processElement(n1, n2, container, parentComponent);
        } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          // 处理组件
          processComponent(n1, n2, container, parentComponent);
        }
        break;
    }
  }

  function processComponent(
    n1: VNode | null,
    n2: VNode,
    container: HTMLElement,
    parentComponent: Instance | null = null
  ) {
    // 1.先挂载组件
    mountComponent(n2, container, parentComponent);
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
    effect(() => {
      if (instance.render) {
        // 判断是否是 虚拟节点初始化
        if (!instance.isMounted) {
          // 返回的 虚拟节点
          // render 函数中可能使用了 this
          // 所以在赋值给实例之前 将 this 指向 proxy 代理的对象上
          // 包括 props 都是通过代理来访问的
          const subTree = instance.render.call(instance.proxy);
          // 将当前的 虚拟节点进行保存
          // update Element 时 对新旧 Vnode 进行比较
          instance.prevTree = subTree;
          // 对返回的 虚拟节点进行挂载
          // vnode -> element => mountElement
          patch(null, subTree, container, instance);
          // 将根元素节点 挂载在 setupState 上
          instance.el = subTree.el;
          instance.isMounted = true;
        } else {
          const subTree = instance.render.call(instance.proxy);
          const prevTree = instance.prevTree as VNode;
          // 将当前的 虚拟节点进行保存
          // update Element 时 对新旧 Vnode 进行比较
          instance.prevTree = subTree;
          patch(prevTree, subTree, container, instance);
        }
      }
    });
  }

  /**
   * 处理 element
   */
  function processElement(
    n1: VNode | null,
    n2: VNode,
    container: HTMLElement,
    parentComponent: Instance | null = null
  ) {
    // n1 不存在就代表是初始化
    if (!n1) {
      console.log(" init ");

      mountElement(n2, container, parentComponent);
    } else {
      console.log(" update ");
      console.log(n1);
      console.log(n2);

      patchElement(n1, n2, container, parentComponent);
    }
  }
  /**
   * 处理 Text
   */
  function processText(n1: VNode | null, n2: VNode, container: HTMLElement) {
    // 获取到 string
    const { children } = n2;
    // 创建文本节点
    const textNode = (n2.el = document.createTextNode(children as string));
    // 添加到元素上
    container.append(textNode);
  }

  /**
   * 处理 Fragment
   */
  function processFragment(
    n1: VNode | null,
    n2: VNode,
    container: HTMLElement
  ) {
    // 省略  const el = await mountTag(vnode);
    //       mountAttributes(vnode, el);
    // 直接将 children 添加在 container 上
    mountChildren(n2, container);
  }

  /**
   * 修改Element
   */

  function patchElement(
    n1: VNode,
    n2: VNode,
    container: HTMLElement,
    parentComponent: Instance | null
  ) {
    // console.log("update ");

    let el = (n2.el = n1.el);
    let oldProps = n1.props || EMPEY_OBJECT;
    let newProps = n2.props || EMPEY_OBJECT;

    patchProps(el as HTMLElement, oldProps, newProps);

    patchChildren(el as HTMLElement, n1, n2, parentComponent);
  }

  function patchChildren(
    container: HTMLElement,
    n1: VNode,
    n2: VNode,
    parentComponent: Instance | null
  ) {
    // const shapeFlag = n1?.shapeFlag;
    const { shapeFlag: prevShapeFlag, children: c1 } = n1;
    const { shapeFlag, children: c2 } = n2;

    // 当前节点是文本节点
    // 处理
    // 1.ArrayToText
    // 2.TextToText
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      console.log(c1);
      console.log("----------");
      console.log(c2);
      // 如果之前的文本节点 与 当前的文本节点不一致的话 更新文本节点
      // 因为当前的 children 为文本节点 所以只需要修改 text 就行
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        unmountChildren(c1 as VNode[]);
      }
      if (c1 !== c2) {
        hostSetElementText(container, c2 as string);
      }
    } else {
      if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
        hostSetElementText(container, "");
        // TODO
      }
      unmountChildren(c1 as VNode[]);
      mountChildren(n2, container, parentComponent);
    }
  }

  /**
   * 清除元素里面的子节点
   */
  function unmountChildren(children: VNode[]) {
    for (let i = 0; i < children.length; i++) {
      let el = children[i].el;
      hostRemove(el as HTMLElement);
    }
  }

  function patchProps(el: HTMLElement, oldProps, newProps) {
    if (oldProps !== newProps) {
      // 遍历新 props 添加 或者 修改 props
      for (const key in newProps) {
        // 获取到新老节点 进行修改
        let prevProps = oldProps[key];
        let nextProps = newProps[key];
        if (prevProps !== nextProps) {
          // 调用  createRenderer patchProps
          hostPatchProps(el, key, prevProps, nextProps);
        }
      }

      // 如果老节点存在的值 在新节点上不存在 需要删除该值
      // 如: new : { foo : 'foo'}
      //     old : { foo : 'foo', bar : 'bar'}
      // 当前元素上则只有 foo
      if (oldProps !== EMPEY_OBJECT) {
        for (let key in oldProps) {
          if (!(key in newProps)) {
            let prevProps = oldProps[key];
            hostPatchProps(el, key, prevProps, null);
          }
        }
      }
    }
  }

  /**
   * 挂载到页面上
   * 移除 Promise 防止 createTextVNode 创建在第一个元素上
   */
  function mountElement(
    n2: VNode,
    container: HTMLElement,
    parentComponent: Instance | null = null
  ) {
    // const el = await mountTag(vnode);
    // 写死创建节点 使用方法来创建节点
    // 挂载的元素不同
    // const el = document.createElement(<string>vnode.type);
    const el = hostCreateElement(n2.type as string);
    n2.el = el;
    mountAttributes(n2, el);
    mountChildren(n2, el, parentComponent);

    // container.append(el);
    hostInsert(el, container);
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
      hostPatchProps(container, key, null, val);
    }
  }

  /**
   * 挂载元素
   */
  function mountChildren(
    vnode: VNode,
    container: HTMLElement,
    parentComponent: Instance | null = null
  ) {
    const { children } = vnode;
    if (vnode.shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      container.textContent = children as string;
    } else if (vnode.shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      // TODO
      // 数组类型
      (children as VNode[]).forEach((item) => {
        item && patch(null, item, container, parentComponent);
      });
    }
  }

  return {
    createApp: createAppAPI(render),
  };
}
