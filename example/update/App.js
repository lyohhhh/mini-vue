import { h, ref } from "../../lib/guide-vue.esm.js";
export const App = {
  name: "App",
  render() {
    return h(
      "div",
      {
        ...this.demo,
      },
      [
        h("p", { ...this.demo }, `count : ${this.count}`),
        h("button", { onClick: this.onClick }, "点击增加Count"),
        h("button", { onClick: this.demoClickHandler1 }, "点击修改foo值"),
        h("button", { onClick: this.demoClickHandler2 }, "点击删除foo值"),
        h("button", { onClick: this.demoClickHandler3 }, "点击修改demo对象"),
      ]
    );
  },
  setup() {
    let count = ref(0);

    const demo = ref({
      foo: "foo",
      bar: "bar",
    });
    const onClick = () => {
      count.value++;
    };

    const demoClickHandler1 = () => {
      demo.value.foo = "new-foo";
    };
    const demoClickHandler2 = () => {
      demo.value.foo = null;
    };

    const demoClickHandler3 = () => {
      demo.value = {
        foo: "delete-foo",
      };
    };
    return {
      count,
      onClick,
      demoClickHandler1,
      demoClickHandler2,
      demoClickHandler3,
      demo,
    };
  },
};
