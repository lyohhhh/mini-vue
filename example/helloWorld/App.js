import { h } from "../../lib/guide-vue.esm.js";
window.self = null;
export const App = {
  render() {
    window.self = this;
    return h(
      "div",
      {
        id: "root",
        class: ["text", "text-bold"],
      },
      `hello ${this.msg} ${this.list.join(",")}`
    );
  },
  setup() {
    let list = ["你好", "世界", "你好", "明天"];
    return {
      msg: "world",
      list,
    };
  },
};
