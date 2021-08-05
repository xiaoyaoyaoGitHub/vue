import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";

const routes: Array<RouteRecordRaw> = [
	{
		path: "/",
		name: "Home",
		component: () => import("../views/index.vue"),
	},
	{
		path: "/login",
		name: "Login",
		component: () => import("../views/LoginRegister.vue"),
	},
	{
		path: "/forgotPassword",
		name: "ForgotPassword",
		component: () => import("../views/ForgotPassword.vue"),
	},
	{
		path: "/:catchAll(.*)",
		name: "/404",
		component: () => import("../views/404.vue"),
	},
];

const router = createRouter({
	history: createWebHistory(process.env.BASE_URL),
	routes,
});

export default router;
