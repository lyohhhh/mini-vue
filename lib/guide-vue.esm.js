/**
 * 合并对象
 */
const extend = Object.assign;
/**
 * @description 判读是否为对象
 * @param target
 * @returns
 */
const isObject = (target) => {
    return target !== null && typeof target === "object";
};
const hasChanged = (val, newVal) => {
    return !Object.is(val, newVal);
};
const hasOwn = (target, key) => {
    return Object.prototype.hasOwnProperty.call(target, key);
};
const nameRE = /-(\w)/g;
const camelize = (str) => {
    return str.replace(nameRE, (_, s) => (s ? s.toUpperCase() : ""));
};
const capitalize = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
};
/**
 * 添加 on
 * @param str
 * @returns
 */
function toEventNameHandle(str) {
    return str ? `on${capitalize(str)}` : "";
}
/**
 * 判读是否是事件
 * @returns { boolean } 是| 否
 */
const isEvent = (str) => {
    return /^on[A-Z]/.test(str);
};
const EMPEY_OBJECT = {};

// 使用 Fragment 防止数组元素需要多层嵌套
const Fragment = Symbol("Fragment");
// 使用 Text 节点映射文本节点
const Text = Symbol("Text");
/**
 * @description 1. 正常element ： "div", {}, 'hello'
 * @description 2. Component ： Component, { props, emit }
 * @param type
 * @param props
 * @param children
 * @returns
 */
function createVNode(type, props, children) {
    const vnode = {
        type,
        props: props || {},
        children,
        el: null,
        // 判断当前 vnode 类型
        shapeFlag: getShapeFlag(type),
    };
    // 判断 children 类型
    if (Array.isArray(children)) {
        vnode.shapeFlag |= 16 /* ARRAY_CHILDREN */;
    }
    else if (typeof children == "string" || typeof children == "number") {
        vnode.shapeFlag |= 8 /* TEXT_CHILDREN */;
    }
    // 判断 slots 类型
    if (vnode.shapeFlag & 4 /* STATEFUL_COMPONENT */) {
        if (isObject(children)) {
            vnode.shapeFlag |= 32 /* SLOTS_CHILDREN */;
        }
    }
    return vnode;
}
function getShapeFlag(type) {
    return typeof type === "string"
        ? 1 /* ELEMENT_NODE */
        : 4 /* STATEFUL_COMPONENT */;
}
/**
 * @description 创建 文本节点
 * @param text
 * @returns
 */
function createTextVNode(text) {
    return createVNode(Text, null, text);
}

function h(type, props, children) {
    return createVNode(type, props, children);
}

const renderSlots = (slots, name, props) => {
    const slot = slots[name];
    if (slot) {
        // 作用域插槽
        // 使用 Fragment 防止生成冗余标签
        if (typeof slot === "function") {
            return createVNode(Fragment, null, slot(props));
        }
        else {
            return createVNode(Fragment, null, slot);
        }
    }
};

// 依赖收集的容器
const targetMap = new Map();
// 定义一个变量 获取 effect 中的 fn
let activedEffect;
// 定义 是否需要收集依赖
let shouldTrack = false;
class ReactiveEffect {
    constructor(fn, scheduler) {
        this.scheduler = scheduler;
        this.deps = [];
        this.active = true;
        this._fn = fn;
    }
    run() {
        // 判断是否 stop 是的话直接返回 fn
        // 否则 将收集依赖
        if (!this.active) {
            return this._fn();
        }
        shouldTrack = true;
        // 执行当前方法时 将 this 赋值给 activedEffect
        // 需要将 activedEffect 放在 fn 执行之前
        // fn 执行时会执行 get 操作 -> 收集依赖时 activedEffect 为空
        activedEffect = this;
        // 获取 fn 返回值 并且返回
        const result = this._fn();
        // 执行完之后 shouldTrack 为 false 清空全局变量
        shouldTrack = false;
        // 将返回值返回
        return result;
    }
    stop() {
        // 清除过了就不再清除
        if (this.active) {
            clearEffect(this);
            // 如果传入了 onStop 执行 onStop 回调
            if (this.onStop) {
                this.onStop();
            }
            this.active = false;
        }
    }
}
/**
 * @description 清除所有effect
 * @param effect
 */
function clearEffect(effect) {
    effect.deps.forEach((dep) => {
        dep.delete(effect);
    });
    effect.deps.length = 0;
}
/**
 * @description 收集依赖
 * @param target
 * @param key
 */
