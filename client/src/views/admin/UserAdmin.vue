<template>
    <div>
        <h2
            class="text-2xl font-bold mb-6 text-gray-800 font-noto-serif-sc p-4"
        >
            用户权限管理
        </h2>

        <!-- 成功/错误消息提示 -->
        <div
            v-if="successMessage"
            class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4 mx-4"
            role="alert"
        >
            <span class="block sm:inline">{{ successMessage }}</span>
            <span
                @click="successMessage = null"
                class="absolute top-0 bottom-0 right-0 px-4 py-3 cursor-pointer"
                >×</span
            >
        </div>
        <div
            v-if="error"
            class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 mx-4"
            role="alert"
        >
            <span class="block sm:inline">{{ error }}</span>
            <span
                @click="error = null"
                class="absolute top-0 bottom-0 right-0 px-4 py-3 cursor-pointer"
                >×</span
            >
        </div>

        <!-- 用户列表 -->
        <div class="overflow-x-auto p-4">
            <table
                class="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm"
            >
                <thead>
                    <tr
                        class="bg-gray-100 text-gray-600 uppercase text-sm leading-normal"
                    >
                        <th class="py-3 px-6 text-left">用户名</th>
                        <th class="py-3 px-6 text-left">邮箱</th>
                        <th class="py-3 px-6 text-left">手机号</th>
                        <th class="py-3 px-6 text-left">是否管理员</th>
                        <th class="py-3 px-6 text-center">操作</th>
                    </tr>
                </thead>
                <tbody class="text-gray-600 text-sm font-light">
                    <tr v-if="users.length === 0">
                        <td colspan="5" class="py-3 px-6 text-center">
                            暂无用户。
                        </td>
                    </tr>
                    <tr
                        v-for="user in users"
                        :key="user._id"
                        class="border-b border-gray-200 hover:bg-gray-50"
                    >
                        <td class="py-3 px-6 text-left">{{ user.username }}</td>
                        <td class="py-3 px-6 text-left">
                            {{ user.email || "N/A" }}
                        </td>
                        <td class="py-3 px-6 text-left">
                            {{ user.phone || "N/A" }}
                        </td>
                        <td class="py-3 px-6 text-left">
                            <span
                                :class="
                                    user.isAdmin
                                        ? 'text-green-600 font-semibold'
                                        : 'text-red-600'
                                "
                            >
                                {{ user.isAdmin ? "是" : "否" }}
                            </span>
                        </td>
                        <td class="py-3 px-6 text-center">
                            <button
                                @click="
                                    toggleAdminStatus(user._id, user.username)
                                "
                                :class="{
                                    'bg-blue-500 hover:bg-blue-700':
                                        !user.isAdmin,
                                    'bg-red-500 hover:bg-red-700': user.isAdmin,
                                }"
                                class="text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300"
                            >
                                {{ user.isAdmin ? "撤销管理员" : "设为管理员" }}
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script>
import { getUsers, toggleUserAdminStatus } from '@/api/admin';

export default {
    name: "UserAdmin",
    data() {
        return {
            users: [],
            error: null,
            successMessage: null,
        };
    },
    mounted() {
        this.fetchUsers();
    },
    methods: {
        async fetchUsers() {
            try {
                const response = await getUsers();
                this.users = response.data;
            } catch (err) {
                console.error("获取用户数据失败:", err.message);
                this.error = err.message || "获取用户数据失败。";
            }
        },
        async toggleAdminStatus(userId, username) {
            const action = this.users.find((u) => u._id === userId)?.isAdmin
                ? "撤销"
                : "设置";
            if (confirm(`确定要${action}用户 ${username} 的管理员权限吗？`)) {
                try {
                    const response = await toggleUserAdminStatus(userId);
                    this.successMessage = response.message;
                    const index = this.users.findIndex(
                        (user) => user._id === userId
                    );
                    if (index !== -1) {
                        this.$set(this.users, index, response.data);
                    }
                } catch (err) {
                    console.error("更新用户权限失败:", err.message);
                    this.error = err.message || "更新用户权限失败，请稍后再试。";
                }
            }
        },
    },
};
</script>

<style scoped>
/* 可以添加 UserAdmin 组件特有的样式 */
</style>
