import { extend, isObject } from "@wangly/share";
import { reactive, readonly } from "./reactive";

// get 方法生成函数
// vue3 针对的是对象来进行劫持,不用改写原来的对象,如果是嵌套,取值的时候才会进行代理
// vue2 针对的书属性劫持,改写了原来对象,首先递归
// vue3 可以对不存在的属性进行获取,也会走get方法,proxy支持数组
function createGetter(isReadonly = false, shallow = false) {
	return function (target, key, receiver) {
		// 使用Reflect做映射取值
		const res = Reflect.get(target, key, receiver);
		// 如果属性不是深层代理则直接返回
		if (shallow) {
			return res;
		}
		// 如果res是对象,则对其进行再次代理
		if (isObject(res)) {
			// 懒递归,当我们去取值时,才去做递归,如果不取默认代理1层
			return isReadonly ? readonly(res) : reactive(res);
		}

		return res;
	};
}
// set 方法生成函数
function createSetter(shallow = false) {
	return function (target, key, value, receiver) {
		const res = Reflect.set(target, key, value, receiver);
		return res;
	};
}

// get方法
const get = createGetter();
const shallowGet = createGetter(false, true);
const readonlyGet = createGetter(true);
const shallowReadonlyGet = createGetter(true, true);

// set方法
const set = createSetter();
const shallowSet = createSetter(true);

export const mutableHandler = {
	get,
	set,
};

export const shallowReactiveHandler = {
	get: shallowGet,
	set: shallowSet,
};

let readonlySet = {
	set(target, key) {
		console.warn(`cannot set ${JSON.stringify(target)} on key ${key}`);
	},
};

export const readonlyHandler = extend(
	{
		get: readonlyGet,
	},
	readonlySet
);

export const shallowReadonlyHandler = extend(
	{
		get: shallowReadonlyGet,
	},
	readonlySet
);
