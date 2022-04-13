import { createRenderer } from "../runtime-core";
import { isEvent } from "../shared";

// 创建元素
function createElement(type: string): HTMLElement {
  return document.createElement(type);
}

// 添加属性
function patchProps(
  el: HTMLElement,
  key: string,
  oldValue: Function | string | null,
  newValue: Function | string | null
) {
  // 如果是绑定的事件
  // 绑定事件
  // 跳过本次循环
  if (isEvent(key)) {
    const evName = key.slice(2).toLocaleLowerCase();
    el.addEventListener(evName, newValue as any);
    return;
  }

  if (Array.isArray(newValue)) {
    el.setAttribute(key, newValue.join(" "));
  } else {
    // 如果复制的是 null 或者 undefined 就删除改属性
    if (newValue === null || newValue == undefined) {
      el.removeAttribute(key);
    } else {
      el.setAttribute(key, newValue as string);
    }
  }
}

// 设置元素 text
function setElementText(container: HTMLElement, text: string) {
  console.log(container, text);

  container.textContent = text;
}

// 添加元素
function insert(el: HTMLElement, container: HTMLElement) {
  container.append(el);
}

// 删除元素
function remove(child: HTMLElement) {
  let parent = child.parentNode;
  if (parent) {
    parent.removeChild(child);
  }
}

// 提供 createRenderer 函数
// 内部返回 createApp 接口
const renderer = createRenderer({
  createElement,
  patchProps,
  insert,
  remove,
  setElementText,
});

// 返回createApp 接口 -》 返回的是 createRouterer 内部返回的createAoo
export function createApp(rootComponent: Component) {
  return renderer.createApp(rootComponent);
}

// runtime-core 依赖于 runtime-dom
export * from "../runtime-core";
