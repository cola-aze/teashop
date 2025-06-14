<template>
    <div>
        <h2
            class="text-2xl font-bold mb-6 text-gray-800 font-noto-serif-sc p-4"
        >
            海报图管理
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

        <!-- 新增/编辑海报图表单 -->
        <form
            @submit.prevent="isEditing ? updateItem() : addItem()"
            class="mb-8 p-4 border border-gray-200 rounded-lg bg-white shadow-md"
        >
            <h3 class="text-xl font-semibold mb-4 text-gray-700">
                {{ isEditing ? "编辑海报图" : "新增海报图" }}
            </h3>
            <div class="mb-4">
                <label
                    for="imageUpload"
                    class="block text-gray-700 text-sm font-bold mb-2"
                    >图片:</label
                >
                <input
                    type="file"
                    id="imageUpload"
                    @change="handleFileChange"
                    class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-stone-500"
                    accept="image/*"
                    :required="!currentItem.imageUrl && !imagePreviewUrl && !isEditing"
                />
            </div>

            <!-- 图片预览 -->
            <div v-if="imagePreviewUrl || currentItem.imageUrl" class="mb-4">
                <label class="block text-gray-700 text-sm font-bold mb-2"
                    >图片预览:</label
                >
                <div class="flex items-center">
                    <img
                        :src="
                            imagePreviewUrl ||
                            getAbsoluteImageUrl(currentItem.imageUrl)
                        "
                        alt="图片预览"
                        class="w-32 h-auto object-cover rounded-md border border-gray-300"
                    />
                    <button
                        type="button"
                        @click="removeImage"
                        class="ml-4 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition duration-300 text-sm"
                    >
                        移除图片
                    </button>
                </div>
            </div>

            <div class="mb-4">
                <label
                    for="title"
                    class="block text-gray-700 text-sm font-bold mb-2"
                    >标题 (可选):</label
                >
                <input
                    type="text"
                    id="title"
                    v-model="currentItem.title"
                    class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-stone-500"
                    placeholder="请输入海报图标题"
                />
            </div>

            <div class="mb-4">
                <label
                    for="linkUrl"
                    class="block text-gray-700 text-sm font-bold mb-2"
                    >链接URL (可选):</label
                >
                <input
                    type="text"
                    id="linkUrl"
                    v-model="currentItem.linkUrl"
                    class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-stone-500"
                    :placeholder="
                        linkType === 'internal'
                            ? '例如: /products/some-product-id'
                            : '例如: https://www.example.com'
                    "
                />
            </div>
            <div class="mb-4">
                <label class="block text-gray-700 text-sm font-bold mb-2"
                    >链接类型:</label
                >
                <div class="flex items-center space-x-4">
                    <label class="inline-flex items-center">
                        <input
                            type="radio"
                            class="form-radio text-stone-600"
                            value="internal"
                            v-model="linkType"
                        />
                        <span class="ml-2 text-gray-700">内部链接</span>
                    </label>
                    <label class="inline-flex items-center">
                        <input
                            type="radio"
                            class="form-radio text-stone-600"
                            value="external"
                            v-model="linkType"
                        />
                        <span class="ml-2 text-gray-700">外部链接</span>
                    </label>
                </div>
            </div>
            <div class="mb-4">
                <label
                    for="order"
                    class="block text-gray-700 text-sm font-bold mb-2"
                    >排序 (数字):</label
                >
                <input
                    type="number"
                    id="order"
                    v-model.number="currentItem.order"
                    class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-stone-500"
                    placeholder="请输入排序数字"
                    required
                />
            </div>
            <div class="flex items-center justify-between">
                <button
                    type="submit"
                    class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300"
                >
                    {{ isEditing ? "更新" : "新增" }}
                </button>
                <button
                    type="button"
                    @click="cancelEdit"
                    v-if="isEditing"
                    class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300"
                >
                    取消
                </button>
            </div>
        </form>

        <!-- 海报图列表 -->
        <div class="overflow-x-auto p-4 bg-white rounded-lg shadow-md">
            <table
                class="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm"
            >
                <thead>
                    <tr
                        class="bg-gray-100 text-gray-600 uppercase text-sm leading-normal"
                    >
                        <th class="py-3 px-6 text-left">图片</th>
                        <th class="py-3 px-6 text-left">标题</th>
                        <th class="py-3 px-6 text-left">链接</th>
                        <th class="py-3 px-6 text-left">排序</th>
                        <th class="py-3 px-6 text-center">操作</th>
                    </tr>
                </thead>
                <tbody class="text-gray-600 text-sm font-light">
                    <tr v-if="posterItems.length === 0">
                        <td colspan="5" class="py-3 px-6 text-center">
                            暂无海报图。
                        </td>
                    </tr>
                    <tr
                        v-for="item in posterItems"
                        :key="item._id"
                        class="border-b border-gray-200 hover:bg-gray-50"
                    >
                        <td class="py-3 px-6 text-left">
                            <img
                                :src="getAbsoluteImageUrl(item.imageUrl)"
                                alt="Poster Image"
                                class="w-24 h-16 object-cover rounded-md"
                            />
                        </td>
                        <td class="py-3 px-6 text-left">
                            {{ item.title || "无标题" }}
                        </td>
                        <td class="py-3 px-6 text-left">
                            <a
                                :href="getPosterLink(item.linkUrl)"
                                target="_blank"
                                class="text-blue-500 hover:underline"
                                >{{ item.linkUrl || "无" }}</a
                            >
                        </td>
                        <td class="py-3 px-6 text-left">{{ item.order }}</td>
                        <td class="py-3 px-6 text-center">
                            <button
                                @click="editItem(item)"
                                class="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-3 rounded text-xs mr-2 transition duration-300"
                            >
                                编辑
                            </button>
                            <button
                                @click="deleteItem(item._id)"
                                class="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-xs transition duration-300"
                            >
                                删除
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script>
import { getPosterItems, addPosterItem, updatePosterItem, deletePosterItem } from '@/api/admin';
// import axios from "axios"; // 移除 axios 导入

