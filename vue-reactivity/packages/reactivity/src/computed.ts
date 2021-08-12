import { isObject } from "@wangly/share";
import { effect, track, trigger } from "./effect";

class ComputedRefImpl {
	public effect;
	public _value;
	public dirty = true; //防止多次取值
	constructor(public getter, public setter) {
		this.effect = effect(getter, {
			lazy: true, //开始不执行
			// 如果设置了schedular,则更新的时候就不触发effect,而是触发schedular
			schedular: (effect) => { //依赖有更新
				if(!this.dirty){
                    this.dirty = true
                    trigger(this, 'set', 'value')
                }
			},
		});
	}
	get value() {
		if (this.dirty) {  //如果依赖有更新,则重新取值,如果没有则直接返回缓存
            console.log('依赖有更新,重新取值');
			this._value = this.effect();
            this.dirty = false
		}
        track(this, 'get', 'value') // 当计算属性被其他effect引用时,也要收集依赖
		return this._value;
	}

	set value(newValue) {
		this.setter(newValue);
	}
}

/**
 *
 * @param objectOptions
 *  可能是一个方法或者是一个对象里面设置了set/get方法
 */
export function computed(objectOptions) {
	let getter, setter;
	if (isObject(objectOptions)) {
		getter = objectOptions.get;
		setter = objectOptions.set;
	}
	getter = objectOptions;
	setter = () => {
		console.log("no setter");
	};

	return new ComputedRefImpl(getter, setter);
}
