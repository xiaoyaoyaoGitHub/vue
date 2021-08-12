function isObject(target) {
    return typeof target == "object" && target !== null;
}
var extend = Object.assign;
var hasChange = function (oldValue, newValue) {
    return oldValue !== newValue;
};
var isArray = Array.isArray;
var hasOwn = function (target, key) {
    return Object.prototype.hasOwnProperty.call(target, key);
};
var isIntegerKey = function (key) {
    return parseInt(key) + "" === key;
};

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

export { computed, effect, reactive, readonly, ref, shallowReactive, shallowReadonly, toRef, toRefs };
//# sourceMappingURL=reactivity.esc-bundler.js.map
