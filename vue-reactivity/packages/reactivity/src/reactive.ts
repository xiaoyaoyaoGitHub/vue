
// import { isObject } from "./../../share/src/index.ts";  // 修改tsconfig.json配置文件,修改其中的path 和 baseurl
import { isObject } from "@wangly/share";

function mutableHandler() {}

function shallowReactiveHandler() {}

function readonlyHandler() {}

function shallowReadonlyHandler() {}

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
	return createReactiveObject(target, false, readonlyHandler);
}

// 浅读
export function shallowReadonly(target) {
	return createReactiveObject(target, false, shallowReadonlyHandler);
}

/**
 *
 * @param target 创建代理目标
 * @param isReadonly 是否为只读
 * @param baseHandler  针对不同的方式创建不同的代理对象
 */
function createReactiveObject(target, isReadonly, baseHandler) {
    if(!isObject(target)){
        return target
    }
    console.log(target);
}
