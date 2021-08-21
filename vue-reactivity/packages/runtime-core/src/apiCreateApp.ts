import { createVNode } from "./vnode";

export function createAppApi(render) {
	return (rootComponent, rootProp) => {
		const app = {
			// 为了稍后组件挂载之前可以先校验组件是否有render函数或者模板
			_component: rootComponent,
			_props: rootProp,
			_container: null,
			mount(container) {
				// 根据用户传入的属性创建一个虚拟节点
				console.log(rootComponent);
				const vNode = createVNode(rootComponent, rootProp);
				console.log(vNode);
				// 更新节点的_container
				app._container = container;
				// 将虚拟节点转化成真实节点,插入到对应的容器中
				render( vNode, container);
			},
			render,
		};
		console.log(app);
		return app;
	};
}
