<template>
	<el-form
		label-width="100px"
		class="loginForm sign-in-form"
		ref="loginForm"
		:model="loginUser"
		:rules="rules"
	>
		<el-form-item label="邮箱" prop="email">
			<el-input
				v-model="loginUser.email"
				placeholder="Enter email..."
			></el-input>
		</el-form-item>
		<el-form-item label="密码" prop="password">
			<el-input
				type="password"
				v-model="loginUser.password"
				placeholder="Enter password"
			></el-input>
		</el-form-item>
		<el-form-item>
			<el-button
				class="submit-btn"
				type="primary"
				@click="submitForm('loginForm')"
				>提交</el-button
			>
		</el-form-item>
		<!-- 找回密码 -->
		<div class="tiparea">
			<p>忘记密码？ <a @click.prevent="handlePassword">立即找回</a></p>
		</div>
	</el-form>
</template>

<script lang="ts">
import { getCurrentInstance } from "vue";
import { AxiosResponse } from "axios";
import { useRouter } from "vue-router";
export default {
	name: "LoginForm",
	props: {
		loginUser: {
			type: Object,
			required: true,
		},
		rules: {
			type: Object,
			required: true,
		},
	},
	setup(props) {
		// @ts-ignore
		const { ctx } = getCurrentInstance();
		const route = useRouter();
		// 触发登录
		const submitForm = (form: string) => {
			ctx.$refs[form].validate((valid: boolean) => {
				if (valid) {
					ctx.$axios
						.post("/api/v1/auth/login", props.loginUser)
						.then(
							(
								res: AxiosResponse<{
									success: boolean;
									token: string;
								}>
							) => {
								console.log(res);
								ctx.$message.success("登录成功");

								route.push("/");
							}
						)
						.catch((err: any) => {
							ctx.$message.error(err.message);
						});
				}
			});
		};
		// 找回密码
		const handlePassword = () => {
			route.push("/forgotPassword");
		};
		return { submitForm, handlePassword };
	},
};
</script>

<style scoped>
.submit-btn {
	width: 100%;
}
.tiparea {
	text-align: right;
	font-size: 12px;
	color: #333;
}
.tiparea p a {
	color: #409eff;
}
</style>
