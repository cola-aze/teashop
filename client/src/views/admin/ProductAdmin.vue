<template>
    <div>
        <h2
            class="text-2xl font-bold mb-6 text-gray-800 font-noto-serif-sc p-4"
        >
            茶品管理
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

        <!-- 新增/编辑茶品表单 -->
        <form
            @submit.prevent="isEditing ? updateItem() : addItem()"
            class="mb-8 p-4 border border-gray-200 rounded-lg bg-white shadow-md"
        >
            <h3 class="text-xl font-semibold mb-4 text-gray-700">
                {{ isEditing ? "编辑茶品" : "新增茶品" }}
            </h3>
            <div class="mb-4">
                <label
                    for="name"
                    class="block text-gray-700 text-sm font-bold mb-2"
                    >茶品名称:</label
                >
                <input
                    type="text"
                    id="name"
                    v-model="currentItem.name"
                    class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-stone-500"
                    placeholder="请输入茶品名称"
                    required
                />
            </div>
            <div class="mb-4">
                <label
                    for="description"
                    class="block text-gray-700 text-sm font-bold mb-2"
                    >描述:</label
                >
                <textarea
                    id="description"
                    v-model="currentItem.description"
                    class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-stone-500 h-24"
                    placeholder="请输入茶品描述"
                ></textarea>
            </div>
            <div class="mb-4">
                <label
                    for="price"
                    class="block text-gray-700 text-sm font-bold mb-2"
                    >价格:</label
                >
                <input
                    type="number"
                    id="price"
                    v-model.number="currentItem.price"
                    class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-stone-500"
                    placeholder="请输入价格"
                    required
                />
            </div>
            <div class="mb-4">
                <label
                    for="imageUrl"
                    class="block text-gray-700 text-sm font-bold mb-2"
                    >图片URL:</label
                >
                <input
                    type="text"
                    id="imageUrl"
                    v-model="currentItem.imageUrl"
                    class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-stone-500"
                    placeholder="请输入图片URL"
                    required
                />
            </div>
            <div class="mb-4">
                <label
                    for="stock"
                    class="block text-gray-700 text-sm font-bold mb-2"
                    >库存:</label
                >
                <input
                    type="number"
                    id="stock"
                    v-model.number="currentItem.stock"
                    class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-stone-500"
                    placeholder="请输入库存数量"
                    required
                />
            </div>
            <div class="mb-4">
                <label
                    for="category"
                    class="block text-gray-700 text-sm font-bold mb-2"
                    >类别:</label
                >
                <select
                    id="category"
                    v-model="currentItem.category"
                    class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-stone-500"
                    required
                >
                    <option value="">选择类别</option>
                    <option
                        v-for="cat in categories"
                        :key="cat.value"
                        :value="cat.value"
                    >
                        {{ cat.text }}
                    </option>
                </select>
            </div>
            <div class="mb-4">
                <label
                    for="order"
                    class="block text-gray-700 text-sm font-bold mb-2"
                    >排序 (越小越靠前):</label
                >
                <input
                    type="number"
                    id="order"
                    v-model.number="currentItem.order"
                    class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-stone-500"
                    placeholder="请输入排序值"
                />
            </div>
            <div class="mb-4">
                <label
                    for="level"
                    class="block text-gray-700 text-sm font-bold mb-2"
                    >等级:</label
                >
                <input
                    type="text"
                    id="level"
                    v-model="currentItem.level"
                    class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-stone-500"
                    placeholder="请输入茶品等级 (如: 特级, 一级等)"
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

        <!-- 茶品列表 -->
        <div class="overflow-x-auto p-4 bg-white rounded-lg shadow-md">
            <table
                class="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm"
            >
                <thead>
                    <tr
                        class="bg-gray-100 text-gray-600 uppercase text-sm leading-normal"
                    >
                        <th class="py-3 px-6 text-left">图片</th>
                        <th class="py-3 px-6 text-left">名称</th>
                        <th class="py-3 px-6 text-left">类别</th>
                        <th class="py-3 px-6 text-left">价格</th>
                        <th class="py-3 px-6 text-left">库存</th>
                        <th class="py-3 px-6 text-left">排序</th>
                        <th class="py-3 px-6 text-left">等级</th>
                        <th class="py-3 px-6 text-center">操作</th>
                    </tr>
                </thead>
                <tbody class="text-gray-600 text-sm font-light">
                    <tr v-if="products.length === 0">
                        <td colspan="8" class="py-3 px-6 text-center">
                            暂无茶品。
                        </td>
                    </tr>
                    <tr
                        v-for="product in products"
                        :key="product._id"
                        class="border-b border-gray-200 hover:bg-gray-50"
                    >
                        <td class="py-3 px-6 text-left">
                            <img
                                :src="product.imageUrl"
                                alt="Product Image"
                                class="w-16 h-16 object-cover rounded-md"
                            />
                        </td>
                        <td class="py-3 px-6 text-left">{{ product.name }}</td>
                        <td class="py-3 px-6 text-left">
                            {{ getCategoryText(product.category) }}
                        </td>
                        <td class="py-3 px-6 text-left">
                            ¥{{ product.price.toFixed(2) }}
                        </td>
                        <td class="py-3 px-6 text-left">{{ product.stock }}</td>
                        <td class="py-3 px-6 text-left">{{ product.order }}</td>
                        <td class="py-3 px-6 text-left">{{ product.level }}</td>
                        <td class="py-3 px-6 text-center">
                            <button
                                @click="editItem(product)"
                                class="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-3 rounded text-xs mr-2 transition duration-300"
                            >
                                编辑
                            </button>
                            <button
                                @click="deleteItem(product._id)"
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
    name: "ProductAdmin",
    data() {
        return {
            products: [],
            currentItem: {
                name: "",
                description: "",
                price: 0,
                imageUrl: "",
                stock: 0,
                category: "",
                order: 0,
                level: "",
            },
            categories: [
                { value: "green", text: "绿茶" },
                { value: "black", text: "红茶" },
                { value: "oolong", text: "乌龙茶" },
                { value: "white", text: "白茶" },
                { value: "dark", text: "黑茶" },
                { value: "flower", text: "花草茶" },
                { value: "puer", text: "普洱茶" },
                { value: "teaware", text: "茶具" },
                { value: "yellow", text: "黄茶" },
                { value: "reprocessed", text: "再加工茶" },
                { value: "substitute", text: "代用茶" },
            ],
            isEditing: false,
            error: null,
            successMessage: null,
            // 用于管理图片上传的附加数据
            imageUploadType: "url", // 'url' 或 'file'
            selectedFile: null,
            previewImageUrl: "",
        };
    },
    created() {
        this.fetchItems();
    },
    methods: {
        getInitialItem() {
            return {
                name: "",
                description: "",
                price: 0,
                imageUrl: "",
                stock: 0,
                category: "",
                order: 0,
                level: "", // 初始化等级字段
            };
        },
        async fetchItems() {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    this.error = "未授权：请登录";
                    return;
                }
                const response = await axios.get(
                    "http://localhost:5000/api/admin/products",
                    {
                        headers: { "x-auth-token": token },
                    }
                );
                this.products = response.data.sort((a, b) => a.order - b.order); // 排序
            } catch (err) {
                console.error("获取茶品失败:", err);
                this.error = "获取茶品失败，请稍后再试。";
            }
        },
        async addItem() {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    this.error = "未授权：请登录";
                    return;
                }
                const productData = { ...this.currentItem }; // 确保所有字段都被包含
                const response = await axios.post(
                    "http://localhost:5000/api/admin/products",
                    productData,
                    {
                        headers: { "x-auth-token": token },
                    }
                );
                this.products.push(response.data);
                this.resetForm();
                this.successMessage = "茶品新增成功！";
                this.fetchItems(); // 重新获取数据以更新列表和排序
            } catch (err) {
                console.error("新增茶品失败:", err);
                this.error = "新增茶品失败，请检查输入并重试。";
            }
        },
        editItem(item) {
            this.isEditing = true;
            this.currentItem = { ...item }; // 确保所有字段都被复制
        },
        async updateItem() {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    this.error = "未授权：请登录";
                    return;
                }
                const productData = { ...this.currentItem }; // 确保所有字段都被包含
                const response = await axios.put(
                    `http://localhost:5000/api/admin/products/${this.currentItem._id}`,
                    productData,
                    {
                        headers: { "x-auth-token": token },
                    }
                );
                // 更新列表中的对应项
                const index = this.products.findIndex(
                    (p) => p._id === response.data._id
                );
                if (index !== -1) {
                    // 使用 Vue.set 确保响应式更新，并确保所有字段都被更新
                    this.$set(this.products, index, {
                        ...this.products[index],
                        ...response.data,
                    });
                }
                this.resetForm();
                this.isEditing = false;
                this.successMessage = "茶品更新成功！";
                this.fetchItems(); // 重新获取数据以更新列表和排序
            } catch (err) {
                console.error("更新茶品失败:", err);
                this.error = "更新茶品失败，请检查输入并重试。";
            }
        },
        async deleteItem(id) {
            if (!confirm("确定要删除此茶品吗？")) {
                return;
            }
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    this.error = "未授权：请登录";
                    return;
                }
                await axios.delete(
                    `http://localhost:5000/api/admin/products/${id}`,
                    {
                        headers: { "x-auth-token": token },
                    }
                );
                this.products = this.products.filter((p) => p._id !== id);
                this.successMessage = "茶品删除成功！";
            } catch (err) {
                console.error("删除茶品失败:", err);
                this.error = "删除茶品失败，请稍后再试。";
            }
        },
        cancelEdit() {
            this.isEditing = false;
            this.resetForm();
            this.error = null; // 清除错误信息
            this.successMessage = null; // 清除成功信息
        },
        resetForm() {
            this.currentItem = this.getInitialItem();
            // 重置图片上传相关的状态
            this.imageUploadType = "url";
            this.selectedFile = null;
            this.previewImageUrl = "";
        },
        getCategoryText(value) {
            const category = this.categories.find((cat) => cat.value === value);
            return category ? category.text : value;
        },
        handleImageChange(event) {
            const file = event.target.files[0];
            if (file) {
                this.selectedFile = file;
                this.previewImageUrl = URL.createObjectURL(file);
            } else {
                this.selectedFile = null;
                this.previewImageUrl = "";
            }
        },
    },
};
</script>

<style scoped>
/* 可以添加 ProductAdmin 组件特有的样式 */
</style>
