// 对dom操作的整合,将这些api传入到core中调用, 统一不同平台调用方法

import { extend } from "@wangly/share";
import { createRenderer } from "@wangly/runtime-core";
import { nodeOps } from "./nodeOps";
import { patchProp } from "./patchProp";
const renderOptions = extend(nodeOps, { patchProp });


/**
 *  创建节点
 * @param rootComponent  组件
 * @param rootProp       组件传入的属性值
 */
export function createApp(rootComponent, rootProp = null) {
	const app = createRenderer(renderOptions).createApp(
		rootComponent,
		rootProp
	);
	const { mount } = app || {};
	// 重写mount
	app.mount = function (container) {
		container = document.querySelector(container);
		container.innerHTML = ""; //挂载之前先清空
		mount(container);
	};
	return app;
}

export * from "@wangly/runtime-core";
export * from "@wangly/reactivity"