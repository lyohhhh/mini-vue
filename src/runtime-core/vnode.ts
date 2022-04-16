import { isObject } from "../shared";
import { ShapeFlags } from "../shared/shapeFlags";

// 使用 Fragment 防止数组元素需要多层嵌套
export const Fragment = Symbol("Fragment");
// 使用 Text 节点映射文本节点
export const Text = Symbol("Text");

/**
 * @description 1. 正常element ： "div", {}, 'hello'
 * @description 2. Component ： Component, { props, emit }
 * @param type
 * @param props
 * @param children
 * @returns
 */
export function createVNode(type, props?, children?): VNode {
  const vnode: VNode = {
    type,
    props: props || {},
    children,
    el: null,
    key: props && props.key,
    // 判断当前 vnode 类型
    shapeFlag: getShapeFlag(type),
  };

  // 判断 children 类型
  if (Array.isArray(children)) {
    vnode.shapeFlag |= ShapeFlags.ARRAY_CHILDREN;
  } else if (typeof children == "string" || typeof children == "number") {
    vnode.shapeFlag |= ShapeFlags.TEXT_CHILDREN;
  }
  // 判断 slots 类型
  if (vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
    if (isObject(children)) {
      vnode.shapeFlag |= ShapeFlags.SLOTS_CHILDREN;
    }
  }

  return vnode;
}

function getShapeFlag(type: any): number {
  return typeof type === "string"
    ? ShapeFlags.ELEMENT_NODE
    : ShapeFlags.STATEFUL_COMPONENT;
}

/**
 * @description 创建 文本节点
 * @param text
 * @returns
 */
export function createTextVNode(text: string | number) {
  return createVNode(Text, null, text);
}
