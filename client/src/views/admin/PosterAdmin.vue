<template>
  <div>
      <h2
          class="text-2xl font-bold mb-6 text-gray-800 font-noto-serif-sc p-4"
      >
          海报图管理
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

      <!-- 新增海报图按钮 -->
      <div class="p-4">
          <el-button type="primary" @click="openAddModal">新增海报图</el-button>
      </div>

      <!-- 新增/编辑海报图弹窗 -->
      <el-dialog
          :title="isEditing ? '编辑海报图' : '新增海报图'"
          :visible.sync="dialogFormVisible"
          @close="resetForm"
      >
          <el-form
              :model="currentItem"
              ref="posterForm"
              label-width="120px"
          >
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

              <el-form-item label="标题 (可选):" prop="title">
                  <el-input
                      v-model="currentItem.title"
                      placeholder="请输入海报图标题"
                  ></el-input>
              </el-form-item>

              <el-form-item label="链接URL (可选):" prop="linkUrl">
                  <el-input
                      v-model="currentItem.linkUrl"
                      :placeholder="
                          linkType === 'internal'
                              ? '例如: /products/some-product-id'
                              : '例如: https://www.example.com'
                      "
                  ></el-input>
              </el-form-item>

              <el-form-item label="链接类型:" prop="linkType">
                  <el-radio-group v-model="linkType">
                      <el-radio label="internal">内部链接</el-radio>
                      <el-radio label="external">外部链接</el-radio>
                  </el-radio-group>
              </el-form-item>

              <el-form-item label="排序 (数字):" prop="order">
                  <el-input-number
                      v-model="currentItem.order"
                      :min="0"
                      label="排序数字"
                  ></el-input-number>
              </el-form-item>
          </el-form>
          <div slot="footer" class="dialog-footer">
              <el-button @click="cancelEdit">取 消</el-button>
              <el-button type="primary" @click="isEditing ? updateItem() : addItem()">确 定</el-button>
          </div>
      </el-dialog>

      <!-- 海报图列表 -->
      <div class="overflow-x-auto p-4 bg-white rounded-lg shadow-md">
          <el-table :data="posterItems" style="width: 100%">
              <el-table-column label="图片" width="180">
                  <template slot-scope="scope">
                      <img
                          :src="getAbsoluteImageUrl(scope.row.imageUrl)"
                          alt="Poster Image"
                          class="w-24 h-16 object-cover rounded-md"
                      />
                  </template>
              </el-table-column>
              <el-table-column prop="title" label="标题" width="180"></el-table-column>
              <el-table-column label="链接">
                  <template slot-scope="scope">
                      <a
                          :href="getPosterLink(scope.row.linkUrl)"
                          target="_blank"
                          class="text-blue-500 hover:underline"
                          >{{ scope.row.linkUrl || "无" }}</a
                      >
                  </template>
              </el-table-column>
              <el-table-column prop="order" label="排序"></el-table-column>
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
import { getPosterItems, addPosterItem, updatePosterItem, deletePosterItem } from '@/api/admin';

