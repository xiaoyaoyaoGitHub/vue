export function isObject(target) {
	return typeof target == "object" && target !== null;
}

export const extend = Object.assign;

export const hasChange = (oldValue, newValue) => {
	return oldValue !== newValue;
};

export const isArray = Array.isArray;

export const hasOwn = (target, key) =>
	Object.prototype.hasOwnProperty.call(target, key);

export const isIntegerKey = (key) => {
	return parseInt(key) + "" === key;
};
