// 其他属性统一在此获取
// eg: $el $option $slots $props
const PublicPropertiesMap = {
  $el: (o) => o.el,
};

export const PublicInstanceProxyHandlers = {
  get({ _: instance }, key) {
    // setup 中的数据
    if (key in instance.setupState) {
      return instance.setupState[key];
    }
    // vue2 原型上面的属性
    const publicGetter = PublicPropertiesMap[key];
    if (publicGetter) return publicGetter(instance);
  },
};
