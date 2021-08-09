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
