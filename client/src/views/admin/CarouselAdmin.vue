<template>
    <div>
        <h2
            class="text-2xl font-bold mb-6 text-gray-800 font-noto-serif-sc p-4"
        >
            轮播图管理
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

        <!-- 新增/编辑轮播图表单 -->
        <form
            @submit.prevent="isEditing ? updateItem() : addItem()"
            class="mb-8 p-4 border border-gray-200 rounded-lg bg-white shadow-md"
        >
            <h3 class="text-xl font-semibold mb-4 text-gray-700">
                {{ isEditing ? "编辑轮播图" : "新增轮播图" }}
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
                        :src="getAbsoluteImageUrl(imagePreviewUrl || currentItem.imageUrl)"
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
                    >标题:</label
                >
                <input
                    type="text"
                    id="title"
                    v-model="currentItem.title"
                    class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-stone-500"
                    placeholder="请输入轮播图标题"
                    required
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

        <!-- 轮播图列表 -->
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
                    <tr v-if="carouselItems.length === 0">
                        <td colspan="5" class="py-3 px-6 text-center">
                            暂无轮播图。
                        </td>
                    </tr>
                    <tr
                        v-for="item in carouselItems"
                        :key="item._id"
                        class="border-b border-gray-200 hover:bg-gray-50"
                    >
                        <td class="py-3 px-6 text-left">
                            <img
                                :src="getAbsoluteImageUrl(item.imageUrl)"
                                alt="Carousel Image"
                                class="w-24 h-16 object-cover rounded-md"
                            />
                        </td>
                        <td class="py-3 px-6 text-left">{{ item.title }}</td>
                        <td class="py-3 px-6 text-left">
                            <a
                                :href="getCarouselLink(item.linkUrl)"
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
import { getCarouselItems, addCarouselItem, updateCarouselItem, deleteCarouselItem } from '@/api/admin';

export default {
    name: "CarouselAdmin",
    data() {
        return {
            carouselItems: [],
            currentItem: {
                _id: null,
                imageUrl: "",
                title: "",
                linkUrl: "",
                order: 0,
            },
            imagePreviewUrl: "",
            imageFile: null,
            isEditing: false,
            successMessage: null,
            error: null,
            linkType: 'internal',
        };
    },
    mounted() {
        this.fetchCarouselItems();
    },
    methods: {
        getAbsoluteImageUrl(relativeUrl) {
            if (!relativeUrl) return "";
            if (
                relativeUrl.startsWith("http://") ||
                relativeUrl.startsWith("https://") ||
                relativeUrl.startsWith("blob:") ||
                relativeUrl.startsWith("data:")
            ) {
                return relativeUrl;
            }
            return `http://localhost:5000${relativeUrl}`;
        },
        getCarouselLink(linkUrl) {
            if (!linkUrl) return "#";
            if (
                linkUrl.startsWith("http://") ||
                linkUrl.startsWith("https://")
            ) {
                return linkUrl;
            }
            return linkUrl;
        },
        handleFileChange(event) {
            const file = event.target.files[0];
            if (file) {
                this.imageFile = file;
                this.imagePreviewUrl = URL.createObjectURL(file);
                this.currentItem.imageUrl = "";
            }
        },
        removeImage() {
            this.imageFile = null;
            this.imagePreviewUrl = "";
            this.currentItem.imageUrl = "";
            if (this.isEditing) {
                this.currentItem.removeImage = true;
            }
        },
        async fetchCarouselItems() {
            try {
                const response = await getCarouselItems();
                this.carouselItems = response.data;
                this.successMessage = response.message;
            } catch (err) {
                console.error("获取轮播图失败:", err.message);
                this.error = err.message || "获取轮播图失败，请稍后再试。";
            }
        },
        async addItem() {
            this.error = null;
            this.successMessage = null;

            if (!this.imageFile && !this.currentItem.imageUrl) {
                this.error = "请选择图片！";
                return;
            }

            try {
                const formData = new FormData();
                formData.append('title', this.currentItem.title);
                formData.append('linkUrl', this.currentItem.linkUrl);
                formData.append('order', this.currentItem.order);
                if (this.imageFile) {
                    formData.append('image', this.imageFile);
                }

                const response = await addCarouselItem(formData);
                this.successMessage = response.message;
                this.fetchCarouselItems();
                this.resetForm();
            } catch (err) {
                console.error("新增轮播图失败:", err.message);
                this.error = err.message || "新增轮播图失败，请稍后再试。";
            }
        },
        editItem(item) {
            this.isEditing = true;
            this.currentItem = { ...item };
            this.imagePreviewUrl = this.getAbsoluteImageUrl(item.imageUrl);
            this.imageFile = null;
            this.currentItem.removeImage = false;
        },
        async updateItem() {
            this.error = null;
            this.successMessage = null;

            if (!this.imageFile && !this.currentItem.imageUrl && !this.currentItem.removeImage) {
                this.error = "请选择图片或确认是否移除旧图片！";
                return;
            }

            try {
                const formData = new FormData();
                formData.append('title', this.currentItem.title);
                formData.append('linkUrl', this.currentItem.linkUrl);
                formData.append('order', this.currentItem.order);

                if (this.imageFile) {
                    formData.append('image', this.imageFile);
                } else if (this.currentItem.removeImage) {
                    formData.append('removeImage', 'true');
                }
                else if (this.currentItem.imageUrl) {
                    formData.append('imageUrl', this.currentItem.imageUrl);
                }

                const response = await updateCarouselItem(this.currentItem._id, formData);
                this.successMessage = response.message;
                this.fetchCarouselItems();
                this.resetForm();
            } catch (err) {
                console.error("更新轮播图失败:", err.message);
                this.error = err.message || "更新轮播图失败，请稍后再试。";
            }
        },
        async deleteItem(id) {
            if (confirm("确定要删除此轮播图项吗？")) {
                this.error = null;
                this.successMessage = null;
                try {
                    const response = await deleteCarouselItem(id);
                    this.successMessage = response.message;
                    this.fetchCarouselItems();
                } catch (err) {
                    console.error("删除轮播图失败:", err.message);
                    this.error = err.message || "删除轮播图失败，请稍后再试。";
                }
            }
        },
        resetForm() {
            this.currentItem = {
                _id: null,
                imageUrl: "",
                title: "",
                linkUrl: "",
                order: 0,
            };
            this.imageFile = null;
            this.imagePreviewUrl = "";
            this.isEditing = false;
            this.linkType = 'internal';
        },
        cancelEdit() {
            this.resetForm();
        },
    },
};
</script>

<style scoped>
/* 可以添加 CarouselAdmin 组件特有的样式 */
</style>
