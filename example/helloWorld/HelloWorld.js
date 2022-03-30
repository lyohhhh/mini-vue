import { h } from "../../lib/guide-vue.esm.js";

export const HelloWorld = {
  name: "HelloWorld",
  setup(props) {
    console.log(props);
  },
  render() {
    return h("p", {}, `hello ${this.msg}`);
  },
};
