export const enum ShapeFlags {
  // 普通 element
  ELEMENT_NODE = 1,
  // 组件类型
  STATEFUL_COMPONENT = 1 << 2,
  // 文本节点
  TEXT_CHILDREN = 1 << 3,
  // 数据节点
  ARRAY_CHILDREN = 1 << 4,
  // slots
  SLOTS_CHILDREN = 1 << 5,
}
