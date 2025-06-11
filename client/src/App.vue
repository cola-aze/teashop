<template>
    <div
        id="app"
        class="min-h-screen flex flex-col font-noto-serif-sc antialiased text-gray-800 bg-stone-50"
    >
        <!-- 顶部导航栏 -->
        <nav
            v-if="isLoggedIn || !isAuthRoute"
            class="bg-white shadow-md p-4 flex items-center justify-between flex-wrap z-10"
        >
            <!-- Logo 和商城名称 -->
            <div class="flex items-center flex-shrink-0 mr-6">
                <!-- 假设Logo是一个SVG或图片，这里先用文字代替 -->
                <span class="text-4xl font-bold tracking-tight text-gray-900"
                    >墨</span
                >
                <span class="text-4xl font-bold tracking-tight text-gray-700"
                    >韵</span
                >
                <span
                    class="text-3xl font-bold tracking-tight text-gray-700 ml-2"
                    >茶商城</span
                >
            </div>

            <!-- 搜索框 -->
            <div class="flex-grow max-w-lg mx-4">
                <input
                    type="text"
                    placeholder="搜索您喜欢的茗茶..."
                    class="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-500"
                />
            </div>

            <!-- Tab 栏 (大屏幕显示，小屏幕隐藏) -->
            <div class="hidden lg:flex flex-grow items-center justify-center">
                <router-link
                    to="/"
                    class="block mt-4 lg:inline-block lg:mt-0 text-gray-600 hover:text-gray-900 mr-4 transition duration-300"
                    >首页</router-link
                >
                <router-link
                    to="/all-teas"
                    class="block mt-4 lg:inline-block lg:mt-0 text-gray-600 hover:text-gray-900 mr-4 transition duration-300"
                    >所有茗茶</router-link
                >
                <router-link
                    to="/teaware"
                    class="block mt-4 lg:inline-block lg:mt-0 text-gray-600 hover:text-gray-900 mr-4 transition duration-300"
                    >茶具</router-link
                >
                <router-link
                    to="/about-us"
                    class="block mt-4 lg:inline-block lg:mt-0 text-gray-600 hover:text-gray-900 mr-4 transition duration-300"
                    >关于我们</router-link
                >
                <router-link
                    to="/tea-knowledge"
                    class="block mt-4 lg:inline-block lg:mt-0 text-gray-600 hover:text-gray-900 ml-4 transition duration-300"
                    >茶知识</router-link
                >
            </div>

            <!-- 用户信息及下拉菜单 -->
            <div
                class="relative flex items-center cursor-pointer"
                @click="toggleDropdown"
                ref="avatarDropdown"
            >
                <span class="text-gray-700 mr-2">{{
                    isLoggedIn ? currentUsername : "用户名称"
                }}</span>
                <!-- 用户头像 -->
                <img
                    :src="currentAvatar"
                    alt="用户头像"
                    class="w-10 h-10 rounded-full border-2 border-stone-300"
                />

                <!-- 下拉菜单 -->
                <div
                    v-if="isDropdownOpen"
                    class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20 top-full"
                >
                    <router-link
                        v-if="!isLoggedIn"
                        to="/auth?mode=login"
                        class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 font-noto-serif-sc"
                        @click.native="isDropdownOpen = false"
                        >登录</router-link
                    >
                    <router-link
                        v-if="!isLoggedIn"
                        to="/auth?mode=register"
                        class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 font-noto-serif-sc"
                        @click.native="isDropdownOpen = false"
                        >注册</router-link
                    >
                    <router-link
                        v-if="isLoggedIn"
                        to="/profile"
                        class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 font-noto-serif-sc"
                        @click.native="isDropdownOpen = false"
                        >个人信息</router-link
                    >
                    <router-link
                        v-if="isLoggedIn && isAdmin"
                        to="/admin/carousel"
                        class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 font-noto-serif-sc"
                        @click.native="isDropdownOpen = false"
                        >后台管理</router-link
                    >
                    <a
                        v-if="isLoggedIn"
                        href="#"
                        @click.prevent="logout"
                        class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 font-noto-serif-sc"
                        >退出</a
                    >
                </div>
            </div>
        </nav>

        <!-- 主内容区域 -->
        <main class="flex-grow bg-stone-100">
            <router-view />
        </main>
    </div>
</template>

<script>
import defaultUserAvatar from "@/assets/images/default_user.png"; // 导入默认头像图片

export default {
    name: "App",
    data() {
        return {
            isDropdownOpen: false,
            isLoggedIn: false,
            currentUsername: "用户名称", // 新增的用户名属性
            currentAvatar: "", // 新增的头像属性
            isAdmin: false, // 新增的管理员状态属性
        };
    },
    computed: {
        isAuthRoute() {
            return this.$route.name === "Auth";
        },
    },
    created() {
        this.checkLoginStatus();
        window.addEventListener("storage", this.checkLoginStatus); // 监听 localStorage 变化
        this.$bus.$on("login-success", this.checkLoginStatus); // 监听登录成功事件
    },
    beforeDestroy() {
        window.removeEventListener("storage", this.checkLoginStatus);
        this.$bus.$off("login-success", this.checkLoginStatus); // 移除事件监听
    },
    methods: {
        toggleDropdown() {
            this.isDropdownOpen = !this.isDropdownOpen;
            if (this.isDropdownOpen) {
                // 延时添加监听器，防止当前点击事件立即关闭下拉菜单
                setTimeout(() => {
                    document.addEventListener("click", this.handleClickOutside);
                }, 0);
            } else {
                document.removeEventListener("click", this.handleClickOutside);
            }
        },
        handleClickOutside(event) {
            // 检查点击事件是否发生在下拉菜单及其父容器之外
            if (
                this.$refs.avatarDropdown &&
                !this.$refs.avatarDropdown.contains(event.target)
            ) {
                this.isDropdownOpen = false;
                document.removeEventListener("click", this.handleClickOutside); // 关闭后移除监听器
            }
        },
        checkLoginStatus() {
            this.isLoggedIn = !!localStorage.getItem("token");
            this.currentUsername =
                localStorage.getItem("username") || "用户名称"; // 读取用户名
            const avatarPath = localStorage.getItem("avatar");
            this.currentAvatar = avatarPath
                ? `http://localhost:5000${avatarPath}`
                : defaultUserAvatar; // 如果没有头像路径，使用默认头像
            this.isAdmin = localStorage.getItem("isAdmin") === "true"; // 读取管理员状态
        },
        logout() {
            localStorage.removeItem("token");
            localStorage.removeItem("username"); // 移除用户名
            localStorage.removeItem("avatar"); // 移除头像
            localStorage.removeItem("isAdmin"); // 移除管理员状态
            this.isLoggedIn = false;
            this.currentUsername = "用户名称"; // 重置用户名
            this.currentAvatar = ""; // 重置头像
            this.isAdmin = false; // 重置管理员状态
            this.isDropdownOpen = false;
            this.$router.push("/auth?mode=login"); // 退出后跳转到登录页面
        },
    },
};
</script>

<style>
/* 这里可以添加自定义的水墨画风格 CSS */
/* 例如，背景纹理、字体、颜色等 */
</style>
