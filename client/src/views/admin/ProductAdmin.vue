<template>
  <div>
      <h2
          class="text-2xl font-bold mb-6 text-gray-800 font-noto-serif-sc p-4"
      >
          茶品管理
      </h2>

      <!-- 成功/错误消息提示 -->
      <el-alert
          v-if="successMessage"
          :title="successMessage"
          type="success"
          show-icon
          closable
          @close="successMessage = null"
          class="mb-4 mx-4"
      >
      </el-alert>
      <el-alert
          v-if="error"
          :title="error"
          type="error"
          show-icon
          closable
          @close="error = null"
          class="mb-4 mx-4"
      >
      </el-alert>

      <!-- 新增茶品按钮 -->
      <div class="p-4">
          <el-button type="primary" @click="openAddModal">新增茶品</el-button>
      </div>

      <!-- 新增/编辑茶品弹窗 -->
      <el-dialog
          :title="isEditing ? '编辑茶品' : '新增茶品'"
          :visible.sync="dialogFormVisible"
          @close="resetForm"
      >
          <el-form
              :model="currentItem"
              ref="productForm"
              label-width="120px"
          >
              <el-form-item label="类别:" prop="category">
                  <el-select v-model="currentItem.category" placeholder="请选择类别">
                      <el-option
                          v-for="category in teaCategories"
                          :key="category._id"
                          :label="category.description"
                          :value="category.value"
                      ></el-option>
                  </el-select>
              </el-form-item>

              <el-form-item label="等级:" prop="level">
                  <el-select v-model="currentItem.level" placeholder="请选择等级">
                      <el-option
                          v-for="level in productLevels"
                          :key="level._id"
                          :label="level.description"
                          :value="level.value"
                      ></el-option>
                  </el-select>
              </el-form-item>

              <el-form-item label="茶品名称:" prop="name">
                  <el-input
                      v-model="currentItem.name"
                      placeholder="请输入茶品名称"
                  ></el-input>
              </el-form-item>

              <el-form-item label="描述:" prop="description">
                  <el-input
                      type="textarea"
                      v-model="currentItem.description"
                      placeholder="请输入茶品描述"
                  ></el-input>
              </el-form-item>

              <el-form-item label="价格:" prop="price">
                  <el-input-number
                      v-model="currentItem.price"
                      :min="0"
                      :precision="2"
                      :step="0.01"
                      label="价格"
                  ></el-input-number>
              </el-form-item>

              <el-form-item label="图片:" prop="imageUrl">
                  <el-upload
                      action="#"
                      list-type="picture-card"
                      :auto-upload="false"
                      :on-change="handleUploadChange"
                      :on-remove="handleUploadRemove"
                      :on-preview="handlePictureCardPreview"
                      :file-list="fileList"
                      :limit="1"
                      ref="uploadRef"
                  >
                      <i class="el-icon-plus"></i>
                  </el-upload>
                  <el-dialog :visible.sync="dialogVisible">
                      <img width="100%" :src="dialogImageUrl" alt="">
                  </el-dialog>
              </el-form-item>

              <el-form-item label="库存:" prop="stock">
                  <el-input-number
                      v-model="currentItem.stock"
                      :min="0"
                      label="库存数量"
                  ></el-input-number>
              </el-form-item>

              <el-form-item label="排序 (越小越靠前):" prop="order">
                  <el-input-number
                      v-model="currentItem.order"
                      :min="0"
                      label="排序值"
                  ></el-input-number>
              </el-form-item>
          </el-form>
          <div slot="footer" class="dialog-footer">
              <el-button @click="cancelEdit">取 消</el-button>
              <el-button type="primary" @click="isEditing ? updateItem() : addItem()">确 定</el-button>
          </div>
      </el-dialog>

      <!-- 茶品列表 -->
      <div class="overflow-x-auto p-4 bg-white rounded-lg shadow-md">
          <el-table :data="products" style="width: 100%">
              <el-table-column label="图片">
                  <template slot-scope="scope">
                      <img
                          :src="getImageSrc(scope.row.imageUrl)"
                          alt="Product Image"
                          class="w-16 h-16 object-cover rounded-md"
                      />
                  </template>
              </el-table-column>
              <el-table-column prop="name" label="名称"></el-table-column>
              <el-table-column label="类别">
                  <template slot-scope="scope">
                      {{ getCategoryDescription(scope.row.category) }}
                  </template>
              </el-table-column>
              <el-table-column prop="price" label="价格">
                  <template slot-scope="scope">
                      ¥{{ scope.row.price.toFixed(2) }}
                  </template>
              </el-table-column>
              <el-table-column prop="stock" label="库存"></el-table-column>
              <el-table-column prop=\"order\" label=\"排序\"></el-table-column>
              <el-table-column label="等级">
                  <template slot-scope="scope">
                      {{ getLevelDescription(scope.row.level) }}
                  </template>
              </el-table-column>
              <el-table-column label="操作">
                  <template slot-scope="scope">
                      <el-button size="mini" @click="editItem(scope.row)">编辑</el-button>
                      <el-button size="mini" type="danger" @click="deleteItem(scope.row._id)">删除</el-button>
                  </template>
              </el-table-column>
          </el-table>
          <el-pagination
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              :current-page="currentPage"
              :page-sizes="[5, 10, 20, 50]"
              :page-size="pageSize"
              layout="total, sizes, prev, pager, next, jumper"
              :total="totalItems"
              class="mt-4 text-right"
          >
          </el-pagination>
      </div>
  </div>
