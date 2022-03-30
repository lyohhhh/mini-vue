import { h } from "../../lib/guide-vue.esm.js";
window.self = null;
export const App = {
  render() {
    window.self = this;
    return h(
      "div",
      {
        onClick: this.ev,
        onMousedown() {
          console.log(`mouse down`);
        },
        id: "root",
        class: ["text", "text-bold"],
      },
      `hello ${this.msg} ${this.list.join(",")}`
    );
  },
  setup() {
    let list = ["你好", "世界", "你好", "明天"];
    const ev = () => console.log(`clicked me! hello ${list.join("-")}`);
    return {
      msg: "world",
      list,
      ev,
    };
  },
};
