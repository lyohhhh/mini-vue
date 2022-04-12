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

export const hasOwn = (target: object, key: string | symbol): boolean => {
  return Object.prototype.hasOwnProperty.call(target, key);
};

const nameRE = /-(\w)/g;

export const camelize = (str: string): string => {
  return str.replace(nameRE, (_, s: string) => (s ? s.toUpperCase() : ""));
};

export const capitalize: (str: string) => string = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * 添加 on
 * @param str
 * @returns
 */
export function toEventNameHandle(str: string): string {
  return str ? `on${capitalize(str)}` : "";
}

/**
 * 判读是否是事件
 * @returns { boolean } 是| 否
 */
export const isEvent: (str: string) => boolean = (str): boolean => {
  return /^on[A-Z]/.test(str);
};

export const EMPEY_OBJECT = {};
