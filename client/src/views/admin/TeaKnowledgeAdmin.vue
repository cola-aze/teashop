<template>
    <div>
        <h2 class="text-2xl font-bold mb-6 text-gray-800 font-noto-serif-sc p-4">
            茶知识管理
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

        <!-- 新增/编辑茶知识表单 -->
        <form
            @submit.prevent="isEditing ? updateItem() : addItem()"
            class="mb-8 p-4 border border-gray-200 rounded-lg bg-white shadow-md"
        >
            <h3 class="text-xl font-semibold mb-4 text-gray-700">
                {{ isEditing ? "编辑茶知识" : "新增茶知识" }}
            </h3>
            <div class="mb-4">
                <label
                    for="category"
                    class="block text-gray-700 text-sm font-bold mb-2"
                    >茶类别:</label
                >
                <!-- 修改为下拉选择框，并从 teaCategories 中获取选项 -->
                <select
                    id="category"
                    v-model="currentItem.category"
                    class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-stone-500"
                    required
                >
                    <option value="" disabled>请选择茶类别</option>
                    <option
                        v-for="category in teaCategories"
                        :key="category._id"
                        :value="category.value"
                    >
                        {{ category.description }}
                    </option>
                </select>
            </div>
            <div class="mb-4">
                <label
                    for="name"
                    class="block text-gray-700 text-sm font-bold mb-2"
                    >茶名称:</label
                >
                <input
                    type="text"
                    id="name"
                    v-model="currentItem.name"
                    class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-stone-500"
                    placeholder="例如: 金骏眉, 西湖龙井"
                    required
                />
            </div>
            <div class="mb-4">
                <label
                    for="description_short"
                    class="block text-gray-700 text-sm font-bold mb-2"
                    >简短描述:</label
                >
                <textarea
                    id="description_short"
                    v-model="currentItem.description_short"
                    class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-stone-500 h-24"
                    placeholder="用于列表页卡片上的简短描述"
                    required
                ></textarea>
            </div>
            <div class="mb-4">
                <label
                    for="description_full"
                    class="block text-gray-700 text-sm font-bold mb-2"
                    >完整茶知识内容:</label
                >
                <textarea
                    id="description_full"
                    v-model="currentItem.description_full"
                    class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-stone-500 h-48"
                    placeholder="完整的茶知识详情"
                    required
                ></textarea>
            </div>
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
                    :required="!currentItem.imageUrl && !imagePreviewUrl"
                />
            </div>

            <!-- 图片预览 -->
            <div v-if="imagePreviewUrl || currentItem.imageUrl" class="mb-4">
                <label class="block text-gray-700 text-sm font-bold mb-2"
                    >图片预览:</label
                >
                <div class="flex items-center">
                    <img
                        :src="imagePreviewUrl || getAbsoluteImageUrl(currentItem.imageUrl)"
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

            <!-- 更多字段，例如：产地、特点、冲泡方法等 -->
            <div class="mb-4">
                <label
                    for="origin"
                    class="block text-gray-700 text-sm font-bold mb-2"
                    >产地:</label
                >
                <input
                    type="text"
                    id="origin"
                    v-model="currentItem.origin"
                    class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-stone-500"
                    placeholder="例如: 福建武夷山"
                />
            </div>
            <div class="mb-4">
                <label
                    for="features"
                    class="block text-gray-700 text-sm font-bold mb-2"
                    >特点 (逗号分隔):</label
                >
                <input
                    type="text"
                    id="features"
                    v-model="featuresInput"
                    class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-stone-500"
                    placeholder="例如: 口感醇厚, 香气独特"
                />
            </div>
            <div class="mb-4">
                <label
                    for="brewing_guide"
                    class="block text-gray-700 text-sm font-bold mb-2"
                    >冲泡指南:</label
                >
                <textarea
                    id="brewing_guide"
                    v-model="currentItem.brewing_guide"
                    class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-stone-500 h-32"
                    placeholder="详细冲泡方法"
                ></textarea>
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

        <!-- 茶知识列表 -->
        <div class="overflow-x-auto p-4 bg-white rounded-lg shadow-md">
            <table
                class="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm"
            >
                <thead>
                    <tr
                        class="bg-gray-100 text-gray-600 uppercase text-sm leading-normal"
                    >
                        <th class="py-3 px-6 text-left">图片</th>
                        <th class="py-3 px-6 text-left">类别</th>
                        <th class="py-3 px-6 text-left">名称</th>
                        <th class="py-3 px-6 text-left">简短描述</th>
                        <th class="py-3 px-6 text-left">产地</th>
                        <th class="py-3 px-6 text-center">操作</th>
                    </tr>
                </thead>
                <tbody class="text-gray-600 text-sm font-light">
                    <tr v-if="teaKnowledgeItems.length === 0">
                        <td colspan="6" class="py-3 px-6 text-center">
                            暂无茶知识。
                        </td>
                    </tr>
                    <tr
                        v-for="item in teaKnowledgeItems"
                        :key="item._id"
                        class="border-b border-gray-200 hover:bg-gray-50"
                    >
                        <td class="py-3 px-6 text-left">
                            <img
                                :src="getAbsoluteImageUrl(item.image_url)"
                                alt="Tea Image"
                                class="w-24 h-16 object-cover rounded-md"
                            />
                        </td>
                        <td class="py-3 px-6 text-left">{{ item.category }}</td>
                        <td class="py-3 px-6 text-left">{{ item.name }}</td>
                        <td class="py-3 px-6 text-left">{{ item.description_short }}</td>
                        <td class="py-3 px-6 text-left">{{ item.origin || '-' }}</td>
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
import axios from "axios";

