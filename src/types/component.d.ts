type Emit = (ctx: Instance, event: string, ...args: any) => void;

declare interface Option {
  data?: object | Function;
  methods?: object;
  propsData?: object;
  computed?: object;
  props?: string[] | object;
  watch?: object;
}

declare interface Component extends Option {
  setup?: (props?: object, ctx: Context) => object | Function;
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

declare interface Context {
  emit: Emit;
}

declare interface VNode {
  type: Component;
  props: object;
  children?: string | VNode[];
  el?: HTMLElement | Text | null;
  shapeFlag: int;
  key: string;
}

declare interface Instance {
  vnode: VNode;
  setupState: object;
  type: Component;
  render?: () => VNode;
  el?: HTMLElement | Text | null;
  proxy?: ProxyHandler<object>;
  props: object;
  emit: Emit;
  slots?: object;
  provides: object;
  parent: Instance | null;
  isMounted: boolean;
  prevTree?: VNode;
  subTree: VNode | {};
}

declare interface RendererOptions {
  createElement: (type: string) => HTMLElement;
  patchProps: (
    el: HTMLElement,
    key: string,
    oldValue: Function | string | null,
    newValue: Function | string | null
  ) => void;
  insert: (
    el: HTMLElement,
    container: HTMLElement,
    anchor: HTMLElement | null = null
  ) => void;
  remove: (child: HTMLElement) => void;
  setElementText: (el: HTMLElement, value: string) => void;
}

/**
 * @description Vue 包名
 */
declare namespace Vue {
  type VNode = VNode;
  type Component = Component;
  type Context = Context;
  type Instance = Instance;
  type RendererOptions = RendererOptions;
}