function track(target, key) {
    // 是否需要收集依赖
    if (!isTracking())
        return;
    // 一个target => 一个key => 一个dep
    let depsMap = targetMap.get(target);
    // 初始化时 depsMap 获取不到
    // 需要手动存
    if (!depsMap) {
        depsMap = new Map();
        // 建立映射关系
        targetMap.set(target, depsMap);
    }
    let dep = depsMap.get(key);
    if (!dep) {
        dep = new Set();
        // 建立映射关系
        depsMap.set(key, dep);
    }
    // // 没有 effect
    // if (!activedEffect) return;
    // // 不需要手机依赖
    // if (!shouldTrack) return;
    trackEffects(dep);
}
/**
 * @description 收集依赖
 */
function trackEffects(dep) {
    // 如果 deps 中有 activedEffect
    if (dep.has(activedEffect))
        return;
    // 将 activedEffect 添加到 dep中
    dep.add(activedEffect);
    // 反向添加 dep stop方法
    activedEffect.deps.push(dep);
}
function isTracking() {
    return shouldTrack && activedEffect !== undefined;
}
/**
 * @description 触发依赖
 * @param { T } target
 * @param { string | symbol } key
 */
function trigger(target, key) {
    // 获取 target 的映射 Map
    let depsMap = targetMap.get(target);
    // 防止为了没有收集依赖 就触发
    if (!depsMap)
        return;
    // 获取 key 的映射 Set
    let dep = depsMap.get(key);
    if (!dep)
        return;
    triggerEffects(dep);
}
/**
 * @description 触发依赖
 */
function triggerEffects(dep) {
    // 遍历执行 fn 方法
    for (let effect of dep) {
        // 如果存在 scheduler 执行scheduler
        if (effect.scheduler) {
            effect.scheduler();
        }
        else {
            // 否则执行 run
            effect.run();
        }
    }
}
/**
 * @description 创建effect
 * @param { Funciton } fn 监听函数
 * @param { opt }`
 * @returns { Function }
 */
function effect(fn, opt = {}) {
    const _effect = new ReactiveEffect(fn, opt.scheduler);
    _effect.run();
    // 考虑之后的多个参数
    extend(_effect, opt);
    const runner = _effect.run.bind(_effect);
    // 绑定当前effect
    runner._effect = _effect;
    // 返回 runner
    return runner;
}

/**
 * @description 创建 get
 * @param { boolean } isReadonly 是否是只读对象
 * @param { boolean } shallow 是否浅层对象
 * @returns { any } 获取的值
 */
function createGetter(isReadonly = false, shallow = false) {
    return function get(target, key) {
        // 获取 目标
        const res = Reflect.get(target, key);
        // 判读是否是响应式对象
        if ("__v_isReavtive" /* IS_REACTIVE */ == key) {
            return !isReadonly;
            // 是否是只读对象
        }
        else if ("__v_isReadonly" /* IS_READONLY */ == key) {
            return isReadonly;
        }
        if (shallow && isReadonly) {
            return res;
        }
        // 不是只读对象才收集依赖
        // 只读对象 只能 get 不能 set
        // 手机依赖无作用
        if (shallow && !isReadonly) {
            // 依赖收集
            track(target, key);
            return res;
        }
        if (!shallow && !isReadonly) {
            track(target, key);
        }
        // 对象嵌套 递归收集依赖
        if (isObject(res)) {
            // 如果是 只读属性
            return isReadonly ? readonly(res) : reactive(res);
        }
        return res;
    };
}
/**
 * @description 创建 set
 */
function createSetter() {
    return function (target, key, value) {
        const res = Reflect.set(target, key, value);
        // 触发依赖
        trigger(target, key);
        return res;
    };
}
const get = createGetter();
const set = createSetter();
/**
 * @description 创建响应式对象
 */
const mutableHandlers = {
    get,
    set,
};
const shallowReactiveGet = createGetter(false, true);
/**
 * @description 创建表层 reactive 对象
 */
extend({}, mutableHandlers, {
    get: shallowReactiveGet,
});
const readonlyGet = createGetter(true);
/**
 * @description 创建只读对象
 */
const readonlyHandles = {
    get: readonlyGet,
    set(target, key, value) {
        console.warn(`${String(key)} can't update, because this is readonly`);
        return true;
    },
};
const shallowReadonlyGet = createGetter(true, true);
/**
 * @description 创建表层 readonly 对象
 */
