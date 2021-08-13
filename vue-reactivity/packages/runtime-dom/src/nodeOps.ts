// 增 删 改 查 元素中插入文本  文本的创建 文本元素内容的设置 获取父节点 获取相邻节点
export const nodeOps = {
	createElement: (tag) => document.createElement(tag),
	remove: (child) => child.parentNode && child.parentNode.removeChild(child),
	insert: (child, parent, anchor = null) =>
		parent.insertBefore(child, anchor),
	querySelector: (selector) => document.querySelector(selector),
	setElementText: (el, text) => (el.textContent = text),
	createText: (text) => document.createTextNode(text),
	setText: (node, text) => (node.nodeValue = text),
	getParent: (node) => node.parentNode,
	getNextSibling: (node) => node.nextElementSibling,
};
