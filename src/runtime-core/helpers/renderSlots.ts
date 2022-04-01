import { createVNode } from "../vnode";
import { Fragment } from "../vnode";
export const renderSlots = (slots, name: string, props) => {
  const slot = slots[name];
  if (slot) {
    // 作用域插槽
    // 使用 Fragment 防止生成冗余标签
    if (typeof slot === "function") {
      return createVNode(Fragment, null, slot(props));
    } else {
      return createVNode(Fragment, null, slot);
    }
  }
};
