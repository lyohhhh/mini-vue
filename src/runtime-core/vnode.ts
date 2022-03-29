export function createVNode(type, props?, children?): VNode {
  const vnode: VNode = {
    type,
    props,
    children,
    el: null,
  };

  return vnode;
}
