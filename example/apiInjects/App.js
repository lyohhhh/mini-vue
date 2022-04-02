import {
  createTextVNode,
  h,
  provide,
  inject,
} from "../../lib/guide-vue.esm.js";

const Foo = {
  name: "Foo",
  setup() {
    provide("count", "1");
    provide("name", "刘越");
    return () => h(Foo2);
  },
};

const Foo2 = {
  name: "Foo2",
  setup() {
    provide("count", "10");
    provide("age", "18");
    return () => h(Foo3);
  },
};
const Foo3 = {
  name: "Foo3",
  setup() {
    const count = inject("count");
    const name = inject("name");
    const age = inject("age");
    const school = inject("school", () => "清华大学");
    return () => h("p", null, `Foo3-${count}-${name}-${age}-${school}`);
  },
};
export const App = {
  name: "App",
  setup() {
    return () => h("div", null, [createTextVNode("APP"), h(Foo)]);
  },
};
