import { h, ref } from "../../lib/guide-vue.esm.js";

// 1. 右侧创建 新的右侧比旧的多出节点
// ( a, b )
// ( a, b )  c    d
//      ↑    ↑    ↑
//     (e1) (i) (e2)
// i = 2; e1 = 1; e2 = 3

// const prevChildren = [h("p", { key: "A" }, "A"), h("p", { key: "B" }, "B")];
// const nextChildren = [
//   h("p", { key: "A" }, "A"),
//   h("p", { key: "B" }, "B"),
//   h("p", { key: "C" }, "C"),
//   h("p", { key: "D" }, "D"),
// ];

// 2. 左侧创建 新的左侧比旧的多出节点
//       ( a, b )
// d   c ( a, b )
// ↑   ↑
// (i) (e1,e2)
// i = 0; e1 = -1; e2 = 1

// const prevChildren = [h("p", { key: "A" }, "A"), h("p", { key: "B" }, "B")];
// const nextChildren = [
//   h("p", { key: "D" }, "D"),
//   h("p", { key: "C" }, "C"),
//   h("p", { key: "A" }, "A"),
//   h("p", { key: "B" }, "B"),
// ];

// 3. 右侧移除 旧的右侧比新的多出节点
// ( a, b )  c    d
// ( a, b )
//      ↑    ↑    ↑
//     (e1) (i) (e2)
// i = 2; e1 = 1; e2 = 3

// const prevChildren = [
//   h("p", { key: "A" }, "A"),
//   h("p", { key: "B" }, "B"),
//   h("p", { key: "C" }, "C"),
//   h("p", { key: "D" }, "D"),
// ];
// const nextChildren = [h("p", { key: "A" }, "A"), h("p", { key: "B" }, "B")];

// 4.左侧移除 旧的左侧比新的多出节点
//  c   d ( a, b )
//        ( a, b )
//  ↑   ↑
//  (i) (e1,e2)
// i = 0; e1 = 1; e2 = -1

// const prevChildren = [
//   h("p", { key: "C" }, "C"),
//   h("p", { key: "D" }, "D"),
//   h("p", { key: "A" }, "A"),
//   h("p", { key: "B" }, "B"),
// ];
// const nextChildren = [h("p", { key: "A" }, "A"), h("p", { key: "B" }, "B")];

// 5.右侧移除&创建
// ( a, b ) e
// ( a, b ) c      d
//          ↑      ↑
//         (i,e1) (e2)
// i = 2; e1 = 2; e2 = 3

const prevChildren = [
  h("p", { key: "A" }, "A"),
  h("p", { key: "B" }, "B"),
  h("p", { key: "E" }, "E"),
];
const nextChildren = [
  h("p", { key: "A" }, "A"),
  h("p", { key: "B" }, "B"),
  h("p", { key: "C" }, "C"),
  h("p", { key: "D" }, "D"),
];

// 6.左侧侧移除&创建
//      e ( a, b )
//  c   d ( a, b )
//  ↑   ↑
// (i) (e1,e2)
// i = 0; e1 = 0; e2 = 1
// const prevChildren = [h("p", { key: "E" }, "E"), h("p", { key: "A" }, "A"), h("p", { key: "B" }, "B")];
// const nextChildren = [
//   h("p", { key: "A" }, "A"),
//   h("p", { key: "B" }, "B"),
// ];

// 7.中间对比
//   7.1 新节点 多出节点
//   7.2 新节点 少了节点
//   7.3 新旧节点交换位置
// (a,b) c d e (f,g)
// (a,b) e h c (f,g)
// const prevChildren = [
//   h("p", { key: "A" }, "A"),
//   h("p", { key: "B" }, "B"),
//   h("p", { key: "C" }, "C"),
//   h("p", { key: "D" }, "D"),
//   h("p", { key: "E" }, "E"),
//   h("p", { key: "F" }, "F"),
//   h("p", { key: "G" }, "G"),
// ];
// const nextChildren = [
//   h("p", { key: "A" }, "A"),
//   h("p", { key: "B" }, "B"),
//   h("p", { key: "E" }, "E"),
//   h("p", { key: "H" }, "H"),
//   h("p", { key: "C" }, "C"),
//   h("p", { key: "F" }, "F"),
//   h("p", { key: "G" }, "G"),
// ];

export const ArrayToArray = {
  name: "App",
  render() {
    return this.isChange
      ? h("div", null, nextChildren)
      : h("div", null, prevChildren);
  },
  setup() {
    const isChange = ref(false);
    window.isChange = isChange;
    return {
      isChange,
    };
  },
};
