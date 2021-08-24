import { effect } from "@wangly/reactivity";
import { hasOwn, ShapeFlags } from "@wangly/share";
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
				console.log(`subTree`, subTree);
				instance.isMounted = true;
				patch(null, subTree, container);
			} else {
				// instance.isMounted = true;
				console.log("组件更新");
				const prevTree = instance.subTree;
				const nextTree = instance.render.call(
					instance.proxy,
					instance.proxy
				);
				// 进入新旧vnode节点比对
				patch(prevTree, nextTree, container);
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

	function mountChildren(children, container, auchor) {
		console.log(`children`, children);

		for (let i = 0; i < children.length; i++) {
			patch(null, children[i], container, auchor);
		}
	}

	/**
	 * 挂载节点
	 * @param vnode
	 * @param container
	 */
	function mountElement(vnode, container, auchor) {
		const { type, props, children, shapeFlag } = vnode || {};
		let el = (vnode.el = hostCreateElement(type));
		// console.log(`props`, shapeFlag & ShapeFlags.TEXT_CHILDREN);
		if (props) {
			for (let key in props) {
				hostPatchProp(el, key, null, props[key]);
			}
		}
		if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
			console.log("处理children");
			// 如果子元素是数组
			mountChildren(children, el, auchor);
		} else {
			hostSetElementText(el, children);
		}
		hostInsert(el, container, auchor);
	}

	/**
	 * 属性对比
	 * @param el
	 * @param oldProps
	 * @param newProps
	 */
	function patchProps(el, oldProps, newProps) {
		if (oldProps === newProps) return;
		for (let key in newProps) {
			const prev = oldProps[key];
			const next = newProps[key];
			if (prev !== next) {
				hostPatchProp(el, key, prev, next);
			}
		}
		for (let key in oldProps) {
			if (!hasOwn(newProps, key)) {
				hostPatchProp(el, key, oldProps[key], null);
			}
		}
	}

	/**
	 * 数组子节点比较
	 * @param c1
	 * @param c2
	 * @param container
	 */
	function patchKeyedChildren(c1, c2, container) {
		let i = 0;
		let e1 = c1.length - 1;
		let e2 = c2.length - 1;
		// 从前往后比较
		while (i <= e1 && i <= e2) {
			if (isSameVnode(c1[i], c2[i])) {
				// 如果是相同类型元素, 则比较属性和子节点
				patch(c1[i], c2[i], container);
			} else {
				break;
			}
			i++;
		}
		console.log('i',i);
		// 从后往前比较
		while (i <= e1 && i <= e2) {
			if (isSameVnode(c1[e1], c2[e2])) {
				patch(c1[e1], c2[e2], container);
			} else {
				break;
			}
			e1--;
			e2--
		}
		console.log('e1',e1);
		console.log('e2',e2);

		// 有序比对
		if (i > e1) {
			//新的多,旧的少
			if ( i<= e2) {
				const nextPos = e2 + 1;
				const anchor = nextPos < c2.length - 1 ? c2[nextPos].el : null;
				// 如果anchor 不为null,则是在当前元素添加
				while (i <= e2) {
					patch(null, c2[i++], container, anchor);
				}
			}
		} else if (i > e2) {
			// 老的多,新的少
			while (i <= e1) {
				unmount(c1[i++]);
			}
		} else {
			// 乱序比对
			let s1 = i; // 旧节点循环到的索引
			let s2 = i; // 新节点循环到的索引
			// 以新节点为映射表
			const keyForNewNnode = new Map();
			for (let i = s2; i <= e2; i++) {
				const cvnode = c2[i];
				keyForNewNnode.set(cvnode.key, i);
			}
			console.log(`keyForNewNnode`,keyForNewNnode);
			const toBePatch = e2 - s2 + 1;
			const newIndexToOldIndexMap = new Array(toBePatch).fill(0); //记录被patch过的节点
			// 循环旧节点,在映射表中查找
			for (let i = s1; i <= e1; i++) {
				const oldVnode = c1[i];
				const baseKey = oldVnode.key;
				// 旧节点在新节点中的位置索引
				const newIndex = keyForNewNnode.get(baseKey);
				if (newIndex === undefined) {
					// 删除
					unmount(oldVnode);
				} else {
					// 存储的是新节点中的节点对应旧节点位置的索引
					newIndexToOldIndexMap[newIndex - s2] = i + 1;
					patch(oldVnode, c2[newIndex], container);
				}
			}
			console.log(`newIndexToOldIndexMap`, newIndexToOldIndexMap);
			// // 移动位置
			for (let i = toBePatch - 1; i >= 0; i--) {
				// console.log(newIndexToOldIndexMap[i]);
				const newCurrentIndex = i + s2;
				const newChild = c2[newCurrentIndex];
				// 寻找当前节点的后面的节点插入
				const auchor =
					newCurrentIndex + 1 < c2.length
						? c2[newCurrentIndex + 1].el
						: null;
				console.log(`auchor`,auchor);
				if (newIndexToOldIndexMap[i] === 0) {
					// 新增
					patch(null, newChild, container, auchor);
				} else {
					hostInsert(newChild.el, container, auchor)
				}
			}
		}
	}

	function unmount(vnode) {
		hostRemove(vnode.el);
	}

	/**
	 * 对比子节点
	 * @param n1   旧节点
	 * @param n2   新节点
	 * @param container
	 */
	function patchChildren(n1, n2, container, auchor) {
		const c1 = n1.children;
		const c2 = n2.children;

		const prevShageFlag = n1.shapeFlag;
		const shapeFlag = n2.shapeFlag;
		// 1. 当前子节点是文本,则直接替换
		if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
			hostSetElementText(container, c2);
		} else {
			// 当前子节点是数组
			if (prevShageFlag & ShapeFlags.ARRAY_CHILDREN) {
				//之前的子节点也是数组
				patchKeyedChildren(c1, c2, container);
			} else {
				// 之前子节点是文本
				hostSetElementText(container, ""); // 清空之前节点
				mountChildren(c2, container, auchor); //挂载当前子节点
			}
		}
	}

	/**
	 * 对比新旧节点的属性/子节点
	 * @param n1
	 * @param n2
	 * @param container
	 */
	function patchElement(n1, n2, container, auchor) {
		let el = (n2.el = n1.el);
		const oldProps = n1.props || {};
		const newProps = n2.props || {};
		patchProps(el, oldProps, newProps); //对比属性
		// 对比子节点
		patchChildren(n1, n2, el, auchor);
	}

	/**
	 * 创建节点
	 * @param n1
	 * @param n2
	 * @param container
	 */
	function processElement(n1, n2, container, auchor) {
		if (n1 === null) {
			mountElement(n2, container, auchor);
		} else {
			// 更新 diff 算法
			patchElement(n1, n2, container, auchor);
		}
	}

	/**
	 * 判断新旧节点是否相同
	 * @param n1 旧节点
	 * @param n2 新节点
	 */
	function isSameVnode(n1, n2) {
		return n1.type == n2.type && n1.key == n2.key;
	}

	/**
	 * 判断是否挂载还是更新
	 * @param n1         旧虚拟节点
	 * @param n2         新虚拟节点
	 * @param container  挂载跟节点
	 */
	function patch(n1, n2, container, auchor = null) {
		// 判断节点是否相同,如果不同则直接删除旧节点
		if (n1 && !isSameVnode(n1, n2)) {
			unmount(n1);
			n1 = null;
		}
		// 判断新虚拟节点类型
		const { shapeFlag } = n2;
		if (shapeFlag & ShapeFlags.ELEMENT) {
			//节点类型
			processElement(n1, n2, container, auchor);
		} else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
			//组件类型
			processComponent(n1, n2, container);
		} else {
			// 直接是文本
			container.textContent = container.textContent + n2;
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
