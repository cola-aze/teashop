<template>
    <div class="admin-dashboard flex flex-row h-screen bg-stone-100">
        <!-- 侧边导航栏 -->
        <aside
            :class="isSidebarCollapsed ? 'w-16' : 'w-64'"
            class="bg-gray-800 text-white p-4 shadow-lg flex flex-col transition-all duration-300 ease-in-out"
        >
            <div class="flex items-center justify-between mb-6">
                <h1
                    class="text-2xl font-bold font-noto-serif-sc overflow-hidden"
                    :class="{ 'mx-auto': isSidebarCollapsed }"
                >
                    <span v-if="!isSidebarCollapsed">管理面板</span>
                </h1>
                <!-- 折叠/展开按钮 -->
                <button
                    @click="toggleSidebar"
                    class="text-white bg-gray-700 hover:bg-gray-600 p-2 rounded transition duration-300 flex-shrink-0"
                    :class="{ 'ml-auto': !isSidebarCollapsed }"
                >
                    <span v-if="!isSidebarCollapsed">折叠 <</span>
                    <span v-else>></span>
                </button>
            </div>

            <nav class="flex-1">
                <ul>
                    <li class="mb-3">
                        <router-link
                            to="/admin/carousel"
                            :class="[
                                isSidebarCollapsed
                                    ? 'justify-center pointer-events-none opacity-50'
                                    : 'justify-start',
                                isSidebarCollapsed
                                    ? 'hover:bg-transparent'
                                    : 'hover:bg-gray-700',
                            ]"
                            class="flex items-center py-2 px-4 rounded transition duration-300"
                        >
                            <i
                                class="fas fa-images mr-3"
                                :class="{ 'mr-0': isSidebarCollapsed }"
                            ></i>
                            <span v-if="!isSidebarCollapsed">轮播图管理</span>
                        </router-link>
                    </li>
                    <li class="mb-3">
                        <router-link
                            to="/admin/posters"
                            :class="[
                                isSidebarCollapsed
                                    ? 'justify-center pointer-events-none opacity-50'
                                    : 'justify-start',
                                isSidebarCollapsed
                                    ? 'hover:bg-transparent'
                                    : 'hover:bg-gray-700',
                            ]"
                            class="flex items-center py-2 px-4 rounded transition duration-300"
                        >
                            <i
                                class="fas fa-ad mr-3"
                                :class="{ 'mr-0': isSidebarCollapsed }"
                            ></i>
                            <span v-if="!isSidebarCollapsed">海报图管理</span>
                        </router-link>
                    </li>
                    <li class="mb-3">
                        <router-link
                            to="/admin/products"
                            :class="[
                                isSidebarCollapsed
                                    ? 'justify-center pointer-events-none opacity-50'
                                    : 'justify-start',
                                isSidebarCollapsed
                                    ? 'hover:bg-transparent'
                                    : 'hover:bg-gray-700',
                            ]"
                            class="flex items-center py-2 px-4 rounded transition duration-300"
                        >
                            <i
                                class="fas fa-tea mr-3"
                                :class="{ 'mr-0': isSidebarCollapsed }"
                            ></i>
                            <span v-if="!isSidebarCollapsed">茶品管理</span>
                        </router-link>
                    </li>
                    <li class="mb-3">
                        <router-link
                            to="/admin/users"
                            :class="[
                                isSidebarCollapsed
                                    ? 'justify-center pointer-events-none opacity-50'
                                    : 'justify-start',
                                isSidebarCollapsed
                                    ? 'hover:bg-transparent'
                                    : 'hover:bg-gray-700',
                            ]"
                            class="flex items-center py-2 px-4 rounded hover:bg-gray-700 transition duration-300"
                        >
                            <i
                                class="fas fa-users-cog mr-3"
                                :class="{ 'mr-0': isSidebarCollapsed }"
                            ></i>
                            <span v-if="!isSidebarCollapsed">用户权限管理</span>
                        </router-link>
                    </li>
                    <!-- 更多管理项可以添加在这里 -->
                </ul>
            </nav>
        </aside>

        <!-- 主内容区域 -->
        <main class="flex-1 overflow-y-auto">
            <router-view />
        </main>
    </div>
</template>

<script>
export default {
    name: "AdminDashboard",
    data() {
        return {
            isSidebarCollapsed: false, // 控制侧边栏折叠状态
        };
    },
    methods: {
        toggleSidebar() {
            this.isSidebarCollapsed = !this.isSidebarCollapsed;
        },
    },
};
</script>

<style scoped>
/* 可以添加 AdminDashboard 组件特有的样式 */
</style>
