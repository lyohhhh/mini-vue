import { createVNode } from "./vnode";

export function h(type, props?, children?): VNode {
  return createVNode(type, props, children);
}
