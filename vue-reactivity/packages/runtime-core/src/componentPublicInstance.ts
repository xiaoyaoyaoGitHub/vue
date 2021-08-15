import { hasOwn } from "@wangly/share";

export const componentPublicInstance = {
	get({ _: instance }, key) {
		const { setupState, props, ctx } = instance;
		if (hasOwn(setupState, key)) {
			return setupState[key];
		} else if (hasOwn(props, key)) {
			return props[key];
		} else if (hasOwn(ctx, key)) {
			return ctx[key];
		}
	},
	set({ _: instance }, key, value) {
		const { setupState, props, ctx } = instance;
		if (hasOwn(setupState, key)) {
			setupState[key] = value
		} else if (hasOwn(props, key)) {
			return props[key] = value
		} else if (hasOwn(ctx, key)) {
			return ctx[key] = value
		}
        return true
	},
};
