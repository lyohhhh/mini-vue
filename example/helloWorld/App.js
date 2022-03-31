import { h } from "../../lib/guide-vue.esm.js";
import { HelloWorld } from "./HelloWorld.js";
window.self = null;
export const App = {
  name: "App",
  render() {
    window.self = this;
    return h("div", {}, [h(HelloWorld, { msg: "children component" })]);
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
