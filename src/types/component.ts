declare interface Option {
  data?: object | Function;
  methods?: object;
  propsData?: object;
  computed?: object;
  props?: string[] | object;
  watch?: object;
}

declare interface Component extends Option {
  setup?: () => object | Function;
  render?: () => VNode;
  beforeCreate?: () => void;
  created?: () => void;
  beforeMount?: () => void;
  mounted?: () => void;
  beforeUpdate?: () => void;
  updated?: () => void;
  activated?: () => void;
  deactivated?: () => void;
  beforeDestroy?: () => void;
  destroyed?: () => void;
  errorCaptured?: () => void;
}

declare interface VNode {
  type: Component;
  props?: object;
  children?: string | VNode[];
}

declare interface Instance {
  vnode: VNode;
  setupState?: object | Function;
  type: Component;
  render?: () => VNode;
}
