<template>
    <div class="p-8">
        <h1 class="text-4xl font-bold mb-8 text-center text-gray-800">
            所有茗茶
        </h1>
        <div v-if="loading" class="text-center text-gray-600">
            正在加载茶品...
        </div>
        <div v-else-if="error" class="text-center text-red-500">
            加载茶品失败: {{ error }}
        </div>
        <div v-else>
            <div
                v-for="(productsInCategory, category) in groupedProducts"
                :key="category"
                class="mb-10"
            >
                <h2
                    class="text-3xl font-bold mb-6 text-gray-700 border-b-2 border-stone-300 pb-2"
                >
                    {{ getCategoryChineseName(category) }}
                </h2>
                <div
                    class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
                >
                    <div
                        v-for="product in productsInCategory"
                        :key="product._id"
                        class="bg-white rounded-lg shadow-md overflow-hidden transform transition duration-300 hover:scale-105"
                    >
                        <router-link :to="`/product/${product._id}`">
                            <img
                                :src="getImageSrc(product.image_url)"
                                alt="产品图片"
                                class="w-full h-48 object-cover"
                            />
                        </router-link>
                        <div class="p-4">
                            <h3
                                class="font-semibold text-lg mb-2 text-gray-800"
                            >
                                {{ product.name }}
                            </h3>
                            <p class="text-gray-600 text-sm mb-2">
                                {{ product.description | truncate(50) }}
                            </p>
                            <p class="font-bold text-lg text-stone-700">
                                ¥{{ product.price.toFixed(2) }}
                            </p>
                            <p class="text-sm text-gray-500">
                                库存: {{ product.stock }}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import axios from "axios";

export default {
    name: "AllTeas",
    data() {
        return {
            products: [],
            loading: true,
            error: null,
        };
    },
    computed: {
        groupedProducts() {
            const grouped = {};
            this.products.forEach((product) => {
                if (!grouped[product.category]) {
                    grouped[product.category] = [];
                }
                grouped[product.category].push(product);
            });
            return grouped;
        },
    },
    filters: {
        truncate(value, length) {
            if (value.length > length) {
                return value.substring(0, length) + "...";
            } else {
                return value;
            }
        },
    },
    created() {
        this.fetchProducts();
    },
    methods: {
        async fetchProducts() {
            try {
                const response = await axios.get(
                    "http://localhost:5000/api/products"
                );
                this.products = response.data;
                this.loading = false;
            } catch (err) {
                console.error("Error fetching products:", err);
                this.error = "无法加载茶品，请稍后再试。";
                this.loading = false;
            }
        },
        getCategoryChineseName(category) {
            const categoryMap = {
                green: "绿茶",
                black: "红茶",
                oolong: "乌龙茶",
                white: "白茶",
                yellow: "黄茶",
                dark: "黑茶",
                flower: "花草茶",
                herbal: "养生茶",
            };
            return categoryMap[category] || category;
        },
        getImageSrc(imageUrl) {
            if (
                imageUrl &&
                (imageUrl.startsWith("http://") ||
                    imageUrl.startsWith("https://"))
            ) {
                return imageUrl;
            } else if (imageUrl) {
                return `http://localhost:5000${imageUrl}`;
            } else {
                return "/path/to/default-image.jpg"; // 默认图片路径
            }
        },
    },
};
</script>

<style scoped>
/* 可以在这里添加 AllTeas 组件特有的样式 */
</style>
