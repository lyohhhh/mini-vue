import { h, renderSlots } from "../../lib/guide-vue.esm.js";

export const Foo = {
  name: "Foo",
  render() {
    // return h("div", {}, [h("div", null, this.$slots)]);
    return h("div", {}, [
      renderSlots(this.$slots, "header", "count"),
      h(
        "div",
        {
          onClick: this.emitEvent,
        },
        "main" + this.msg
      ),
      renderSlots(this.$slots, "default"),
      renderSlots(this.$slots, "footer"),
    ]);
  },
  setup(props, { emit }) {
    let event = () => {
      console.log(`click in foo`);
      emit("mainClick", "emit click event");
    };
    return { emitEvent: event };
  },
};
