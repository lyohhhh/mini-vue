// import { render } from "./runderer";
import { createVNode } from "./vnode";

export function createAppAPI(render: Function) {
  return function createApp(rootComponent: Component) {
    return {
      mount(rootContainer: HTMLElement) {
        if (!rootContainer) {
          throw new Error(`mounted element undefined`);
        }
        // 先将 rootComponent -> vnode
        // Component -> vnode
        // 后续的操作将会基于 vnode

        // 将 rootComponent 转化为 vnode
        const vnode: VNode = createVNode(rootComponent);
        // 调用 render 函数对 vnode 进行操作
        render(vnode, rootContainer);
      },
    };
  };
}
