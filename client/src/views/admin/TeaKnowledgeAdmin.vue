<template>
    <div>
        <h2
            class="text-2xl font-bold mb-6 text-gray-800 font-noto-serif-sc p-4"
        >
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
                >
                    类别:
                </label>
                <select
                    id="category"
                    v-model="currentItem.category"
                    class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-stone-500"
                    required
                >
                    <option value="" disabled>请选择类别</option>
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
                >
                    茶名称:
                </label>
                <input
                    type="text"
                    id="name"
                    v-model="currentItem.name"
                    class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-stone-500"
                    placeholder="请输入茶名称"
                    required
                />
            </div>
            <div class="mb-4">
                <label
                    for="description_short"
                    class="block text-gray-700 text-sm font-bold mb-2"
                >
                    简短描述:
                </label>
                <textarea
                    id="description_short"
                    v-model="currentItem.description_short"
                    class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-stone-500 h-24"
                    placeholder="请输入简短描述 (用于列表页卡片)"
                    required
                ></textarea>
            </div>
            <div class="mb-4">
                <label
                    for="description_full"
                    class="block text-gray-700 text-sm font-bold mb-2"
                >
                    完整茶知识内容 (支持Markdown):
                </label>
                <textarea
                    id="description_full"
                    v-model="currentItem.description_full"
                    class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-stone-500 h-48"
                    placeholder="请输入完整的茶知识详情，支持 Markdown 格式"
                    required
                ></textarea>
            </div>

            <div class="mb-4">
                <label
                    for="imageUpload"
                    class="block text-gray-700 text-sm font-bold mb-2"
                >
                    图片:
                </label>
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
                >
                    图片预览:
                </label>
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

            <div class="mb-4">
                <label
                    for="origin"
                    class="block text-gray-700 text-sm font-bold mb-2"
                >
                    产地:
                </label>
                <region-selects
                    v-model="selectedOrigin"
                    @change="handleRegionChange"
                    class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-stone-500"
                ></region-selects>
            </div>
            <div class="mb-4">
                <label
                    for="appearance"
                    class="block text-gray-700 text-sm font-bold mb-2"
                >
                    茶叶外形:
                </label>
                <input
                    type="text"
                    id="appearance"
                    v-model="currentItem.appearance"
                    class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-stone-500"
                    placeholder="请输入茶叶外形描述"
                />
            </div>
            <div class="mb-4">
                <label
                    for="liquorColor"
                    class="block text-gray-700 text-sm font-bold mb-2"
                >
                    汤色 (逗号分隔):
                </label>
                <textarea
                    id="liquorColor"
                    v-model="liquorColorInput"
                    class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-stone-500 h-24"
                    placeholder="例如: 橙黄, 明亮, 清澈"
                ></textarea>
            </div>
            <div class="mb-4">
                <label
                    for="infusedLeaves"
                    class="block text-gray-700 text-sm font-bold mb-2"
                >
                    叶底 (逗号分隔):
                </label>
                <textarea
                    id="infusedLeaves"
                    v-model="infusedLeavesInput"
                    class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-stone-500 h-24"
                    placeholder="例如: 匀齐, 软亮, 完整"
                ></textarea>
            </div>
            <div class="mb-4">
                <label
                    for="benefits"
                    class="block text-gray-700 text-sm font-bold mb-2"
                >
                    功效作用 (逗号分隔):
                </label>
                <textarea
                    id="benefits"
                    v-model="benefitsInput"
                    class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-stone-500 h-24"
                    placeholder="例如: 提神醒脑, 降脂减肥, 抗氧化"
                ></textarea>
            </div>
            <div class="mb-4">
                <label
                    for="brewingMethod"
                    class="block text-gray-700 text-sm font-bold mb-2"
                >
                    冲泡方法:
                </label>
                <quill-editor
                    v-model="currentItem.brewingMethod"
                    contentType="html"
                    :options="editorOption"
                    class="shadow appearance-none border rounded w-full text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-stone-500"
                    placeholder="请输入冲泡方法"
                ></quill-editor>
            </div>
            <div class="mb-4">
                <label
                    for="storageMethod"
                    class="block text-gray-700 text-sm font-bold mb-2"
                >
                    存储方法:
                </label>
                <input
                    type="text"
                    id="storageMethod"
                    v-model="currentItem.storageMethod"
                    class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-stone-500"
                    placeholder="请输入存储方法"
                />
            </div>
            <div class="mb-4">
                <label
                    for="suitableFor"
                    class="block text-gray-700 text-sm font-bold mb-2"
                >
                    适宜人群 (逗号分隔):
                </label>
                <textarea
                    id="suitableFor"
                    v-model="suitableForInput"
                    class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-stone-500 h-24"
                    placeholder="例如: 一般人群, 电脑工作者, 消化不良者"
                ></textarea>
            </div>
            <div class="mb-4">
                <label
                    for="notSuitableFor"
                    class="block text-gray-700 text-sm font-bold mb-2"
                >
                    禁忌人群 (逗号分隔):
                </label>
                <textarea
                    id="notSuitableFor"
                    v-model="notSuitableForInput"
                    class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-stone-500 h-24"
                    placeholder="例如: 孕妇, 胃寒者, 失眠者"
                ></textarea>
            </div>
            <div class="mb-4">
                <label
                    for="referencePrice"
                    class="block text-gray-700 text-sm font-bold mb-2"
                >
                    参考价格:
                </label>
                <input
                    type="number"
                    id="referencePrice"
                    v-model.number="currentItem.referencePrice"
                    class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-stone-500"
                    placeholder="请输入参考价格"
                />
            </div>
            <div class="mb-4">
                <label
                    for="grade"
                    class="block text-gray-700 text-sm font-bold mb-2"
                >
                    等级 (1-5星):
                </label>
                <input
                    type="number"
                    id="grade"
                    v-model.number="currentItem.grade"
                    min="1"
                    max="5"
                    class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-stone-500"
                    placeholder="请输入等级 (1-5)"
                />
            </div>
            <div class="mb-4">
                <label
                    for="shape"
                    class="block text-gray-700 text-sm font-bold mb-2"
                >
                    形状 (逗号分隔):
                </label>
                <textarea
                    id="shape"
                    v-model="shapeInput"
                    class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-stone-500 h-24"
                    placeholder="例如: 扁形, 针形, 卷曲形"
                ></textarea>
            </div>
            <div class="mb-4">
                <label
                    for="color"
                    class="block text-gray-700 text-sm font-bold mb-2"
                >
                    色泽 (逗号分隔):
                </label>
                <textarea
                    id="color"
                    v-model="colorInput"
                    class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-stone-500 h-24"
                    placeholder="例如: 翠绿, 黄绿, 墨绿"
                ></textarea>
            </div>
            <div class="mb-4">
                <label
                    for="aroma"
                    class="block text-gray-700 text-sm font-bold mb-2"
                >
                    香气 (逗号分隔):
                </label>
                <textarea
                    id="aroma"
                    v-model="aromaInput"
                    class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-stone-500 h-24"
                    placeholder="例如: 清香, 毫香, 花香"
                ></textarea>
            </div>
            <div class="mb-4">
                <label
                    for="taste"
                    class="block text-gray-700 text-sm font-bold mb-2"
                >
                    滋味 (逗号分隔):
                </label>
                <textarea
                    id="taste"
                    v-model="tasteInput"
                    class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-stone-500 h-24"
                    placeholder="例如: 鲜爽, 甘醇, 回甘"
                ></textarea>
            </div>
            <div class="mb-4">
                <label
                    for="productionProcess"
                    class="block text-gray-700 text-sm font-bold mb-2"
                >
                    制作工艺 (逗号分隔):
                </label>
                <textarea
                    id="productionProcess"
                    v-model="productionProcessInput"
                    class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-stone-500 h-24"
                    placeholder="例如: 杀青, 揉捻, 干燥"
                ></textarea>
            </div>

            <div class="flex space-x-4">
                <button
                    type="submit"
                    class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300"
                >
                    {{ isEditing ? "更新茶知识" : "新增茶知识" }}
                </button>
                <button
                    type="button"
                    @click="resetForm"
                    class="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300"
                >
                    取消/重置
                </button>
            </div>
        </form>

        <!-- 茶知识列表 -->
        <div class="p-4">
            <h3 class="text-xl font-semibold mb-4 text-gray-700">茶知识列表</h3>
            <div class="overflow-x-auto">
                <table class="min-w-full bg-white shadow-md rounded-lg">
                    <thead>
                        <tr class="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                            <th class="py-3 px-6 text-left">类别</th>
                            <th class="py-3 px-6 text-left">茶名称</th>
                            <th class="py-3 px-6 text-left">简短描述</th>
                            <th class="py-3 px-6 text-left">图片</th>
                            <th class="py-3 px-6 text-left">产地</th>
                            <th class="py-3 px-6 text-left">茶叶外形</th>
                            <th class="py-3 px-6 text-left">汤色</th>
                            <th class="py-3 px-6 text-left">叶底</th>
                            <th class="py-3 px-6 text-left">功效作用</th>
                            <th class="py-3 px-6 text-left">冲泡方法</th>
                            <th class="py-3 px-6 text-left">存储方法</th>
                            <th class="py-3 px-6 text-left">适宜人群</th>
                            <th class="py-3 px-6 text-left">禁忌人群</th>
                            <th class="py-3 px-6 text-left">参考价格</th>
                            <th class="py-3 px-6 text-left">等级</th>
                            <th class="py-3 px-6 text-left">形状</th>
                            <th class="py-3 px-6 text-left">色泽</th>
                            <th class="py-3 px-6 text-left">香气</th>
                            <th class="py-3 px-6 text-left">滋味</th>
                            <th class="py-3 px-6 text-left">制作工艺</th>
                            <th class="py-3 px-6 text-center">操作</th>
                        </tr>
                    </thead>
                    <tbody class="text-gray-600 text-sm font-light">
                        <tr
                            v-for="item in teaKnowledgeItems"
                            :key="item._id"
                            class="border-b border-gray-200 hover:bg-gray-100"
                        >
                            <td class="py-3 px-6 text-left whitespace-nowrap">
                                {{ getCategoryDescription(item.category) }}
                            </td>
                            <td class="py-3 px-6 text-left">
                                {{ item.name }}
                            </td>
                            <td class="py-3 px-6 text-left">
                                {{ item.description_short }}
                            </td>
                            <td class="py-3 px-6 text-left">
                                <img
                                    v-if="item.imageUrl"
                                    :src="getAbsoluteImageUrl(item.imageUrl)"
                                    alt="茶图片"
                                    class="w-16 h-16 object-cover rounded"
                                />
                                <span v-else>无图片</span>
                            </td>
                            <td class="py-3 px-6 text-left">
                                {{ item.origin }}
                            </td>
                            <td class="py-3 px-6 text-left">
                                {{ item.appearance }}
                            </td>
                            <td class="py-3 px-6 text-left">
                                {{ item.liquorColor ? item.liquorColor.join(", ") : "" }}
                            </td>
                            <td class="py-3 px-6 text-left">
                                {{ item.infusedLeaves ? item.infusedLeaves.join(", ") : "" }}
                            </td>
                            <td class="py-3 px-6 text-left">
                                {{ item.benefits ? item.benefits.join(", ") : "" }}
                            </td>
                            <td class="py-3 px-6 text-left" v-html="item.brewingMethod">
                            </td>
                            <td class="py-3 px-6 text-left">
                                {{ item.storageMethod }}
                            </td>
                            <td class="py-3 px-6 text-left">
                                {{ item.suitableFor ? item.suitableFor.join(", ") : "" }}
                            </td>
                            <td class="py-3 px-6 text-left">
                                {{ item.notSuitableFor ? item.notSuitableFor.join(", ") : "" }}
                            </td>
                            <td class="py-3 px-6 text-left">
                                {{ item.referencePrice }}
                            </td>
                            <td class="py-3 px-6 text-left">
                                {{ item.grade }}
                            </td>
                            <td class="py-3 px-6 text-left">
                                {{ item.shape ? item.shape.join(", ") : "" }}
                            </td>
                            <td class="py-3 px-6 text-left">
                                {{ item.color ? item.color.join(", ") : "" }}
                            </td>
                            <td class="py-3 px-6 text-left">
                                {{ item.aroma ? item.aroma.join(", ") : "" }}
                            </td>
                            <td class="py-3 px-6 text-left">
                                {{ item.taste ? item.taste.join(", ") : "" }}
                            </td>
                            <td class="py-3 px-6 text-left">
                                {{ item.productionProcess ? item.productionProcess.join(", ") : "" }}
                            </td>
                            <td class="py-3 px-6 text-center">
                                <div class="flex item-center justify-center">
                                    <button
                                        @click="editItem(item)"
                                        class="w-6 mr-2 transform hover:text-purple-500 hover:scale-110"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                stroke-linecap="round"
                                                stroke-linejoin="round"
                                                stroke-width="2"
                                                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                                            />
                                        </svg>
                                    </button>
                                    <button
                                        @click="deleteItem(item._id)"
                                        class="w-6 mr-2 transform hover:text-purple-500 hover:scale-110"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                stroke-linecap="round"
                                                stroke-linejoin="round"
                                                stroke-width="2"
                                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                            />
                                        </svg>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>

