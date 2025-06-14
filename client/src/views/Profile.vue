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
                            :src="displayAvatarUrl"
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
import { getUserProfile, updateUserInfo, uploadAvatar } from '@/api/user'; // 引入封装好的 API 方法
import defaultUserAvatar from "@/assets/images/default_user.png"; // 导入默认头像图片

export default {
    name: "Profile",
    data() {
        return {
            userProfile: {
                username: localStorage.getItem("username") || "", // 从 localStorage 获取用户名
                avatar: localStorage.getItem("avatar") || '', // 存储相对路径或空字符串
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
    computed: {
        // 用于显示头像的完整 URL
        displayAvatarUrl() {
            if (!this.userProfile.avatar) {
                return defaultUserAvatar;
            }
            // 如果是临时预览 URL (blob: 或 data:)，直接使用
            if (this.userProfile.avatar.startsWith('blob:') || this.userProfile.avatar.startsWith('data:')) {
                return this.userProfile.avatar;
            }
            // 否则，拼接后端图片服务的基础 URL
            return `http://localhost:5000${this.userProfile.avatar}`;
        }
    },
    created() {
        this.fetchProfile();
    },
    methods: {
        // 获取用户个人信息
        async fetchProfile() {
            try {
                const response = await getUserProfile();
                const profileData = response.data; // 统一返回体，实际数据在 data 字段下
                this.userProfile.username = profileData.username;
                this.userProfile.email = profileData.email;
                this.userProfile.address = profileData.address;
                this.userProfile.phone = profileData.phone;
                // 更新头像路径，后端返回的是相对路径，这里直接存储
                this.userProfile.avatar = profileData.avatar || ''; // 存储相对路径

                // 从 localStorage 更新头像，如果存在且有效，但 fetchProfile 已经是最新的了
                // const storedAvatar = localStorage.getItem("avatar");
                // if (storedAvatar) {
                //     this.userProfile.avatar = storedAvatar;
                // }

            } catch (err) {
                console.error("获取个人信息失败:", err.message);
                this.error = err.message || "获取个人信息失败。";
            }
        },
        onFileChange(e) {
            const file = e.target.files[0];
            if (file) {
                // 预览图片（临时）：生成一个data URL来显示，不实际上传
                this.userProfile.avatar = URL.createObjectURL(file);
                // 调用上传头像的方法，传递原始文件
                this.uploadAvatar(file);
            }
        },
        async uploadAvatar(file) {
            this.error = null;
            this.successMessage = null;

            try {
                const formData = new FormData();
                formData.append("avatar", file); // 'avatar' 对应后端 multer 的字段名

                const response = await uploadAvatar(formData); // 使用封装的 uploadAvatar 方法

                // 更新为后端返回的永久URL（相对路径），并存储到 localStorage
                this.userProfile.avatar = response.data.avatarUrl; // response.data 是统一返回体中的 data 字段
                localStorage.setItem("avatar", response.data.avatarUrl); // 将相对路径存储到 localStorage

                this.$bus.$emit("login-success"); // 触发事件，通知App.vue更新头像
                this.successMessage = response.message || "头像上传成功！"; // 统一返回体中的 message
                console.log("头像上传成功:", response.data);
                // 不需要重新获取，因为已经通过 avatarUrl 更新了 this.userProfile.avatar
            } catch (err) {
                console.error("头像上传失败:", err.message);
                this.error = err.message || "头像上传失败，请稍后再试。";
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
                // 如果当前头像是一个临时预览URL (blob: 或 data:)，则不发送，使用localStorage里的相对路径
                // 否则发送 userProfile.avatar (它应该已经是相对路径)
                let avatarToSend = this.userProfile.avatar;
                if (avatarToSend.startsWith('blob:') || avatarToSend.startsWith('data:')) {
                    avatarToSend = localStorage.getItem('avatar') || ''; // 尝试从localStorage获取上一个相对路径
                }

                const response = await updateUserInfo({ // 使用封装的 updateUserInfo 方法
                    email: this.userProfile.email,
                    address: this.userProfile.address,
                    phone: this.userProfile.phone,
                    avatar: avatarToSend, // 发送相对路径
                });

                // 更新成功后，用后端返回的最新数据更新本地状态
                const updatedProfileData = response.data; // 统一返回体中的 data 字段
                this.userProfile.email = updatedProfileData.email;
                this.userProfile.address = updatedProfileData.address;
                this.userProfile.phone = updatedProfileData.phone;
                // 更新后的头像也应该是相对路径
                this.userProfile.avatar = updatedProfileData.avatar || ''; // 存储相对路径
                localStorage.setItem("avatar", updatedProfileData.avatar); // 更新 localStorage

                this.successMessage = response.message || "个人信息保存成功！";
                console.log("个人信息更新成功:", response.data);
            } catch (err) {
                console.error("个人信息更新失败:", err.message);
                this.error = err.message || "个人信息更新失败，请稍后再试。";
            }
        },
        validateForm() {
            this.emailError = null;
            this.addressError = null;
            this.phoneError = null;

            let isValid = true;

            // 邮箱验证
            if (this.userProfile.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.userProfile.email)) {
                this.emailError = '请输入有效的邮箱地址。';
                isValid = false;
            }

            // 手机号验证 (简单示例，可根据需要调整)
            if (this.userProfile.phone && !/^1[3-9]\d{9}$/.test(this.userProfile.phone)) {
                this.phoneError = '请输入有效的11位手机号码。';
                isValid = false;
            }

            return isValid;
        },
    },
};
</script>

<style scoped>
/* 这里可以添加 Profile 组件特有的样式 */
</style>
