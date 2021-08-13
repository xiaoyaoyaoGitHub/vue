var VueRuntimeDom = (function (exports) {
	'use strict';

	var extend = Object.assign;

	function createRenderer(renderOptions) {
	    return {
	        createApp: function (rootComponent, rootProp) {
	            return {
	                mount: function (container) {
	                    console.log("core", container);
	                },
	            };
	        },
	    };
	}

	// 增 删 改 查 元素中插入文本  文本的创建 文本元素内容的设置 获取父节点 获取相邻节点
	var nodeOps = {
	    createElement: function (tag) { return document.createElement(tag); },
	    remove: function (child) { return child.parentNode && child.parentNode.removeChild(child); },
	    insert: function (child, parent, anchor) {
	        if (anchor === void 0) { anchor = null; }
	        return parent.insertBefore(child, anchor);
	    },
	    querySelector: function (selector) { return document.querySelector(selector); },
	    setElementText: function (el, text) { return (el.textContent = text); },
	    createText: function (text) { return document.createTextNode(text); },
	    setText: function (node, text) { return (node.nodeValue = text); },
	    getParent: function (node) { return node.parentNode; },
	    getNextSibling: function (node) { return node.nextElementSibling; },
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
	            // 循环新属性值 依次设置
	            for (var key in next) {
	                el.style[key] = next[key];
	            }
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
	extend(nodeOps, { patchProp: patchProp });
	/**
	 *  创建节点
	 * @param rootComponent  组件
	 * @param rootProp       组件传入的属性值
	 */
	function createApp(rootComponent, rootProp) {
	    if (rootProp === void 0) { rootProp = null; }
	    var app = createRenderer().createApp(rootComponent, rootProp);
	    var mount = (app || {}).mount;
	    // 重写mount
	    app.mount = function (container) {
	        container = document.querySelector(container);
	        container.innerHTML = ""; //挂载之前先清空
	        mount(container);
	    };
	    return app;
	}
	// from  core

	exports.createApp = createApp;

	Object.defineProperty(exports, '__esModule', { value: true });

	return exports;

}({}));
//# sourceMappingURL=runtime-dom.global.js.map
