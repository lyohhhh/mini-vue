import { createVNode } from "../vnode";

export const renderSlots = (slots, name: string, props) => {
  const slot = slots[name];
  if (slot) {
    // 作用域插槽
    if (typeof slot === "function") {
      return createVNode("Fragment", null, slot(props));
    } else {
      return createVNode("Fragment", null, slot);
    }
  }
};
