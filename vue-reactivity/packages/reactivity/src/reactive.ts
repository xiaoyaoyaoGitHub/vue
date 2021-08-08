// import { isObject } from "./../../share/src/index.ts";  // 修改tsconfig.json配置文件,修改其中的path 和 baseurl
import { isObject } from "@wangly/share";

import { mutableHandler, shallowReactiveHandler, readonlyHandler, shallowReadonlyHandler } from "./baseHandlers"

// 响应式
export function reactive(target) {
	return createReactiveObject(target, false, mutableHandler);
}

// 浅响应式
export function shallowReactive(target) {
	return createReactiveObject(target, false, shallowReactiveHandler);
}

// 只读
export function readonly(target) {
	return createReactiveObject(target, true, readonlyHandler);
}

// 浅读
export function shallowReadonly(target) {
	return createReactiveObject(target, true, shallowReadonlyHandler);
}

/**
 *
 * @param target 创建代理目标
 * @param isReadonly 是否为只读
 * @param baseHandler  针对不同的方式创建不同的代理对象
 */

const reactiveMap = new WeakMap(); //创建映射用作缓存,相对于map来说可以不用手动清除
const readonlyMap = new WeakMap(); //readonly映射缓存
function createReactiveObject(target, isReadonly = false, baseHandler) {
	if (!isObject(target)) {
		return target;
	}
	const proxyMap = isReadonly ? readonlyMap : reactiveMap;
	// 判断是否有缓存,如果有则直接返回缓存对象不再拦截
	if (proxyMap.get(target)) {
		return proxyMap.get(target);
	}
	const proxyTarget = new Proxy(target, baseHandler); //创建proxy
	proxyMap.set(target, proxyTarget);
	return proxyTarget;
}
