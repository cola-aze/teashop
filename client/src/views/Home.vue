<template>
  <div class="home-container w-full max-w-screen-xl mx-auto py-8 px-4">
      <!-- 轮播图区域 -->
      <section class="carousel-section mb-10">
          <div
              class="relative w-full overflow-hidden rounded-lg shadow-lg"
              style="height: 400px"
              @touchstart="handleTouchStart"
              @touchmove="handleTouchMove"
              @touchend="handleTouchEnd"
          >
              <!-- 轮播图内容容器 -->
              <div
                  class="carousel-inner flex h-full transition-transform duration-500 ease-in-out"
                  :style="{ transform: `translateX(-${currentCarouselIndex * 100}%)` }"
              >
                  <template v-for="item in carouselItems">
                      <a
                          v-if="item.linkUrl"
                          :key="`link-${item._id}`"
                          :href="getCarouselLink(item.linkUrl)"
                          target="_blank"
                          class="flex-shrink-0 w-full h-full block"
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
                          class="flex-shrink-0 w-full h-full object-cover"
                      />
                  </template>
              </div>
              <div
                  v-if="carouselItems.length > 0"
                  class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-8 text-white z-10"
              ></div>
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
                  <h3 class="text-2xl font-bold text-white font-noto-serif-sc">
                      {{ poster.title }}
                  </h3>
              </div>
          </div>
      </section>

      <!-- 四宫格组件 -->
      <FourGridSection :featuredCategories="featuredCategories" />

      <!-- Tab 栏目切换卡片列表区域 -->
      <section class="tabs-section">
          <div
              class="flex flex-nowrap mb-6 border-b border-gray-200 overflow-x-auto"
          >
              <button
                  v-for="cat in categories"
                  :key="cat.value"
                  @click="activeTab = cat.value"
                  :class="{
                      'border-b-2 border-stone-500 text-stone-700':
                          activeTab === cat.value,
                      'border-b-2 border-transparent text-gray-500 hover:text-gray-700': activeTab !== cat.value,
                  }"
                  class="py-3 px-6 font-semibold focus:outline-none transition-colors duration-200 whitespace-nowrap"
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
                      :src="getAbsoluteImageUrl(tea.imageUrl)"
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
                      <span class="font-bold text-stone-700">¥{{ tea.price }}</span>
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
import {
  getCarouselItemsPublic,
  getPosterItemsPublic,
  getProductsPublic,
  getFeaturedCategoriesPublic,
  getTeaKnowledgeListPublic,
} from "@/api/public";
import FourGridSection from "@/components/FourGridSection.vue";
import { mapGetters } from 'vuex'; // 引入 mapGetters

