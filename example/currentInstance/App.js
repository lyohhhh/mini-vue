import {
  createTextVNode,
  h,
  getCurrentInstance,
} from "../../lib/guide-vue.esm.js";
import { Foo } from "./Foo.js";
export const App = {
  name: "App",
  render() {
    return h("div", {}, [createTextVNode("APP"), h(Foo)]);
  },
  setup() {
    let appInstance = getCurrentInstance();
    console.log(appInstance);
    return {};
  },
};
