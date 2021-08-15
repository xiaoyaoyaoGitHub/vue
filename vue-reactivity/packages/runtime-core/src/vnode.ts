// 创建虚拟节点 描述真实dom内容的js对象
//  1. 跨平台可用,
//  2.可以在操作真实dom节点之前进行比对,使用之后的比对结果进行渲染,避免操作过多的真实dom,提高性能 真实dom之前的一个缓存

import { isArray, isObject, isString, ShapeFlags } from "@wangly/share";

/**
 *
 * @param type     原始组件
 * @param props    属性
 * @param children 子元素
 */
export function createVNode(type, props, children = null) {
	// 虚拟节点属性描述内容 type props key children _v_isVnode
	const shapeFlag = isString(type) //直接是节点类型 如 div h1
		? ShapeFlags.ELEMENT
		: isObject(type) // 是对象类型例如 {setup:()=>{}}
		? ShapeFlags.STATEFUL_COMPONENT
		: 0;
	const vnode = {
		_v_isVnode: true,
		type, // 对组件而言就是一个对象
		props,
		children,
		el: null, // 对应真实节点
		component: null, // 组件实例
		shapeFlag, // 类型
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
function normalizeChildren(vnode, children = null) {
	let shapeFlag = 0;
	if (children) {
		shapeFlag = isArray(children)
			? ShapeFlags.ARRAY_CHILDREN //子元素为数组
			: ShapeFlags.TEXT_CHILDREN; // 子元素为文本
	}
	vnode.shapeFlag |= shapeFlag;
}
