/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

function initProps(instance, rawProps) {
    instance.props = rawProps;
}

/**
 * 合并对象
 */
const hasOwn = (target, key) => {
    return Object.prototype.hasOwnProperty.call(target, key);
};

// 其他属性统一在此获取
// eg: $el $option $slots $props
const PublicPropertiesMap = {
    $el: (o) => o.el,
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

/**
 * 创建组件实例 获取实例
 */
function createComponentInstance(vnode) {
    const instance = {
        type: vnode.type,
        vnode,
        setupState: {},
        props: {},
    };
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
    // initSlots
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
    console.log(instance);
    const { setup } = component;
    if (setup) {
        // 有可能是 object 有可能是 function
        const setupResult = setup();
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
    if (vnode.shapeFlag & 1 /* ELEMENT_NODE */) {
        // 处理 Element
        processElement(vnode, container);
    }
    else if (vnode.shapeFlag & 4 /* STATEFUL_COMPONENT */) {
        // 处理组件
        processComponent(vnode, container);
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
 * 挂载到页面上
 */
function mountElement(vnode, container) {
    return __awaiter(this, void 0, void 0, function* () {
        const el = yield mountTag(vnode);
        mountAttributes(vnode, el);
        mountChildren(vnode, el);
        container.append(el);
    });
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
            patch(item, container);
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
    else if (typeof children == "string") {
        vnode.shapeFlag |= 8 /* TEXT_CHILDREN */;
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

export { createApp, h };
