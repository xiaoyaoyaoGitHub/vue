import { isArray, isIntegerKey } from "@wangly/share";

export function effect(fn, options: any = {}) {
	const effectReactive = createReactiveEffect(fn, options);
	if (!options.lazy) {
		//立即执行一次
		effectReactive();
	}
	return effectReactive;
}

const effectStack = []; //effect 栈
let activeEffect; // 当前执行的effect
let id = 0;

function createReactiveEffect(fn, options) {
	const effect = function reactiveEffect() {
		try {
			effectStack.push(effect);
			activeEffect = effect;
			return fn();
		} finally {
			effectStack.pop();
			activeEffect = effectStack[effectStack.length - 1];
		}
	};
	effect.id = id++;
	effect.options = options;
	effect.deps = []; // 用来收集依赖
	return effect;
}

// 创建weakMap, 收集依赖
const depMaps = new WeakMap();
export function track(target, type, key) {
	if (!activeEffect) {
		//如果只是单纯的取值,则不需要保存
		return;
	}
	// debugger
	let deps = depMaps.get(target);
	if (!deps) {
		//如果不存在则重新设置
		depMaps.set(target, (deps = new Map()));
	}
	let dep = deps.get(key);
	if (!dep) {
		deps.set(key, (dep = new Set())); //使用Set是为了防止重复
	}
	if (!dep.has(activeEffect)) {
		dep.add(activeEffect);
	}
}

// 触发更新
export function trigger(target, type, key, oldValue, newValue) {
	// console.log(oldValue, newValue, key);
    console.log(depMaps);
	const depsMap = depMaps.get(target);
    console.log(depsMap);
	if (!depsMap) return;
	// const effectsSet = depsMap.get(key) || [];
	const willEffectsSet = new Set();
	const add = (effectsSet) => {
		if (effectsSet) {
			effectsSet.forEach((effect: any) => willEffectsSet.add(effect));
		}
	};
	if (key === "length" && isArray(target)) { //如果数组直接修改length的长度
		depsMap.forEach((dep, setKey) => {
			//查看当前监听里面是否含有比当前数组大的索引值,如果有则更新
			if (typeof setKey !== "symbol") {
				if (setKey > newValue || setKey === "length") {
					add(dep);
				}
			}
		});
	} else {
		add(depsMap.get(key));
		if (isArray(target) && isIntegerKey(key)) {
			switch (type) {
				case "add":// 如果数组通过push增加,修改了length,则触发不了监听,需要手动触发
					add(depsMap.get("length"));
					break;
			}
		}
	}
	willEffectsSet.forEach((effect: any) => effect());
}