const shallowReadonlyHandles = extend({}, readonlyHandles, {
    get: shallowReadonlyGet,
    set(target, key, value) {
        console.warn(`${String(key)} can't update, because this is readonly`);
        return true;
    },
});

/**
 * @description 创建响应式对象
 * @param { T } raw
 * @returns { T }
 */
function reactive(raw) {
    return createActiviedObject(raw, mutableHandlers);
}
/**
 * @description 创建只读对象
 * @param { T } raw
 * @returns { T }
 */
function readonly(raw) {
    return createActiviedObject(raw, readonlyHandles);
}
function shallowReadonly(raw) {
    return createActiviedObject(raw, shallowReadonlyHandles);
}
function createActiviedObject(raw, baseHandles) {
    return new Proxy(raw, baseHandles);
}

class Refimpl {
    constructor(val) {
        this.__v_isRef__ = true;
        this._rawValue = val;
        this._value = convert(val);
        this.dep = new Set();
    }
    get value() {
        trackRef(this);
        return this._value;
    }
    set value(newVal) {
        // 判断 newVal 是否改变
        // 改变之后才触发依赖
        // 这里需要 没有改变过的值和之前的值比较
        if (hasChanged(this._rawValue, newVal)) {
            this._rawValue = newVal;
            // 触发依赖在赋值之后触发
            this._value = convert(newVal);
            // 触发依赖
            triggerEffects(this.dep);
        }
    }
}
/**
 * @description 如果是响应式对象就需要 reactive 包裹
 */
function convert(val) {
    return isObject(val) ? reactive(val) : val;
}
/**
 * 收集 dep
 */
function trackRef(ref) {
    // 是否处在收集依赖中 是的话则收集依赖
    if (isTracking()) {
        // 收集依赖
        trackEffects(ref.dep);
    }
}
/**
 * @description ref
 */
function ref(val) {
    return new Refimpl(val);
}
/**
 * @description 判断是否是 ref 对象
 */
function isRef(ref) {
    return !!ref.__v_isRef__;
}
/**
 * @description 返回 ref 的值
 */
function unRef(ref) {
    return isRef(ref) ? ref.value : ref;
}
/**
 * @description 修改 ref 不用使用 .value 访问值
 */
function proxyRefs(proxyWithRefs) {
    return new Proxy(proxyWithRefs, {
        get(t, k) {
            return unRef(Reflect.get(t, k));
        },
        set(t, k, v) {
            if (isRef(t[k]) && !isRef(v)) {
                return (t[k].value = v);
            }
            else {
                return Reflect.set(t, k, v);
            }
        },
    });
}

/**
 * @description 子组件发送事件
 * @param instance 当前组件实例 通过bind传入
 * @param event  事件名称
 * @param args 参数
 */
