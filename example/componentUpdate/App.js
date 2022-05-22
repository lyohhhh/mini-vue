import { h, ref, createTextVNode } from "../../lib/guide-vue.esm.js";
import { Foo } from "./Foo.js";
export const App = {
  name: "App",
  render() {
    return h("div", {}, [
      h(
        "button",
        {
          onClick: this.changeMsg,
        },
        "改变MSG"
      ),
      h(Foo, {
        msg: this.msg,
      }),
      h(
        "button",
        {
          onClick: this.changeCount,
        },
        "改变Count"
      ),
      h("span", null, this.count),
    ]);
  },
  setup() {
    const isChange = ref(false);

    const msg = ref("123");

    const changeMsg = () => {
      msg.value = "456";
    };
    window.msg = msg;
    const count = ref(1);

    const changeCount = () => {
      count.value++;
    };
    return {
      isChange,
      msg,
      changeMsg,
      count,
      changeCount,
    };
  },
};
