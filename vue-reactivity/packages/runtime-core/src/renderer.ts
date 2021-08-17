import { effect } from "@wangly/reactivity";
import { ShapeFlags } from "@wangly/share";
import { createAppApi } from "./apiCreateApp";
import { setupComponent } from "./component";

export function createRenderer(renderOptions) {
	let uid = 0;
	const {
		insert: hostInsert,
		remove: hostRemove,
		patchProp: hostPatchProp,
		createElement: hostCreateElement,
		createText: hostCreateText,
		setText: hostSetText,
		setElementText: hostSetElementText,
		parentNode: hostParentNode,
		nextSibling: hostNextSibling,
	} = renderOptions;
	/**
	 * 创建对象实例
	 * @param vnode 虚拟节点
	 */
	function createComponentInstance(vnode) {
		const instance = {
			uid: uid++,
			vnode: vnode, // 实例上的vnode就是我们处理过的vnode
			type: vnode.type, // 用户写的组件的内容
			props: {}, // props就是组件里用户声明过的
			attrs: {}, // 用户没用到的props 就会放到attrs中
			slots: {}, // 组件的是插槽
			setupState: {}, // setup的返回值
			proxy: null,
			emit: null, // 组件通信
			ctx: {}, // 上下文
			isMounted: false, // 组件是否挂载
			subTree: null, // 组件u敌营的渲染内容
			render: null,
		};
		instance.ctx = { _: instance };
		return instance;
	}

	/**
	 * 挂载
	 * @param instance
	 * @param container
	 */
	function setupRenderEffect(instance, container) {
		effect(function componentEffect() {
			if (!instance.isMounted) {
				console.log("第一次挂载");
				// 在vue中的render函数中,有个参数,是对当前实例的拦截的proxy
				let subTree = (instance.subTree = instance.render.call(
					instance.proxy,
					instance.proxy
				));
				console.log(subTree);
				patch(null, subTree, container);
			} else {
				instance.isMounted = true;
				console.log("组件更新");
			}
		});
	}

	/**
	 * 挂载组件
	 * @param n2         新虚拟节点
	 * @param container
	 */
	function mountComponent(n2, container) {
		// 创建组件实例, 并将实例挂载到自己本身上
		let instance = (n2.instance = createComponentInstance(n2));
		// 处理实例参数
		setupComponent(instance);
		// 执行render 方法 劫持组件
		setupRenderEffect(instance, container);
	}

	/**
	 * 更新组件
	 * @param n1        新虚拟节点
	 * @param n2        旧虚拟节点
	 * @param container
	 */
	function updateComponent(n1, n2, container) {}

	/**
	 * 组件处理
	 * @param n1
	 * @param n2
	 * @param container
	 */
	function processComponent(n1, n2, container) {
		if (!n1) {
			// 如果没有旧vode 则是挂载
			mountComponent(n2, container);
		} else {
			//否则是更新
			updateComponent(n1, n2, container);
		}
	}

	function mountChildren(children, container) {
		console.log(children);
		
		for (let i = 0; i < children.length; i++) {
			patch(null, children[i], container);
		}
	}

	/**
	 * 挂载节点
	 * @param vnode
	 * @param container
	 */
	function mountElement(vnode, container) {
		const { type, props, children, shapeFlag } = vnode || {};
		let el = (vnode.el = hostCreateElement(type));
		console.log(`props`,props);
		if (props) {
			for (let key in props) {
				hostPatchProp(el, key, null, props[key]);
			}
		}
		if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
			console.log('处理children');
			// 如果子元素是数组
			mountChildren(children, el);
		} else {
			hostSetElementText(el, children);
		}
		// console.log(container);
		hostInsert(el, container)
	}

	/**
	 *
	 * @param n1
	 * @param n2
	 * @param container
	 */
	function processElement(n1, n2, container) {
		if (n1 === null) {
			mountElement(n2, container);
		} else {
			// 更新 diff 算法
		}
	}

	/**
	 * 判断是否挂载还是更新
	 * @param n1         旧虚拟节点
	 * @param n2         新虚拟节点
	 * @param container  挂载跟节点
	 */
	function patch(n1, n2, container) {
		// 判断新虚拟节点类型
		const { shapeFlag } = n2;
		if (shapeFlag & ShapeFlags.ELEMENT) {
			//节点类型
			processElement(n1, n2, container);
		} else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
			//组件类型
			processComponent(n1, n2, container);
		}
	}

	/**
	 * render函数
	 * @param vnode     虚拟节点
	 * @param container 挂载跟节点
	 */
	const render = (vnode, container) => {
		// 对比新旧节点的不同
		patch(null, vnode, container);
	};

	return {
		createApp: createAppApi(render),
		render,
	};
}
