import { h } from "../../lib/guide-vue.esm.js";
import { Foo } from "./Foo.js";
export const App = {
  name: "App",
  render() {
    return h("div", {}, [
      h("div", {}, "in App"),
      // h(Foo, {}, [h("p", {}, "Foo1"), h("p", {}, "Foo2")]),
      h(
        Foo,
        {},
        {
          header: (count) => h("p", {}, "header---" + count),
          footer: h("p", {}, "footer---"),
        }
      ),
    ]);
  },
  setup() {
    return {};
  },
};
