import { toEventNameHandle, camelize } from "../shared";

/**
 * @description 子组件发送事件
 * @param instance 当前组件实例 通过bind传入
 * @param event  事件名称
 * @param args 参数
 */
export function emit(instance: Instance, event: string, ...args: any) {
  /**
   * 监听事件 在 props 里面
   */
  const { props } = instance;
  // ------------ createVNode ------------
  // 通过 h 第二个参数传入
  const eventKey = toEventNameHandle(camelize(event));
  // 判断 props 中是否传入这个函数
  // 有值的话 执行函数 并将参数传入
  if (props[eventKey]) {
    props[eventKey](...args);
  }
}
