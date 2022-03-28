import { h } from "../../lib/guide-vue.esm.js";
export const App = {
  render() {
    return h(
      "div",
      {
        id: "root",
        class: ["text", "text-bold"],
      },
      `hello ${this.list.join(",")}`
    );
  },
  setup() {
    let list = ["你好", "世界", "你好", "明天"];
    return {
      list,
    };
  },
};
