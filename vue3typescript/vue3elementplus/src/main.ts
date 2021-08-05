import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";

import ElementPlus from "element-plus";
import "element-plus/lib/theme-chalk/index.css";

import axios from './https';

const app = createApp(App)

// 全局挂载axios
app.config.globalProperties.$axios = axios

app.use(store)
app.use(router)
app.use(ElementPlus)
app.mount("#app");
