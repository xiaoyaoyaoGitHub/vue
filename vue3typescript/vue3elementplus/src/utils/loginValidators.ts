import { ref } from "vue";

interface User {
	email: string;
	password: string;
}

export const loginUser = ref<User>({
	email: "",
	password: "",
});

interface Rules {
	email: {
		type: string;
		required: boolean;
		message: string;
		trigger: string;
	}[];
	password: (
		| {
				required: boolean;
				message: string;
				trigger: string;
				min?: unknown;
				max?: unknown;
		  }
		| {
				min: number;
				max: number;
				required: boolean;
				message: string;
				trigger: string;
		  }
	)[];
}

// 登录表单校验
export const rules = ref<Rules>({
	email: [
		{
			type: "email",
			required: true,
			message: "Email is incorrect...",
			trigger: "blur",
		},
	],
	password: [
		{
			required: true,
			message: "Password could not be empty...",
			trigger: "blur",
		},
		{
			min: 6,
			max: 30,
			required: true,
			message: "Password's length has to be 6 to 30 characters...",
			trigger: "blur",
		},
	],
});
