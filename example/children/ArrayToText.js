import { h, ref } from "../../lib/guide-vue.esm.js";

const prevChildren = [h("div", null, [h("p", null, "A"), h("p", null, "B")])];
const nextChildren = "prevChildren";
export const ArrayToText = {
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
