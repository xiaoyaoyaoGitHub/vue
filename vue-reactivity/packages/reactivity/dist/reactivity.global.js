var VueReactivity = (function (exports) {
    'use strict';

    function isObject(target) {
        return typeof target == 'object' && target !== null;
    }
    var extend = Object.assign;

    // get 方法生成函数
    function createGetter(isReadonly, shallow) {
        return function () { };
    }
    // set 方法生成函数
    function createSetter(shallow) {
    }
    // get方法
    var get = createGetter();
    var shallowGet = createGetter();
    var readonlyGet = createGetter();
    var shallowReadonlyGet = createGetter();
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

    exports.reactive = reactive;
    exports.readonly = readonly;
    exports.shallowReactive = shallowReactive;
    exports.shallowReadonly = shallowReadonly;

    Object.defineProperty(exports, '__esModule', { value: true });

    return exports;

}({}));
//# sourceMappingURL=reactivity.global.js.map
