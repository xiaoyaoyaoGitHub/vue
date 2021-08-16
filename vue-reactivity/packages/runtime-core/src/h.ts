import { isArray, isObject, isVnode } from "@wangly/share";
import { createVNode } from "./vnode";

export function h(type, propsOrChildren, children) {
	// console.log(arguments);
	const argLength = arguments.length;
	if (argLength == 2) {
		if (isObject(propsOrChildren) && !isArray(propsOrChildren)) {
			if (isVnode(propsOrChildren)) {
				//表示没有属性值
				return createVNode(type, null, [propsOrChildren]);
			} else {
				return createVNode(type, propsOrChildren); // 表示没有子元素
			}
		}
	} else if (argLength === 3) {
		if (isVnode(children)) {
			return createVNode(type, propsOrChildren, [children]);
		}
	} else if (argLength > 3) {
		return createVNode(
			type,
			propsOrChildren,
			Array.from(arguments).slice(2)
		);
	}
}
