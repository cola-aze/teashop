<template>
    <div class="flex items-center justify-center min-h-screen bg-stone-100 p-4">
        <div
            class="bg-white p-8 rounded-lg shadow-xl w-full max-w-md border border-stone-200"
        >
            <h1
                class="text-3xl font-bold text-center mb-6 text-gray-800 font-noto-serif-sc"
            >
                {{ isLogin ? "用户登录" : "用户注册" }}
            </h1>
            <form @submit.prevent="isLogin ? handleLogin() : handleRegister()">
                <div class="mb-4">
                    <label
                        for="username"
                        class="block text-gray-700 text-sm font-bold mb-2"
                        >用户名:</label
                    >
                    <input
                        type="text"
                        id="username"
                        v-model="username"
                        class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-stone-500"
                        placeholder="请输入用户名"
                        required
                    />
                </div>
                <div class="mb-6">
                    <label
                        for="password"
                        class="block text-gray-700 text-sm font-bold mb-2"
                        >密码:</label
                    >
                    <input
                        type="password"
                        id="password"
                        v-model="password"
                        class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline focus:border-stone-500"
                        placeholder="请输入密码"
                        required
                    />
                </div>
                <div class="mb-6" v-if="error">
                    <p class="text-red-500 text-xs italic">{{ error }}</p>
                </div>
                <div class="flex items-center justify-between">
                    <button
                        type="submit"
                        class="bg-gray-800 hover:bg-gray-900 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300 font-noto-serif-sc"
                    >
                        {{ isLogin ? "登录" : "注册" }}
                    </button>
                    <button
                        type="button"
                        @click="toggleForm"
                        class="inline-block align-baseline font-bold text-sm text-gray-600 hover:text-gray-800 font-noto-serif-sc"
                    >
                        {{ isLogin ? "还没有账号？注册" : "已有账号？登录" }}
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>

<script>
import axios from "axios";

export default {
    name: "Auth",
    data() {
        return {
            username: "",
            password: "",
            isLogin: true, // true 为登录模式，false 为注册模式
            error: null,
        };
    },
    watch: {
        // 监听路由变化，根据 mode 参数更新 isLogin 状态
        "$route.query.mode": {
            immediate: true, // 立即执行一次，以初始化状态
            handler(newMode) {
                this.isLogin = newMode === "login";
                this.error = null; // 切换表单时清除错误信息
            },
        },
    },
    methods: {
        toggleForm() {
            // 切换表单时，也更新 URL 中的 mode 参数
            const newMode = this.isLogin ? "register" : "login";
            this.$router.push({ query: { mode: newMode } });
        },
        async handleLogin() {
            try {
                this.error = null;
                const response = await axios.post(
                    "http://localhost:5000/api/auth/login",
                    {
                        username: this.username,
                        password: this.password,
                    }
                );

                const { token, username, avatar } = response.data;
                localStorage.setItem("token", token);
                localStorage.setItem("username", username);
                if (avatar) {
                    localStorage.setItem("avatar", avatar);
                } else {
                    localStorage.removeItem("avatar"); // 如果没有头像，确保清除
                }
                console.log("登录成功，Token:", token);
                this.$bus.$emit("login-success"); // 触发登录成功事件
                this.$router.push("/"); // 登录成功后跳转到首页
            } catch (err) {
                console.error(
                    "登录失败:",
                    err.response ? err.response.data : err.message
                );
                this.error =
                    err.response && err.response.data && err.response.data.msg
                        ? err.response.data.msg
                        : "登录失败，请检查用户名或密码。";
            }
        },
        async handleRegister() {
            try {
                this.error = null;
                const response = await axios.post(
                    "http://localhost:5000/api/auth/register",
                    {
                        username: this.username,
                        password: this.password,
                    }
                );

                const { token, username, avatar } = response.data;
                localStorage.setItem("token", token);
                localStorage.setItem("username", username);
                if (avatar) {
                    localStorage.setItem("avatar", avatar);
                } else {
                    localStorage.removeItem("avatar"); // 如果没有头像，确保清除
                }
                console.log("注册成功，Token:", token);
                this.$bus.$emit("login-success"); // 触发注册成功事件
                // 注册成功后可以跳转到登录页面或者直接登录到首页
                this.$router.push("/"); // 注册成功后直接登录到首页
            } catch (err) {
                console.error(
                    "注册失败:",
                    err.response ? err.response.data : err.message
                );
                this.error =
                    err.response && err.response.data && err.response.data.msg
                        ? err.response.data.msg
                        : "注册失败，请稍后再试。";
            }
        },
    },
};
</script>

<style scoped>
/* 这里可以添加 Auth 组件特有的样式 */
</style>
