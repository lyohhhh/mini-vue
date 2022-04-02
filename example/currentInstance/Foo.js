import { h, getCurrentInstance } from "../../lib/guide-vue.esm.js";

export const Foo = {
  name: "Foo",
  setup() {
    let fooInstance = getCurrentInstance();
    console.log(fooInstance);
  },
  render() {
    return h("p", null, `Foo`);
  },
};
