import { h } from "../../lib/guide-vue.esm.js";

export const HelloWorld = {
  name: "HelloWorld",
  setup(props, { emit }) {
    console.log(props);
    const emitEvent = () => {
      console.log("emitEvent in HelloWorld");
      emit("emit-msg-log", "helloworld emit in App params");
    };
    return {
      emitEvent,
    };
  },
  render() {
    return h("p", { onClick: this.emitEvent }, `hello ${this.msg}`);
  },
};
