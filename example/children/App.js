import { h, ref } from "../../lib/guide-vue.esm.js";

import { TextToArray } from "./TextToArray.js";
import { TextToText } from "./TextToText.js";
import { ArrayToText } from "./ArrayToText.js";
import { ArrayToArray } from "./ArrayToArray.js";
export const App = {
  name: "App",
  render() {
    return h(
      "div",
      {
        ...this.demo,
      },
      [
        h("p", null, "APP"),
        // 老的是 text 新的是 array
        // h(TextToArray),
        // 老的是 text 新的是 text
        // h(TextToText),
        // 老的是 array 新的是 text
        // h(ArrayToText),
        // 老的是 array 新的是 array
        h(ArrayToArray),
      ]
    );
  },
  setup() {},
};
