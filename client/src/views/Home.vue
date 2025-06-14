<template>
    <div class="home-container w-full max-w-screen-xl mx-auto py-8 px-4">
        <!-- 轮播图区域 -->
        <section class="carousel-section mb-10">
            <h2
                class="text-3xl font-bold text-gray-800 mb-6 text-center font-noto-serif-sc"
            >
                茶之韵：品味东方
            </h2>
            <div
                class="relative w-full overflow-hidden rounded-lg shadow-lg"
                style="height: 400px"
            >
                <!-- 轮播图内容 -->
                <template v-for="(item, index) in carouselItems">
                    <a
                        v-if="item.linkUrl"
                        :key="`link-${item._id}`"
                        :href="getCarouselLink(item.linkUrl)"
                        target="_blank"
                        class="w-full h-full block absolute inset-0 transition-opacity duration-500 z-10"
                        :class="{
                            'opacity-100': currentCarouselIndex === index,
                            'opacity-0': currentCarouselIndex !== index,
                        }"
                    >
                        <img
                            :src="getAbsoluteImageUrl(item.imageUrl)"
                            :alt="item.title"
                            class="w-full h-full object-cover"
                        />
                    </a>
                    <img
                        v-else
                        :key="`img-${item._id}`"
                        :src="getAbsoluteImageUrl(item.imageUrl)"
                        :alt="item.title"
                        :class="{
                            'opacity-100': currentCarouselIndex === index,
                            'opacity-0': currentCarouselIndex !== index,
                        }"
                        class="w-full h-full object-cover absolute inset-0 transition-opacity duration-500"
                    />
                </template>
                <div
                    v-if="carouselItems.length > 0"
                    class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-8 text-white z-0"
                >
                    <h3 class="text-4xl font-bold font-noto-serif-sc">
                        {{ carouselItems[currentCarouselIndex].title }}
                    </h3>
                </div>
                <!-- 轮播指示器 -->
                <div
                    v-if="carouselItems.length > 1"
                    class="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20"
                >
                    <span
                        v-for="(item, index) in carouselItems"
                        :key="`indicator-${index}`"
                        @click="currentCarouselIndex = index"
                        :class="{
                            'bg-stone-500': currentCarouselIndex === index,
                            'bg-gray-300': currentCarouselIndex !== index,
                        }"
                        class="w-3 h-3 rounded-full cursor-pointer transition-colors duration-300"
                    ></span>
                </div>
            </div>
        </section>

        <!-- 海报图/特色产品区域 -->
        <section
            class="poster-section mb-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
            <div
                v-for="poster in posters"
                :key="poster._id"
                class="relative overflow-hidden rounded-lg shadow-md group h-64"
            >
                <a
                    v-if="poster.linkUrl"
                    :href="getPosterLink(poster.linkUrl)"
                    target="_blank"
                    class="w-full h-full block absolute inset-0 z-10"
                >
                    <img
                        :src="getAbsoluteImageUrl(poster.imageUrl)"
                        :alt="poster.title"
                        class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                </a>
                <img
                    v-else
                    :src="getAbsoluteImageUrl(poster.imageUrl)"
                    :alt="poster.title"
                    class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div
                    class="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0"
                >
                    <h3
                        class="text-2xl font-bold text-white font-noto-serif-sc"
                    >
                        {{ poster.title }}
                    </h3>
                </div>
            </div>
        </section>

        <!-- Tab 栏目切换卡片列表区域 -->
        <section class="tabs-section">
            <h2
                class="text-3xl font-bold text-gray-800 mb-6 text-center font-noto-serif-sc"
            >
                精选茗茶
            </h2>
            <div class="flex justify-center mb-6 border-b border-gray-200">
                <button
                    v-for="cat in categories"
                    :key="cat.value"
                    @click="activeTab = cat.value"
                    :class="{
                        'border-b-2 border-stone-500 text-stone-700':
                            activeTab === cat.value,
                        'text-gray-500 hover:text-gray-700':
                            activeTab !== cat.value,
                    }"
                    class="py-3 px-6 font-semibold focus:outline-none transition-colors duration-200"
                >
                    {{ cat.text }}
                </button>
            </div>

            <div
                class="card-list grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
            >
                <div
                    v-for="tea in filteredProducts"
                    :key="tea._id"
                    class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                >
                    <img
                        :src="tea.imageUrl"
                        :alt="tea.name"
                        class="w-full h-48 object-cover"
                    />
                    <div class="p-4">
                        <h3 class="font-bold text-lg mb-2 font-noto-serif-sc">
                            {{ tea.name }}
                        </h3>
                        <p class="text-gray-600 text-sm mb-2">
                            {{ tea.description }}
                        </p>
                        <span class="font-bold text-stone-700"
                            >¥{{ tea.price }}</span
                        >
                    </div>
                </div>
                <div
                    v-if="filteredProducts.length === 0"
                    class="col-span-full text-center text-gray-500"
                >
                    暂无相关茶品。
                </div>
            </div>
        </section>
    </div>
