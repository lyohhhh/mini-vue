import { h } from "../../lib/guide-vue.esm.js";

export const Foo = {
  name: "Foo",
  render() {
    return h(
      "div",
      {
        id: 1,
      },
      `props msg : ${this.$props.msg}`
    );
  },
  setup(props, { emit }) {},
};
