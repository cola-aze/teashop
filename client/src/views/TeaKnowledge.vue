
<template>
    <div
        class="tea-knowledge-container p-8 max-w-screen-xl mx-auto bg-white shadow-lg rounded-lg my-8"
    >
        <h1
            class="text-4xl font-bold text-center text-gray-800 mb-10 font-noto-serif-sc"
        >
            茶知识百科
        </h1>

        <div v-if="loading" class="text-center text-gray-600">
            正在加载茶知识...
        </div>
        <div v-else-if="error" class="text-center text-red-500">
            加载茶知识失败: {{ error }}
        </div>
        <div v-else-if="Object.keys(groupedTeaKnowledge).length === 0" class="text-center text-gray-600">
            暂无茶知识数据。
        </div>
        <section
            v-for="(categoryData, categoryValue) in groupedTeaKnowledge"
            :key="categoryValue"
            class="mb-12"
        >
            <h2
                class="text-3xl font-bold text-stone-700 mb-6 border-b-2 border-stone-300 pb-3"
            >
                {{ getCategoryDescription(categoryValue) }}
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <h3 class="text-xl font-semibold text-gray-800 mb-3">
                        特点
                    </h3>
                    <p class="text-gray-600 leading-relaxed">
                        {{ categoryData.features || '暂无特点描述' }}
                    </p>
                </div>
                <div>
                    <h3 class="text-xl font-semibold text-gray-800 mb-3">
                        功效
                    </h3>
                    <ul
                        class="list-disc list-inside text-gray-600 leading-relaxed"
                        v-if="categoryData.benefits && categoryData.benefits.length > 0"
                    >
                        <li
                            v-for="(effect, idx) in categoryData.benefits"
                            :key="idx"
                        >
                            {{ effect }}
                        </li>
                    </ul>
                    <p v-else class="text-gray-600 leading-relaxed">暂无功效信息。</p>
                </div>
                <div>
                    <h3 class="text-xl font-semibold text-gray-800 mb-3">
                        适宜人群
                    </h3>
                    <ul
                        class="list-disc list-inside text-gray-600 leading-relaxed"
                        v-if="categoryData.suitableFor && categoryData.suitableFor.length > 0"
                    >
                        <li
                            v-for="(group, idx) in categoryData.suitableFor"
                            :key="idx"
                        >
                            {{ group }}
                        </li>
                    </ul>
                    <p v-else class="text-gray-600 leading-relaxed">暂无适宜人群信息。</p>
                </div>
            </div>
            <div
                v-if="categoryData.examples && categoryData.examples.length > 0"
                class="mt-6"
            >
                <h3 class="text-xl font-semibold text-gray-800 mb-3">
                    代表茶品
                </h3>
                <div class="flex flex-wrap gap-x-6 gap-y-2 text-gray-700">
                    <span
                        v-for="(tea, idx) in categoryData.examples"
                        :key="idx"
                        class="bg-stone-100 px-3 py-1 rounded-full text-sm"
                    >
                        {{ tea }}
                    </span>
                </div>
            </div>
            <div v-else class="mt-6 text-gray-600">暂无代表茶品。</div>
        </section>

        <section class="mt-12 text-center text-gray-500 text-sm">
            <p>
                内容参考自
                <a
                    href="https://baike.lingyaai.cn/zaijiagongcha/"
                    target="_blank"
                    class="text-stone-500 hover:underline"
                    >灵芽百科</a
                >
            </p>
        </section>
    </div>
</template>

<script>
import { getTeaKnowledgeListPublic, getDictionaryItemsPublic } from '@/api/public';

export default {
    name: "TeaKnowledge",
    data() {
        return {
            teaKnowledgeItems: [], // 存储从后端获取的茶知识列表
            teaCategoriesOptions: [], // 存储从字典获取的茶类别选项
            error: null,
            loading: true,
        };
    },
    computed: {
        groupedTeaKnowledge() {
            const grouped = {};
            this.teaKnowledgeItems.forEach(item => {
                const category = item.category;
                if (!grouped[category]) {
                    grouped[category] = {
                        features: '', // 后端TeaKnowledge模型没有直接的features字段
                        benefits: [],
                        suitableFor: [],
                        examples: [],
                        // 考虑添加其他需要聚合的字段
                    };
                }

                // 聚合每个类别下的茶知识数据
                if (item.description_short && !grouped[category].features) {
                    // 假设description_short可以作为特点，只取第一个
                    grouped[category].features = item.description_short;
                }
                if (item.benefits && item.benefits.length > 0) {
                    grouped[category].benefits.push(...item.benefits);
                }
                if (item.suitableFor && item.suitableFor.length > 0) {
                    grouped[category].suitableFor.push(...item.suitableFor);
                }
                if (item.name) {
                    grouped[category].examples.push(item.name);
                }
                // 去重
                grouped[category].benefits = [...new Set(grouped[category].benefits)];
                grouped[category].suitableFor = [...new Set(grouped[category].suitableFor)];
                grouped[category].examples = [...new Set(grouped[category].examples)];
            });

            // 如果需要按特定顺序显示类别，可以在这里对 grouped 对象进行排序
            // 例如，按照 teaCategoriesOptions 的顺序
            const sortedGrouped = {};
            this.teaCategoriesOptions.forEach(option => {
                if (grouped[option.value]) {
                    sortedGrouped[option.value] = grouped[option.value];
                }
            });

            return sortedGrouped;
        },
    },
    created() {
        this.fetchTeaCategoriesOptions();
        this.fetchTeaKnowledgeItems();
    },
    methods: {
        async fetchTeaCategoriesOptions() {
            try {
                const response = await getDictionaryItemsPublic({ type: 'tea_category' });
                this.teaCategoriesOptions = response.data;
            } catch (err) {
                console.error("获取茶类别选项失败:", err.message);
                this.error = err.message || "获取茶类别失败。";
            }
        },
        async fetchTeaKnowledgeItems() {
            this.loading = true;
            try {
                const response = await getTeaKnowledgeListPublic();
                this.teaKnowledgeItems = response.data;
                this.loading = false;
            } catch (err) {
                console.error("获取茶知识列表失败:", err.message);
                this.error = err.message || "获取茶知识失败，请稍后再试。";
                this.loading = false;
            }
        },
        getCategoryDescription(categoryValue) {
            const category = this.teaCategoriesOptions.find(cat => cat.value === categoryValue);
            return category ? category.description : categoryValue;
        },
        getAbsoluteImageUrl(relativePath) {
            if (!relativePath) return "";
            if (
                relativePath.startsWith("http://") ||
                relativePath.startsWith("https://")
            ) {
                return relativePath;
            }
            return `http://localhost:5000${relativePath}`;
        },
    },
};
</script>

<style scoped>
.tea-knowledge-container {
    font-family: "Noto Serif SC", serif;
}
</style>
