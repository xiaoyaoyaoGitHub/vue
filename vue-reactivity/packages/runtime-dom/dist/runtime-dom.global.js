var VueRuntimeDom = (function (exports) {
	'use strict';

	function isObject(target) {
	    return typeof target == "object" && target !== null;
	}
	var extend = Object.assign;
	var hasChange = function (oldValue, newValue) {
	    return oldValue !== newValue;
	};
	var isArray = Array.isArray;
	var isString = function (val) { return typeof val === "string"; };
	var hasOwn = function (target, key) {
	    return Object.prototype.hasOwnProperty.call(target, key);
	};
	var isIntegerKey = function (key) {
	    return parseInt(key) + "" === key;
	};
	var isFunction = function (val) { return typeof val === "function"; };
	// 是否是虚拟节点
	var isVnode = function (val) { return val.__v_isVNode === true; };
	// 按位或有一个是1 就是1
	// 100
	// 010
	// 110
	// 按位与
	// const manager = 1<<1 // 2
	// const user = 1<<2 // 4
	// const order = 1<<3 // 8
	// const admin = manager | user
	// admin & order > 0 有权限
	// admin & order == 0 没权限
	// admin & user >  有权限

	function effect(fn, options) {
	    if (options === void 0) { options = {}; }
	    var effectReactive = createReactiveEffect(fn, options);
	    if (!options.lazy) {
	        //立即执行一次
	        effectReactive();
	    }
	    return effectReactive;
	}
	var effectStack = []; //effect 栈
	var activeEffect; // 当前执行的effect
	var id = 0;
	function createReactiveEffect(fn, options) {
	    var effect = function reactiveEffect() {
	        try {
	            effectStack.push(effect);
	            activeEffect = effect;
	            return fn();
	        }
	        finally {
	            effectStack.pop();
	            activeEffect = effectStack[effectStack.length - 1];
	        }
	    };
	    effect.id = id++;
	    effect.options = options;
	    effect.deps = []; // 用来收集依赖
	    return effect;
	}
	// 创建weakMap, 收集依赖
	var depMaps = new WeakMap();
	function track(target, type, key) {
	    if (!activeEffect) {
	        //如果只是单纯的取值,则不需要保存
	        return;
	    }
	    // debugger
	    var deps = depMaps.get(target);
	    if (!deps) {
	        //如果不存在则重新设置
	        depMaps.set(target, (deps = new Map()));
	    }
	    var dep = deps.get(key);
	    if (!dep) {
	        deps.set(key, (dep = new Set())); //使用Set是为了防止重复
	    }
	    if (!dep.has(activeEffect)) {
	        dep.add(activeEffect);
	    }
	}
	// 触发更新
	function trigger(target, type, key, oldValue, newValue) {
	    // console.log(oldValue, newValue, key);
	    console.log(depMaps);
	    var depsMap = depMaps.get(target);
	    console.log(depsMap);
	    if (!depsMap)
	        return;
	    // const effectsSet = depsMap.get(key) || [];
	    var willEffectsSet = new Set();
	    var add = function (effectsSet) {
	        if (effectsSet) {
	            effectsSet.forEach(function (effect) { return willEffectsSet.add(effect); });
	        }
	    };
	    if (key === "length" && isArray(target)) {
	        //如果数组直接修改length的长度
	        depsMap.forEach(function (dep, setKey) {
	            //查看当前监听里面是否含有比当前数组大的索引值,如果有则更新
	            if (typeof setKey !== "symbol") {
	                if (setKey > newValue || setKey === "length") {
	                    add(dep);
	                }
	            }
	        });
	    }
	    else {
	        add(depsMap.get(key));
	        if (isArray(target) && isIntegerKey(key)) {
	            switch (type) {
	                case "add": // 如果数组通过push增加,修改了length,则触发不了监听,需要手动触发
	                    add(depsMap.get("length"));
	                    break;
	            }
	        }
	    }
	    willEffectsSet.forEach(function (effect) {
	        if (effect.options.schedular) {
	            effect.options.schedular(effect);
	        }
	        else {
	            effect();
	        }
	    });
	}

	// get 方法生成函数
	// vue3 针对的是对象来进行劫持,不用改写原来的对象,如果是嵌套,取值的时候才会进行代理
	// vue2 针对的书属性劫持,改写了原来对象,首先递归
	// vue3 可以对不存在的属性进行获取,也会走get方法,proxy支持数组
	function createGetter(isReadonly, shallow) {
	    if (isReadonly === void 0) { isReadonly = false; }
	    if (shallow === void 0) { shallow = false; }
	    return function (target, key, receiver) {
	        // 使用Reflect做映射取值
	        var res = Reflect.get(target, key, receiver);
	        // 当属性值不是只读时收集依赖,(并且需要过滤掉类型是symbol的属性)
	        if (!isReadonly && (typeof key !== 'symbol')) {
	            // console.log('收集依赖');
	            track(target, "get", key);
	        }
	        // 如果属性不是深层代理则直接返回
	        if (shallow) {
	            return res;
	        }
	        // 如果res是对象,则对其进行再次代理
	        if (isObject(res)) {
	            // 懒递归,当我们去取值时,才去做递归,如果不取默认代理1层
	            return isReadonly ? readonly(res) : reactive(res);
	        }
	        return res;
	    };
	}
	// set 方法生成函数
	// 如果是操作数组,如果发生length变化,则会触发两次set方法
	function createSetter(shallow) {
	    return function (target, key, value, receiver) {
	        var oldValue = target[key];
	        // 是否存在当前设置的key 区分下数组的新增和修改
	        var hadKey = isArray(target) && isIntegerKey(key)
	            ? Number(key) < target.length
	            : hasOwn(target, key);
	        var res = Reflect.set(target, key, value, receiver);
	        if (!hadKey) {
	            //是新增
	            // console.log("是新增"); 
	            trigger(target, "add", key, oldValue, value);
	        }
	        else if (hasChange(oldValue, value)) {
	            console.log('set');
	            trigger(target, "set", key, oldValue, value);
	        }
	        return res;
	    };
	}
	// get方法
	var get = createGetter();
	var shallowGet = createGetter(false, true);
	var readonlyGet = createGetter(true);
	var shallowReadonlyGet = createGetter(true, true);
	// set方法
	var set = createSetter();
	var shallowSet = createSetter();
	var mutableHandler = {
	    get: get,
	    set: set,
	};
	var shallowReactiveHandler = {
	    get: shallowGet,
	    set: shallowSet,
	};
	var readonlySet = {
	    set: function (target, key) {
	        console.warn("cannot set " + JSON.stringify(target) + " on key " + key);
	    },
	};
	var readonlyHandler = extend({
	    get: readonlyGet,
	}, readonlySet);
	var shallowReadonlyHandler = extend({
	    get: shallowReadonlyGet,
	}, readonlySet);

	// import { isObject } from "./../../share/src/index.ts";  // 修改tsconfig.json配置文件,修改其中的path 和 baseurl
	// 响应式
	function reactive(target) {
	    return createReactiveObject(target, false, mutableHandler);
	}
	// 浅响应式
	function shallowReactive(target) {
	    return createReactiveObject(target, false, shallowReactiveHandler);
	}
	// 只读
	function readonly(target) {
	    return createReactiveObject(target, true, readonlyHandler);
	}
	// 浅读
	function shallowReadonly(target) {
	    return createReactiveObject(target, true, shallowReadonlyHandler);
	}
	/**
	 *
	 * @param target 创建代理目标
	 * @param isReadonly 是否为只读
	 * @param baseHandler  针对不同的方式创建不同的代理对象
	 */
	var reactiveMap = new WeakMap(); //创建映射用作缓存,相对于map来说可以不用手动清除
	var readonlyMap = new WeakMap(); //readonly映射缓存
	function createReactiveObject(target, isReadonly, baseHandler) {
	    if (isReadonly === void 0) { isReadonly = false; }
	    if (!isObject(target)) {
	        return target;
	    }
	    var proxyMap = isReadonly ? readonlyMap : reactiveMap;
	    // 判断是否有缓存,如果有则直接返回缓存对象不再拦截
	    if (proxyMap.get(target)) {
	        return proxyMap.get(target);
	    }
	    var proxyTarget = new Proxy(target, baseHandler); //创建proxy
	    proxyMap.set(target, proxyTarget);
	    return proxyTarget;
	}

	function ref(value) {
	    return createRef(value);
	}
	function createRef(value) {
	    return new RefImpl(value);
	}
	var RefImpl = /** @class */ (function () {
	    function RefImpl(rawValue) {
	        this.rawValue = rawValue;
	        this._value = reactive(rawValue);
	    }
	    Object.defineProperty(RefImpl.prototype, "value", {
	        get: function () {
	            track(this, "get", "value");
	            return this._value;
	        },
	        set: function (newValue) {
	            this._value = newValue;
	            trigger(this, "set", "value", this.rawValue, newValue);
	        },
	        enumerable: false,
	        configurable: true
	    });
	    return RefImpl;
	}());
	function toRef(target, key) {
	    return new ObjectRefImpl(target, key);
	}
	// 通过代理的方式去Proxy中取值
	var ObjectRefImpl = /** @class */ (function () {
	    function ObjectRefImpl(target, key) {
	        this.target = target;
	        this.key = key;
	        this._v_isRef = true;
	    }
	    Object.defineProperty(ObjectRefImpl.prototype, "value", {
	        get: function () {
	            // console.log(`this.target`,this.target);
	            // console.log(`[this.key]`,this.key);
	            return this.target[this.key];
	        },
	        set: function (newValue) {
	            this.target[this.key] = newValue;
	        },
	        enumerable: false,
	        configurable: true
	    });
	    return ObjectRefImpl;
	}());
	function toRefs(target) {
	    var res = isArray(target)
	        ? new Array(target.length)
	        : Object.create(null);
	    // 循环将每一项都设置toRef
	    for (var key in target) {
	        res[key] = toRef(target, key);
	    }
	    return res;
	}

	var ComputedRefImpl = /** @class */ (function () {
	    function ComputedRefImpl(getter, setter) {
	        var _this = this;
	        this.getter = getter;
	        this.setter = setter;
	        this.dirty = true; //防止多次取值
	        this.effect = effect(getter, {
	            lazy: true,
	            // 如果设置了schedular,则更新的时候就不触发effect,而是触发schedular
	            schedular: function (effect) {
	                if (!_this.dirty) {
	                    _this.dirty = true;
	                    trigger(_this, 'set', 'value');
	                }
	            },
	        });
	    }
	    Object.defineProperty(ComputedRefImpl.prototype, "value", {
	        get: function () {
	            if (this.dirty) { //如果依赖有更新,则重新取值,如果没有则直接返回缓存
	                console.log('依赖有更新,重新取值');
	                this._value = this.effect();
	                this.dirty = false;
	            }
	            track(this, 'get', 'value'); // 当计算属性被其他effect引用时,也要收集依赖
	            return this._value;
	        },
	        set: function (newValue) {
	            this.setter(newValue);
	        },
	        enumerable: false,
	        configurable: true
	    });
	    return ComputedRefImpl;
	}());
	/**
	 *
	 * @param objectOptions
	 *  可能是一个方法或者是一个对象里面设置了set/get方法
	 */
	function computed(objectOptions) {
	    var getter, setter;
	    if (isObject(objectOptions)) {
	        getter = objectOptions.get;
	        setter = objectOptions.set;
	    }
	    getter = objectOptions;
	    setter = function () {
	        console.log("no setter");
	    };
	    return new ComputedRefImpl(getter, setter);
	}

	// 创建虚拟节点 描述真实dom内容的js对象
	/**
	 *
	 * @param type     原始组件
	 * @param props    属性
	 * @param children 子元素
	 */
	function createVNode(type, props, children) {
	    if (children === void 0) { children = null; }
	    // 虚拟节点属性描述内容 type props key children _v_isVnode
	    var shapeFlag = isString(type) //直接是节点类型 如 div h1
	        ? 1 /* ELEMENT */
	        : isObject(type) // 是对象类型例如 {setup:()=>{}}
	            ? 4 /* STATEFUL_COMPONENT */
	            : 0;
	    var vnode = {
	        _v_isVnode: true,
	        type: type,
	        props: props,
	        children: children,
	        key: props && props.key,
	        el: null,
	        component: null,
	        shapeFlag: shapeFlag,
	    };
	    // 加入子元素的类型判断
	    normalizeChildren(vnode, children);
	    return vnode;
	}
	/**
	 * 子元素类型判断
	 * @param vnode    虚拟节点
	 * @param children 子元素
	 */
	function normalizeChildren(vnode, children) {
	    if (children === void 0) { children = null; }
	    var shapeFlag = 0;
	    if (children) {
	        shapeFlag = isArray(children)
	            ? 16 /* ARRAY_CHILDREN */
	            : 8 /* TEXT_CHILDREN */; // 子元素为文本
	    }
	    vnode.shapeFlag |= shapeFlag;
	}

	function createAppApi(render) {
	    return function (rootComponent, rootProp) {
	        var app = {
	            // 为了稍后组件挂载之前可以先校验组件是否有render函数或者模板
	            _component: rootComponent,
	            _props: rootProp,
	            _container: null,
	            mount: function (container) {
	                // 根据用户传入的属性创建一个虚拟节点
	                console.log(rootComponent);
	                var vNode = createVNode(rootComponent, rootProp);
	                console.log(vNode);
	                // 更新节点的_container
	                app._container = container;
	                // 将虚拟节点转化成真实节点,插入到对应的容器中
	                render(vNode, container);
	            },
	            render: render,
	        };
	        console.log(app);
	        return app;
	    };
	}

	var componentPublicInstance = {
	    get: function (_a, key) {
	        var instance = _a._;
	        var setupState = instance.setupState, props = instance.props, ctx = instance.ctx;
	        if (hasOwn(setupState, key)) {
	            return setupState[key];
	        }
	        else if (hasOwn(props, key)) {
	            return props[key];
	        }
	        else if (hasOwn(ctx, key)) {
	            return ctx[key];
	        }
	    },
	    set: function (_a, key, value) {
	        var instance = _a._;
	        var setupState = instance.setupState, props = instance.props, ctx = instance.ctx;
	        if (hasOwn(setupState, key)) {
	            setupState[key] = value;
	        }
	        else if (hasOwn(props, key)) {
	            return props[key] = value;
	        }
	        else if (hasOwn(ctx, key)) {
	            return ctx[key] = value;
	        }
	        return true;
	    },
	};

	/**
	 * 处理setup 第二个参数
	 * @param instance
	 * @returns
	 */
	function createSetupContext(instance) {
	    return {
	        slots: instance.slots,
	        emit: instance.emit,
	        attrs: instance.attrs,
	        expose: function () { }, // 可以通过该方法暴露参数和方法,对外使用ref被调用
	    };
	}
	/**
	 * 处理setup执行返回结果 处理setup返回结果,如果返回的是对象,则赋值为实例的state,如果是函数,则作为render函数触发
	 * @param instance    当前组件实例对象
	 * @param setupResult setup执行结果
	 */
	function handleSetupResult(instance, setupResult) {
	    if (isObject(setupResult)) {
	        instance.setupState = setupResult; // 将返回结果保存到setupState中
	    }
	    else if (isFunction(setupResult)) {
	        instance.render = setupResult;
	    }
	    finishComponentSetup(instance);
	}
	/**
	 * 处理如果没有setup函数或者无返回结果render处理方式
	 * @param instance
	 */
	function finishComponentSetup(instance) {
	    var Component = instance.type;
	    if (Component && Component.render) {
	        instance.render = Component.render;
	    }
	    console.log(instance);
	}
	/**
	 * 处理setup参数并执行setup方法
	 * @param instance 实例
	 */
	function setupStatefulComponent(instance) {
	    var Component = instance.type;
	    var setup = Component.setup;
	    console.log(setup);
	    if (setup) {
	        // 处理setup需要传入的两个参数
	        var setupContext = createSetupContext(instance);
	        var setupResult = setup(instance.props, setupContext);
	        // 处理setup返回结果
	        handleSetupResult(instance, setupResult);
	    }
	    else {
	        finishComponentSetup(instance);
	    }
	}
	/**
	 * 处理实例参数
	 * @param instance 实例
	 */
	function setupComponent(instance) {
	    var _a = instance.vnode, props = _a.props, children = _a.children;
	    console.log(props, "props");
	    // TODO  props是响应式
	    instance.props = props;
	    instance.slots = children;
	    // 对整个instance.ctx做劫持
	    instance.proxy = new Proxy(instance.ctx, componentPublicInstance);
	    // 处理setup 函数
	    setupStatefulComponent(instance);
	}

	function createRenderer(renderOptions) {
	    var uid = 0;
	    var hostInsert = renderOptions.insert, hostRemove = renderOptions.remove, hostPatchProp = renderOptions.patchProp, hostCreateElement = renderOptions.createElement; renderOptions.createText; renderOptions.setText; var hostSetElementText = renderOptions.setElementText; renderOptions.parentNode; renderOptions.nextSibling;
	    /**
	     * 创建对象实例
	     * @param vnode 虚拟节点
	     */
	    function createComponentInstance(vnode) {
	        var instance = {
	            uid: uid++,
	            vnode: vnode,
	            type: vnode.type,
	            props: {},
	            attrs: {},
	            slots: {},
	            setupState: {},
	            proxy: null,
	            emit: null,
	            ctx: {},
	            isMounted: false,
	            subTree: null,
	            render: null,
	        };
	        instance.ctx = { _: instance };
	        return instance;
	    }
	    /**
	     * 挂载
	     * @param instance
	     * @param container
	     */
	    function setupRenderEffect(instance, container) {
	        effect(function componentEffect() {
	            if (!instance.isMounted) {
	                console.log("第一次挂载");
	                // 在vue中的render函数中,有个参数,是对当前实例的拦截的proxy
	                var subTree = (instance.subTree = instance.render.call(instance.proxy, instance.proxy));
	                console.log("subTree", subTree);
	                instance.isMounted = true;
	                patch(null, subTree, container);
	            }
	            else {
	                // instance.isMounted = true;
	                console.log("组件更新");
	                var prevTree = instance.subTree;
	                var nextTree = instance.render.call(instance.proxy, instance.proxy);
	                // 进入新旧vnode节点比对
	                patch(prevTree, nextTree, container);
	            }
	        });
	    }
	    /**
	     * 挂载组件
	     * @param n2         新虚拟节点
	     * @param container
	     */
	    function mountComponent(n2, container) {
	        // 创建组件实例, 并将实例挂载到自己本身上
	        var instance = (n2.instance = createComponentInstance(n2));
	        // 处理实例参数
	        setupComponent(instance);
	        // 执行render 方法 劫持组件
	        setupRenderEffect(instance, container);
	    }
	    /**
	     * 组件处理
	     * @param n1
	     * @param n2
	     * @param container
	     */
	    function processComponent(n1, n2, container) {
	        if (!n1) {
	            // 如果没有旧vode 则是挂载
	            mountComponent(n2, container);
	        }
	    }
	    function mountChildren(children, container, auchor) {
	        console.log("children", children);
	        for (var i = 0; i < children.length; i++) {
	            patch(null, children[i], container, auchor);
	        }
	    }
	    /**
	     * 挂载节点
	     * @param vnode
	     * @param container
	     */
	    function mountElement(vnode, container, auchor) {
	        var _a = vnode || {}, type = _a.type, props = _a.props, children = _a.children, shapeFlag = _a.shapeFlag;
	        var el = (vnode.el = hostCreateElement(type));
	        // console.log(`props`, shapeFlag & ShapeFlags.TEXT_CHILDREN);
	        if (props) {
	            for (var key in props) {
	                hostPatchProp(el, key, null, props[key]);
	            }
	        }
	        if (shapeFlag & 16 /* ARRAY_CHILDREN */) {
	            console.log("处理children");
	            // 如果子元素是数组
	            mountChildren(children, el, auchor);
	        }
	        else {
	            hostSetElementText(el, children);
	        }
	        hostInsert(el, container, auchor);
	    }
	    /**
	     * 属性对比
	     * @param el
	     * @param oldProps
	     * @param newProps
	     */
	    function patchProps(el, oldProps, newProps) {
	        if (oldProps === newProps)
	            return;
	        for (var key in newProps) {
	            var prev = oldProps[key];
	            var next = newProps[key];
	            if (prev !== next) {
	                hostPatchProp(el, key, prev, next);
	            }
	        }
	        for (var key in oldProps) {
	            if (!hasOwn(newProps, key)) {
	                hostPatchProp(el, key, oldProps[key], null);
	            }
	        }
	    }
	    /**
	     * 数组子节点比较
	     * @param c1
	     * @param c2
	     * @param container
	     */
	    function patchKeyedChildren(c1, c2, container) {
	        var i = 0;
	        var e1 = c1.length - 1;
	        var e2 = c2.length - 1;
	        // 从前往后比较
	        while (i <= e1 && i <= e2) {
	            if (isSameVnode(c1[i], c2[i])) {
	                // 如果是相同类型元素, 则比较属性和子节点
	                patch(c1[i], c2[i], container);
	            }
	            else {
	                break;
	            }
	            i++;
	        }
	        // 从后往前比较
	        while (i <= e1 && i <= e2) {
	            if (isSameVnode(c1[e1], c2[e2])) {
	                patch(c1[e1], c2[e2], container);
	            }
	            else {
	                break;
	            }
	            e1--;
	            e2--;
	        }
	        // 有序比对
	        if (i > e1) {
	            //新的多,旧的少
	            if (i <= e2) {
	                var nextPos = e2 + 1;
	                var anchor = nextPos < c2.length - 1 ? c2[nextPos].el : null;
	                // 如果anchor 不为null,则是在当前元素添加
	                while (i <= e2) {
	                    patch(null, c2[i++], container, anchor);
	                }
	            }
	        }
	    }
	    /**
	     * 对比子节点
	     * @param n1   旧节点
	     * @param n2   新节点
	     * @param container
	     */
	    function patchChildren(n1, n2, container, auchor) {
	        var c1 = n1.children;
	        var c2 = n2.children;
	        var prevShageFlag = n1.shapeFlag;
	        var shapeFlag = n2.shapeFlag;
	        // 1. 当前子节点是文本,则直接替换
	        if (shapeFlag & 8 /* TEXT_CHILDREN */) {
	            hostSetElementText(container, c2);
	        }
	        else {
	            // 当前子节点是数组
	            if (prevShageFlag & 16 /* ARRAY_CHILDREN */) {
	                //之前的子节点也是数组
	                patchKeyedChildren(c1, c2, container);
	            }
	            else {
	                // 之前子节点是文本
	                hostSetElementText(container, ""); // 清空之前节点
	                mountChildren(c2, container, auchor); //挂载当前子节点
	            }
	        }
	    }
	    /**
	     * 对比新旧节点的属性/子节点
	     * @param n1
	     * @param n2
	     * @param container
	     */
	    function patchElement(n1, n2, container, auchor) {
	        var el = (n2.el = n1.el);
	        var oldProps = n1.props || {};
	        var newProps = n2.props || {};
	        patchProps(el, oldProps, newProps); //对比属性
	        // 对比子节点
	        patchChildren(n1, n2, el, auchor);
	    }
	    /**
	     * 创建节点
	     * @param n1
	     * @param n2
	     * @param container
	     */
	    function processElement(n1, n2, container, auchor) {
	        if (n1 === null) {
	            mountElement(n2, container, auchor);
	        }
	        else {
	            // 更新 diff 算法
	            patchElement(n1, n2, container, auchor);
	        }
	    }
	    /**
	     * 判断新旧节点是否相同
	     * @param n1 旧节点
	     * @param n2 新节点
	     */
	    function isSameVnode(n1, n2) {
	        return n1.type == n2.type && n1.key == n2.key;
	    }
	    /**
	     * 判断是否挂载还是更新
	     * @param n1         旧虚拟节点
	     * @param n2         新虚拟节点
	     * @param container  挂载跟节点
	     */
	    function patch(n1, n2, container, auchor) {
	        if (auchor === void 0) { auchor = null; }
	        // 判断节点是否相同,如果不同则直接删除旧节点
	        if (n1 && !isSameVnode(n1, n2)) {
	            hostRemove(container);
	            n1 = null;
	        }
	        // 判断新虚拟节点类型
	        var shapeFlag = n2.shapeFlag;
	        if (shapeFlag & 1 /* ELEMENT */) {
	            //节点类型
	            processElement(n1, n2, container, auchor);
	        }
	        else if (shapeFlag & 4 /* STATEFUL_COMPONENT */) {
	            //组件类型
	            processComponent(n1, n2, container);
	        }
	        else {
	            // 直接是文本
	            container.textContent = container.textContent + n2;
	        }
	    }
	    /**
	     * render函数
	     * @param vnode     虚拟节点
	     * @param container 挂载跟节点
	     */
	    var render = function (vnode, container) {
	        // 对比新旧节点的不同
	        patch(null, vnode, container);
	    };
	    return {
	        createApp: createAppApi(render),
	        render: render,
	    };
	}

	function h(type, propsOrChildren, children) {
	    console.log(arguments);
	    var argLength = arguments.length;
	    if (argLength == 2) {
	        if (isObject(propsOrChildren) && !isArray(propsOrChildren)) {
	            if (isVnode(propsOrChildren)) {
	                //表示没有属性值
	                return createVNode(type, null, [propsOrChildren]);
	            }
	            else {
	                return createVNode(type, propsOrChildren); // 表示没有子元素
	            }
	        }
	        else {
	            return createVNode(type, null, propsOrChildren);
	        }
	    }
	    else if (argLength === 3) {
	        if (isVnode(children)) {
	            children = [children];
	        }
	        return createVNode(type, propsOrChildren, children);
	    }
	    else if (argLength > 3) {
	        return createVNode(type, propsOrChildren, Array.from(arguments).slice(2));
	    }
	}

	// 增 删 改 查 元素中插入文本  文本的创建 文本元素内容的设置 获取父节点 获取相邻节点
	var nodeOps = {
	    // 增 删  改 查询 元素中插入文本  文本的创建  文本元素的内容设置  获取父亲  获取下一个元素
	    createElement: function (tagName) { return document.createElement(tagName); },
	    remove: function (child) { return child.parentNode && child.parentNode.removeChild(child); },
	    insert: function (child, parent, anchor) {
	        if (anchor === void 0) { anchor = null; }
	        return parent.insertBefore(child, anchor);
	    },
	    querySelector: function (selector) { return document.querySelector(selector); },
	    setElementText: function (el, text) { return (el.textContent = text); },
	    createText: function (text) { return document.createTextNode(text); },
	    setText: function (node, text) { return (node.nodeValue = text); },
	    parentNode: function (node) { return node.parentNode; },
	    nextSibling: function (node) { return node.nextElementSibling; },
	};

	/**
	 * 设置class属性值
	 * @param el   节点
	 * @param next 新属性值
	 */
	function patchClass(el, next) {
	    if (next == null) {
	        next = "";
	    }
	    el.className = next;
	}
	/**
	 * 设置style属性值
	 * @param el    节点
	 * @param prev  旧值
	 * @param next  新值
	 */
	function patchStyle(el, prev, next) {
	    if (next == null) {
	        //如果新属性值没有,则移除style属性
	        el.removeAttribute("style");
	    }
	    else {
	        if (prev) {
	            for (var key in prev) {
	                if (!next[key]) {
	                    //如果新属性值中没有当前属性值,则直接设置为空
	                    el.style[key] = "";
	                }
	            }
	        }
	        // 循环新属性值 依次设置
	        for (var key in next) {
	            el.style[key] = next[key];
	        }
	    }
	}
	/**
	 * 设置事件
	 * @param el   节点
	 * @param key  事件类型
	 * @param next 触发事件
	 */
	function patchEvents(el, key, next) {
	    // 判断当前节点有没有绑定事件
	    var invokers = el._vei || (el.vei = {});
	    var exists = invokers[key];
	    if (exists && next) {
	        exists.value = next;
	    }
	    else {
	        // 处理事件类型 onClick => click
	        var eventName = key.toLowerCase().slice(2);
	        if (!next) {
	            //如果绑定事件木有了则移除监听
	            el.removeEventListener(eventName);
	        }
	        else {
	            // 如果绑定或者删除事件监听,对性能损耗较大,然后可以将需要更改监听统一使用invoker,在invoker中的value属性中保存需要监听的方法,之后改变就改变value的值
	            var invoker = createInvoker(next);
	            el.addEventListener(eventName, invoker);
	        }
	    }
	}
	/**
	 *
	 * @param fn addEventListener 需要监听的事件
	 */
	function createInvoker(fn) {
	    var invoker = function (e) { return invoker.value(e); };
	    invoker.value = fn;
	    return invoker;
	}
	/**
	 * 对比其他属性值
	 * @param el   节点
	 * @param key  属性名
	 * @param next 新值
	 */
	function patchAttrs(el, key, next) {
	    if (next) {
	        el.setAttribute(key, next);
	    }
	    else {
	        el.removeAttribute(key);
	    }
	}
	/**
	 *
	 * @param el   节点
	 * @param key  对比的属性
	 * @param prev 旧值
	 * @param next 新值
	 */
	var patchProp = function (el, key, prev, next) {
	    switch (key) {
	        case "class":
	            patchClass(el, next);
	            break;
	        case "style":
	            patchStyle(el, prev, next);
	            break;
	        default:
	            if (/^on[^a-z]/.test(key)) {
	                // 事件
	                patchEvents(el, key, next);
	            }
	            else {
	                // 其他属性
	                patchAttrs(el, key, next);
	            }
	    }
	};

	// 对dom操作的整合,将这些api传入到core中调用, 统一不同平台调用方法
	var renderOptions = extend(nodeOps, { patchProp: patchProp });
	/**
	 *  创建节点
	 * @param rootComponent  组件
	 * @param rootProp       组件传入的属性值
	 */
	function createApp(rootComponent, rootProp) {
	    if (rootProp === void 0) { rootProp = null; }
	    var app = createRenderer(renderOptions).createApp(rootComponent, rootProp);
	    var mount = (app || {}).mount;
	    // 重写mount
	    app.mount = function (container) {
	        container = document.querySelector(container);
	        container.innerHTML = ""; //挂载之前先清空
	        mount(container);
	    };
	    return app;
	}

	exports.computed = computed;
	exports.createApp = createApp;
	exports.createRenderer = createRenderer;
	exports.effect = effect;
	exports.h = h;
	exports.reactive = reactive;
	exports.readonly = readonly;
	exports.ref = ref;
	exports.shallowReactive = shallowReactive;
	exports.shallowReadonly = shallowReadonly;
	exports.toRef = toRef;
	exports.toRefs = toRefs;

	Object.defineProperty(exports, '__esModule', { value: true });

	return exports;

}({}));
//# sourceMappingURL=runtime-dom.global.js.map
