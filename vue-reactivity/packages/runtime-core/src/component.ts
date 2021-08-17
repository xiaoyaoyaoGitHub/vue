import { isFunction, isObject } from "@wangly/share";
import { componentPublicInstance } from "./componentPublicInstance";

/**
 * 处理setup 第二个参数
 * @param instance
 * @returns
 */
export function createSetupContext(instance) {
	return {
		slots: instance.slots,
		emit: instance.emit,
		attrs: instance.attrs,
		expose: () => {}, // 可以通过该方法暴露参数和方法,对外使用ref被调用
	};
}

/**
 * 处理setup执行返回结果 处理setup返回结果,如果返回的是对象,则赋值为实例的state,如果是函数,则作为render函数触发
 * @param instance    当前组件实例对象
 * @param setupResult setup执行结果
 */
function handleSetupResult(instance, setupResult) {
	if (isObject(setupResult)) {
        instance.setupState = setupResult // 将返回结果保存到setupState中
	} else if (isFunction(setupResult)) {
		instance.render = setupResult;
	}
	finishComponentSetup(instance);
}

/**
 * 处理如果没有setup函数或者无返回结果render处理方式
 * @param instance
 */
function finishComponentSetup(instance) {
	const Component = instance.type;
	if (Component && Component.render) {
		instance.render = Component.render;
	}
    console.log(instance);
}

/**
 * 处理setup参数并执行setup方法
 * @param instance 实例
 */
export function setupStatefulComponent(instance) {
	const { type: Component } = instance;
	const { setup } = Component;
	console.log(setup);
	if (setup) {
		// 处理setup需要传入的两个参数
		const setupContext = createSetupContext(instance);
		const setupResult = setup(instance.props, setupContext);
		// 处理setup返回结果
		handleSetupResult(instance, setupResult);
	} else {
		finishComponentSetup(instance);
	}
}

/**
 * 处理实例参数
 * @param instance 实例
 */
export function setupComponent(instance) {
	const { props, children } = instance.vnode;
	console.log(props,`props`);
	// TODO  props是响应式
	instance.props = props;
	instance.slots = children;
    // 对整个instance.ctx做劫持
    instance.proxy = new Proxy(instance.ctx, componentPublicInstance)
	// 处理setup 函数
	setupStatefulComponent(instance);
}
