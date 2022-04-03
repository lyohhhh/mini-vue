import { createRenderer } from "../../lib/guide-vue.esm.js";
import { App } from "./App.js";

const pixi = new PIXI.Application({
  width: 500,
  height: 500,
});

const renderer = createRenderer({
  createElement(type) {
    if (type == "rect") {
      const rect = new PIXI.Graphics();
      rect.beginFill(0xffffff);
      rect.drawRect(0, 0, 100, 100);
      rect.endFill();
      return rect;
    }
  },

  patchProp(el, key, value) {
    el[key] = value;
  },

  insert(el, parent) {
    parent.addChild(el);
  },
});

document.body.append(pixi.view);
renderer.createApp(App).mount(pixi.stage);