</template>

<script>
import { getProducts, addProduct, updateProduct, deleteProduct } from '@/api/admin';
import { mapGetters } from 'vuex'; // 导入 mapGetters

export default {
  name: "ProductAdmin",
  data() {
      return {
          products: [],
          currentItem: {
              _id: null,
              name: "",
              category: "",
              price: 0,
              stock: 0,
              description: "",
              imageUrl: "",
              order: 0,
              level: "",
          },
          isEditing: false,
          successMessage: null,
          error: null,
          imagePreviewUrl: null,
          selectedFile: null,
          dialogImageUrl: '',
          dialogVisible: false,
          dialogFormVisible: false, // 控制新增/编辑弹窗的显示
          fileList: [], // For ElUpload
          currentPage: 1,
          pageSize: 10,
          totalItems: 0,
      };
  },
  // 添加 computed 属性来映射 Vuex 中的字典数据
  computed: {
      ...mapGetters('dictionary', ['allTeaCategories', 'allProductLevels']),
      // 将 getters 映射到组件的本地属性，方便模板使用
      teaCategories() {
          return this.allTeaCategories;
      },
      productLevels() {
          return this.allProductLevels;
      },
  },
  created() {
      this.fetchProducts();
      // 在组件创建时分发 Vuex action 来获取字典数据
      this.$store.dispatch('dictionary/fetchTeaCategories');
      this.$store.dispatch('dictionary/fetchProductLevels');
  },
  methods: {
      async fetchProducts() {
          try {
              const response = await getProducts({
                  page: this.currentPage,
                  limit: this.pageSize,
              });
              this.products = response.data.products;
              this.totalItems = response.data.totalProducts;
          } catch (err) {
              this.error = "获取茶品失败：" + (err.response?.data?.message || err.message);
          }
      },
      handleUploadChange(file, fileList) {
          this.fileList = fileList.slice(-1);
          if (this.fileList.length > 0) {
              this.selectedFile = this.fileList[0].raw;
              this.imagePreviewUrl = this.fileList[0].url;
          } else {
              this.selectedFile = null;
              this.imagePreviewUrl = null;
          }
      },
      handlePictureCardPreview(file) {
          this.dialogImageUrl = file.url;
          this.dialogVisible = true;
      },
      handleUploadRemove(file, fileList) {
          this.fileList = [];
          this.selectedFile = null;
          this.imagePreviewUrl = null;
          this.currentItem.imageUrl = null;
          this.dialogImageUrl = '';
          this.dialogVisible = false;
      },
      openAddModal() {
          this.isEditing = false;
          this.resetForm();
          this.dialogFormVisible = true;
      },
      async addItem() {
          try {
              const formData = new FormData();
              formData.append('name', this.currentItem.name);
              formData.append('category', this.currentItem.category);
              formData.append('price', this.currentItem.price);
              formData.append('stock', this.currentItem.stock);
              formData.append('description', this.currentItem.description);
              formData.append('order', this.currentItem.order);
              formData.append('level', this.currentItem.level);

              if (this.selectedFile) {
                  formData.append('image', this.selectedFile);
              } else if (this.currentItem.imageUrl) {
                  formData.append('imageUrl', this.currentItem.imageUrl);
              } else {
                  this.error = "请上传图片！";
                  return;
              }

              const response = await addProduct(formData);
              this.successMessage = response.message;
              this.fetchProducts();
              this.dialogFormVisible = false;
              this.resetForm();
          } catch (err) {
              this.error = "新增茶品失败：" + (err.response?.data?.message || err.message);
          }
      },
      async updateItem() {
          try {
              const formData = new FormData();
              formData.append('name', this.currentItem.name);
              formData.append('category', this.currentItem.category);
              formData.append('price', this.currentItem.price);
              formData.append('stock', this.currentItem.stock);
              formData.append('description', this.currentItem.description);
              formData.append('order', this.currentItem.order);
              formData.append('level', this.currentItem.level);

              if (this.selectedFile) {
                  formData.append('image', this.selectedFile);
              } else if (this.currentItem.imageUrl) {
                  formData.append('imageUrl', this.currentItem.imageUrl);
              } else if (!this.currentItem.imageUrl) {
                  formData.append('removeImage', 'true');
              }

              const response = await updateProduct(this.currentItem._id, formData);
              this.successMessage = response.message;
              this.fetchProducts();
              this.dialogFormVisible = false;
              this.resetForm();
          } catch (err) {
              this.error = "更新茶品失败：" + (err.response?.data?.message || err.message);
          }
      },
      editItem(item) {
          this.isEditing = true;
          this.currentItem = { ...item };
          this.imagePreviewUrl = this.getImageSrc(item.imageUrl);
          this.selectedFile = null;
          this.fileList = item.imageUrl ? [{ name: item.name, url: this.getImageSrc(item.imageUrl) }] : [];
          this.dialogImageUrl = this.getImageSrc(item.imageUrl); 
          this.dialogFormVisible = true;
      },
      async deleteItem(id) {
          if (confirm('确定删除此茶品吗？')) {
              try {
                  const response = await deleteProduct(id);
                  this.successMessage = response.message;
                  this.fetchProducts();
              } catch (err) {
                  this.error = "删除茶品失败：" + (err.response?.data?.message || err.message);
              }
          }
      },
      cancelEdit() {
          this.dialogFormVisible = false;
          this.resetForm();
      },
      resetForm() {
          this.isEditing = false;
          this.currentItem = {
              _id: null,
              name: "",
              category: "",
              price: 0,
              stock: 0,
              description: "",
              imageUrl: "",
              order: 0,
              level: "",
          };
          this.imagePreviewUrl = null;
          this.selectedFile = null;
          this.successMessage = null;
          this.error = null;
          this.fileList = [];
          this.$nextTick(() => {
              // 检查 productForm 是否存在，避免在组件销毁时调用错误
              if (this.$refs.productForm) {
                  this.$refs.productForm.resetFields();
              }
              if (this.$refs.uploadRef) {
                  this.$refs.uploadRef.clearFiles();
              }
          });
      },
      getImageSrc(relativePath) {
          if (!relativePath) {
              return '';
          }
          if (relativePath.startsWith('http') || relativePath.startsWith('blob:')) {
              return relativePath;
          }
          return `http://localhost:5000${relativePath}`;
      },
      handleSizeChange(val) {
          this.pageSize = val;
          this.fetchProducts();
      },
      handleCurrentChange(val) {
          this.currentPage = val;
          this.fetchProducts();
      },
      getCategoryDescription(value) {
          const category = this.teaCategories.find(cat => cat.value === value);
          return category ? category.description : value;
      },
      getLevelDescription(value) {
          const level = this.productLevels.find(lvl => lvl.value === value);
          return level ? level.description : value;
      },
  },
};
</script>

<style scoped>
.el-upload-list__item {
  width: 148px;
  height: 148px;
}

.el-upload--picture-card i {
  font-size: 28px;
  color: #8c939d;
}
</style>