import { h, ref } from "../../lib/guide-vue.esm.js";

const prevChildren = "prevChildren";
const nextChildren = [h("div", null, [h("p", null, "A"), h("p", null, "B")])];
export const TextToArray = {
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
