import { h, renderSlots } from "../../lib/guide-vue.esm.js";

export const Foo = {
  name: "Foo",
  render() {
    // return h("div", {}, [h("div", null, this.$slots)]);
    return h("div", {}, [
      renderSlots(this.$slots, "header", "count"),
      h("div", null, "main"),
      renderSlots(this.$slots, "default"),
      renderSlots(this.$slots, "footer"),
    ]);
  },
  setup() {
    return {};
  },
};
