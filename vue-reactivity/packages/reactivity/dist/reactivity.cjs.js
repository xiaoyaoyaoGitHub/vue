'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function isObject(target) {
    return typeof target == 'object' && target !== null;
}
var extend = Object.assign;

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
function createSetter(shallow) {
    return function (target, key, value, receiver) {
        var res = Reflect.set(target, key, value, receiver);
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

exports.reactive = reactive;
exports.readonly = readonly;
exports.shallowReactive = shallowReactive;
exports.shallowReadonly = shallowReadonly;
//# sourceMappingURL=reactivity.cjs.js.map
