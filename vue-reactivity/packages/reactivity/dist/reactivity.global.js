var VueReactivity = (function (exports) {
    'use strict';

    function reactive() {
        console.log('reactive');
    }
    function shadowReactive() {
        console.log('shadowReactive');
    }

    exports.reactive = reactive;
    exports.shadowReactive = shadowReactive;

    Object.defineProperty(exports, '__esModule', { value: true });

    return exports;

}({}));
//# sourceMappingURL=reactivity.global.js.map