</template>

<script>
import { getCarouselItemsPublic, getPosterItemsPublic, getProductsPublic } from '@/api/public';

export default {
    name: "Home",
    data() {
        return {
            activeTab: "green", // 默认激活的 Tab
            carouselItems: [],
            posters: [],
            products: [],
            currentCarouselIndex: 0, // 当前轮播图索引
            carouselInterval: null, // 轮播图自动播放的定时器
            categories: [
                { value: "green", text: "绿茶" },
                { value: "black", text: "红茶" },
                { value: "oolong", text: "乌龙茶" },
                { value: "white", text: "白茶" },
                { value: "dark", text: "黑茶" },
                { value: "flower", text: "花草茶" },
                { value: "puer", text: "普洱茶" },
                { value: "yellow", text: "黄茶" },
                { value: "reprocessed", text: "再加工茶" },
                { value: "substitute", text: "代用茶" },
            ], // 与ProductAdmin.vue保持一致
        };
    },
    computed: {
        filteredProducts() {
            return this.products.filter(
                (product) => product.category === this.activeTab
            );
        },
    },
    methods: {
        // Helper to get absolute image URL
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
        // Helper to get carousel item link
        getCarouselLink(linkUrl) {
            if (!linkUrl) return "#"; // Return a non-actionable link if empty
            if (
                linkUrl.startsWith("http://") ||
                linkUrl.startsWith("https://")
            ) {
                return linkUrl;
            }
            return linkUrl ? `http://localhost:5000${linkUrl}` : "#";
        },
        // Helper to get poster item link
        getPosterLink(linkUrl) {
            if (!linkUrl) return "#";
            if (
                linkUrl.startsWith("http://") ||
                linkUrl.startsWith("https://")
            ) {
                return linkUrl;
            }
            return linkUrl ? `http://localhost:5000${linkUrl}` : "#";
        },
        // Helper to get category text for display
        getCategoryText(value) {
            const category = this.categories.find((cat) => cat.value === value);
            return category ? category.text : value;
        },
        async fetchCarouselItems() {
            try {
                const response = await getCarouselItemsPublic();
                this.carouselItems = response.data;
                if (this.carouselItems.length > 1) {
                    this.startCarouselAutoPlay();
                }
            } catch (err) {
                console.error("获取轮播图失败:", err.message);
            }
        },
        async fetchPosters() {
            try {
                const response = await getPosterItemsPublic();
                this.posters = response.data;
            } catch (err) {
                console.error("获取海报图失败:", err.message);
            }
        },
        async fetchProducts() {
            try {
                const response = await getProductsPublic();
                this.products = response.data;
            } catch (err) {
                console.error("获取产品列表失败:", err.message);
            }
        },
        startCarouselAutoPlay() {
            this.carouselInterval = setInterval(() => {
                this.currentCarouselIndex = (
                    this.currentCarouselIndex + 1
                ) % this.carouselItems.length;
            }, 5000); // 每 5 秒切换一次
        },
        stopCarouselAutoPlay() {
            if (this.carouselInterval) {
                clearInterval(this.carouselInterval);
                this.carouselInterval = null;
            }
        },
    },
    created() {
        this.fetchCarouselItems();
        this.fetchPosters();
        this.fetchProducts();
    },
    beforeUnmount() {
        this.stopCarouselAutoPlay();
    },
};
</script>

<style scoped>
/* 可以添加 Home 组件特有的样式 */
</style>
