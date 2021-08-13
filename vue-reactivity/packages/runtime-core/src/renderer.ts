export function createRenderer(renderOptions) {
	return {
		createApp(rootComponent, rootProp) {
			return {
				mount: function (container) {
					console.log("core", container);
				},
			};
		},
	};
}
