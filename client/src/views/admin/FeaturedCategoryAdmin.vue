<template>
    <div class="p-6 bg-white shadow-lg rounded-lg">
        <h2 class="text-3xl font-bold mb-6 text-gray-800">优选分类管理</h2>

        <button
            @click="openAddModal"
            class="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md shadow-md mb-6 transition duration-300 ease-in-out"
        >
            添加优选分类
        </button>

        <div class="overflow-x-auto">
            <table class="min-w-full bg-white border border-gray-300 rounded-lg shadow-sm">
                <thead class="bg-gray-100">
                    <tr>
                        <th class="py-3 px-4 border-b text-left text-sm font-semibold text-gray-700">ID</th>
                        <th class="py-3 px-4 border-b text-left text-sm font-semibold text-gray-700">名称</th>
                        <th class="py-3 px-4 border-b text-left text-sm font-semibold text-gray-700">描述</th>
                        <th class="py-3 px-4 border-b text-left text-sm font-semibold text-gray-700">图片</th>
                        <th class="py-3 px-4 border-b text-left text-sm font-semibold text-gray-700">链接</th>
                        <th class="py-3 px-4 border-b text-left text-sm font-semibold text-gray-700">操作</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(category, index) in categories" :key="category._id" class="hover:bg-gray-50 transition duration-150 ease-in-out">
                        <td class="py-3 px-4 border-b text-sm text-gray-700">{{ category._id }}</td>
                        <td class="py-3 px-4 border-b text-sm text-gray-700">{{ category.name }}</td>
                        <td class="py-3 px-4 border-b text-sm text-gray-700">{{ category.description }}</td>
                        <td class="py-3 px-4 border-b text-sm text-gray-700">
                            <div class="flex space-x-2">
                                <img
                                    v-for="(url) in category.imageUrls"
                                    :key="url"
                                    :src="url"
                                    alt="分类图片"
                                    class="w-16 h-16 object-cover rounded-md shadow-sm"
                                />
                            </div>
                        </td>
                        <td class="py-3 px-4 border-b text-sm text-blue-600 hover:underline"><a :href="category.link" target="_blank">{{ category.link }}</a></td>
                        <td class="py-3 px-4 border-b text-sm">
                            <button
                                @click="openEditModal(category)"
                                class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-3 rounded-md shadow-sm mr-2 transition duration-300 ease-in-out"
                            >
                                编辑
                            </button>
                            <button
                                @click="moveUp(index)"
                                :disabled="index === 0"
                                class="bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-3 rounded-md shadow-sm mr-2 transition duration-300 ease-in-out"
                                :class="{'opacity-50 cursor-not-allowed': index === 0}"
                            >
                                上移
                            </button>
                            <button
                                @click="moveDown(index)"
                                :disabled="index === categories.length - 1"
                                class="bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-3 rounded-md shadow-sm mr-2 transition duration-300 ease-in-out"
                                :class="{'opacity-50 cursor-not-allowed': index === categories.length - 1}"
                            >
                                下移
                            </button>
                            <button
                                @click="deleteCategory(category._id)"
                                class="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded-md shadow-sm transition duration-300 ease-in-out"
                            >
                                删除
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- 添加/编辑模态框 -->
        <div v-if="showModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
                <h3 class="text-2xl font-bold mb-4 text-gray-800">{{ isEditMode ? '编辑优选分类' : '添加优选分类' }}</h3>
                <form @submit.prevent="handleSubmit">
                    <div class="mb-4">
                        <label for="name" class="block text-gray-700 text-sm font-bold mb-2">名称:</label>
                        <input
                            type="text"
                            id="name"
                            v-model="currentCategory.name"
                            required
                            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        />
                    </div>
                    <div class="mb-4">
                        <label for="description" class="block text-gray-700 text-sm font-bold mb-2">描述:</label>
                        <input
                            type="text"
                            id="description"
                            v-model="currentCategory.description"
                            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        />
                    </div>
                    <div class="mb-4">
                        <label class="block text-gray-700 text-sm font-bold mb-2">图片 (最多2张):</label>
                        <input
                            type="file"
                            id="images"
                            multiple
                            accept="image/*"
                            @change="handleImageUpload"
                            ref="fileInput"
                            style="display: none;"
                        />
                        <button
                            type="button"
                            @click="triggerFileInput"
                            class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md shadow-md transition duration-300 ease-in-out"
                        >
                            选择文件
                        </button>
                        <div v-if="currentCategory.imageUrls.length > 0 || currentImagePreviews.length > 0" class="mt-4 flex space-x-4">
                            <div v-for="(url) in currentCategory.imageUrls" :key="url" class="relative">
                                <img
                                    :src="url"
                                    alt="当前图片"
                                    class="w-32 h-32 object-cover rounded-md shadow-sm"
                                />
                                <button
                                    @click.stop="removeImage('existing', url)"
                                    class="absolute top-0 right-0 bg-red-500 text-white rounded-full h-6 w-6 flex items-center justify-center text-xs font-bold -mt-2 -mr-2 cursor-pointer hover:bg-red-600 transition-colors duration-200"
                                >
                                    x
                                </button>
                            </div>
                            <div v-for="(url) in currentImagePreviews" :key="url" class="relative">
                                <img
                                    :src="url"
                                    alt="新图片预览"
                                    class="w-32 h-32 object-cover rounded-md shadow-sm"
                                />
                                <button
                                    @click.stop="removeImage('new', url)"
                                    class="absolute top-0 right-0 bg-red-500 text-white rounded-full h-6 w-6 flex items-center justify-center text-xs font-bold -mt-2 -mr-2 cursor-pointer hover:bg-red-600 transition-colors duration-200"
                                >
                                    X
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="mb-6">
                        <label for="link" class="block text-gray-700 text-sm font-bold mb-2">链接:</label>
                        <input
                            type="text"
                            id="link"
                            v-model="currentCategory.link"
                            required
                            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        />
                    </div>
                    <div class="flex justify-end">
                        <button
                            type="submit"
                            class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md shadow-md mr-2 transition duration-300 ease-in-out"
                        >
                            保存
                        </button>
                        <button
                            type="button"
                            @click="closeModal"
                            class="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-md shadow-md transition duration-300 ease-in-out"
                        >
                            取消
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<script>
import { getFeaturedCategories, addFeaturedCategory, updateFeaturedCategory, deleteFeaturedCategory, reorderFeaturedCategories } from '@/api/admin';