export default {
    name: "TeaKnowledgeAdmin",
    data() {
        return {
            teaKnowledgeItems: [],
            currentItem: {
                category: "",
                name: "",
                description_short: "",
                description_full: "",
                image: null,
                imageUrl: "",
                origin: "",
                features: [],
                brewing_guide: "",
            },
            featuresInput: "", // 用于绑定features的输入
            imagePreviewUrl: null,
            isEditing: false,
            error: null,
            successMessage: null,
            teaCategories: [], // 新增：用于存储从字典获取的茶类别
        };
    },
    watch: {
        // 监听 featuresInput 变化，更新 currentItem.features 数组
        featuresInput(newVal) {
            this.currentItem.features = newVal
                .split(",")
                .map((s) => s.trim())
                .filter((s) => s.length > 0);
        },
        // 监听 currentItem.features 变化，更新 featuresInput 字符串
        "currentItem.features": {
            handler(newVal) {
                if (newVal) {
                    this.featuresInput = newVal.join(", ");
                } else {
                    this.featuresInput = "";
                }
            },
            immediate: true, // 立即执行一次，处理初始值
        },
    },
    mounted() {
        this.fetchTeaKnowledgeItems();
        this.fetchTeaCategories(); // 新增：在组件挂载时获取茶类别
    },
    methods: {
        async fetchTeaKnowledgeItems() {
            try {
                const token = localStorage.getItem("token");
                const response = await axios.get(
                    "http://localhost:5000/api/admin/tea-knowledge",
                    {
                        headers: {
                            "x-auth-token": token,
                        },
                    }
                );
                this.teaKnowledgeItems = response.data.sort((a, b) => {
                    const categoryComparison = a.category.localeCompare(b.category);
                    if (categoryComparison !== 0) return categoryComparison;
                    return a.name.localeCompare(b.name);
                });
            } catch (err) {
                this.error =
                    "获取茶知识失败：" +
                    (err.response ? err.response.data.msg : err.message);
                console.error(err);
            }
        },
        // 新增方法：获取茶类别
        async fetchTeaCategories() {
            try {
                const token = localStorage.getItem("token");
                const response = await axios.get(
                    "http://localhost:5000/api/admin/dictionary?type=tea_category",
                    {
                        headers: {
                            "x-auth-token": token,
                        },
                    }
                );
                // 假设返回的数据是 { _id, type, value, description, order } 形式
                this.teaCategories = response.data.sort((a, b) => a.order - b.order || a.value.localeCompare(b.value));
            } catch (err) {
                this.error =
                    "获取茶类别失败：" +
                    (err.response ? err.response.data.msg : err.message);
                console.error(err);
                this.teaCategories = []; // 获取失败时清空类别
            }
        },
        handleFileChange(event) {
            const file = event.target.files[0];
            if (file) {
                this.currentItem.image = file;
                this.imagePreviewUrl = URL.createObjectURL(file);
            } else {
                this.currentItem.image = null;
                this.imagePreviewUrl = null;
            }
        },
        removeImage() {
            this.currentItem.image = null;
            this.currentItem.imageUrl = ""; // 清空已有的图片 URL
            this.imagePreviewUrl = null;
            // 重置文件输入框
            const fileInput = document.getElementById("imageUpload");
            if (fileInput) {
                fileInput.value = "";
            }
        },
        getAbsoluteImageUrl(relativePath) {
            if (!relativePath) return "";
            // 检查是否已经是完整的URL
            if (relativePath.startsWith("http://") || relativePath.startsWith("https://")) {
                return relativePath;
            }
            return `http://localhost:5000${relativePath}`;
        },
        async addItem() {
            this.error = null;
            this.successMessage = null;
            try {
                const token = localStorage.getItem("token");
                const formData = new FormData();
                formData.append("category", this.currentItem.category);
                formData.append("name", this.currentItem.name);
                formData.append("description_short", this.currentItem.description_short);
                formData.append("description_full", this.currentItem.description_full);
                formData.append("origin", this.currentItem.origin || "");
                formData.append(
                    "features",
                    JSON.stringify(this.currentItem.features)
                ); // features作为JSON字符串发送
                formData.append("brewing_guide", this.currentItem.brewing_guide || "");
                if (this.currentItem.image) {
                    formData.append("image", this.currentItem.image);
                }

                const response = await axios.post(
                    "http://localhost:5000/api/admin/tea-knowledge",
                    formData,
                    {
                        headers: {
                            "x-auth-token": token,
                            "Content-Type": "multipart/form-data",
                        },
                    }
                );
                this.teaKnowledgeItems.push(response.data);
                this.teaKnowledgeItems.sort((a, b) => {
                    const categoryComparison = a.category.localeCompare(b.category);
                    if (categoryComparison !== 0) return categoryComparison;
                    return a.name.localeCompare(b.name);
                });
                this.resetForm();
                this.successMessage = "茶知识新增成功！";
            } catch (err) {
                this.error =
                    "新增茶知识失败：" +
                    (err.response ? err.response.data.msg : err.message);
                console.error(err);
            }
        },
        editItem(item) {
            this.isEditing = true;
            this.currentItem = { ...item };
            // 处理 features 数组到 featuresInput 字符串
            this.featuresInput = item.features ? item.features.join(", ") : "";
            // 清空image，因为图片上传需要重新选择文件，不能直接编辑已上传的文件
            this.currentItem.image = null;
            this.imagePreviewUrl = null; // 清除预览
            // 重置文件输入框
            const fileInput = document.getElementById("imageUpload");
            if (fileInput) {
                fileInput.value = "";
            }
            window.scrollTo({ top: 0, behavior: "smooth" });
        },
        async updateItem() {
            this.error = null;
            this.successMessage = null;
            try {
                const token = localStorage.getItem("token");
                const formData = new FormData();
                formData.append("category", this.currentItem.category);
                formData.append("name", this.currentItem.name);
                formData.append("description_short", this.currentItem.description_short);
                formData.append("description_full", this.currentItem.description_full);
                formData.append("origin", this.currentItem.origin || "");
                formData.append(
                    "features",
                    JSON.stringify(this.currentItem.features)
                );
                formData.append("brewing_guide", this.currentItem.brewing_guide || "");

                if (this.currentItem.image) {
                    formData.append("image", this.currentItem.image);
                } else if (this.currentItem.imageUrl === "") {
                    // 如果图片被移除，则明确发送一个指示
                    formData.append("removeImage", "true");
                }

                const response = await axios.put(
                    `http://localhost:5000/api/admin/tea-knowledge/${this.currentItem._id}`,
                    formData,
                    {
                        headers: {
                            "x-auth-token": token,
                            "Content-Type": "multipart/form-data",
                        },
                    }
                );
                const index = this.teaKnowledgeItems.findIndex(
                    (item) => item._id === response.data._id
                );
                if (index !== -1) {
                    this.$set(this.teaKnowledgeItems, index, response.data);
                }
                this.teaKnowledgeItems.sort((a, b) => {
                    const categoryComparison = a.category.localeCompare(b.category);
                    if (categoryComparison !== 0) return categoryComparison;
                    return a.name.localeCompare(b.name);
                });
                this.resetForm();
                this.successMessage = "茶知识更新成功！";
            } catch (err) {
                this.error =
                    "更新茶知识失败：" +
                    (err.response ? err.response.data.msg : err.message);
                console.error(err);
            }
        },
        async deleteItem(id) {
            if (confirm("确定要删除此茶知识吗？")) {
                this.error = null;
                this.successMessage = null;
                try {
                    const token = localStorage.getItem("token");
                    await axios.delete(
                        `http://localhost:5000/api/admin/tea-knowledge/${id}`,
                        {
                            headers: {
                                "x-auth-token": token,
                            },
                        }
                    );
                    this.teaKnowledgeItems = this.teaKnowledgeItems.filter(
                        (item) => item._id !== id
                    );
                    this.successMessage = "茶知识已删除！";
                } catch (err) {
                    this.error =
                        "删除茶知识失败：" +
                        (err.response ? err.response.data.msg : err.message);
                    console.error(err);
                }
            }
        },
        cancelEdit() {
            this.resetForm();
            this.isEditing = false;
        },
        resetForm() {
            this.currentItem = {
                category: "",
                name: "",
                description_short: "",
                description_full: "",
                image: null,
                imageUrl: "",
                origin: "",
                features: [],
                brewing_guide: "",
            };
            this.featuresInput = ""; // 重置 featuresInput
            this.imagePreviewUrl = null;
            this.isEditing = false;
            this.error = null;
            this.successMessage = null;
            // 重置文件输入框
            const fileInput = document.getElementById("imageUpload");
            if (fileInput) {
                fileInput.value = "";
            }
        },
    },
};
</script>

<style scoped>
/* 可以添加 TeaKnowledgeAdmin 组件特有的样式 */
</style>