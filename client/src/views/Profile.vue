<template>
    <div class="flex items-center justify-center min-h-screen bg-stone-100 p-4">
        <div
            class="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl border border-stone-200"
        >
            <h1
                class="text-3xl font-bold text-center mb-6 text-gray-800 font-noto-serif-sc"
            >
                个人信息
            </h1>
            <form @submit.prevent="updateProfile">
                <!-- 头像上传 -->
                <div class="mb-6 text-center">
                    <label class="block text-gray-700 text-sm font-bold mb-2"
                        >头像:</label
                    >
                    <div
                        class="relative w-24 h-24 mx-auto mb-2 rounded-full overflow-hidden border-2 border-stone-300"
                    >
                        <img
                            :src="userProfile.avatar"
                            alt="用户头像"
                            class="w-full h-full object-cover"
                        />
                        <input
                            type="file"
                            @change="onFileChange"
                            class="absolute inset-0 opacity-0 cursor-pointer"
                        />
                    </div>
                    <p class="text-xs text-gray-500">点击头像上传新图片</p>
                </div>

                <!-- 用户名 (只读) -->
                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2"
                        >用户名:</label
                    >
                    <input
                        type="text"
                        v-model="userProfile.username"
                        class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 bg-gray-100 cursor-not-allowed"
                        readonly
                    />
                </div>

                <!-- 邮箱 -->
                <div class="mb-4">
                    <label
                        for="email"
                        class="block text-gray-700 text-sm font-bold mb-2"
                        >邮箱:</label
                    >
                    <input
                        type="email"
                        id="email"
                        v-model="userProfile.email"
                        class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-stone-500"
                        placeholder="请输入邮箱"
                    />
                    <p
                        v-if="emailError"
                        class="text-red-500 text-xs italic mt-1"
                    >
                        {{ emailError }}
                    </p>
                </div>

                <!-- 地址 -->
                <div class="mb-4">
                    <label
                        for="address"
                        class="block text-gray-700 text-sm font-bold mb-2"
                        >地址:</label
                    >
                    <input
                        type="text"
                        id="address"
                        v-model="userProfile.address"
                        class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-stone-500"
                        placeholder="请输入地址"
                    />
                    <p
                        v-if="addressError"
                        class="text-red-500 text-xs italic mt-1"
                    >
                        {{ addressError }}
                    </p>
                </div>

                <!-- 手机号 -->
                <div class="mb-6">
                    <label
                        for="phone"
                        class="block text-gray-700 text-sm font-bold mb-2"
                        >手机号:</label
                    >
                    <input
                        type="tel"
                        id="phone"
                        v-model="userProfile.phone"
                        class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-stone-500"
                        placeholder="请输入手机号"
                    />
                    <p
                        v-if="phoneError"
                        class="text-red-500 text-xs italic mt-1"
                    >
                        {{ phoneError }}
                    </p>
                </div>

                <div class="mb-6" v-if="error">
                    <p class="text-red-500 text-xs italic">{{ error }}</p>
                </div>
                <div class="mb-6" v-if="successMessage">
                    <p class="text-green-500 text-xs italic">
                        {{ successMessage }}
                    </p>
                </div>

                <div class="flex items-center justify-between">
                    <button
                        type="submit"
                        class="bg-gray-800 hover:bg-gray-900 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300 font-noto-serif-sc"
                    >
                        保存信息
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>

<script>
import axios from "axios"; // 引入 axios
import defaultUserAvatar from "@/assets/images/default_user.png"; // 导入默认头像图片

