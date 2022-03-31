// 其他属性统一在此获取

import { hasOwn } from "../shared";

// eg: $el $option $slots $props
const PublicPropertiesMap = {
  $el: (o: Instance) => o.el,
};

export const PublicInstanceProxyHandlers = {
  get({ _: instance }, key: string | symbol) {
    const { props, setupState } = instance as Instance;
    // setup 中的数据
    if (hasOwn(setupState, key)) {
      return setupState[key];
    } else if (hasOwn(props, key)) {
      return props[key];
    }
    // vue2 原型上面的属性
    const publicGetter = PublicPropertiesMap[key];
    if (publicGetter) return publicGetter(instance);
  },
};
