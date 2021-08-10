import { isArray } from "@wangly/share";
import { track, trigger } from "./effect";
import { reactive } from "./reactive";

export function ref(value) {
	return createRef(value);
}

function createRef(value) {
	return new RefImpl(value);
}

class RefImpl {
	public _value;
	constructor(public rawValue) {
		this._value = reactive(rawValue);
	}

	get value() {
		track(this, "get", "value");
		return this._value;
	}

	set value(newValue) {
		this._value = newValue;
		trigger(this, "set", "value", this.rawValue, newValue);
	}
}

export function toRef(target, key) {
	return new ObjectRefImpl(target, key);
}

// 通过代理的方式去Proxy中取值
class ObjectRefImpl {
	public _v_isRef = true;
	constructor(public target, public key) {}

	get value() {
		// console.log(`this.target`,this.target);
		// console.log(`[this.key]`,this.key);
		return this.target[this.key];
	}

	set value(newValue) {
		this.target[this.key] = newValue;
	}
}

export function toRefs(target) {
	const res = isArray(target)
		? new Array(target.length)
		: Object.create(null);
	// 循环将每一项都设置toRef
	for (let key in target) {
		res[key] = toRef(target, key);
	}
	return res;
}
