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
function toEventNameHandle(str) {
    return str ? `on${capitalize(str)}` : "";
}

// 依赖收集的容器
const targetMap = new Map();
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
            return res;
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
function createComponentInstance(vnode) {
    const instance = {
        type: vnode.type,
        vnode,
        setupState: {},
        props: {},
        emit: () => { },
        slots: {},
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
        // 有可能是 object 有可能是 function
        // 将 props 传给 setup
        const setupResult = setup(shallowReadonly(instance.props), {
            // 绑定event
            emit: instance.emit,
        });
        handleSetupResult(instance, setupResult);
    }
}
/**
 * 判断 setup 返回的值 不同类型进行不同操作
 */
function handleSetupResult(instance, setupResult) {
    // TODO
    // Function
    if (typeof setupResult === "object") {
        instance.setupState = setupResult;
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

function render(vnode, container) {
    // 调用 patch 方法以便后续对 vnode 进行操作
    patch(vnode, container);
}
function patch(vnode, container) {
    const { type } = vnode;
    switch (type) {
        case "Fragment":
            // Fragment 不创建标签 直接添加在 container 上
            processFragment(vnode, container);
            break;
        default:
            if (vnode.shapeFlag & 1 /* ELEMENT_NODE */) {
                // 处理 Element
                processElement(vnode, container);
            }
            else if (vnode.shapeFlag & 4 /* STATEFUL_COMPONENT */) {
                // 处理组件
                processComponent(vnode, container);
            }
            break;
    }
}
function processComponent(vnode, container) {
    // 1.先挂载组件
    mountComponent(vnode, container);
}
function mountComponent(vnode, container) {
    // 1.先创建组件实例 获取实例
    const instance = createComponentInstance(vnode);
    // 2.调用 setup
    setupComponent(instance);
    // 3.调用 render
    setupRenderEffect(instance, container);
}
function setupRenderEffect(instance, container) {
    if (instance.render) {
        // 返回的 虚拟节点
        // render 函数中可能使用了 this
        // 所以在赋值给实例之前 将 this 指向 proxy 代理的对象上
        // 包括 props 都是通过代理来访问的
        const subTree = instance.render.call(instance.proxy);
        // 对返回的 虚拟节点进行挂载
        // vnode -> element => mountElement
        patch(subTree, container);
        // 将根元素节点 挂载在 setupState 上
        instance.el = subTree.el;
    }
}
/**
 * 处理 element
 */
function processElement(vnode, container) {
    mountElement(vnode, container);
}
/**
 * 处理 Fragment
 */
function processFragment(vnode, container) {
    // 省略  const el = await mountTag(vnode);
    //       mountAttributes(vnode, el);
    // 直接将 children 添加在 container 上
    mountChildren(vnode, container);
}
/**
 * 挂载到页面上
 */
async function mountElement(vnode, container) {
    const el = await mountTag(vnode);
    mountAttributes(vnode, el);
    mountChildren(vnode, el);
    container.append(el);
}
/**
 * 创建标签
 */
function mountTag(vnode) {
    return new Promise((resolve) => {
        const el = document.createElement(vnode.type);
        vnode.el = el;
        resolve(el);
    });
}
/**
 * 设置 Attributes
 */
function mountAttributes(vnode, container) {
    const { props } = vnode;
    for (let key in props) {
        const val = props[key];
        // 如果是绑定的事件
        // 绑定事件
        // 跳过本次循环
        if (isEvent(key)) {
            const evName = key.slice(2).toLocaleLowerCase();
            container.addEventListener(evName, val);
            continue;
        }
        if (Array.isArray(val)) {
            container.setAttribute(key, val.join(" "));
        }
        else {
            container.setAttribute(key, val);
        }
    }
}
/**
 * 挂载元素
 */
function mountChildren(vnode, container) {
    const { children } = vnode;
    if (vnode.shapeFlag & 8 /* TEXT_CHILDREN */) {
        container.textContent = children;
    }
    else if (vnode.shapeFlag & 16 /* ARRAY_CHILDREN */) {
        // TODO
        // 数组类型
        children.forEach((item) => {
            item && patch(item, container);
        });
    }
}
/**
 * 判读是否是事件
 * @returns { boolean } 是| 否
 */
function isEvent(str) {
    return /^on[A-Z]/.test(str);
}

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
    else if (["string", "number"].indexOf(typeof children) > -1) {
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

function createApp(rootComponent) {
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
}

function h(type, props, children) {
    return createVNode(type, props, children);
}

const renderSlots = (slots, name, props) => {
    const slot = slots[name];
    if (slot) {
        // 作用域插槽
        if (typeof slot === "function") {
            return createVNode("Fragment", null, slot(props));
        }
        else {
            return createVNode("Fragment", null, slot);
        }
    }
};

export { createApp, h, renderSlots };
