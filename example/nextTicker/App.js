import {
  h,
  ref,
  getCurrentInstance,
  nextTick,
} from "../../lib/guide-vue.esm.js";

export const App = {
  name: "App",
  setup() {
    const count = ref(1);
    const instance = getCurrentInstance();
    const onClick = () => {
      for (let i = 1; i < 100; i++) {
        count.value++;
      }
      console.log(instance);
      nextTick(() => {
        console.log(instance);
      });
    };

    return {
      count,
      onClick,
    };
  },

  render() {
    const button = h("button", { onClick: this.onClick }, "update");
    const text = h("p", null, "count:" + this.count);

    return h("div", null, [button, text]);
  },
};
