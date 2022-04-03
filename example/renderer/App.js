import { h } from "../../lib/guide-vue.esm.js";
window.self = null;
export const App = {
  name: "App",
  setup() {
    const x = 200;
    const y = 200;

    return () => h("rect", { x, y });
  },
};