export default {
    name: "Profile",
    data() {
        const avatarPath = localStorage.getItem("avatar");
        return {
            userProfile: {
                username: localStorage.getItem("username") || "", // 从 localStorage 获取用户名
                avatar: avatarPath
                    ? `http://localhost:5000${avatarPath}`
                    : defaultUserAvatar,
                email: "",
                address: "",
                phone: "",
            },
            error: null,
            successMessage: null,
            emailError: null,
            addressError: null,
            phoneError: null,
        };
    },
    methods: {
        onFileChange(e) {
            const file = e.target.files[0];
            if (file) {
                // 预览图片（临时）
                this.userProfile.avatar = URL.createObjectURL(file);
                // 调用上传头像的方法
                this.uploadAvatar(file);
            }
        },
        async uploadAvatar(file) {
            this.error = null;
            this.successMessage = null;

            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    this.error = "用户未登录，无法上传头像。";
                    return;
                }

                const formData = new FormData();
                formData.append("avatar", file); // 'avatar' 对应后端 multer 的字段名

                const response = await axios.post(
                    "http://localhost:5000/api/user/avatar/upload",
                    formData,
                    {
                        headers: {
                            "Content-Type": "multipart/form-data",
                            "x-auth-token": token,
                        },
                    }
                );

                // 更新为后端返回的永久URL，并拼接完整的地址
                this.userProfile.avatar = `http://localhost:5000${response.data.avatarUrl}`;
                localStorage.setItem("avatar", response.data.avatarUrl); // 将相对路径存储到 localStorage
                // this.$bus.$emit("login-success"); // 触发事件，通知App.vue更新头像
                this.successMessage = "头像上传成功！";
                console.log("头像上传成功:", response.data);
                this.fetchProfile(); // 重新获取个人信息，确保页面更新
            } catch (err) {
                console.error(
                    "头像上传失败:",
                    err.response ? err.response.data : err.message
                );
                this.error =
                    err.response && err.response.data && err.response.data.msg
                        ? err.response.data.msg
                        : "头像上传失败，请稍后再试。";
            }
        },
        async updateProfile() {
            this.error = null;
            this.successMessage = null;

            // 执行表单验证
            if (!this.validateForm()) {
                this.error = "请检查您的输入。";
                return; // 如果验证失败，停止执行
            }

            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    this.error = "用户未登录，请先登录。";
                    return;
                }

                const response = await axios.put(
                    "http://localhost:5000/api/user/profile",
                    {
                        email: this.userProfile.email,
                        address: this.userProfile.address,
                        phone: this.userProfile.phone,
                        avatar: this.userProfile.avatar, // 现在这里发送的是后端返回的永久URL
                    },
                    {
                        headers: {
                            "x-auth-token": token,
                        },
                    }
                );

                // 更新成功后，用后端返回的最新数据更新本地状态
                this.userProfile.email = response.data.email;
                this.userProfile.address = response.data.address;
                this.userProfile.phone = response.data.phone;
                // 确保更新后的头像URL也是完整的
                this.userProfile.avatar = `http://localhost:5000${response.data.avatar}`;
                localStorage.setItem("avatar", response.data.avatar); // 将相对路径存储到 localStorage
                this.$bus.$emit("login-success"); // 触发事件，通知App.vue更新头像

                this.successMessage = "个人信息保存成功！";
                console.log("个人信息更新成功:", response.data);
                // this.fetchProfile(); // 重新获取个人信息，确保页面更新
            } catch (err) {
                console.error(
                    "保存失败:",
                    err.response ? err.response.data : err.message
                );
                this.error =
                    err.response && err.response.data && err.response.data.msg
                        ? err.response.data.msg
                        : "保存个人信息失败，请稍后再试。";
            }
        },
        async fetchProfile() {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    // 如果没有 token，可能是未登录状态，不做处理，等待路由守卫重定向
                    return;
                }

                const response = await axios.get(
                    "http://localhost:5000/api/user/profile",
                    {
                        headers: {
                            "x-auth-token": token,
                        },
                    }
                );

                this.userProfile.username = response.data.username; // 确保用户名也被更新
                this.userProfile.email = response.data.email;
                this.userProfile.address = response.data.address;
                this.userProfile.phone = response.data.phone;
                if (response.data.avatar) {
                    this.userProfile.avatar = `http://localhost:5000${response.data.avatar}`;
                    localStorage.setItem("avatar", response.data.avatar); // 将相对路径存储到 localStorage
                } else {
                    this.userProfile.avatar = defaultUserAvatar; // 使用默认头像
                    localStorage.removeItem("avatar"); // 从 localStorage 清除头像
                }
                console.log("个人信息加载成功:", response.data);
            } catch (err) {
                console.error(
                    "获取个人信息失败:",
                    err.response ? err.response.data : err.message
                );
                this.error =
                    err.response && err.response.data && err.response.data.msg
                        ? err.response.data.msg
                        : "获取个人信息失败，请稍后再试。";
            }
        },
        validateForm() {
            let isValid = true;

            // 邮箱验证
            if (
                this.userProfile.email &&
                !/^[\w.-]+@[\w.-]+\.\w+$/.test(this.userProfile.email)
            ) {
                this.emailError = "请输入有效的邮箱地址。";
                isValid = false;
            } else {
                this.emailError = null;
            }

            // 地址验证 (简单非空和长度)
            if (
                this.userProfile.address &&
                this.userProfile.address.length < 5
            ) {
                this.addressError = "地址至少包含5个字符。";
                isValid = false;
            } else {
                this.addressError = null;
            }

            // 手机号验证 (纯数字且长度为11)
            if (
                this.userProfile.phone &&
                !/^\d{11}$/.test(this.userProfile.phone)
            ) {
                this.phoneError = "请输入有效的11位手机号码。";
                isValid = false;
            } else {
                this.phoneError = null;
            }

            return isValid;
        },
    },
    mounted() {
        this.fetchProfile(); // 页面加载时获取个人信息
    },
};
</script>

<style scoped>
/* 这里可以添加 Profile 组件特有的样式 */
</style>
