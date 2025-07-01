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

      <!-- 新增茶知识按钮 -->
      <div class="p-4">
          <button
              @click="showAddModal"
              class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300"
          >
              新增茶知识
          </button>
      </div>

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
                          <th class="py-3 px-6 text-left">色泽</th>
                          <th class="py-3 px-6 text-left">香气</th>
                          <th class="py-3 px-6 text-left">滋味</th>
                          <th class="py-3 px-6 text-left">制作工艺</th>
                          <th class="py-3 px-6 text-center sticky right-0 bg-gray-100 z-10">操作</th>
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
                              {{ formatTags(item.appearance) }}
                          </td>
                          <td class="py-3 px-6 text-left">
                              {{ formatTags(item.liquorColor) }}
                          </td>
                          <td class="py-3 px-6 text-left">
                              {{ formatTags(item.infusedLeaves) }}
                          </td>
                          <td class="py-3 px-6 text-left">
                              {{ formatTags(item.benefits) }}
                          </td>
                          <td class="py-3 px-6 text-left" v-html="item.brewingMethod">
                          </td>
                          <td class="py-3 px-6 text-left">
                              {{ item.storageMethod }}
                          </td>
                          <td class="py-3 px-6 text-left">
                              {{ formatTags(item.suitableFor) }}
                          </td>
                          <td class="py-3 px-6 text-left">
                              {{ formatTags(item.notSuitableFor) }}
                          </td>
                          <td class="py-3 px-6 text-left">
                              {{ item.referencePrice }}
                          </td>
                          <td class="py-3 px-6 text-left">
                              {{ item.grade }}
                          </td>
                          <td class="py-3 px-6 text-left">
                              {{ formatTags(item.color) }}
                          </td>
                          <td class="py-3 px-6 text-left">
                              {{ formatTags(item.aroma) }}
                          </td>
                          <td class="py-3 px-6 text-left">
                              {{ formatTags(item.taste) }}
                          </td>
                          <td class="py-3 px-6 text-left">
                              {{ formatTags(item.productionProcess) }}
                          </td>
                          <td class="py-3 px-6 text-center sticky right-0 bg-white z-10">
                                <div class="flex item-center justify-center">
                                    <!-- 详情按钮 -->
                                    <button
                                        @click="showDetailModal(item)"
                                        class="bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-2 rounded focus:outline-none focus:shadow-outline transition duration-300 mr-2"
                                    >
                                        详情
                                    </button>
                                    <!-- 编辑按钮 -->
                                    <button
                                        @click="showEditModal(item)"
                                        class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-2 rounded focus:outline-none focus:shadow-outline transition duration-300 mr-2"
                                    >
                                        编辑
                                    </button>
                                    <!-- 删除按钮 -->
                                    <button
                                        @click="deleteItem(item._id)"
                                        class="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-2 rounded focus:outline-none focus:shadow-outline transition duration-300"
                                    >
                                        删除
                                    </button>
                                </div>
                            </td>
                      </tr>
                  </tbody>
              </table>
          </div>
      </div>

      <!-- TeaKnowledgeForm 弹窗组件 -->
      <TeaKnowledgeForm
          :visible.sync="showFormModal"
          :initial-data="formEditItem"
          :disabled="disabled"
          :title="title"
          @saved="handleFormSaved"
          @close="showFormModal = false"
      ></TeaKnowledgeForm>
  </div>
</template>

<script>
import {
  getTeaKnowledgeList,
  deleteTeaKnowledge,
  getDictionaryItems
} from '@/api/admin';
import TeaKnowledgeForm from './components/form.vue';

export default {
  name: "TeaKnowledgeAdmin",
  components: {
      TeaKnowledgeForm,
  },
  data() {
      return {
          teaCategories: [], // 保持，用于列表显示类别描述
          teaKnowledgeItems: [],
          successMessage: null,
          error: null,
          showFormModal: false, // 控制弹窗显示
          formEditItem: null,   // 传递给弹窗的数据，null 表示新增，有数据表示编辑
          disabled:false,
          title:'',//弹窗标题
      };
  },
  mounted() {
      this.fetchTeaKnowledgeItems();
      this.fetchTeaCategories();
  },
  methods: {
      getAbsoluteImageUrl(relativePath) {
          if (!relativePath) return "";
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
              this.teaCategories = response.data;
              this.successMessage = response.message;
          } catch (err) {
              console.error("获取茶叶类别失败:", err.message);
              this.error = err.message || "获取茶叶类别失败。";
          }
      },
      async fetchTeaKnowledgeItems() {
          try {
              const response = await getTeaKnowledgeList();
              if (response.code === 200) {
                  this.teaKnowledgeItems = response.data;
              } else {
                  this.error = response.message || "获取茶知识列表失败";
              }
          } catch (err) {
              console.error("获取茶知识列表失败:", err);
              this.error = "获取茶知识列表失败。";
          }
      },
      showAddModal() {
          this.formEditItem = null;
          this.showFormModal = true;
          this.disabled = false;
          this.title = '新增茶知识'
      },
      showEditModal(item) {
          this.formEditItem = { ...item };
          this.showFormModal = true;
          this.disabled = false;
          this.title = '编辑茶知识'
      },
      showDetailModal(item) {
          this.formEditItem = { ...item };
          this.showFormModal = true;
          this.disabled = true;
          this.title = '查看详情'
      },
      async deleteItem(id) {
          if (confirm("确定要删除此茶知识吗？")) {
              try {
                  const response = await deleteTeaKnowledge(id);
                  if (response.code === 200) {
                      this.successMessage = response.message;
                      this.fetchTeaKnowledgeItems(); // 重新加载列表
                  } else {
                      this.error = response.message || "删除失败。";
                  }
              } catch (err) {
                  console.error("删除茶知识失败:", err);
                  this.error = "删除茶知识失败。";
              }
          }
      },
      handleFormSaved(message) {
          this.successMessage = message;
          this.fetchTeaKnowledgeItems(); // 重新加载列表
          this.showFormModal = false;
      },
      // 新增的辅助方法，用于处理标签数组或字符串
      formatTags(tags) {
          if (Array.isArray(tags)) {
              return tags.join(", ");
          } else if (typeof tags === 'string' && tags.trim() !== '') {
              try {
                  // 尝试解析JSON字符串
                  const parsedTags = JSON.parse(tags);
                  if (Array.isArray(parsedTags)) {
                      return parsedTags.join(", ");
                  }
              } catch (e) {
                  // 如果不是有效的JSON，则按逗号分割
                  return tags.split(',').map(s => s.trim()).filter(Boolean).join(", ");
              }
          }
          return ""; // 如果不是数组也不是有效字符串，则返回空
      },
  },
};
</script>

<style scoped>
/* Scoped styles specific to this component */
.sticky {
    position: sticky;
    right: 0;
}
</style>