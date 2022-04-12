import { h, ref } from "../../lib/guide-vue.esm.js";

const prevChildren = [h("div", null, [h("p", null, "A"), h("p", null, "B")])];
const nextChildren = [
  h("div", null, [
    h(
      "p",
      {
        id: "C",
      },
      [h("div", null, [h("p", null, "A"), h("p", null, "B")])]
    ),
    h("p", { id: "D" }, "D"),
  ]),
];
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
