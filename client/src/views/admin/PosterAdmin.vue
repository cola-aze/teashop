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
                                :href="item.linkUrl"
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
import axios from "axios";

export default {
    name: "PosterAdmin",
    data() {
        return {
            posterItems: [],
            currentItem: {
                imageUrl: "",
                title: "",
                linkUrl: "",
                order: 0,
            },
            isEditing: false,
            error: null,
            successMessage: null,
            selectedFile: null,
            imagePreviewUrl: null,
            linkType: "external",
        };
    },
    mounted() {
        this.fetchPosterItems();
    },
    methods: {
        handleFileChange(event) {
            const file = event.target.files[0];
            if (file) {
                this.selectedFile = file;
                this.imagePreviewUrl = URL.createObjectURL(file);
                this.currentItem.imageUrl = "";
            } else {
                this.selectedFile = null;
                this.imagePreviewUrl = null;
            }
        },
        removeImage() {
            this.selectedFile = null;
            this.imagePreviewUrl = null;
            this.currentItem.imageUrl = "";
            const fileInput = document.getElementById("imageUpload");
            if (fileInput) {
                fileInput.value = "";
            }
        },
        getAbsoluteImageUrl(relativeUrl) {
            if (!relativeUrl) return "";
            if (
                relativeUrl.startsWith("http://") ||
                relativeUrl.startsWith("https://")
            ) {
                return relativeUrl;
            }
            return `http://localhost:5000${relativeUrl}`;
        },
        formatLinkUrlForSave() {
            let url = this.currentItem.linkUrl.trim();
            if (!url) return "";

            if (this.linkType === "internal") {
                url = url.replace(/^(https?:\/\/localhost:5000)?/, "");
                if (url && !url.startsWith("/")) {
                    url = "/" + url;
                }
            } else {
                if (!url.startsWith("http://") && !url.startsWith("https://")) {
                    url = "https://" + url;
                }
            }
            return url;
        },
        validateLinkInput() {
            const url = this.currentItem.linkUrl.trim();
            if (!url) return true;

            if (this.linkType === "internal") {
                if (url.startsWith("http://") || url.startsWith("https://")) {
                    this.error =
                        '您选择了"内部链接"，但输入的URL看起来像外部链接。请检查链接类型或URL格式。';
                    return false;
                }
            } else {
                if (
                    url.startsWith("/") &&
                    !(url.startsWith("http://") || url.startsWith("https://"))
                ) {
                    this.error =
                        '您选择了"外部链接"，但输入的URL看起来像内部链接。请检查链接类型或URL格式。';
                    return false;
                }
            }
            return true;
        },
        async fetchPosterItems() {
            try {
                const token = localStorage.getItem("token");
                const response = await axios.get(
                    "http://localhost:5000/api/admin/posters",
                    {
                        headers: {
                            "x-auth-token": token,
                        },
                    }
                );
                this.posterItems = response.data.sort(
                    (a, b) => a.order - b.order
                );
            } catch (err) {
                this.error =
                    "获取海报图失败：" +
                    (err.response ? err.response.data.msg : err.message);
                console.error(err);
            }
        },
        async addItem() {
            this.error = null;
            this.successMessage = null;
            try {
                if (!this.validateLinkInput()) {
                    return;
                }

                const token = localStorage.getItem("token");
                const formData = new FormData();

                if (this.selectedFile) {
                    formData.append("image", this.selectedFile);
                } else if (this.currentItem.imageUrl) {
                    formData.append("imageUrl", this.currentItem.imageUrl);
                } else {
                    this.error = "请上传图片";
                    return;
                }

                formData.append("title", this.currentItem.title);
                formData.append("linkUrl", this.formatLinkUrlForSave());
                formData.append("order", this.currentItem.order);

                const response = await axios.post(
                    "http://localhost:5000/api/admin/posters",
                    formData,
                    {
                        headers: {
                            "x-auth-token": token,
                            "Content-Type": "multipart/form-data",
                        },
                    }
                );
                this.posterItems.push(response.data);
                this.posterItems.sort((a, b) => a.order - b.order);
                this.resetForm();
                this.successMessage = "海报图新增成功！";
            } catch (err) {
                this.error =
                    "新增海报图失败：" +
                    (err.response ? err.response.data.msg : err.message);
                console.error(err);
            }
        },
        editItem(item) {
            this.currentItem = { ...item };
            this.isEditing = true;
            this.error = null;
            this.successMessage = null;
            this.imagePreviewUrl = this.getAbsoluteImageUrl(item.imageUrl);
            this.selectedFile = null;
            if (
                item.linkUrl &&
                (item.linkUrl.startsWith("http://") ||
                    item.linkUrl.startsWith("https://"))
            ) {
                this.linkType = "external";
            } else {
                this.linkType = "internal";
            }
        },
        async updateItem() {
            this.error = null;
            this.successMessage = null;
            try {
                if (!this.validateLinkInput()) {
                    return;
                }

                const token = localStorage.getItem("token");
                const formData = new FormData();

                if (this.selectedFile) {
                    formData.append("image", this.selectedFile);
                } else if (this.currentItem.imageUrl !== undefined) {
                    formData.append(
                        "imageUrl",
                        this.currentItem.imageUrl || ""
                    );
                }

                formData.append("title", this.currentItem.title);
                formData.append("linkUrl", this.formatLinkUrlForSave());
                formData.append("order", this.currentItem.order);

                const response = await axios.put(
                    `http://localhost:5000/api/admin/posters/${this.currentItem._id}`,
                    formData,
                    {
                        headers: {
                            "x-auth-token": token,
                            "Content-Type": "multipart/form-data",
                        },
                    }
                );
                const index = this.posterItems.findIndex(
                    (item) => item._id === response.data._id
                );
                if (index !== -1) {
                    this.$set(this.posterItems, index, response.data);
                }
                this.posterItems.sort((a, b) => a.order - b.order);
                this.resetForm();
                this.successMessage = "海报图更新成功！";
            } catch (err) {
                this.error =
                    "更新海报图失败：" +
                    (err.response ? err.response.data.msg : err.message);
                console.error(err);
            }
        },
        async deleteItem(id) {
            if (confirm("确定要删除此海报图吗？")) {
                this.error = null;
                this.successMessage = null;
                try {
                    const token = localStorage.getItem("token");
                    await axios.delete(
                        `http://localhost:5000/api/admin/posters/${id}`,
                        {
                            headers: {
                                "x-auth-token": token,
                            },
                        }
                    );
                    this.posterItems = this.posterItems.filter(
                        (item) => item._id !== id
                    );
                    this.successMessage = "海报图已删除！";
                } catch (err) {
                    this.error =
                        "删除海报图失败：" +
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
                imageUrl: "",
                title: "",
                linkUrl: "",
                order: 0,
            };
            this.selectedFile = null;
            this.imagePreviewUrl = null;
            this.linkType = "external";
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