<script>
import { 
    getTeaKnowledgeList, 
    addTeaKnowledge, 
    updateTeaKnowledge, 
    deleteTeaKnowledge, 
    getDictionaryItems 
} from '@/api/admin';
import { RegionSelects } from "v-region"; // 导入 RegionSelects 组件

export default {
    name: "TeaKnowledgeAdmin",
    components: {
        RegionSelects, // 注册 RegionSelects 组件
    },
    data() {
        return {
            teaCategories: [],
            teaLevels: [],
            teaShapes: [],
            teaColors: [],
            teaAromas: [],
            teaTastes: [],
            teaProductionProcesses: [],
            currentItem: {
                _id: null, // 新增 _id 字段用于编辑时存储ID
                category: "",
                name: "",
                description_short: "",
                description_full: "",
                imageUrl: "", // 存储相对路径
                origin: "", // 修改为字符串，存储级联选择器组合后的文本
                appearance: "",
                liquorColor: [],
                infusedLeaves: [],
                benefits: [],
                brewingMethod: "", // 保持为字符串，Quill会处理HTML
                storageMethod: "",
                suitableFor: [],
                notSuitableFor: [],
                referencePrice: null,
                grade: null,
                shape: "",
                color: "",
                aroma: "",
                taste: "",
                productionProcess: [],
            },
            editorOption: {
                modules: {
                    toolbar: [
                        ["bold", "italic", "underline", "strike"],
                        ["blockquote", "code-block"],
                        [{ header: 1 }, { header: 2 }],
                        [{ list: "ordered" }, { list: "bullet" }],
                        [{ script: "sub" }, { script: "super" }],
                        [{ indent: "-1" }, { indent: "+1" }],
                        [{ direction: "rtl" }],
                        [{ size: ["small", false, "large", "huge"] }],
                        [{ header: [1, 2, 3, 4, 5, 6, false] }],
                        [{ color: [] }, { background: [] }],
                        [{ font: [] }],
                        [{ align: [] }],
                        ["clean"],
                        ["link", "image"],
                    ],
                },
            },
            imageFile: null,
            imagePreviewUrl: null,
            isEditing: false,
            teaKnowledgeItems: [],
            searchQuery: "",
            successMessage: null,
            error: null,
            liquorColorInput: "",
            infusedLeavesInput: "",
            benefitsInput: "",
            suitableForInput: "",
            notSuitableForInput: "",
            productionProcessInput: "",
            shapeInput: "",
            colorInput: "",
            aromaInput: "",
            tasteInput: "",
            selectedOrigin: { // 新增，用于v-region组件的v-model绑定
                province: {}, // Should be an object for v-region
                city: {},    // Should be an object for v-region
                area: {}     // Should be an object for v-region
            },
        };
    },
    mounted() {
        this.fetchTeaKnowledgeItems();
        this.fetchTeaCategories();
        this.fetchTeaLevels();
        this.fetchTeaShapes();
        this.fetchTeaColors();
        this.fetchTeaAromas();
        this.fetchTeaTastes();
        this.fetchTeaProductionProcesses();
    },
    methods: {
        handleRegionChange(data) {
            // 将选择的地区组合成一个字符串，存储到currentItem.origin
            // data.province, data.city, data.area 包含了 name 和 value 属性
            // 我们存储 value，例如 '110000', '110100', '110101'
            const selectedParts = [
                data.province && data.province.value ? data.province.value : '',
                data.city && data.city.value ? data.city.value : '',
                data.area && data.area.value ? data.area.value : ''
            ].filter(Boolean);
            this.currentItem.origin = selectedParts.join('-');
        },
        getAbsoluteImageUrl(relativePath) {
            if (!relativePath) return "";
            // 如果已经是完整的 URL (例如 blob: 或 data: 或 http/https)
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
        getCategoryDescription(value) {
            const category = this.teaCategories.find(cat => cat.value === value);
            return category ? category.description : value;
        },
        async fetchTeaCategories() {
            try {
                const response = await getDictionaryItems({ type: 'tea_category' });
                this.teaCategories = response.data; // 统一返回体，实际数据在 data 字段下
                this.successMessage = response.message; // 获取成功消息
            } catch (err) {
                console.error("获取茶叶类别失败:", err.message);
                this.error = err.message || "获取茶叶类别失败。";
            }
        },
        async fetchTeaLevels() {
            try {
                const response = await getDictionaryItems({ type: 'tea_level' });
                this.teaLevels = response.data; // 统一返回体，实际数据在 data 字段下
                this.successMessage = response.message; // 获取成功消息
            } catch (err) {
                console.error("获取茶叶等级失败:", err.message);
                this.error = err.message || "获取茶叶等级失败。";
            }
        },
        async fetchTeaShapes() {
            try {
                const response = await getDictionaryItems({ type: 'tea_shape' });
                this.teaShapes = response.data; // 统一返回体，实际数据在 data 字段下
                this.successMessage = response.message; // 获取成功消息
            } catch (err) {
                console.error("获取茶叶形状失败:", err.message);
                this.error = err.message || "获取茶叶形状失败。";
            }
        },
        async fetchTeaColors() {
            try {
                const response = await getDictionaryItems({ type: 'tea_color' });
                this.teaColors = response.data; // 统一返回体，实际数据在 data 字段下
                this.successMessage = response.message; // 获取成功消息
            } catch (err) {
                console.error("获取茶叶色泽失败:", err.message);
                this.error = err.message || "获取茶叶色泽失败。";
            }
        },
        async fetchTeaAromas() {
            try {
                const response = await getDictionaryItems({ type: 'tea_aroma' });
                this.teaAromas = response.data; // 统一返回体，实际数据在 data 字段下
                this.successMessage = response.message; // 获取成功消息
            } catch (err) {
                console.error("获取茶叶香气失败:", err.message);
                this.error = err.message || "获取茶叶香气失败。";
            }
        },
        async fetchTeaTastes() {
            try {
                const response = await getDictionaryItems({ type: 'tea_taste' });
                this.teaTastes = response.data; // 统一返回体，实际数据在 data 字段下
                this.successMessage = response.message; // 获取成功消息
            } catch (err) {
                console.error("获取茶叶滋味失败:", err.message);
                this.error = err.message || "获取茶叶滋味失败。";
            }
        },
        async fetchTeaProductionProcesses() {
            try {
                const response = await getDictionaryItems({ type: 'tea_production_process' });
                this.teaProductionProcesses = response.data; // 统一返回体，实际数据在 data 字段下
                this.successMessage = response.message; // 获取成功消息
            } catch (err) {
                console.error("获取茶叶制作工艺失败:", err.message);
                this.error = err.message || "获取茶叶制作工艺失败。";
            }
        },
        async fetchTeaKnowledgeItems() {
            try {
                const response = await getTeaKnowledgeList();
                this.teaKnowledgeItems = response.data; // 统一返回体，实际数据在 data 字段下
                this.successMessage = response.message; // 获取成功消息
            } catch (err) {
                console.error("获取茶知识列表失败:", err.message);
                this.error = err.message || "获取茶知识列表失败。";
            }
        },
        handleFileChange(event) {
            const file = event.target.files[0];
            if (file) {
                this.imageFile = file;
                this.imagePreviewUrl = URL.createObjectURL(file);
            } else {
                this.imageFile = null;
                this.imagePreviewUrl = null;
            }
        },
        removeImage() {
            this.imageFile = null;
            this.imagePreviewUrl = null;
            this.currentItem.imageUrl = ""; // 清除现有图片URL
            // 清空文件输入框
            const fileInput = document.getElementById("imageUpload");
            if (fileInput) {
                fileInput.value = "";
            }
        },
        async addItem() {
            this.error = null;
            this.successMessage = null;
            try {
                const formData = new FormData();

                // 统一处理多标签字段，转为JSON字符串或空数组
                const toArrayOrEmpty = (input) => {
                    const arr = input.split(',').map(s => s.trim()).filter(s => s);
                    return JSON.stringify(arr);
                };

                formData.append("category", this.currentItem.category);
                formData.append("name", this.currentItem.name);
                formData.append("description_short", this.currentItem.description_short);
                formData.append("description_full", this.currentItem.description_full);
                formData.append("origin", this.currentItem.origin); // 使用级联选择器处理后的产地
                formData.append("appearance", this.currentItem.appearance || "");
                formData.append("liquorColor", toArrayOrEmpty(this.liquorColorInput));
                formData.append("infusedLeaves", toArrayOrEmpty(this.infusedLeavesInput));
                formData.append("benefits", toArrayOrEmpty(this.benefitsInput));
                formData.append("brewingMethod", this.currentItem.brewingMethod);
                formData.append("storageMethod", this.currentItem.storageMethod || "");
                formData.append("suitableFor", toArrayOrEmpty(this.suitableForInput));
                formData.append("notSuitableFor", toArrayOrEmpty(this.notSuitableForInput));
                formData.append("productionProcess", toArrayOrEmpty(this.productionProcessInput));
                formData.append("referencePrice", this.currentItem.referencePrice || "");
                formData.append("grade", this.currentItem.grade || 0);
                formData.append("shape", toArrayOrEmpty(this.shapeInput));
                formData.append("color", toArrayOrEmpty(this.colorInput));
                formData.append("aroma", toArrayOrEmpty(this.aromaInput));
                formData.append("taste", toArrayOrEmpty(this.tasteInput));

                if (this.imageFile) {
                    formData.append("image", this.imageFile);
                } else if (this.currentItem.imageUrl) {
                    formData.append("imageUrl", this.currentItem.imageUrl);
                } else {
                    formData.append("imageUrl", "");
                }

                const response = await addTeaKnowledge(formData); // 使用封装的 API

                this.successMessage = response.message; // 统一返回体中的 message
                this.resetForm();
                this.fetchTeaKnowledgeItems();
            } catch (err) {
                console.error("新增茶知识失败:", err.message);
                this.error = err.message || "新增茶知识失败。";
            }
        },
        editItem(item) {
            this.isEditing = true;
            this.currentItem = { ...item };
            this.currentItem._id = item._id; // 确保_id被复制

            // 将数组字段转换回逗号分隔的字符串，以便在 textarea 中显示
            this.liquorColorInput = item.liquorColor ? item.liquorColor.join(", ") : "";
            this.infusedLeavesInput = item.infusedLeaves ? item.infusedLeaves.join(", ") : "";
            this.benefitsInput = item.benefits ? item.benefits.join(", ") : "";
            this.suitableForInput = item.suitableFor ? item.suitableFor.join(", ") : "";
            this.notSuitableForInput = item.notSuitableFor ? item.notSuitableFor.join(", ") : "";
            this.productionProcessInput = item.productionProcess ? item.productionProcess.join(", ") : "";
            this.shapeInput = item.shape ? item.shape.join(", ") : "";
            this.colorInput = item.color ? item.color.join(", ") : "";
            this.aromaInput = item.aroma ? item.aroma.join(", ") : "";
            this.tasteInput = item.taste ? item.taste.join(", ") : "";

            // 初始化selectedOrigin用于级联选择器
            if (item.origin) {
                const parts = String(item.origin).split('-');
                this.selectedOrigin.province = parts[0] ? { value: parts[0], name: '' } : {};
                this.selectedOrigin.city = parts[1] ? { value: parts[1], name: '' } : {};
                this.selectedOrigin.area = parts[2] ? { value: parts[2], name: '' } : {};
            } else {
                this.selectedOrigin = { province: {}, city: {}, area: {} };
            }

            this.imagePreviewUrl = item.imageUrl ? this.getAbsoluteImageUrl(item.imageUrl) : null;
            this.imageFile = null; // 清空图片文件，防止重新提交时带上旧文件
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
                const formData = new FormData();

                const toArrayOrEmpty = (input) => {
                    const arr = input.split(',').map(s => s.trim()).filter(s => s);
                    return JSON.stringify(arr);
                };

                formData.append("category", this.currentItem.category);
                formData.append("name", this.currentItem.name);
                formData.append("description_short", this.currentItem.description_short);
                formData.append("description_full", this.currentItem.description_full);
                formData.append("origin", this.currentItem.origin); // 使用级联选择器处理后的产地
                formData.append("appearance", this.currentItem.appearance || "");
                formData.append("liquorColor", toArrayOrEmpty(this.liquorColorInput));
                formData.append("infusedLeaves", toArrayOrEmpty(this.infusedLeavesInput));
                formData.append("benefits", toArrayOrEmpty(this.benefitsInput));
                formData.append("brewingMethod", this.currentItem.brewingMethod);
                formData.append("storageMethod", this.currentItem.storageMethod || "");
                formData.append("suitableFor", toArrayOrEmpty(this.suitableForInput));
                formData.append("notSuitableFor", toArrayOrEmpty(this.notSuitableForInput));
                formData.append("productionProcess", toArrayOrEmpty(this.productionProcessInput));
                formData.append("referencePrice", this.currentItem.referencePrice || "");
                formData.append("grade", this.currentItem.grade || 0);
                formData.append("shape", toArrayOrEmpty(this.shapeInput));
                formData.append("color", toArrayOrEmpty(this.colorInput));
                formData.append("aroma", toArrayOrEmpty(this.aromaInput));
                formData.append("taste", toArrayOrEmpty(this.tasteInput));

                if (this.imageFile) {
                    formData.append("image", this.imageFile);
                } else if (this.currentItem.imageUrl === "") {
                    // 如果图片被移除（imageUrl清空），则明确发送一个指示给后端
                    formData.append("removeImage", "true");
                } else {
                    // 如果没有新文件，且 imageUrl 存在，则发送旧的 imageUrl
                    formData.append("imageUrl", this.currentItem.imageUrl);
                }

                const response = await updateTeaKnowledge(this.currentItem._id, formData); // 使用封装的 API

                this.successMessage = response.message; // 统一返回体中的 message
                this.resetForm();
                this.fetchTeaKnowledgeItems();
            } catch (err) {
                console.error("更新茶知识失败:", err.message);
                this.error = err.message || "更新茶知识失败。";
            }
        },
        async deleteItem(id) {
            if (confirm("确定要删除此茶知识吗？")) {
                this.error = null;
                this.successMessage = null;
                try {
                    const response = await deleteTeaKnowledge(id); // 使用封装的 API
                    this.successMessage = response.message; // 统一返回体中的 message
                    this.fetchTeaKnowledgeItems();
                } catch (err) {
                    console.error("删除茶知识失败:", err.message);
                    this.error = err.message || "删除茶知识失败。";
                }
            }
        },
        resetForm() {
            this.isEditing = false;
            this.currentItem = {
                _id: null,
                category: "",
                name: "",
                description_short: "",
                description_full: "",
                imageUrl: "",
                origin: "",
                appearance: "",
                liquorColor: [],
                infusedLeaves: [],
                benefits: [],
                brewingMethod: "",
                storageMethod: "",
                suitableFor: [],
                notSuitableFor: [],
                referencePrice: null,
                grade: null,
                shape: "",
                color: "",
                aroma: "",
                taste: "",
                productionProcess: [],
            };
            this.imageFile = null;
            this.imagePreviewUrl = null;
            this.liquorColorInput = "";
            this.infusedLeavesInput = "";
            this.benefitsInput = "";
            this.suitableForInput = "";
            this.notSuitableForInput = "";
            this.productionProcessInput = "";
            this.shapeInput = "";
            this.colorInput = "";
            this.aromaInput = "";
            this.tasteInput = "";
            this.selectedOrigin = { province: {}, city: {}, area: {} }; // 重置级联选择器状态
            const fileInput = document.getElementById("imageUpload");
            if (fileInput) {
                fileInput.value = "";
            }
            this.successMessage = null;
            this.error = null;
        },
    },
};
</script>