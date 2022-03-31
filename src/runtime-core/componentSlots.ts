import { ShapeFlags } from "../shared/shapeFlags";

export const initSlots = (instance: Instance, children: any) => {
  // instance.slots = Array.isArray(children) ? children : [children];

  // 判断是否是 slots
  if (instance.vnode.shapeFlag & ShapeFlags.SLOTS_CHILDREN) {
    normalizeObjectSlot(children, instance.slots);
  }
};

function normalizeObjectSlot(children, slots) {
  // 具名插槽
  // 挂载在 instance.slots 上
  // 通过 componentPublicInstance proxy 访问
  for (const key in children) {
    const slot = children[key];

    // 是否是 作用域插槽
    if (typeof slot === "function") {
      slots[key] = (props) => normalizeSlotValue(slot(props));
    } else {
      slots[key] = normalizeSlotValue(slot);
    }
  }
}

// 将 slot 转化为数组 保证多个 slots 存在
function normalizeSlotValue(slot): object[] {
  return Array.isArray(slot) ? slot : [slot];
}
