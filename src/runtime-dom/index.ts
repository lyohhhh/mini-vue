import { createRenderer } from "../runtime-core";
import { isEvent } from "../shared";

// 创建元素
function createElement(type: string): HTMLElement {
  return document.createElement(type);
}

// 添加属性
function patchProp(el: HTMLElement, key: string, value: Function | string) {
  // 如果是绑定的事件
  // 绑定事件
  // 跳过本次循环
  if (isEvent(key)) {
    const evName = key.slice(2).toLocaleLowerCase();
    el.addEventListener(evName, value as any);
    return;
  }

  if (Array.isArray(value)) {
    el.setAttribute(key, value.join(" "));
  } else {
    el.setAttribute(key, value as string);
  }
}

// 添加元素
function insert(el: HTMLElement, container: HTMLElement) {
  container.append(el);
}

// 提供 createRenderer 函数
// 内部返回 createApp 接口
const renderer = createRenderer({ createElement, patchProp, insert });

// 返回createApp 接口 -》 返回的是 createRouterer 内部返回的createAoo
export function createApp(rootComponent: Component) {
  return renderer.createApp(rootComponent);
}

// runtime-core 依赖于 runtime-dom
export * from "../runtime-core";