export default {
    name: "PosterAdmin",
    data() {
        return {
            posterItems: [],
            currentItem: {
                _id: null, // 新增 _id 字段用于编辑时存储ID
                imageUrl: "", // 存储相对路径
                title: "",
                linkUrl: "",
                order: 0,
            },
            isEditing: false,
            error: null,
            successMessage: null,
            imageFile: null, // 用于存储待上传的图片文件
            imagePreviewUrl: null, // 用于显示本地选择的图片预览
            linkType: "internal", // 默认为内部链接
        };
    },
    mounted() {
        this.fetchPosterItems();
    },
    methods: {
        handleFileChange(event) {
            const file = event.target.files[0];
            if (file) {
                this.imageFile = file;
                this.imagePreviewUrl = URL.createObjectURL(file);
                // 清除已有的 imageUrl，表示有新图片待上传
                this.currentItem.imageUrl = "";
            } else {
                this.imageFile = null;
                this.imagePreviewUrl = null;
            }
        },
        removeImage() {
            this.imageFile = null;
            this.imagePreviewUrl = null;
            this.currentItem.imageUrl = ""; // 清除现有图片URL
            // 如果是编辑模式，还需要标记图片需要被移除
            if (this.isEditing) {
                this.currentItem.removeImage = true; // 标记图片需要被移除
            }
            const fileInput = document.getElementById("imageUpload");
            if (fileInput) {
                fileInput.value = "";
            }
        },
        getAbsoluteImageUrl(relativePath) {
            if (!relativePath) return "";
            if (
                relativePath.startsWith("http://") ||
                relativePath.startsWith("https://") ||
                relativePath.startsWith("blob:") ||
                relativePath.startsWith("data:")
            ) {
                return relativePath;
            }
            return `http://localhost:5000${relativePath}`;
        },
        // Helper to get poster item link (removes backend URL for internal links)
        getPosterLink(linkUrl) {
            if (!linkUrl) return "#";
            // 如果是内部链接，并且以后端URL开头，则移除后端URL部分
            if (linkUrl.startsWith(`http://localhost:5000/`)) {
                return linkUrl.replace(`http://localhost:5000`, '');
            }
            return linkUrl;
        },
        async fetchPosterItems() {
            try {
                const response = await getPosterItems(); // 使用封装的 API
                this.posterItems = response.data.sort(
                    (a, b) => a.order - b.order
                ); // 统一返回体，实际数据在 data 字段下
                this.successMessage = response.message; // 获取成功消息
            } catch (err) {
                console.error("获取海报图失败:", err.message);
                this.error = err.message || "获取海报图失败，请稍后再试。";
            }
        },
        async addItem() {
            this.error = null;
            this.successMessage = null;
            // 如果没有选择图片且没有旧图，则提示
            if (!this.imageFile && !this.currentItem.imageUrl) {
                this.error = "请选择图片！";
                return;
            }

            try {
                const formData = new FormData();

                if (this.imageFile) {
                    formData.append("image", this.imageFile);
                } else if (this.currentItem.imageUrl) {
                    formData.append("imageUrl", this.currentItem.imageUrl);
                } else {
                    // 如果都没有，理论上前面已经拦截了，这里作为双重保险
                    formData.append("imageUrl", ""); 
                }

                formData.append("title", this.currentItem.title);
                formData.append("linkUrl", this.currentItem.linkUrl); // 直接发送，由后端处理格式
                formData.append("order", this.currentItem.order);

                const response = await addPosterItem(formData); // 使用封装的 API
                this.posterItems.push(response.data);
                this.posterItems.sort((a, b) => a.order - b.order);
                this.resetForm();
                this.successMessage = response.message; // 统一返回体中的 message
            } catch (err) {
                console.error("新增海报图失败:", err.message);
                this.error = err.message || "新增海报图失败，请稍后再试。";
            }
        },
        editItem(item) {
            this.isEditing = true;
            this.currentItem = { ...item };
            this.currentItem._id = item._id; // 确保_id被复制
            this.error = null;
            this.successMessage = null;
            this.imagePreviewUrl = this.getAbsoluteImageUrl(item.imageUrl);
            this.imageFile = null; // 清空文件，防止重新提交时带上旧文件
            // 根据 linkUrl 判断链接类型，如果以 http(s):// 开头则为外部链接
            if (
                item.linkUrl &&
                (item.linkUrl.startsWith("http://") ||
                    item.linkUrl.startsWith("https://"))
            ) {
                this.linkType = "external";
            } else {
                this.linkType = "internal";
            }
            window.scrollTo({ top: 0, behavior: "smooth" });
        },
        async updateItem() {
            this.error = null;
            this.successMessage = null;
            try {
                const formData = new FormData();

                if (this.imageFile) {
                    formData.append("image", this.imageFile);
                } else if (this.currentItem.imageUrl === "") {
                    // 如果图片被移除（imageUrl清空），则明确发送一个指示给后端
                    formData.append("removeImage", "true");
                } else {
                    // 如果没有新文件，且 imageUrl 存在，则发送旧的 imageUrl
                    formData.append("imageUrl", this.currentItem.imageUrl);
                }

                formData.append("title", this.currentItem.title);
                formData.append("linkUrl", this.currentItem.linkUrl); // 直接发送，由后端处理格式
                formData.append("order", this.currentItem.order);

                const response = await updatePosterItem(this.currentItem._id, formData); // 使用封装的 API
                const index = this.posterItems.findIndex(
                    (item) => item._id === response.data._id
                );
                if (index !== -1) {
                    this.$set(this.posterItems, index, response.data); // 统一返回体，实际数据在 data 字段下
                }
                this.posterItems.sort((a, b) => a.order - b.order);
                this.resetForm();
                this.successMessage = response.message; // 统一返回体中的 message
            } catch (err) {
                console.error("更新海报图失败:", err.message);
                this.error = err.message || "更新海报图失败，请稍后再试。";
            }
        },
        async deleteItem(id) {
            if (confirm("确定要删除此海报图吗？")) {
                this.error = null;
                this.successMessage = null;
                try {
                    const response = await deletePosterItem(id); // 使用封装的 API
                    this.posterItems = this.posterItems.filter(
                        (item) => item._id !== id
                    );
                    this.successMessage = response.message; // 统一返回体中的 message
                } catch (err) {
                    console.error("删除海报图失败:", err.message);
                    this.error = err.message || "删除海报图失败，请稍后再试。";
                }
            }
        },
        cancelEdit() {
            this.resetForm();
            this.isEditing = false;
        },
        resetForm() {
            this.currentItem = {
                _id: null,
                imageUrl: "",
                title: "",
                linkUrl: "",
                order: 0,
            };
            this.isEditing = false;
            this.error = null;
            this.successMessage = null;
            this.imageFile = null;
            this.imagePreviewUrl = null;
            this.linkType = "internal"; // 重置为默认内部链接
            const fileInput = document.getElementById("imageUpload");
            if (fileInput) {
                fileInput.value = "";
            }
        },
    },
};
</script>

<style scoped>
/* 可以添加 PosterAdmin 组件特有的样式 */
</style>
