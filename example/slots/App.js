import { h, createTextVNode } from "../../lib/guide-vue.esm.js";
import { Foo } from "./Foo.js";
export const App = {
  name: "App",
  render() {
    return h("div", {}, [
      h("div", {}, "in App"),
      // h(Foo, {}, [h("p", {}, "Foo1"), h("p", {}, "Foo2")]),
      h(
        Foo,
        {
          msg: "你好 props",
          onMainClick() {
            console.log("emit in app");
          },
        },
        {
          header: (count) => [
            h("p", {}, "header---" + count),
            createTextVNode("你好"),
          ],

          footer: [
            h(
              "p",
              {
                onClick() {
                  console.log(`footer clicked `);
                },
              },
              "footer---"
            ),
            createTextVNode(123_456_789),
          ],
        }
      ),
      createTextVNode("createTextNode"),
    ]);
  },
  setup() {},
};
