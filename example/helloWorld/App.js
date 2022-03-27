import { h } from "../../lib/guide-vue.esm.js";
export const App = {
  render() {
    return h(
      "div",
      {
        id: "root",
        class: ["text", "text-bold"],
      },
      "啊啊啊"
    );
  },
  setup() {
    return {
      msg: "world ",
    };
  },
};