export default {
  name: "PosterAdmin",
  data() {
      return {
          posterItems: [],
          currentItem: {
              _id: null,
              imageUrl: "",
              title: "",
              linkUrl: "",
              order: 0,
          },
          isEditing: false,
          imagePreviewUrl: null,
          selectedFile: null,
          linkType: "internal", // 默认链接类型
          successMessage: null,
          error: null,
          dialogImageUrl: '',
          dialogVisible: false,
          dialogFormVisible: false, // 控制新增/编辑弹窗的显示
          fileList: [], // For ElUpload
          currentPage: 1,
          pageSize: 10,
          totalItems: 0,
      };
  },
  created() {
      this.fetchPosterItems();
  },
  methods: {
      async fetchPosterItems() {
          try {
              const response = await getPosterItems({
                  page: this.currentPage,
                  limit: this.pageSize,
              });
              this.posterItems = response.data.items;
              this.totalItems = response.data.totalItems;
          } catch (err) {
              this.error = "获取海报图失败：" + (err.response?.data?.message || err.message);
          }
      },
      handleUploadChange(file, fileList) {
          // 确保只保留一个文件
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
              formData.append('title', this.currentItem.title);
              formData.append('linkUrl', this.currentItem.linkUrl);
              formData.append('order', this.currentItem.order);

              if (this.selectedFile) {
                  formData.append('image', this.selectedFile);
              } else if (this.currentItem.imageUrl) {
                  formData.append('imageUrl', this.currentItem.imageUrl);
              } else {
                  this.error = "请上传图片！";
                  return;
              }

              const response = await addPosterItem(formData);
              this.successMessage = response.message;
              this.fetchPosterItems();
              this.dialogFormVisible = false;
              this.resetForm();
          } catch (err) {
              this.error = "新增海报图失败：" + (err.response?.data?.message || err.message);
          }
      },
      async updateItem() {
          try {
              const formData = new FormData();
              formData.append('title', this.currentItem.title);
              formData.append('linkUrl', this.currentItem.linkUrl);
              formData.append('order', this.currentItem.order);

              if (this.selectedFile) {
                  formData.append('image', this.selectedFile);
              } else if (this.currentItem.imageUrl) {
                  formData.append('imageUrl', this.currentItem.imageUrl);
              } else if (!this.currentItem.imageUrl) {
                  formData.append('removeImage', 'true');
              }

              const response = await updatePosterItem(this.currentItem._id, formData);
              this.successMessage = response.message;
              this.fetchPosterItems();
              this.dialogFormVisible = false;
              this.resetForm();
          } catch (err) {
              this.error = "更新海报图失败：" + (err.response?.data?.message || err.message);
          }
      },
      editItem(item) {
          this.isEditing = true;
          this.currentItem = { ...item };
          this.linkType = item.linkUrl && (item.linkUrl.startsWith('http') || item.linkUrl.startsWith('/')) ? (item.linkUrl.startsWith('http') ? 'external' : 'internal') : 'internal';

          this.imagePreviewUrl = this.getAbsoluteImageUrl(item.imageUrl);
          this.selectedFile = null;
          this.fileList = item.imageUrl ? [{ name: item.title, url: this.getAbsoluteImageUrl(item.imageUrl) }] : [];
          this.dialogImageUrl = this.getAbsoluteImageUrl(item.imageUrl); 
          this.dialogFormVisible = true;
      },
      async deleteItem(id) {
          if (confirm('确定删除此海报图吗？')) {
              try {
                  const response = await deletePosterItem(id);
                  this.successMessage = response.message;
                  this.fetchPosterItems();
              } catch (err) {
                  this.error = "删除海报图失败：" + (err.response?.data?.message || err.message);
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
              imageUrl: "",
              title: "",
              linkUrl: "",
              order: 0,
          };
          this.imagePreviewUrl = null;
          this.selectedFile = null;
          this.linkType = "internal";
          this.successMessage = null;
          this.error = null;
          this.fileList = [];
          this.$nextTick(() => {
              this.$refs.posterForm.resetFields();
              if (this.$refs.uploadRef) {
                  this.$refs.uploadRef.clearFiles();
              }
          });
      },
      getAbsoluteImageUrl(relativePath) {
          if (!relativePath) {
              return '';
          }
          if (relativePath.startsWith('http') || relativePath.startsWith('blob:')) {
              return relativePath;
          }
          return `http://localhost:5000${relativePath}`;
      },
      getPosterLink(link) {
          if (this.linkType === 'internal' && link && !link.startsWith('http')) {
              return `/${link.replace(/^\//, '')}`; 
          } else if (link) {
              return link;
          }
          return '#';
      },
      handleSizeChange(val) {
          this.pageSize = val;
          this.fetchPosterItems();
      },
      handleCurrentChange(val) {
          this.currentPage = val;
          this.fetchPosterItems();
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