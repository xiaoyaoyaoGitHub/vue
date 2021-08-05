<template>
	<el-form label-width="100px" class="forgotPassword">
		<el-form-item label="注册邮箱" prop="email">
			<el-input v-model="email"></el-input>
		</el-form-item>
		<el-form-item>
			<el-button type="primary" @click="forgotPassword"
				>立即发送</el-button
			>
		</el-form-item>
	</el-form>
</template>

<script lang="ts">
import { ref, getCurrentInstance } from "vue";
export default {
	name: "ForgotPassword",
	setup() {
		//  @ts-ignore
		const { ctx } = getCurrentInstance();
		const email = ref<string>("");
		const forgotPassword = async () => {
			try {
				if (email.value) {
					const res = await ctx.$axios.post(
						"/api/v1/auth/forgotpassword",
						{ email: email.value }
					);
					ctx.$message.success("发送成功");
				} else {
					ctx.$message.warning("请输入邮箱");
				}
			} catch (err) {
				ctx.$message.error(err.message);
			}
		};

		return { email, forgotPassword };
	},
};
</script>
<style>
.forgotPassword {
	width: 50%;
	margin: 50px auto;
}
</style>
