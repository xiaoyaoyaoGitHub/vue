<template>
	<!-- 注册 -->
	<el-form
		label-width="100px"
		class="registerForm sign-up-form"
		ref="registerForm"
		:model="registerUser"
		:rules="registerRules"
	>
		<el-form-item label="用户名" prop="name">
			<el-input
				v-model="registerUser.name"
				placeholder="Enter name..."
			></el-input>
		</el-form-item>
		<el-form-item label="邮箱" prop="email">
			<el-input
				v-model="registerUser.email"
				placeholder="Enter email..."
			></el-input>
		</el-form-item>
		<el-form-item label="密码" prop="password">
			<el-input
				type="password"
				v-model="registerUser.password"
				placeholder="Enter password"
			></el-input>
		</el-form-item>
		<el-form-item label="确认密码" prop="password2">
			<el-input
				type="password"
				v-model="registerUser.password2"
				placeholder="Enter password2"
			></el-input>
		</el-form-item>
		<el-form-item label="选择身份">
			<el-select v-model="registerUser.role" placeholder="请选择身份">
				<el-option label="管理员" value="admin"></el-option>
				<el-option label="用户" value="user"></el-option>
				<el-option label="游客" value="visitor"></el-option>
			</el-select>
		</el-form-item>
		<el-form-item>
			<el-button
				class="submit-btn"
				type="primary"
				@click="handleRegister('registerForm')"
				>提交</el-button
			>
		</el-form-item>
	</el-form>
</template>

<script lang="ts">
import { getCurrentInstance } from "vue";
import { AxiosResponse } from "axios";
import { useRouter } from "vue-router";
export default {
	name: "RegisterForm",
	props: {
		registerUser: {
			type: Object,
			required: true,
		},
		registerRules: {
			type: Object,
			required: true,
		},
	},
	setup(props) {
		// @ts-ignore
		const { ctx } = getCurrentInstance();
		const route = useRouter();
		const handleRegister = (form: string) => {
			ctx.$refs[form].validate((valid: boolean) => {
				if (valid) {
					ctx.$axios
						.post("/api/v1/auth/register", props.registerUser)
						.then(
							(
								res: AxiosResponse<{
									success: boolean;
									token: string;
								}>
							) => {
								console.log(res.data);
								ctx.$message.success('注册成功');
								route.push("/");
							}
						)
						.catch((err: any) => {
							ctx.$message.error(err.message);
						});
				} else {
					console.log("error submit!!");
					return false;
				}
			});
		};
		return { handleRegister };
	},
};
</script>

<style scoped></style>
