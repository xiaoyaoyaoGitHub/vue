export function effect(fn, options: any = {}) {
	const effect = createReactiveEffect(fn, options);
	if (!options.lazy) {
		//立即执行一次
		effect();
	}
	return effect;
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
	// console.log(depMaps);
}

// 触发更新
export function trigger(target, type, key, oldValue, newValue) {
	// console.log(target, type, key, oldValue, newValue);
	const depsMap = depMaps.get(target);
	if (!depsMap) return;
    console.log(key);
	const effectsSet = depsMap.get(key);
	if (!effectsSet) return;
	const willEffectsSet = new Set();
	effectsSet.forEach(effect => willEffectsSet.add(effect));
    willEffectsSet.forEach((effect:any) => effect())
	// console.log(target, type, key, oldValue, newValue);
}
