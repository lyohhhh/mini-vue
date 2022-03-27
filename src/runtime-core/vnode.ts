export function createVNode(type, props?, children?): VNode {
  const vnode: VNode = {
    type,
    props,
    children,
  };

  return vnode;
}
