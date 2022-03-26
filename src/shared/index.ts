/**
 * 合并对象
 */
export const extend = Object.assign;

/**
 * @description 判读是否为对象
 * @param target
 * @returns
 */
export const isObject = (target: any): boolean => {
  return target !== null && typeof target === "object";
};

export const hasChanged = (val, newVal) => {
  return !Object.is(val, newVal);
};