export default {
  name: "Home",
  components: {
      FourGridSection,
  },
  data() {
      return {
          activeTab: "", // 默认激活的 Tab，可以设置为第一个类别或空
          carouselItems: [],
          posters: [],
          products: [],
          featuredCategories: [], // 添加 featuredCategories 属性
          currentCarouselIndex: 0, // 当前轮播图索引
          carouselInterval: null, // 轮播图自动播放的定时器
          touchStartX: 0, // 触摸开始的X坐标
          touchEndX: 0, // 触摸结束的X坐标
          touchThreshold: 50, // 识别滑动的最小距离（像素）
      };
  },
  computed: {
      // 使用 mapGetters 映射 Vuex 中的 allTeaCategories
      ...mapGetters('dictionary', ['allTeaCategories']),
      categories() {
          // 将 Vuex 中的 allTeaCategories 映射为 { value, text } 格式
          const mappedCategories = this.allTeaCategories.map(cat => ({
              value: cat.value,
              text: cat.description
          }));
          // 如果 activeTab 为空，则将其设置为第一个类别
          if (this.activeTab === "" && mappedCategories.length > 0) {
              this.activeTab = mappedCategories[0].value;
          }
          return mappedCategories;
      },
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
          if (linkUrl.startsWith("http://") || linkUrl.startsWith("https://")) {
              return linkUrl;
          }
          return linkUrl ? `http://localhost:5000${linkUrl}` : "#";
      },
      // Helper to get poster item link
      getPosterLink(linkUrl) {
          if (!linkUrl) return "#";
          if (linkUrl.startsWith("http://") || linkUrl.startsWith("https://")) {
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
          } catch (error) {
              console.error("获取轮播图失败:", error);
          }
      },
      startCarouselAutoPlay() {
          if (this.carouselInterval) {
              clearInterval(this.carouselInterval);
          }
          this.carouselInterval = setInterval(() => {
              this.nextSlide();
          }, 5000); // 每 5 秒切换一次
      },
      stopCarouselAutoPlay() {
          if (this.carouselInterval) {
              clearInterval(this.carouselInterval);
              this.carouselInterval = null;
          }
      },
      prevSlide() {
          this.currentCarouselIndex =
              (this.currentCarouselIndex - 1 + this.carouselItems.length) %
              this.carouselItems.length;
      },
      nextSlide() {
          this.currentCarouselIndex =
              (this.currentCarouselIndex + 1) % this.carouselItems.length;
      },
      handleTouchStart(event) {
          this.touchStartX = event.touches[0].clientX;
          this.stopCarouselAutoPlay();
      },
      handleTouchMove(event) {
          this.touchEndX = event.touches[0].clientX;
      },
      handleTouchEnd() {
          const diff = this.touchEndX - this.touchStartX;
          if (diff > this.touchThreshold) {
              // Swipe right
              this.prevSlide();
          } else if (diff < -this.touchThreshold) {
              // Swipe left
              this.nextSlide();
          }
          // Reset touch coordinates
          this.touchStartX = 0;
          this.touchEndX = 0;
          this.startCarouselAutoPlay();
      },
      async fetchPosterItems() {
          try {
              const response = await getPosterItemsPublic();
              this.posters = response.data;
          } catch (error) {
              console.error("获取海报图失败:", error);
          }
      },
      async fetchProducts() {
          try {
              const response = await getProductsPublic();
              this.products = response.data;
          } catch (error) {
              console.error("获取产品失败:", error);
          }
      },
      async fetchFeaturedCategories() {
          try {
              const response = await getFeaturedCategoriesPublic();
              if (response.code === 200) {
                  this.featuredCategories = response.data.slice(0, 4);
              }
          } catch (error) {
              console.error("获取优选分类失败:", error);
          }
      },
  },
  created() {
      this.fetchCarouselItems();
      this.fetchPosterItems();
      this.fetchProducts();
      this.fetchFeaturedCategories();
      this.$store.dispatch('dictionary/fetchTeaCategories'); // 在 created 钩子中分发 action
  },
  mounted() {
      // 确保 activeTab 在 categories 数据加载后被设置
      // 如果 categories 还没有数据，activeTab 将在 computed 属性中设置
      if (this.categories.length > 0 && this.activeTab === "") {
          this.activeTab = this.categories[0].value;
      }
  },
  beforeDestroy() {
      clearInterval(this.carouselInterval);
  },
};
</script>

<style scoped>
/* 可以添加 Home 组件特有的样式 */
.home-container {
  background-color: #f8f8f8; /* 轻微的背景色 */
}

.carousel-section {
  @apply relative;
}

.carousel-inner {
  transition: transform 0.5s ease-in-out;
}

.carousel-image {
  @apply w-full h-full object-cover;
}

.poster-section div {
  background-color: #fff; /* 海报项的背景色 */
}

.product-card,
.teaware-item,
.knowledge-article {
  @apply bg-white p-4 rounded-lg shadow-sm text-center flex flex-col items-center;
}

.product-image,
.teaware-image,
.article-image {
  @apply w-full h-40 object-cover rounded-md mb-4;
}

.product-name,
.teaware-name,
.article-title {
  @apply text-lg font-semibold text-gray-800 mb-2 font-noto-serif-sc;
}

.product-price {
  @apply text-red-600 font-bold mb-3;
}

.article-summary {
  @apply text-sm text-gray-600 mb-3 line-clamp-3;
}

/* Tab 样式 */
.tabs-section button {
  transition: all 0.2s ease-in-out;
}

.tabs-section button.active {
  border-color: #a78b4e; /* 石色 */
  color: #a78b4e;
}
</style>