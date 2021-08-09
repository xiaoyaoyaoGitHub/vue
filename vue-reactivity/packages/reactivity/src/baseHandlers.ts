import {
	extend,
	isObject,
	hasChange,
	isArray,
	hasOwn,
	isIntegerKey,
} from "@wangly/share";
import { reactive, readonly } from "./reactive";
import { track, trigger } from "./effect";

// get 方法生成函数
// vue3 针对的是对象来进行劫持,不用改写原来的对象,如果是嵌套,取值的时候才会进行代理
// vue2 针对的书属性劫持,改写了原来对象,首先递归
// vue3 可以对不存在的属性进行获取,也会走get方法,proxy支持数组
function createGetter(isReadonly = false, shallow = false) {
	return function (target, key, receiver) {
		// 使用Reflect做映射取值
		const res = Reflect.get(target, key, receiver);
		if (!isReadonly) {
			// console.log('收集依赖');
			track(target, "get", key);
		}
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
// 如果是操作数组,如果发生length变化,则会触发两次set方法
function createSetter(shallow = false) {
	return function (target, key, value, receiver) {
		const oldValue = target[key];
		// 是否存在当前设置的key 区分下数组的新增和修改
		const hadKey =
			isArray(target) && isIntegerKey(key)
				? Number(key) < target.length
				: hasOwn(target, key);
		const res = Reflect.set(target, key, value, receiver);

		if (!hadKey) {
			//是新增
			// console.log("是新增");
			trigger(target, "add", key, oldValue, value);
		} else if (hasChange(oldValue, value)) {
			// console.log("改变数值");
			trigger(target, "set", key, oldValue, value);
		}
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
