<template>
    <div>
        <h2 class="text-2xl font-bold mb-6 text-gray-800 font-noto-serif-sc p-4">
            数据字典管理
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

        <!-- 新增/编辑字典项表单 -->
        <form
            @submit.prevent="isEditing ? updateItem() : addItem()"
            class="mb-8 p-4 border border-gray-200 rounded-lg bg-white shadow-md"
        >
            <h3 class="text-xl font-semibold mb-4 text-gray-700">
                {{ isEditing ? "编辑字典项" : "新增字典项" }}
            </h3>
            <div class="mb-4">
                <label
                    for="type-select"
                    class="block text-gray-700 text-sm font-bold mb-2"
                    >字典类型:</label
                >
                <select
                    id="type-select"
                    v-model="selectedTypeOption"
                    class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-stone-500"
                    required
                    :disabled="isEditing"
                >
                    <option value="" disabled>请选择或新增类型</option>
                    <option value="new_type">新增类型...</option>
                    <option
                        v-for="typeOption in existingTypes"
                        :key="typeOption"
                        :value="typeOption"
                    >
                        {{ typeOption }}
                    </option>
                </select>
            </div>

            <div class="mb-4" v-if="selectedTypeOption === 'new_type' || isEditing">
                <label
                    for="new-type-input"
                    class="block text-gray-700 text-sm font-bold mb-2"
                    >新字典类型名称:</label
                >
                <input
                    type="text"
                    id="new-type-input"
                    v-model="currentItem.type"
                    class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-stone-500"
                    placeholder="例如: tea_category, product_level"
                    required
                    :disabled="isEditing && selectedTypeOption !== 'new_type'"
                />
            </div>

            <div class="mb-4">
                <label
                    for="value"
                    class="block text-gray-700 text-sm font-bold mb-2"
                    >字典值 (键):</label
                >
                <input
                    type="text"
                    id="value"
                    v-model="currentItem.value"
                    class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-stone-500"
                    placeholder="例如: greentea, special"
                    required
                />
            </div>
            <div class="mb-4">
                <label
                    for="description"
                    class="block text-gray-700 text-sm font-bold mb-2"
                    >描述 (标签, 可选):</label
                >
                <textarea
                    id="description"
                    v-model="currentItem.description"
                    class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-stone-500 h-24"
                    placeholder="请输入描述，例如: 绿茶, 特级"
                ></textarea>
            </div>
            <div class="mb-4">
                <label
                    for="order"
                    class="block text-gray-700 text-sm font-bold mb-2"
                    >排序 (数字, 可选):</label
                >
                <input
                    type="number"
                    id="order"
                    v-model.number="currentItem.order"
                    class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-stone-500"
                    placeholder="请输入排序数字"
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

        <!-- 字典项列表 -->
        <div class="overflow-x-auto p-4 bg-white rounded-lg shadow-md">
            <table
                class="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm"
            >
                <thead>
                    <tr
                        class="bg-gray-100 text-gray-600 uppercase text-sm leading-normal"
                    >
                        <th class="py-3 px-6 text-left">类型</th>
                        <th class="py-3 px-6 text-left">值 (键)</th>
                        <th class="py-3 px-6 text-left">描述 (标签)</th>
                        <th class="py-3 px-6 text-left">排序</th>
                        <th class="py-3 px-6 text-center">操作</th>
                    </tr>
                </thead>
                <tbody class="text-gray-600 text-sm font-light">
                    <tr v-if="dictionaryItems.length === 0">
                        <td colspan="5" class="py-3 px-6 text-center">
                            暂无字典项。
                        </td>
                    </tr>
                    <tr
                        v-for="item in dictionaryItems"
                        :key="item._id"
                        class="border-b border-gray-200 hover:bg-gray-50"
                    >
                        <td class="py-3 px-6 text-left">{{ item.type }}</td>
                        <td class="py-3 px-6 text-left">{{ item.value }}</td>
                        <td class="py-3 px-6 text-left">{{ item.description || '-' }}</td>
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
    name: "DictionaryAdmin",
    data() {
        return {
            dictionaryItems: [],
            currentItem: {
                type: "",
                value: "",
                description: "",
                order: 0,
            },
            isEditing: false,
            error: null,
            successMessage: null,
            existingTypes: [], // 存储所有唯一的字典类型
            selectedTypeOption: "", // 控制下拉框的选择
        };
    },
    watch: {
        selectedTypeOption(newVal) {
            if (newVal === "new_type") {
                this.currentItem.type = ""; // 清空类型，等待用户输入新类型
            } else {
                this.currentItem.type = newVal; // 设置为选中的类型
            }
        },
        // 当currentItem.type被外部（如editItem）改变时，同步selectedTypeOption
        "currentItem.type"(newVal) {
            if (this.existingTypes.includes(newVal)) {
                this.selectedTypeOption = newVal;
            } else if (newVal) {
                // 如果是新类型，但不是通过"new_type"选项输入的，则默认为"new_type"
                this.selectedTypeOption = "new_type";
            } else {
                this.selectedTypeOption = "";
            }
        },
    },
    mounted() {
        this.fetchDictionaryItems();
        this.fetchExistingTypes(); // 获取所有现有字典类型
    },
    methods: {
        async fetchDictionaryItems() {
            try {
                const token = localStorage.getItem("token");
                const response = await axios.get(
                    "http://localhost:5000/api/admin/dictionary",
                    {
                        headers: {
                            "x-auth-token": token,
                        },
                    }
                );
                this.dictionaryItems = response.data.sort((a, b) => a.type.localeCompare(b.type) || a.order - b.order || a.value.localeCompare(b.value));
            } catch (err) {
                this.error =
                    "获取字典项失败：" +
                    (err.response ? err.response.data.msg : err.message);
                console.error(err);
            }
        },
        async fetchExistingTypes() {
            try {
                const token = localStorage.getItem("token");
                // 获取所有字典项，然后提取唯一的类型
                const response = await axios.get(
                    "http://localhost:5000/api/admin/dictionary",
                    {
                        headers: {
                            "x-auth-token": token,
                        },
                    }
                );
                const types = new Set();
                response.data.forEach((item) => {
                    types.add(item.type);
                });
                this.existingTypes = Array.from(types).sort();
            } catch (err) {
                console.error("获取字典类型失败：", err);
            }
        },
        async addItem() {
            this.error = null;
            this.successMessage = null;
            if (this.selectedTypeOption === 'new_type' && !this.currentItem.type.trim()) {
                this.error = "请输入新的字典类型名称。";
                return;
            }
            try {
                const token = localStorage.getItem("token");
                const response = await axios.post(
                    "http://localhost:5000/api/admin/dictionary",
                    this.currentItem,
                    {
                        headers: {
                            "x-auth-token": token,
                        },
                    }
                );
                this.dictionaryItems.push(response.data);
                this.dictionaryItems.sort((a, b) => a.type.localeCompare(b.type) || a.order - b.order || a.value.localeCompare(b.value));
                this.fetchExistingTypes(); // 新增成功后刷新类型列表
                this.resetForm();
                this.successMessage = "字典项新增成功！";
            } catch (err) {
                this.error =
                    "新增字典项失败：" +
                    (err.response ? err.response.data.msg : err.message);
                console.error(err);
            }
        },
        editItem(item) {
            this.isEditing = true;
            this.currentItem = { ...item };
            // 在编辑模式下，如果当前项的类型不在现有类型中，则显示为"新增类型"
            if (!this.existingTypes.includes(item.type)) {
                this.selectedTypeOption = "new_type";
            } else {
                this.selectedTypeOption = item.type;
            }
            window.scrollTo({ top: 0, behavior: "smooth" });
        },
        async updateItem() {
            this.error = null;
            this.successMessage = null;
            if (this.selectedTypeOption === 'new_type' && !this.currentItem.type.trim()) {
                this.error = "请输入新的字典类型名称。";
                return;
            }
            try {
                const token = localStorage.getItem("token");
                const response = await axios.put(
                    `http://localhost:5000/api/admin/dictionary/${this.currentItem._id}`,
                    this.currentItem,
                    {
                        headers: {
                            "x-auth-token": token,
                        },
                    }
                );
                const index = this.dictionaryItems.findIndex(
                    (item) => item._id === response.data._id
                );
                if (index !== -1) {
                    this.$set(this.dictionaryItems, index, response.data);
                }
                this.dictionaryItems.sort((a, b) => a.type.localeCompare(b.type) || a.order - b.order || a.value.localeCompare(b.value));
                this.fetchExistingTypes(); // 更新成功后刷新类型列表
                this.resetForm();
                this.successMessage = "字典项更新成功！";
            } catch (err) {
                this.error =
                    "更新字典项失败：" +
                    (err.response ? err.response.data.msg : err.message);
                console.error(err);
            }
        },
        async deleteItem(id) {
            if (confirm("确定要删除此字典项吗？")) {
                this.error = null;
                this.successMessage = null;
                try {
                    const token = localStorage.getItem("token");
                    await axios.delete(
                        `http://localhost:5000/api/admin/dictionary/${id}`,
                        {
                            headers: {
                                "x-auth-token": token,
                            },
                        }
                    );
                    this.dictionaryItems = this.dictionaryItems.filter(
                        (item) => item._id !== id
                    );
                    this.fetchExistingTypes(); // 删除成功后刷新类型列表
                    this.successMessage = "字典项已删除！";
                } catch (err) {
                    this.error =
                        "删除字典项失败：" +
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
                type: "",
                value: "",
                description: "",
                order: 0,
            };
            this.isEditing = false;
            this.error = null;
            this.successMessage = null;
            this.selectedTypeOption = ""; // 重置下拉框选择
        },
    },
};
</script>

<style scoped>
/* 可以添加 DictionaryAdmin 组件特有的样式 */
</style>