import { h, ref } from "../../lib/guide-vue.esm.js";
export const App = {
  name: "App",
  render() {
    return h("div", null, [
      h("p", null, `count : ${this.count}`),
      h("button", { onClick: this.onClick }, "点击增加Count"),
    ]);
  },
  setup() {
    let count = ref(0);
    const onClick = () => {
      count.value++;
    };
    return {
      count,
      onClick,
    };
  },
};