function emit(instance, event, ...args) {
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

function initProps(instance, rawProps) {
    instance.props = rawProps;
}

// 其他属性统一在此获取
// eg: $el $option $slots $props
const PublicPropertiesMap = {
    $el: (o) => o.el,
    $slots: (o) => o.slots,
};
const PublicInstanceProxyHandlers = {
    get({ _: instance }, key) {
        const { props, setupState } = instance;
        // setup 中的数据
        if (hasOwn(setupState, key)) {
            return setupState[key];
        }
        else if (hasOwn(props, key)) {
            return props[key];
        }
        // vue2 原型上面的属性
        const publicGetter = PublicPropertiesMap[key];
        if (publicGetter)
            return publicGetter(instance);
    },
};

const initSlots = (instance, children) => {
    // instance.slots = Array.isArray(children) ? children : [children];
    // 判断是否是 slots
    if (instance.vnode.shapeFlag & 32 /* SLOTS_CHILDREN */) {
        normalizeObjectSlot(children, instance.slots);
    }
};
function normalizeObjectSlot(children, slots) {
    // 具名插槽
    // 挂载在 instance.slots 上
    // 通过 componentPublicInstance proxy 访问
    for (const key in children) {
        const slot = children[key];
        // 是否是 作用域插槽
        if (typeof slot === "function") {
            slots[key] = (props) => normalizeSlotValue(slot(props));
        }
        else {
            slots[key] = normalizeSlotValue(slot);
        }
    }
}
// 将 slot 转化为数组 保证多个 slots 存在
function normalizeSlotValue(slot) {
    return Array.isArray(slot) ? slot : [slot];
}

/**
 * 创建组件实例 获取实例
 */
function createComponentInstance(vnode, parent) {
    const instance = {
        type: vnode.type,
        vnode,
        parent,
        setupState: {},
        provides: parent ? parent.provides : {},
        props: {},
        emit: () => { },
        slots: {},
        subTree: {},
        isMounted: false,
    };
    // 使用 bind 将 instance 实例传入
    // 用户 只穿入 event
    instance.emit = emit.bind(null, instance);
    return instance;
}
/**
 * 初始化组件
 */
function setupComponent(instance) {
    const { props } = instance.vnode;
    // TODO
    // 初始化
    initProps(instance, props);
    initSlots(instance, instance.vnode.children);
    // 初始化一个有状态的组件 -> 函数组件没有状态
    setupStatefulComponent(instance);
}
/**
 * 初始化一个有状态的组件
 */
function setupStatefulComponent(instance) {
    // 获取组件中的 setup
    const component = instance.vnode.type;
    // 通过 Proxy 实现 vue2 中挂载原型上的方法
    // this props ....
    instance.proxy = new Proxy({ _: instance }, 
    // 统一 proxy 获取属性
    PublicInstanceProxyHandlers);
    const { setup } = component;
    if (setup) {
        // 将当前组件实例赋值
        setCurrentInstance(instance);
        // 有可能是 object 有可能是 function
        // 将 props 传给 setup
        const setupResult = setup(shallowReadonly(instance.props), {
            // 绑定event
            emit: instance.emit,
        });
        // 将当前组件实例清空
        setCurrentInstance(null);
        // 对 setup 返回回来的值进行挂载
        handleSetupResult(instance, setupResult);
    }
}
let currentInstance = null;
/**
 * 获取当前组件实例
 * 必须在当前组件的 setup 中获取
 * 在 setup 中获取的时候 currentInstance 才有值
 */
function getCurrentInstance() {
    return currentInstance;
}
function setCurrentInstance(instance) {
    currentInstance = instance;
}
/**
 * 判断 setup 返回的值 不同类型进行不同操作
 */
function handleSetupResult(instance, setupResult) {
    // TODO
    // Function
    if (typeof setupResult === "object") {
        instance.setupState = proxyRefs(setupResult);
    }
    else if (typeof setupResult === "function") {
        instance.render = setupResult;
    }
    // 保证 render 函数中是有值的
    finishComponentSetup(instance);
}
// 将实例的 render 复制
function finishComponentSetup(instance) {
    const component = instance.type;
    // 查看是否有 render 函数
    if (component.render) {
        // 有的话
        instance.render = component.render;
    }
}

// 注入依赖
// 当父级 key 和 爷爷级别的 key 重复的时候，对于子组件来讲，需要取最近的父级别组件的值
// provides 初始化的时候是在 createComponent 时处理的，当时是直接把 parent.provides 赋值给组件的 provides 的
// 所以，如果说这里发现 provides 和 parentProvides 相等的话，那么就说明是第一次做 provide(对于当前组件来讲)
// 我们就可以把 parent.provides 作为 currentInstance.provides 的原型重新赋值
// 1.获取当前组件的实例
// 2.获取当前组件实例的 provides
// 3.获取当前组件实例的 父组件实例
// 4.provides 和 parentProvides 相等的话，那么就说明是第一次做
// 5.parent.provides 作为 currentInstance.provides 的原型重新赋值
function provide(key, value) {
    var _a;
    const instance = getCurrentInstance();
    if (instance) {
        let { provides } = instance;
        const parentProvides = (_a = instance.parent) === null || _a === void 0 ? void 0 : _a.provides;
        if (parentProvides === provides) {
            provides = instance.provides = Object.create(parentProvides);
        }
        provides[key] = value;
    }
}
// 获取注入的依赖
// 获取当前组件的父组件的实例
// 因为指向原型链
// 一层一层查找
// TODO
// 之间包含一层虚拟节点 parent 为 null
function inject(key, defaultValue) {
    var _a;
    let instance = getCurrentInstance();
    if (instance) {
        const provides = ((_a = instance.parent) === null || _a === void 0 ? void 0 : _a.provides) || {};
        if (key in provides) {
            return provides[key];
        }
        else if (defaultValue) {
            if (typeof defaultValue === "function") {
                return defaultValue();
            }
            return defaultValue;
        }
    }
}

// import { render } from "./runderer";
function createAppAPI(render) {
    return function createApp(rootComponent) {
        return {
            mount(rootContainer) {
                if (!rootContainer) {
                    throw new Error(`mounted element undefined`);
                }
                // 先将 rootComponent -> vnode
                // Component -> vnode
                // 后续的操作将会基于 vnode
                // 将 rootComponent 转化为 vnode
                const vnode = createVNode(rootComponent);
                // 调用 render 函数对 vnode 进行操作
                render(vnode, rootContainer);
            },
        };
    };
}

// 使用 createRouterer 接口
// 内部的  createElement, patchProp, insert 可以用户自己定义
function createRenderer(options) {
    const { createElement: hostCreateElement, patchProps: hostPatchProps, insert: hostInsert, } = options;
    function render(vnode, container, parentComponent = null) {
        // 调用 patch 方法以便后续对 vnode 进行操作
        patch(null, vnode, container, parentComponent);
    }
    // 传入 parentComponent 为了 provide 和 inject
    // 在 父级元素上获取注入的数据
    // n1 为之前的 vnode
    // n2 为当前的 Vnode
    function patch(n1, n2, container, parentComponent = null) {
        // debugger;
        const { type, shapeFlag } = n2;
        switch (type) {
            case Fragment:
                // Fragment 不创建标签 直接添加在 container 上
                processFragment(n1, n2, container);
                break;
            case Text:
                // 子节点为字符串
                processText(n1, n2, container);
                break;
            default:
                if (shapeFlag & 1 /* ELEMENT_NODE */) {
                    // 处理 Element
                    processElement(n1, n2, container, parentComponent);
                }
                else if (shapeFlag & 4 /* STATEFUL_COMPONENT */) {
                    // 处理组件
                    processComponent(n1, n2, container, parentComponent);
                }
                break;
        }
    }
    function processComponent(n1, n2, container, parentComponent = null) {
        // 1.先挂载组件
        mountComponent(n2, container, parentComponent);
    }
    function mountComponent(vnode, container, parentComponent = null) {
        // debugger;
        // 1.先创建组件实例 获取实例
        const instance = createComponentInstance(vnode, parentComponent);
        // 2.调用 setup
        setupComponent(instance);
        // 3.调用 render
        setupRenderEffect(instance, container);
    }
    function setupRenderEffect(instance, container) {
        effect(() => {
            if (instance.render) {
                // 判断是否是 虚拟节点初始化
                if (!instance.isMounted) {
                    // 返回的 虚拟节点
                    // render 函数中可能使用了 this
                    // 所以在赋值给实例之前 将 this 指向 proxy 代理的对象上
                    // 包括 props 都是通过代理来访问的
                    const subTree = instance.render.call(instance.proxy);
                    // 将当前的 虚拟节点进行保存
                    // update Element 时 对新旧 Vnode 进行比较
                    instance.prevTree = subTree;
                    // 对返回的 虚拟节点进行挂载
                    // vnode -> element => mountElement
                    patch(null, subTree, container, instance);
                    // 将根元素节点 挂载在 setupState 上
                    instance.el = subTree.el;
                    instance.isMounted = true;
                }
                else {
                    const subTree = instance.render.call(instance.proxy);
                    const prevTree = instance.prevTree;
                    // 将当前的 虚拟节点进行保存
                    // update Element 时 对新旧 Vnode 进行比较
                    instance.prevTree = subTree;
                    patch(prevTree, subTree, container, instance);
                }
            }
        });
    }
    /**
     * 处理 element
     */
    function processElement(n1, n2, container, parentComponent = null) {
        // n1 不存在就代表是初始化
        if (!n1) {
            console.log(" init ");
            mountElement(n2, container, parentComponent);
        }
        else {
            console.log(" update ");
            console.log(n1);
            console.log(n2);
            patchElement(n1, n2);
        }
    }
    /**
     * 处理 Text
     */
    function processText(n1, n2, container) {
        // 获取到 string
        const { children } = n2;
        // 创建文本节点
        const textNode = (n2.el = document.createTextNode(children));
        // 添加到元素上
        container.append(textNode);
    }
    /**
     * 处理 Fragment
     */
    function processFragment(n1, n2, container) {
        // 省略  const el = await mountTag(vnode);
        //       mountAttributes(vnode, el);
        // 直接将 children 添加在 container 上
        mountChildren(n2, container);
    }
    /**
     * 修改Element
     */
    function patchElement(n1, n2, container, parentComponent) {
        // console.log("update ");
        let el = (n2.el = n1.el);
        let oldProps = n1.props || EMPEY_OBJECT;
        let newProps = n2.props || EMPEY_OBJECT;
        patchProps(el, oldProps, newProps);
    }
    function patchProps(el, oldProps, newProps) {
        if (oldProps !== newProps) {
            // 遍历新 props 添加 或者 修改 props
            for (const key in newProps) {
                // 获取到新老节点 进行修改
                let prevProps = oldProps[key];
                let nextProps = newProps[key];
                if (prevProps !== nextProps) {
                    // 调用  createRenderer patchProps
                    hostPatchProps(el, key, prevProps, nextProps);
                }
            }
            // 如果老节点存在的值 在新节点上不存在 需要删除该值
            // 如: new : { foo : 'foo'}
            //     old : { foo : 'foo', bar : 'bar'}
            // 当前元素上则只有 foo
            if (oldProps !== EMPEY_OBJECT) {
                for (let key in oldProps) {
                    if (!(key in newProps)) {
                        let prevProps = oldProps[key];
                        hostPatchProps(el, key, prevProps, null);
                    }
                }
            }
        }
    }
    /**
     * 挂载到页面上
     * 移除 Promise 防止 createTextVNode 创建在第一个元素上
     */
    function mountElement(n2, container, parentComponent = null) {
        // const el = await mountTag(vnode);
        // 写死创建节点 使用方法来创建节点
        // 挂载的元素不同
        // const el = document.createElement(<string>vnode.type);
        const el = hostCreateElement(n2.type);
        n2.el = el;
        mountAttributes(n2, el);
        mountChildren(n2, el, parentComponent);
        // container.append(el);
        hostInsert(el, container);
    }
    /**
     * 设置 Attributes
     */
    function mountAttributes(vnode, container) {
        const { props } = vnode;
        for (let key in props) {
            const val = props[key];
            // // 如果是绑定的事件
            // // 绑定事件
            // // 跳过本次循环
            // if (isEvent(key)) {
            //   const evName = key.slice(2).toLocaleLowerCase();
            //   container.addEventListener(evName, val);
            //   continue;
            // }
            // if (Array.isArray(val)) {
            //   container.setAttribute(key, val.join(" "));
            // } else {
            //   container.setAttribute(key, val);
            // }
            // 使用方法来创建
            hostPatchProps(container, key, null, val);
        }
    }
    /**
     * 挂载元素
     */
    function mountChildren(vnode, container, parentComponent = null) {
        const { children } = vnode;
        if (vnode.shapeFlag & 8 /* TEXT_CHILDREN */) {
            container.textContent = children;
        }
        else if (vnode.shapeFlag & 16 /* ARRAY_CHILDREN */) {
            // TODO
            // 数组类型
            children.forEach((item) => {
                item && patch(null, item, container, parentComponent);
            });
        }
    }
    return {
        createApp: createAppAPI(render),
    };
}

// 创建元素
function createElement(type) {
    return document.createElement(type);
}
// 添加属性
function patchProps(el, key, oldValue, newValue) {
    // 如果是绑定的事件
    // 绑定事件
    // 跳过本次循环
    if (isEvent(key)) {
        const evName = key.slice(2).toLocaleLowerCase();
        el.addEventListener(evName, newValue);
        return;
    }
    if (Array.isArray(newValue)) {
        el.setAttribute(key, newValue.join(" "));
    }
    else {
        // 如果复制的是 null 或者 undefined 就删除改属性
        if (newValue === null || newValue == undefined) {
            el.removeAttribute(key);
        }
        else {
            el.setAttribute(key, newValue);
        }
    }
}
// 添加元素
function insert(el, container) {
    container.append(el);
}
// 提供 createRenderer 函数
// 内部返回 createApp 接口
const renderer = createRenderer({ createElement, patchProps, insert });
// 返回createApp 接口 -》 返回的是 createRouterer 内部返回的createAoo
function createApp(rootComponent) {
    return renderer.createApp(rootComponent);
}

export { createApp, createRenderer, createTextVNode, getCurrentInstance, h, inject, provide, proxyRefs, ref, renderSlots };
