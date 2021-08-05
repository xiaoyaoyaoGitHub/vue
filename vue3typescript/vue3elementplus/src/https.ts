import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { ElLoading } from "element-plus";
import {
	ILoadingInstance,
	ILoadingOptions,
} from "../node_modules/element-plus/lib/el-loading/src/loading.type";

let loadingInstance: ILoadingInstance;
const showLoading = () => {
	const options: ILoadingOptions = {
		lock: true,
		text: "加载中...",
		background: "rgba(0, 0, 0, 0.7)",
	};
	loadingInstance = ElLoading.service(options);
};

const hideLoading = () => {
	loadingInstance.close();
};

// 请求拦截
axios.interceptors.request.use((config: AxiosRequestConfig) => {
	showLoading();
	return config;
});

// 响应拦截
axios.interceptors.response.use(
	(response: AxiosResponse<any>) => {
		hideLoading();
		return response;
	},
	(err) => {
		hideLoading();
		return Promise.reject(err);
	}
);

export default axios;
