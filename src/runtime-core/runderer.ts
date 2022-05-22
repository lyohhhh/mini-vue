import { effect } from "../reactivity/effect";
import { EMPEY_OBJECT } from "../shared";
import { ShapeFlags } from "../shared/shapeFlags";
import { createComponentInstance, setupComponent } from "./component";
import { shouldUpdateComponent } from "./componentUpdateUtils";
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
    parentComponent: Instance | null = null,
    anchor: HTMLElement | null = null
  ) {
    // debugger;
    const { type, shapeFlag } = n2;
    switch (type) {
      case Fragment:
        // Fragment 不创建标签 直接添加在 container 上
        processFragment(n1, n2, container, parentComponent, anchor);
        break;

      case Text:
        // 子节点为字符串
        processText(n1, n2, container);
        break;
      default:
        if (shapeFlag & ShapeFlags.ELEMENT_NODE) {
          // 处理 Element
          processElement(n1, n2, container, parentComponent, anchor);
        } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          // 处理组件
          processComponent(n1, n2, container, parentComponent, anchor);
        }
        break;
    }
  }

  function processComponent(
    n1: VNode | null,
    n2: VNode,
    container: HTMLElement,
    parentComponent: Instance | null = null,
    anchor: HTMLElement | null = null
  ) {
    if (!n1) {
      // 1.先挂载组件
      mountComponent(n2, container, parentComponent, anchor);
    } else {
      updateComponent(n1, n2);
    }
  }

  // 更新组件
  function updateComponent(n1: VNode, n2: VNode) {
    const instance = (n2.component = n1.component) as Instance;
    if (shouldUpdateComponent(n1, n2)) {
      instance.next = n2;
      (instance.update as Function)();
    } else {
      n2.el = n1.el;
      instance.vnode = n2;
    }
  }

  // 创建组件
  function mountComponent(
    vnode: VNode,
    container: HTMLElement,
    parentComponent: Instance | null = null,
    anchor: HTMLElement | null = null
  ) {
    // debugger;
    // 1.先创建组件实例 获取实例
    const instance = (vnode.component = createComponentInstance(
      vnode,
      parentComponent
    ));
    // 2.调用 setup
    setupComponent(instance);
    // 3.调用 render
    setupRenderEffect(instance, container, anchor);
  }
  function setupRenderEffect(
    instance: Instance,
    container: HTMLElement,
    anchor: HTMLElement | null = null
  ) {
    instance.update = effect(() => {
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
          patch(null, subTree, container, instance, anchor);
          // 将根元素节点 挂载在 setupState 上
          instance.el = subTree.el;
          instance.isMounted = true;
        } else {
          const { proxy } = instance;
          // next 为需要更新的
          // vnode 为当前的
          const { next, vnode } = instance;
          if (next) {
            next.el = vnode.el;
            updateComponentPreRender(instance, next);
          }
          const subTree = instance.render.call(proxy);
          const prevTree = instance.prevTree as VNode;
          // 将当前的 虚拟节点进行保存
          // update Element 时 对新旧 Vnode 进行比较
          instance.prevTree = subTree;
          patch(prevTree, subTree, container, instance, anchor);
        }
      }
    });
  }
  // 更新之前将 实例上的属性赋值
  function updateComponentPreRender(instance: Instance, nextVNode: VNode) {
    instance.vnode = nextVNode;
    instance.next = undefined;
    instance.props = nextVNode.props;
  }

  /**
   * 处理 element
   */
  function processElement(
    n1: VNode | null,
    n2: VNode,
    container: HTMLElement,
    parentComponent: Instance | null = null,
    anchor: HTMLElement | null = null
  ) {
    // n1 不存在就代表是初始化
    if (!n1) {
      // console.log(" init ");

      mountElement(n2, container, parentComponent, anchor);
    } else {
      // console.log(" update ");
      // console.log(n1);
      // console.log(n2);

      patchElement(n1, n2, container, parentComponent, anchor);
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
    container: HTMLElement,
    parentComponent: Instance | null = null,
    anchor: HTMLElement | null = null
  ) {
    // 省略  const el = await mountTag(vnode);
    //       mountAttributes(vnode, el);
    // 直接将 children 添加在 container 上
    mountChildren(n2, container, parentComponent, anchor);
  }

  /**
   * 修改Element
   */

  function patchElement(
    n1: VNode,
    n2: VNode,
    container: HTMLElement,
    parentComponent: Instance | null,
    anchor: HTMLElement | null = null
  ) {
    // console.log("update ");

    let el = (n2.el = n1.el);
    let oldProps = n1.props || EMPEY_OBJECT;
    let newProps = n2.props || EMPEY_OBJECT;

    patchProps(el as HTMLElement, oldProps, newProps);

    patchChildren(el as HTMLElement, n1, n2, parentComponent, anchor);
  }

  function patchChildren(
    container: HTMLElement,
    n1: VNode,
    n2: VNode,
    parentComponent: Instance | null,
    anchor: HTMLElement | null = null
  ) {
    // const shapeFlag = n1?.shapeFlag;
    const { shapeFlag: prevShapeFlag, children: c1 } = n1;
    const { shapeFlag, children: c2 } = n2;

    // 当前节点是文本节点
    // 处理
    // 1.ArrayToText
    // 2.TextToText
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      // console.log(c1);
      // console.log("----------");
      // console.log(c2);
      // 如果之前的文本节点 与 当前的文本节点不一致的话 更新文本节点
      // 因为当前的 children 为文本节点 所以只需要修改 text 就行
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        unmountChildren(c1 as VNode[]);
      }
      // diff 时 不相同才进行创建
      if (c1 !== c2) {
        hostSetElementText(container, c2 as string);
      }
    } else {
      if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
        hostSetElementText(container, "");
        mountChildren(n2, container, parentComponent, anchor);
      } else {
        // array diff array
        patchKeyedChildren(
          c1 as VNode[],
          c2 as VNode[],
          container,
          parentComponent,
          anchor
        );
      }
    }
  }

  // diff
  function patchKeyedChildren(
    c1: VNode[],
    c2: VNode[],
    container: HTMLElement,
    parentComponent: Instance | null,
    parentAnchor: HTMLElement | null = null
  ) {
    let l2 = c2.length;
    let i = 0; // 遍历的下标
    let e1 = c1.length - 1; // 老节点的下标
    let e2 = l2 - 1; // 新节点的下标
    function isSomeVNodeType(n1: VNode, n2: VNode): boolean {
      // type
      // key
      return n1.type === n2.type && n1.key === n2.key;
    }

    // 开始从左侧进行对比
    while (i <= e1 && i <= e2) {
      // 获取到最左侧的节点进行对比
      let n1 = c1[i];
      let n2 = c2[i];
      // 判断是否新旧节点一致
      if (isSomeVNodeType(n1, n2)) {
        // 防止 children 里面还是数组
        // 进行递归
        patch(n1, n2, container, parentComponent, parentAnchor);
      } else {
        break;
      }
      i++;
    }

    // 开始从右侧进行对比
    while (i <= e1 && i <= e2) {
      // 获取到最右侧的节点进行对比
      let n1 = c1[e1];
      let n2 = c2[e2];
      // 判断是否新旧节点一致
      if (isSomeVNodeType(n1, n2)) {
        // 防止 children 里面还是数组
        // 进行递归
        patch(n1, n2, container, parentComponent, parentAnchor);
      } else {
        break;
      }
      e1--;
      e2--;
    }

    console.log(i, e1, e2);
    // 新节点比老节点多
    if (i > e1) {
      if (i <= e2) {
        const nextPos = e2 + 1;
        const anchor = nextPos >= l2 ? null : c2[nextPos].el;
        while (i <= e2) {
          patch(
            null,
            c2[i],
            container,
            parentComponent,
            anchor as HTMLElement | null
          );
          i++;
        }
      }
    } else if (i > e2) {
      while (i <= e1) {
        hostRemove(<HTMLElement>c1[i].el);
        i++;
      }
    } else {
      // 中间对比
      // 获取到 中间部分同的起始下标
      let s1 = i;
      let s2 = i;
      // 获取新节点中间部分的数量
      const toBePatched = e2 - i + 1;
      // 已经修改过的数量
      let patched = 0;
      // 新老节点新增 | 删除映射
      const keyToNewIndexMap = new Map();
      // 新老节点位置映射
      const newIndexToOldIndexMap = new Array(toBePatched);
      // 0 -> 没有建立映射关系
      for (let i = 0; i < toBePatched; i++) newIndexToOldIndexMap[i] = 0;
      // 创建是否移动 flag
      // 防止多次调用 递增子序列
      let moved = false;
      let maxNewIndexSofar = 0;
      // 遍历新节点建立映射关系
      for (let i = s2; i <= e2; i++) {
        let nextChild = c2[i];
        keyToNewIndexMap.set(nextChild.key, i);
      }
      for (let i = s1; i <= e1; i++) {
        // 获取之前的节点
        let prevChild = c1[i];
        // 修改的数量超过 应该修改的数量 说明老节点中的节点在新节点中不存在
        // 直接删除老节点
        if (patched >= toBePatched) {
          hostRemove(prevChild.el as HTMLElement);
          continue;
        }

        let newIndex;
        // 设置 key 的话
        if (prevChild.key != null) {
          // 获取映射关系
          newIndex = keyToNewIndexMap.get(prevChild.key);
        } else {
          // 没有设置 key
          for (let j = s2; i <= e2; j++) {
            // 遍历 判断相同
            if (isSomeVNodeType(prevChild, c2[j])) {
              newIndex = j;
              break;
            }
          }
        }

        // 判断 newIndex 是否为空
        // 为空既是 老节点在新节点中找不到
        // 执行删除操作
        if (newIndex === undefined) {
          hostRemove(prevChild.el as HTMLElement);
        } else {
          if (newIndex >= maxNewIndexSofar) {
            maxNewIndexSofar = newIndex;
          } else {
            moved = true;
          }
          // 建立新老位置映射
          newIndexToOldIndexMap[newIndex - s2] = i + 1;
          // 否则递归调用 patch 对当前节点进行修改
          patch(prevChild, c2[newIndex], container, parentComponent, null);
          patched++;
        }
      }

      // 获取最长递增子序列
      const increasingNewIndexSequence = moved
        ? getSequence(newIndexToOldIndexMap)
        : [];

      // 双指针判断是否需要移动
      let k = increasingNewIndexSequence.length - 1;
      for (let i = toBePatched - 1; i >= 0; i--) {
        const nextIndex = i + s2;
        const nextChild = c2[nextIndex].el;
        const anchor = nextIndex + 1 < l2 ? c2[nextIndex + 1].el : null;
        // 判断新节点是否建立映射
        // 没有建立默认创建新节点
        if (newIndexToOldIndexMap[i] === 0) {
          patch(
            null,
            c2[nextIndex],
            container,
            parentComponent,
            anchor as HTMLElement | null
          );
        } else if (moved) {
          // 判断是否需要移动元素
          if (k < 0 || i !== increasingNewIndexSequence[k]) {
            hostInsert(
              nextChild as HTMLElement,
              container,
              anchor as HTMLElement | null
            );
          } else {
            k--;
          }
        }
      }
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
    parentComponent: Instance | null = null,
    anchor: HTMLElement | null = null
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
    hostInsert(el, container, anchor);
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
    parentComponent: Instance | null = null,
    anchor: HTMLElement | null = null
  ) {
    const { children } = vnode;
    if (vnode.shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      container.textContent = children as string;
    } else if (vnode.shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      // TODO
      // 数组类型
      (children as VNode[]).forEach((item) => {
        item && patch(null, item, container, parentComponent, anchor);
      });
    }
  }

  return {
    createApp: createAppAPI(render),
  };
}

// 获取 最长递增子序列
function getSequence(arr: number[]): number[] {
  const p = arr.slice();
  const result = [0];
  let i, j, u, v, c;
  const len = arr.length;
  for (i = 0; i < len; i++) {
    const arrI = arr[i];
    if (arrI !== 0) {
      j = result[result.length - 1];
      if (arr[j] < arrI) {
        p[i] = j;
        result.push(i);
        continue;
      }
      u = 0;
      v = result.length - 1;
      while (u < v) {
        c = (u + v) >> 1;
        if (arr[result[c]] < arrI) {
          u = c + 1;
        } else {
          v = c;
        }
      }
      if (arrI < arr[result[u]]) {
        if (u > 0) {
          p[i] = result[u - 1];
        }
        result[u] = i;
      }
    }
  }
  u = result.length;
  v = result[u - 1];
  while (u-- > 0) {
    result[u] = v;
    v = p[v];
  }
  return result;
}