export default {
    name: 'FeaturedCategoryAdmin',
    data() {
        return {
            categories: [],
            showModal: false,
            isEditMode: false,
            currentCategory: {
                _id: null,
                name: '',
                description: '',
                imageUrls: [],
                link: '',
                imageFiles: [],
            },
            currentImagePreviews: [],
        };
    },
    created() {
        this.fetchFeaturedCategories();
    },
    methods: {
        async fetchFeaturedCategories() {
            try {
                const response = await getFeaturedCategories();
                this.categories = response.data;
            } catch (error) {
                console.error('获取优选分类失败:', error);
            }
        },
        openAddModal() {
            this.isEditMode = false;
            this.currentCategory = {
                _id: null,
                name: '',
                description: '',
                imageUrls: [],
                link: '',
                imageFiles: [],
            };
            this.currentImagePreviews.forEach(url => URL.revokeObjectURL(url));
            this.currentImagePreviews = [];
            this.showModal = true;
        },
        openEditModal(category) {
            this.isEditMode = true;
            this.currentCategory = {
                ...category,
                imageUrls: [...category.imageUrls],
                imageFiles: []
            };
            if (this.currentCategory.description === undefined) {
                this.currentCategory.description = '';
            }
            this.currentImagePreviews.forEach(url => URL.revokeObjectURL(url));
            this.currentImagePreviews = [];
            this.showModal = true;
        },
        closeModal() {
            this.showModal = false;
            this.currentImagePreviews.forEach(url => URL.revokeObjectURL(url));
            this.currentImagePreviews = [];
        },
        triggerFileInput() {
            this.$refs.fileInput.click();
        },
        handleImageUpload(event) {
            const newlySelectedFiles = Array.from(event.target.files);

            let combinedFiles = [...this.currentCategory.imageFiles];

            newlySelectedFiles.forEach(newFile => {
                const isAlreadyAdded = combinedFiles.some(existingFile =>
                    existingFile.name === newFile.name &&
                    existingFile.size === newFile.size &&
                    existingFile.lastModified === newFile.lastModified
                );
                if (!isAlreadyAdded) {
                    combinedFiles.push(newFile);
                }
            });

            if (this.currentCategory.imageUrls.length + combinedFiles.length > 2) {
                alert('现有图片和新选图片总数不能超过两张，请重新选择或移除部分图片。');
                event.target.value = '';
                return;
            }

            this.currentImagePreviews.forEach(url => URL.revokeObjectURL(url));

            this.currentCategory.imageFiles = combinedFiles;
            this.currentImagePreviews = combinedFiles.map(file => URL.createObjectURL(file));

            event.target.value = '';
        },
        removeImage(type, identifier) {
            if (type === 'existing') {
                const newImageUrls = this.currentCategory.imageUrls.filter(url => url !== identifier);
                this.$set(this.currentCategory, 'imageUrls', newImageUrls);
            } else if (type === 'new') {
                const removedUrl = identifier;
                URL.revokeObjectURL(removedUrl);

                const newImagePreviews = this.currentImagePreviews.filter(url => url !== identifier);
                this.$set(this, 'currentImagePreviews', newImagePreviews);

                const newImageFiles = this.currentCategory.imageFiles.filter((file, idx) => URL.createObjectURL(file) !== identifier);
                this.$set(this.currentCategory, 'imageFiles', newImageFiles);
            }

            if (this.currentCategory.imageUrls.length + this.currentCategory.imageFiles.length === 0) {
                // 这里可以根据需求进行提示或禁用保存按钮
                // 例如：alert('请至少保留一张图片。');
            }
        },
        async handleSubmit() {
            const totalImages = this.currentCategory.imageUrls.length + this.currentCategory.imageFiles.length;
            if (totalImages === 0) {
                alert('请至少上传一张图片。');
                return;
            }
            if (totalImages > 2) {
                alert('图片总数不能超过两张，请重新选择或移除部分图片。');
                return;
            }

            const formData = new FormData();
            formData.append('name', this.currentCategory.name);
            formData.append('description', this.currentCategory.description);
            formData.append('link', this.currentCategory.link);

            if (this.isEditMode) {
                formData.append('retainedImageUrls', JSON.stringify(this.currentCategory.imageUrls));
            }

            if (this.currentCategory.imageFiles.length > 0) {
                this.currentCategory.imageFiles.forEach((file) => {
                    formData.append('images', file);
                });
            }

            try {
                if (this.isEditMode) {
                    await updateFeaturedCategory(this.currentCategory._id, formData);
                } else {
                    await addFeaturedCategory(formData);
                }
                this.closeModal();
                this.fetchFeaturedCategories();
            } catch (error) {
                console.error('保存优选分类失败:', error);
                alert('保存失败：' + (error.response ? error.response.data.message : error.message));
            }
        },
        async deleteCategory(id) {
            if (confirm('确定要删除此优选分类吗？')) {
                try {
                    await deleteFeaturedCategory(id);
                    this.fetchFeaturedCategories();
                } catch (error) {
                    console.error('删除优选分类失败:', error);
                    alert('删除失败：' + (error.response ? error.response.data.message : error.message));
                }
            }
        },
        async moveUp(index) {
            if (index > 0) {
                const newCategories = [...this.categories];
                const movedItem = newCategories.splice(index, 1)[0];
                newCategories.splice(index - 1, 0, movedItem);
                this.categories = newCategories;
                await this.updateCategoryOrder();
            }
        },
        async moveDown(index) {
            if (index < this.categories.length - 1) {
                const newCategories = [...this.categories];
                const movedItem = newCategories.splice(index, 1)[0];
                newCategories.splice(index + 1, 0, movedItem);
                this.categories = newCategories;
                await this.updateCategoryOrder();
            }
        },
        async updateCategoryOrder() {
            try {
                const orderedIds = this.categories.map(cat => cat._id);                
                console.log('Ordered IDs being sent:', orderedIds);
                await reorderFeaturedCategories(orderedIds);
                alert('排序更新成功！');
            } catch (error) {
                console.error('更新排序失败:', error);
                alert('更新排序失败：' + (error.response ? error.response.data.message : error.message));
            }
        }
    },
};
</script>

<style scoped>
/* 移除了旧的 scoped CSS，因为现在主要使用 Tailwind CSS */
</style> 