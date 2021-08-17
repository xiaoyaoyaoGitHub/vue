/**
 * 设置class属性值
 * @param el   节点
 * @param next 新属性值
 */
function patchClass(el, next) {
	if (next == null) {
		next = "";
	}
	el.className = next;
}

/**
 * 设置style属性值
 * @param el    节点
 * @param prev  旧值
 * @param next  新值
 */
function patchStyle(el, prev, next) {
	if (next == null) {
		//如果新属性值没有,则移除style属性
		el.removeAttribute("style");
	} else {
		if (prev) {
			for (let key in prev) {
				if (!next[key]) {
					//如果新属性值中没有当前属性值,则直接设置为空
					el.style[key] = "";
				}
			}
		}
		// 循环新属性值 依次设置
		for (let key in next) {
			el.style[key] = next[key];
		}
	}
}

/**
 * 设置事件
 * @param el   节点
 * @param key  事件类型
 * @param next 触发事件
 */
function patchEvents(el, key, next) {
	// 判断当前节点有没有绑定事件
	const invokers = el._vei || (el.vei = {});
	const exists = invokers[key];
	if (exists && next) {
		exists.value = next;
	} else {
		// 处理事件类型 onClick => click
		const eventName = key.toLowerCase().slice(2);
		if (!next) {
			//如果绑定事件木有了则移除监听
			el.removeEventListener(eventName);
		} else {
			// 如果绑定或者删除事件监听,对性能损耗较大,然后可以将需要更改监听统一使用invoker,在invoker中的value属性中保存需要监听的方法,之后改变就改变value的值
			const invoker = createInvoker(next);
			el.addEventListener(eventName, invoker);
		}
	}
}

/**
 *
 * @param fn addEventListener 需要监听的事件
 */
function createInvoker(fn) {
	const invoker = (e) => invoker.value(e);
	invoker.value = fn;
	return invoker;
}

/**
 * 对比其他属性值
 * @param el   节点
 * @param key  属性名
 * @param next 新值
 */
function patchAttrs(el, key, next) {
	if (next) {
		el.setAttribute(key, next);
	} else {
		el.removeAttribute(key);
	}
}

/**
 *
 * @param el   节点
 * @param key  对比的属性
 * @param prev 旧值
 * @param next 新值
 */
export const patchProp = (el, key, prev, next) => {
	switch (key) {
		case "class":
			patchClass(el, next);
			break;
		case "style":
			patchStyle(el, prev, next);
			break;
		default:
			if (/^on[^a-z]/.test(key)) {
				// 事件
				patchEvents(el, key, next);
			} else {
				// 其他属性
				patchAttrs(el, key, next);
			}
	}
};
