<template>
    <section class="four-grid-section mb-10">
        <h2 class="text-3xl font-bold text-gray-800 mb-6 text-center font-noto-serif-sc">
            优选分类
        </h2>
        <div class="grid grid-cols-2 rounded-lg shadow-lg">
            <!-- 遍历 featuredCategories -->
            <div
                v-for="(category, index) in featuredCategories"
                :key="category._id"
                :class="{
                    'rounded-tl-lg': index === 0,
                    'rounded-tr-lg': index === 1,
                    'rounded-bl-lg': index === 2,
                    'rounded-br-lg': index === 3,
                }"
                class="bg-white overflow-hidden transition-shadow duration-300 border border-gray-300 relative h-48 md:h-64"
            >
                <a :href="category.link" target="_blank" class="absolute inset-0 z-10 flex flex-col p-4">
                    <!-- Text (name and description) part - aligns to top-left -->
                    <div class="flex items-center self-start w-full mb-2">
                        <h4 class="font-bold text-lg text-gray-700">{{ category.name }}</h4>
                        <span v-if="category.description" class="ml-2.5 text-sm font-medium gradient-text">{{ category.description }}</span>
                    </div>
                    <!-- Image part - will be pushed to the bottom and centered horizontally -->
                    <div class="flex items-center justify-center gap-x-2.5 mt-auto w-full" style="height: 11.5rem;">
                        <img
                            v-if="category.imageUrls && category.imageUrls.length > 0"
                            :src="getAbsoluteImageUrl(category.imageUrls[0])"
                            :alt="category.name + '图片1'"
                            class="w-1/2 max-h-full object-contain rounded-lg"
                        >
                        <img
                            v-if="category.imageUrls && category.imageUrls.length > 1"
                            :src="getAbsoluteImageUrl(category.imageUrls[1])"
                            :alt="category.name + '图片2'"
                            class="w-1/2 max-h-full object-contain rounded-lg"
                        >
                    </div>
                </a>
            </div>
            <div
                v-if="featuredCategories.length === 0"
                class="col-span-2 text-center text-gray-500 p-6"
            >
                暂无优选分类。
            </div>
        </div>
    </section>
</template>

<script>
export default {
    name: 'FourGridSection',
    props: {
        featuredCategories: {
            type: Array,
            default: () => [],
        },
    },
    methods: {
        getAbsoluteImageUrl(relativePath) {
            // 确保图片路径是绝对的，以便前端能够正确加载
            if (relativePath && !relativePath.startsWith('http') && !relativePath.startsWith('/')) {
                return `/${relativePath}`;
            }
            return relativePath;
        },
    },
};
</script>

<style scoped>
.gradient-text {
  background-image: linear-gradient(to bottom, #a78bfa, #f472b6); /* Example: purple to pink */
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
</style> 