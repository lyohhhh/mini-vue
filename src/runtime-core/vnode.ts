import { ShapeFlags } from "../shared/shapeFlags";

export function createVNode(type, props?, children?): VNode {
  const vnode: VNode = {
    type,
    props: props || {},
    children,
    el: null,
    // 判断当前 vnode 类型
    shapeFlag: getShapeFlag(type),
  };

  // 判断 children 类型
  if (Array.isArray(children)) {
    vnode.shapeFlag |= ShapeFlags.ARRAY_CHILDREN;
  } else if (typeof children == "string") {
    vnode.shapeFlag |= ShapeFlags.TEXT_CHILDREN;
  }

  return vnode;
}

function getShapeFlag(type: any): number {
  return typeof type === "string"
    ? ShapeFlags.ELEMENT_NODE
    : ShapeFlags.STATEFUL_COMPONENT;
}
