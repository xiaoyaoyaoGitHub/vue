var VueReactivity = (function (exports) {
    'use strict';

    function isObject(target) {
        return typeof target == 'object' && target !== null;
    }

    // import { isObject } from "./../../share/src/index.ts";  // 修改tsconfig.json配置文件,修改其中的path 和 baseurl
    // 响应式
    function reactive(target) {
        return createReactiveObject(target);
    }
    // 浅响应式
    function shallowReactive(target) {
        return createReactiveObject(target);
    }
    // 只读
    function readonly(target) {
        return createReactiveObject(target);
    }
    // 浅读
    function shallowReadonly(target) {
        return createReactiveObject(target);
    }
    /**
     *
     * @param target 创建代理目标
     * @param isReadonly 是否为只读
     * @param baseHandler  针对不同的方式创建不同的代理对象
     */
    function createReactiveObject(target, isReadonly, baseHandler) {
        if (!isObject(target)) {
            return target;
        }
        console.log(target);
    }

    exports.reactive = reactive;
    exports.readonly = readonly;
    exports.shallowReactive = shallowReactive;
    exports.shallowReadonly = shallowReadonly;

    Object.defineProperty(exports, '__esModule', { value: true });

    return exports;

}({}));
//# sourceMappingURL=reactivity.global.js.map
