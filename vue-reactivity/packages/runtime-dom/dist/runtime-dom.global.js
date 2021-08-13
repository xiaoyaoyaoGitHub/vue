var VueRuntimeDom = (function (exports) {
	'use strict';

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

	exports.nodeOps = nodeOps;

	Object.defineProperty(exports, '__esModule', { value: true });

	return exports;

}({}));
//# sourceMappingURL=runtime-dom.global.js.map
