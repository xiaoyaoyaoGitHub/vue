import { extend } from "@wangly/share";

// get 方法生成函数
function createGetter(isReadonly = false, shallow = false) {
	return function () {};
}
// set 方法生成函数
function createSetter(shallow = false) {}

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
