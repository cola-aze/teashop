<template>
    <div>
        <h2
            class="text-2xl font-bold mb-6 text-gray-800 font-noto-serif-sc p-4"
        >
            轮播图管理
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

        <!-- 新增/编辑轮播图表单 -->
        <el-form
            :model="currentItem"
            ref="carouselForm"
            label-width="120px"
            class="mb-8 p-4 border border-gray-200 rounded-lg bg-white shadow-md"
            @submit.native.prevent="isEditing ? updateItem() : addItem()"
        >
            <h3 class="text-xl font-semibold mb-4 text-gray-700">
                {{ isEditing ? "编辑轮播图" : "新增轮播图" }}
            </h3>
            <el-form-item label="图片:" prop="imageUrl">
                <el-upload
                    action="#"
                    list-type="picture-card"
                    :auto-upload="false"
                    :on-change="handleUploadChange"
                    :on-remove="handleUploadRemove"
                    :file-list="fileList"
                    :limit="1"
                >
                    <i class="el-icon-plus"></i>
                </el-upload>
                <el-dialog :visible.sync="dialogVisible">
                    <img width="100%" :src="dialogImageUrl" alt="">
                </el-dialog>
            </el-form-item>

            <el-form-item label="标题:" prop="title">
                <el-input
                    v-model="currentItem.title"
                    placeholder="请输入轮播图标题"
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

            <el-form-item>
                <el-button type="primary" @click="isEditing ? updateItem() : addItem()">{{ isEditing ? "更新" : "新增" }}</el-button>
                <el-button @click="cancelEdit" v-if="isEditing">取消</el-button>
            </el-form-item>
        </el-form>

        <!-- 轮播图列表 -->
        <div class="overflow-x-auto p-4 bg-white rounded-lg shadow-md">
            <el-table :data="carouselItems" style="width: 100%">
                <el-table-column label="图片" width="180">
                    <template slot-scope="scope">
                        <img
                            :src="getAbsoluteImageUrl(scope.row.imageUrl)"
                            alt="Carousel Image"
                            class="w-24 h-16 object-cover rounded-md"
                        />
                    </template>
                </el-table-column>
                <el-table-column prop="title" label="标题" width="180"></el-table-column>
                <el-table-column label="链接">
                    <template slot-scope="scope">
                        <a
                            :href="getCarouselLink(scope.row.linkUrl)"
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
        </div>
    </div>
</template>

<script>
import { getCarouselItems, addCarouselItem, updateCarouselItem, deleteCarouselItem } from '@/api/admin';

export default {
    name: "CarouselAdmin",
    data() {
        return {
            carouselItems: [],
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
            fileList: [], // For ElUpload
        };
    },
    created() {
        this.fetchCarouselItems();
    },
    methods: {
        async fetchCarouselItems() {
            try {
                const response = await getCarouselItems();
                this.carouselItems = response.data;
            } catch (err) {
                this.error = "获取轮播图失败：" + (err.response?.data?.message || err.message);
            }
        },
        handleUploadChange(file, fileList) {
            // 确保只保留一个文件
            this.fileList = fileList.slice(-1);
            if (fileList.length > 0) {
                this.selectedFile = file.raw;
                this.imagePreviewUrl = URL.createObjectURL(file.raw);
            } else {
                this.selectedFile = null;
                this.imagePreviewUrl = null;
            }
            this.dialogVisible = false; // Close dialog if file changes
        },
        handleUploadRemove(file, fileList) {
            this.fileList = [];
            this.selectedFile = null;
            this.imagePreviewUrl = null;
            this.currentItem.imageUrl = null; // Clear existing image when removed
        },
        async addItem() {
            try {
                const formData = new FormData();
                formData.append('title', this.currentItem.title);
                formData.append('linkUrl', this.currentItem.linkUrl);
                formData.append('order', this.currentItem.order);

                if (this.selectedFile) {
                    formData.append('image', this.selectedFile); // Append the actual file
                } else if (this.currentItem.imageUrl) {
                    // If no new file selected but existing image exists, use its URL
                    formData.append('imageUrl', this.currentItem.imageUrl);
                } else {
                    this.error = "请上传图片！";
                    return;
                }

                const response = await addCarouselItem(formData);
                this.successMessage = response.message;
                this.fetchCarouselItems();
                this.resetForm();
            } catch (err) {
                this.error = "新增轮播图失败：" + (err.response?.data?.message || err.message);
            }
        },
        async updateItem() {
            try {
                const formData = new FormData();
                formData.append('title', this.currentItem.title);
                formData.append('linkUrl', this.currentItem.linkUrl);
                formData.append('order', this.currentItem.order);

                // Only append image if a new file is selected
                if (this.selectedFile) {
                    formData.append('image', this.selectedFile);
                } else if (this.currentItem.imageUrl) {
                    // If no new file and existing imageUrl, pass it
                    formData.append('imageUrl', this.currentItem.imageUrl);
                } else if (!this.currentItem.imageUrl) {
                    // If image was removed (imageUrl is null), signal backend to remove it
                    formData.append('removeImage', 'true');
                }

                const response = await updateCarouselItem(this.currentItem._id, formData);
                this.successMessage = response.message;
                this.fetchCarouselItems();
                this.resetForm();
            } catch (err) {
                this.error = "更新轮播图失败：" + (err.response?.data?.message || err.message);
            }
        },
        editItem(item) {
            this.isEditing = true;
            this.currentItem = { ...item };
            this.linkType = item.linkUrl && (item.linkUrl.startsWith('http') || item.linkUrl.startsWith('/')) ? (item.linkUrl.startsWith('http') ? 'external' : 'internal') : 'internal';

            this.imagePreviewUrl = this.getAbsoluteImageUrl(item.imageUrl);
            this.selectedFile = null; // Clear selected file for edit
            this.fileList = item.imageUrl ? [{ name: item.title, url: this.getAbsoluteImageUrl(item.imageUrl) }] : [];
        },
        async deleteItem(id) {
            if (confirm('确定删除此轮播图吗？')) {
                try {
                    const response = await deleteCarouselItem(id);
                    this.successMessage = response.message;
                    this.fetchCarouselItems();
                } catch (err) {
                    this.error = "删除轮播图失败：" + (err.response?.data?.message || err.message);
                }
            }
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
            // Reset Element UI form validation
            this.$nextTick(() => {
                this.$refs.carouselForm.resetFields();
            });
        },
        getAbsoluteImageUrl(relativePath) {
            if (!relativePath) {
                return '';
            }
            // 如果已经是完整的 URL，直接返回
            if (relativePath.startsWith('http') || relativePath.startsWith('blob:')) {
                return relativePath;
            }
            // 否则，拼接后端地址
            return `http://localhost:5000${relativePath}`;
        },
        getCarouselLink(link) {
            // 如果链接是内部链接，拼接前端基础URL
            if (this.linkType === 'internal' && link && !link.startsWith('http')) {
                return `/${link.replace(/^\//, '')}`; // 确保只有一个 / 开头
            } else if (link) {
                return link;
            }
            return '#';
        },
    },
};
</script>

<style scoped>
/* 可以添加 Element UI 覆盖样式 */
.el-upload-list__item {
    width: 148px;
    height: 148px;
}

.el-upload--picture-card i {
    font-size: 28px;
    color: #8c939d;
}
</style> 