<template>
  <!-- Modal Overlay -->
  <div
    v-if="visible"
    class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center"
  >
    <!-- Modal Content -->
    <div
      class="relative p-8 bg-white w-full max-w-4xl mx-auto rounded-lg shadow-lg overflow-y-auto max-h-[90vh]"
    >
      <button
        @click="closeModal"
        class="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold"
      >
        &times;
      </button>

      <form @submit.prevent="isEditing ? updateItem() : addItem()" class="p-4">
        <h3 class="text-xl font-semibold mb-4 text-gray-700">
          {{ isEditing ? "编辑茶知识" : "新增茶知识" }}
        </h3>
        <!-- Removed grid-cols-2 to make each item take a full line -->
        <div class="mb-4">
          <label
            for="category"
            class="block text-gray-700 text-sm font-bold mb-2"
          >
            类别:
          </label>
          <select
            id="category"
            v-model="currentItem.category"
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-stone-500"
            required
          >
            <option value="" disabled>请选择类别</option>
            <option
              v-for="category in teaCategories"
              :key="category._id"
              :value="category.value"
            >
              {{ category.description }}
            </option>
          </select>
        </div>
        <div class="mb-4">
          <label for="name" class="block text-gray-700 text-sm font-bold mb-2">
            茶名称:
          </label>
          <input
            type="text"
            id="name"
            v-model="currentItem.name"
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-stone-500"
            placeholder="请输入茶名称"
            required
          />
        </div>
        <div class="mb-4">
          <label
            for="description_short"
            class="block text-gray-700 text-sm font-bold mb-2"
          >
            简短描述:
          </label>
          <textarea
            id="description_short"
            v-model="currentItem.description_short"
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-stone-500 h-24"
            placeholder="请输入简短描述 (用于列表页卡片)"
            required
          ></textarea>
        </div>
        <div class="mb-4">
          <label
            for="description_full"
            class="block text-gray-700 text-sm font-bold mb-2"
          >
            完整茶知识内容 (支持Markdown):
          </label>
          <quill-editor
            ref="descriptionFullQuillEditor"
            v-model:content="currentItem.description_full"
            contentType="html"
            :options="descriptionFullEditorOption"
            class="shadow appearance-none border rounded w-full text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-stone-500"
            placeholder="请输入完整的茶知识详情，支持 Markdown 格式"
          ></quill-editor>
        </div>

        <div class="mb-4">
          <label
            for="imageUpload"
            class="block text-gray-700 text-sm font-bold mb-2"
          >
            图片:
          </label>
          <input
            type="file"
            id="imageUpload"
            @change="handleFileChange"
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-stone-500"
            accept="image/*"
            :required="!currentItem.imageUrl && !imagePreviewUrl && !isEditing"
          />
        </div>

        <!-- 图片预览 -->
        <div v-if="imagePreviewUrl || currentItem.imageUrl" class="mb-4">
          <label class="block text-gray-700 text-sm font-bold mb-2">
            图片预览:
          </label>
          <div class="flex items-center">
            <img
              :src="
                imagePreviewUrl || getAbsoluteImageUrl(currentItem.imageUrl)
              "
              alt="图片预览"
              class="w-32 h-auto object-cover rounded-md border border-gray-300"
            />
            <button
              type="button"
              @click="removeImage"
              class="ml-4 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition duration-300 text-sm"
            >
              移除图片
            </button>
          </div>
        </div>

        <div class="mb-4">
          <label
            for="origin"
            class="block text-gray-700 text-sm font-bold mb-2"
          >
            产地:
          </label>
          <region-selects
            v-model="selectedOrigin"
            @change="handleRegionChange"
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-stone-500"
          ></region-selects>
        </div>

        <!-- Start of multi-tag fields -->
        <div class="mb-4">
          <label
            for="appearance"
            class="block text-gray-700 text-sm font-bold mb-2"
          >
            茶叶外形 (标签):
          </label>
          <div class="tag-input-container">
            <span
              v-for="tag in appearanceTags"
              :key="tag"
              class="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800 mr-2 mb-2"
            >
              {{ tag }}
              <button
                type="button"
                @click="handleClose('appearance', tag)"
                class="ml-1 -mr-0.5 h-4 w-4 rounded-full inline-flex items-center justify-center text-blue-400 hover:bg-blue-200 hover:text-blue-500 focus:outline-none focus:bg-blue-200"
              >
                <svg
                  class="h-2 w-2"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 8 8"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.5"
                    d="M1 1l6 6m0-6L1 7"
                  />
                </svg>
              </button>
            </span>
            <input
              v-if="appearanceInputVisible"
              v-model="appearanceInputValue"
              ref="saveAppearanceInput"
              @keyup.enter="handleInputConfirm('appearance')"
              @blur="handleInputConfirm('appearance')"
              class="input-new-tag shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:shadow-outline focus:border-stone-500"
              size="small"
              placeholder="添加标签"
            />
            <button
              v-else
              type="button"
              class="button-new-tag bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-1 px-2 rounded inline-flex items-center"
              @click="showInput('appearance')"
            >
              + 添加标签
            </button>
          </div>
        </div>

        <div class="mb-4">
          <label
            for="liquorColor"
            class="block text-gray-700 text-sm font-bold mb-2"
          >
            汤色 (标签):
          </label>
          <div class="tag-input-container">
            <span
              v-for="tag in liquorColorTags"
              :key="tag"
              class="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800 mr-2 mb-2"
            >
              {{ tag }}
              <button
                type="button"
                @click="handleClose('liquorColor', tag)"
                class="ml-1 -mr-0.5 h-4 w-4 rounded-full inline-flex items-center justify-center text-blue-400 hover:bg-blue-200 hover:text-blue-500 focus:outline-none focus:bg-blue-200"
              >
                <svg
                  class="h-2 w-2"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 8 8"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.5"
                    d="M1 1l6 6m0-6L1 7"
                  />
                </svg>
              </button>
            </span>
            <input
              v-if="liquorColorInputVisible"
              v-model="liquorColorInputValue"
              ref="saveLiquorColorInput"
              @keyup.enter="handleInputConfirm('liquorColor')"
              @blur="handleInputConfirm('liquorColor')"
              class="input-new-tag shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:shadow-outline focus:border-stone-500"
              size="small"
              placeholder="添加标签"
            />
            <button
              v-else
              type="button"
              class="button-new-tag bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-1 px-2 rounded inline-flex items-center"
              @click="showInput('liquorColor')"
            >
              + 添加标签
            </button>
          </div>
        </div>

        <div class="mb-4">
          <label
            for="infusedLeaves"
            class="block text-gray-700 text-sm font-bold mb-2"
          >
            叶底 (标签):
          </label>
          <div class="tag-input-container">
            <span
              v-for="tag in infusedLeavesTags"
              :key="tag"
              class="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800 mr-2 mb-2"
            >
              {{ tag }}
              <button
                type="button"
                @click="handleClose('infusedLeaves', tag)"
                class="ml-1 -mr-0.5 h-4 w-4 rounded-full inline-flex items-center justify-center text-blue-400 hover:bg-blue-200 hover:text-blue-500 focus:outline-none focus:bg-blue-200"
              >
                <svg
                  class="h-2 w-2"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 8 8"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.5"
                    d="M1 1l6 6m0-6L1 7"
                  />
                </svg>
              </button>
            </span>
            <input
              v-if="infusedLeavesInputVisible"
              v-model="infusedLeavesInputValue"
              ref="saveInfusedLeavesInput"
              @keyup.enter="handleInputConfirm('infusedLeaves')"
              @blur="handleInputConfirm('infusedLeaves')"
              class="input-new-tag shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:shadow-outline focus:border-stone-500"
              size="small"
              placeholder="添加标签"
            />
            <button
              v-else
              type="button"
              class="button-new-tag bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-1 px-2 rounded inline-flex items-center"
              @click="showInput('infusedLeaves')"
            >
              + 添加标签
            </button>
          </div>
        </div>

        <div class="mb-4">
          <label
            for="benefits"
            class="block text-gray-700 text-sm font-bold mb-2"
          >
            功效作用 (标签):
          </label>
          <div class="tag-input-container">
            <span
              v-for="tag in benefitsTags"
              :key="tag"
              class="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800 mr-2 mb-2"
            >
              {{ tag }}
              <button
                type="button"
                @click="handleClose('benefits', tag)"
                class="ml-1 -mr-0.5 h-4 w-4 rounded-full inline-flex items-center justify-center text-blue-400 hover:bg-blue-200 hover:text-blue-500 focus:outline-none focus:bg-blue-200"
              >
                <svg
                  class="h-2 w-2"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 8 8"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.5"
                    d="M1 1l6 6m0-6L1 7"
                  />
                </svg>
              </button>
            </span>
            <input
              v-if="benefitsInputVisible"
              v-model="benefitsInputValue"
              ref="saveBenefitsInput"
              @keyup.enter="handleInputConfirm('benefits')"
              @blur="handleInputConfirm('benefits')"
              class="input-new-tag shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:shadow-outline focus:border-stone-500"
              size="small"
              placeholder="添加标签"
            />
            <button
              v-else
              type="button"
              class="button-new-tag bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-1 px-2 rounded inline-flex items-center"
              @click="showInput('benefits')"
            >
              + 添加标签
            </button>
          </div>
        </div>

        <div class="mb-4">
          <label
            for="brewingMethod"
            class="block text-gray-700 text-sm font-bold mb-2"
          >
            冲泡方法:
          </label>
          <quill-editor
            v-model:content="currentItem.brewingMethod"
            contentType="html"
            :options="brewingMethodEditorOption"
            class="shadow appearance-none border rounded w-full text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-stone-500"
            placeholder="请输入冲泡方法"
          ></quill-editor>
        </div>
        <div class="mb-4">
          <label
            for="storageMethod"
            class="block text-gray-700 text-sm font-bold mb-2"
          >
            存储方法:
          </label>
          <input
            type="text"
            id="storageMethod"
            v-model="currentItem.storageMethod"
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-stone-500"
            placeholder="请输入存储方法"
          />
        </div>

        <div class="mb-4">
          <label
            for="suitableFor"
            class="block text-gray-700 text-sm font-bold mb-2"
          >
            适宜人群 (标签):
          </label>
          <div class="tag-input-container">
            <span
              v-for="tag in suitableForTags"
              :key="tag"
              class="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800 mr-2 mb-2"
            >
              {{ tag }}
              <button
                type="button"
                @click="handleClose('suitableFor', tag)"
                class="ml-1 -mr-0.5 h-4 w-4 rounded-full inline-flex items-center justify-center text-blue-400 hover:bg-blue-200 hover:text-blue-500 focus:outline-none focus:bg-blue-200"
              >
                <svg
                  class="h-2 w-2"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 8 8"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.5"
                    d="M1 1l6 6m0-6L1 7"
                  />
                </svg>
              </button>
            </span>
            <input
              v-if="suitableForInputVisible"
              v-model="suitableForInputValue"
              ref="saveSuitableForInput"
              @keyup.enter="handleInputConfirm('suitableFor')"
              @blur="handleInputConfirm('suitableFor')"
              class="input-new-tag shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:shadow-outline focus:border-stone-500"
              size="small"
              placeholder="添加标签"
            />
            <button
              v-else
              type="button"
              class="button-new-tag bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-1 px-2 rounded inline-flex items-center"
              @click="showInput('suitableFor')"
            >
              + 添加标签
            </button>
          </div>
        </div>

        <div class="mb-4">
          <label
            for="notSuitableFor"
            class="block text-gray-700 text-sm font-bold mb-2"
          >
            禁忌人群 (标签):
          </label>
          <div class="tag-input-container">
            <span
              v-for="tag in notSuitableForTags"
              :key="tag"
              class="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800 mr-2 mb-2"
            >
              {{ tag }}
              <button
                type="button"
                @click="handleClose('notSuitableFor', tag)"
                class="ml-1 -mr-0.5 h-4 w-4 rounded-full inline-flex items-center justify-center text-blue-400 hover:bg-blue-200 hover:text-blue-500 focus:outline-none focus:bg-blue-200"
              >
                <svg
                  class="h-2 w-2"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 8 8"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.5"
                    d="M1 1l6 6m0-6L1 7"
                  />
                </svg>
              </button>
            </span>
            <input
              v-if="notSuitableForInputVisible"
              v-model="notSuitableForInputValue"
              ref="saveNotSuitableForInput"
              @keyup.enter="handleInputConfirm('notSuitableFor')"
              @blur="handleInputConfirm('notSuitableFor')"
              class="input-new-tag shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:shadow-outline focus:border-stone-500"
              size="small"
              placeholder="添加标签"
            />
            <button
              v-else
              type="button"
              class="button-new-tag bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-1 px-2 rounded inline-flex items-center"
              @click="showInput('notSuitableFor')"
            >
              + 添加标签
            </button>
          </div>
        </div>

        <div class="mb-4">
          <label
            for="referencePrice"
            class="block text-gray-700 text-sm font-bold mb-2"
          >
            参考价格:
          </label>
          <input
            type="number"
            id="referencePrice"
            v-model.number="currentItem.referencePrice"
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-stone-500"
            placeholder="请输入参考价格"
          />
        </div>
        <div class="mb-4">
          <label for="grade" class="block text-gray-700 text-sm font-bold mb-2">
            等级 (1-5星):
          </label>
          <input
            type="number"
            id="grade"
            v-model.number="currentItem.grade"
            min="1"
            max="5"
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-stone-500"
            placeholder="请输入等级 (1-5)"
          />
        </div>

        <div class="mb-4">
          <label for="color" class="block text-gray-700 text-sm font-bold mb-2">
            色泽 (标签):
          </label>
          <div class="tag-input-container">
            <span
              v-for="tag in colorTags"
              :key="tag"
              class="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800 mr-2 mb-2"
            >
              {{ tag }}
              <button
                type="button"
                @click="handleClose('color', tag)"
                class="ml-1 -mr-0.5 h-4 w-4 rounded-full inline-flex items-center justify-center text-blue-400 hover:bg-blue-200 hover:text-blue-500 focus:outline-none focus:bg-blue-200"
              >
                <svg
                  class="h-2 w-2"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 8 8"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.5"
                    d="M1 1l6 6m0-6L1 7"
                  />
                </svg>
              </button>
            </span>
            <input
              v-if="colorInputVisible"
              v-model="colorInputValue"
              ref="saveColorInput"
              @keyup.enter="handleInputConfirm('color')"
              @blur="handleInputConfirm('color')"
              class="input-new-tag shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:shadow-outline focus:border-stone-500"
              size="small"
              placeholder="添加标签"
            />
            <button
              v-else
              type="button"
              class="button-new-tag bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-1 px-2 rounded inline-flex items-center"
              @click="showInput('color')"
            >
              + 添加标签
            </button>
          </div>
        </div>

        <div class="mb-4">
          <label for="aroma" class="block text-gray-700 text-sm font-bold mb-2">
            香气 (标签):
          </label>
          <div class="tag-input-container">
            <span
              v-for="tag in aromaTags"
              :key="tag"
              class="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800 mr-2 mb-2"
            >
              {{ tag }}
              <button
                type="button"
                @click="handleClose('aroma', tag)"
                class="ml-1 -mr-0.5 h-4 w-4 rounded-full inline-flex items-center justify-center text-blue-400 hover:bg-blue-200 hover:text-blue-500 focus:outline-none focus:bg-blue-200"
              >
                <svg
                  class="h-2 w-2"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 8 8"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.5"
                    d="M1 1l6 6m0-6L1 7"
                  />
                </svg>
              </button>
            </span>
            <input
              v-if="aromaInputVisible"
              v-model="aromaInputValue"
              ref="saveAromaInput"
              @keyup.enter="handleInputConfirm('aroma')"
              @blur="handleInputConfirm('aroma')"
              class="input-new-tag shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:shadow-outline focus:border-stone-500"
              size="small"
              placeholder="添加标签"
            />
            <button
              v-else
              type="button"
              class="button-new-tag bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-1 px-2 rounded inline-flex items-center"
              @click="showInput('aroma')"
            >
              + 添加标签
            </button>
          </div>
        </div>

        <div class="mb-4">
          <label for="taste" class="block text-gray-700 text-sm font-bold mb-2">
            滋味 (标签):
          </label>
          <div class="tag-input-container">
            <span
              v-for="tag in tasteTags"
              :key="tag"
              class="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800 mr-2 mb-2"
            >
              {{ tag }}
              <button
                type="button"
                @click="handleClose('taste', tag)"
                class="ml-1 -mr-0.5 h-4 w-4 rounded-full inline-flex items-center justify-center text-blue-400 hover:bg-blue-200 hover:text-blue-500 focus:outline-none focus:bg-blue-200"
              >
                <svg
                  class="h-2 w-2"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 8 8"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.5"
                    d="M1 1l6 6m0-6L1 7"
                  />
                </svg>
              </button>
            </span>
            <input
              v-if="tasteInputVisible"
              v-model="tasteInputValue"
              ref="saveTasteInput"
              @keyup.enter="handleInputConfirm('taste')"
              @blur="handleInputConfirm('taste')"
              class="input-new-tag shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:shadow-outline focus:border-stone-500"
              size="small"
              placeholder="添加标签"
            />
            <button
              v-else
              type="button"
              class="button-new-tag bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-1 px-2 rounded inline-flex items-center"
              @click="showInput('taste')"
            >
              + 添加标签
            </button>
          </div>
        </div>

        <div class="mb-4">
          <label
            for="productionProcess"
            class="block text-gray-700 text-sm font-bold mb-2"
          >
            制作工艺 (标签):
          </label>
          <div class="tag-input-container">
            <span
              v-for="tag in productionProcessTags"
              :key="tag"
              class="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800 mr-2 mb-2"
            >
              {{ tag }}
              <button
                type="button"
                @click="handleClose('productionProcess', tag)"
                class="ml-1 -mr-0.5 h-4 w-4 rounded-full inline-flex items-center justify-center text-blue-400 hover:bg-blue-200 hover:text-blue-500 focus:outline-none focus:bg-blue-200"
              >
                <svg
                  class="h-2 w-2"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 8 8"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.5"
                    d="M1 1l6 6m0-6L1 7"
                  />
                </svg>
              </button>
            </span>
            <input
              v-if="productionProcessInputVisible"
              v-model="productionProcessInputValue"
              ref="saveProductionProcessInput"
              @keyup.enter="handleInputConfirm('productionProcess')"
              @blur="handleInputConfirm('productionProcess')"
              class="input-new-tag shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:shadow-outline focus:border-stone-500"
              size="small"
              placeholder="添加标签"
            />
            <button
              v-else
              type="button"
              class="button-new-tag bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-1 px-2 rounded inline-flex items-center"
              @click="showInput('productionProcess')"
            >
              + 添加标签
            </button>
          </div>
        </div>
        <!-- End of multi-tag fields -->

        <div class="flex space-x-4 mt-6">
          <button
            type="submit"
            class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300"
          >
            {{ isEditing ? "更新茶知识" : "新增茶知识" }}
          </button>
          <button
            type="button"
            @click="closeModal"
            class="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300"
          >
            取消
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import {
  addTeaKnowledge,
  updateTeaKnowledge,
  getDictionaryItems,
  uploadEditorImage
} from "@/api/admin";
import { RegionSelects } from "v-region";
import Quill from 'quill';
console.log(Quill.sources);


// QuillEditor is assumed to be globally registered in main.js, so no local import needed unless desired
// import { QuillEditor } from "@vueup/vue-quill"; // Explicitly import QuillEditor
// import "@vueup/vue-quill/dist/vue-quill.snow.css"; // Explicitly import QuillEditor styles

export default {
  name: "TeaKnowledgeForm",
  components: {
    // QuillEditor, // QuillEditor should be available globally or imported if not. Assuming global.
    RegionSelects,
  },
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    initialData: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      teaCategories: [],
      teaLevels: [],
      teaColors: [],
      teaAromas: [],
      teaTastes: [],
      teaProductionProcesses: [],
      currentItem: {
        _id: null,
        category: "",
        name: "",
        description_short: "",
        description_full: "",
        imageUrl: "",
        origin: "",
        appearance: [],
        liquorColor: [],
        infusedLeaves: [],
        benefits: [],
        brewingMethod: "",
        storageMethod: "",
        suitableFor: [],
        notSuitableFor: [],
        referencePrice: null,
        grade: null,
        color: [],
        aroma: [],
        taste: [],
        productionProcess: [],
      },
      // 完整茶知识内容的 Quill 编辑器配置
      descriptionFullEditorOption: {
        theme: "snow", // or 'bubble'
        placeholder: "请输入完整的茶知识详情，支持 Markdown 格式",
        modules: {
          toolbar: {
            container: [
              ["bold", "italic", "underline", "strike"], // toggled buttons
              ["blockquote", "code-block"],
              [{ header: 1 }, { header: 2 }], // custom button values
              [{ list: "ordered" }, { list: "bullet" }],
              [{ script: "sub" }, { script: "super" }], // superscript/subscript
              [{ indent: "-1" }, { indent: "+1" }], // outdent/indent
              [{ direction: "rtl" }], // text direction
              [{ size: ["small", false, "large", "huge"] }], // custom dropdown
              [{ header: [1, 2, 3, 4, 5, 6, false] }],
              [{ color: [] }, { background: [] }], // dropdown with defaults from theme
              [{ font: [] }],
              [{ align: [] }],
              ["link", "image"], // Keep image button
              ["clean"], // remove formatting button
            ],
            handlers: {
              // 自定义图片上传处理器
              image: (data)=>this.imageHandler(data), // 自定义图片处理
            },
          },
        },
      },
      // 冲泡方法内容的 Quill 编辑器配置 (如果不需要图片上传优化，则使用此简化配置)
      brewingMethodEditorOption: {
        theme: "snow",
        placeholder: "请输入冲泡方法",
        modules: {
          toolbar: [
            ["bold", "italic", "underline", "strike"],
            ["blockquote", "code-block"],
            [{ header: 1 }, { header: 2 }],
            [{ list: "ordered" }, { list: "bullet" }],
            [{ script: "sub" }, { script: "super" }],
            [{ indent: "-1" }, { indent: "+1" }],
            [{ direction: "rtl" }],
            [{ size: ["small", false, "large", "huge"] }],
            [{ header: [1, 2, 3, 4, 5, 6, false] }],
            [{ color: [] }, { background: [] }],
            [{ font: [] }],
            [{ align: [] }],
            ["clean"],
            ["link", "image"], // 保持图片按钮，但会使用 Quill 默认行为，不会触发自定义上传
          ],
        },
      },
      imageFile: null,
      imagePreviewUrl: null,
      isEditing: false,

      // Multi-tag related data properties
      appearanceTags: [],
      appearanceInputVisible: false,
      appearanceInputValue: "",

      liquorColorTags: [],
      liquorColorInputVisible: false,
      liquorColorInputValue: "",

      infusedLeavesTags: [],
      infusedLeavesInputVisible: false,
      infusedLeavesInputValue: "",

      benefitsTags: [],
      benefitsInputVisible: false,
      benefitsInputValue: "",

      suitableForTags: [],
      suitableForInputVisible: false,
      suitableForInputValue: "",

      notSuitableForTags: [],
      notSuitableForInputVisible: false,
      notSuitableForInputValue: "",

      productionProcessTags: [],
      productionProcessInputVisible: false,
      productionProcessInputValue: "",

      colorTags: [],
      colorInputVisible: false,
      colorInputValue: "",

      aromaTags: [],
      aromaInputVisible: false,
      aromaInputValue: "",

      tasteTags: [],
      tasteInputVisible: false,
      tasteInputValue: "",

      selectedOrigin: {
        province: {},
        city: {},
        area: {},
      },
    };
  },
  watch: {
    visible(newVal) {
      if (newVal) {
        this.initializeForm();
      }
    },
    initialData: {
      handler(newVal) {
        if (newVal) {
          this.isEditing = true;
          this.populateForm(newVal);
        } else {
          this.isEditing = false;
          this.resetFormState();
        }
      },
      immediate: true,
    },
  },
  mounted() {
    this.fetchTeaCategories();
    this.fetchTeaLevels();
    this.fetchTeaColors();
    this.fetchTeaAromas();
    this.fetchTeaTastes();
    this.fetchTeaProductionProcesses();
  },
  methods: {
    initializeForm() {
      if (this.initialData) {
        this.isEditing = true;
        this.populateForm(this.initialData);
      } else {
        this.isEditing = false;
        this.resetFormState();
      }
    },
    // 辅助方法：确保数据是数组
    ensureArray(value) {
      if (Array.isArray(value)) {
        return value;
      } else if (typeof value === "string" && value.trim() !== "") {
        try {
          const parsed = JSON.parse(value);
          return Array.isArray(parsed) ? parsed : [value]; // If parsed but not array, treat original as single tag
        } catch (e) {
          // If not valid JSON, split by comma or treat as single tag
          return value
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
        }
      }
      return [];
    },
    populateForm(item) {
      this.currentItem = { ...item };
      this.currentItem._id = item._id;

      // Populate multi-tag fields using the new helper
      this.appearanceTags = this.ensureArray(item.appearance);
      this.liquorColorTags = this.ensureArray(item.liquorColor);
      this.infusedLeavesTags = this.ensureArray(item.infusedLeaves);
      this.benefitsTags = this.ensureArray(item.benefits);
      this.suitableForTags = this.ensureArray(item.suitableFor);
      this.notSuitableForTags = this.ensureArray(item.notSuitableFor);
      this.productionProcessTags = this.ensureArray(item.productionProcess);
      this.colorTags = this.ensureArray(item.color);
      this.aromaTags = this.ensureArray(item.aroma);
      this.tasteTags = this.ensureArray(item.taste);

      if (item.origin) {
        const parts = String(item.origin).split("-");
        this.selectedOrigin.province = parts[0]
          ? { value: parts[0], name: "" }
          : {};
        this.selectedOrigin.city = parts[1]
          ? { value: parts[1], name: "" }
          : {};
        this.selectedOrigin.area = parts[2]
          ? { value: parts[2], name: "" }
          : {};
      } else {
        this.selectedOrigin = { province: {}, city: {}, area: {} };
      }

      this.imagePreviewUrl = item.imageUrl
        ? this.getAbsoluteImageUrl(item.imageUrl)
        : null;
      this.imageFile = null;
      const fileInput = document.getElementById("imageUpload");
      if (fileInput) {
        fileInput.value = "";
      }
    },
    resetFormState() {
      this.currentItem = {
        _id: null,
        category: "",
        name: "",
        description_short: "",
        description_full: "",
        imageUrl: "",
        origin: "",
        appearance: [],
        liquorColor: [],
        infusedLeaves: [],
        benefits: [],
        brewingMethod: "",
        storageMethod: "",
        suitableFor: [],
        notSuitableFor: [],
        referencePrice: null,
        grade: null,
        color: [],
        aroma: [],
        taste: [],
        productionProcess: [],
      };
      this.imageFile = null;
      this.imagePreviewUrl = null;

      // Reset multi-tag fields
      this.appearanceTags = [];
      this.appearanceInputVisible = false;
      this.appearanceInputValue = "";

      this.liquorColorTags = [];
      this.liquorColorInputVisible = false;
      this.liquorColorInputValue = "";

      this.infusedLeavesTags = [];
      this.infusedLeavesInputVisible = false;
      this.infusedLeavesInputValue = "";

      this.benefitsTags = [];
      this.benefitsInputVisible = false;
      this.benefitsInputValue = "";

      this.suitableForTags = [];
      this.suitableForInputVisible = false;
      this.suitableForInputValue = "";

      this.notSuitableForTags = [];
      this.notSuitableForInputVisible = false;
      this.notSuitableForInputValue = "";

      this.productionProcessTags = [];
      this.productionProcessInputVisible = false;
      this.productionProcessInputValue = "";

      this.colorTags = [];
      this.colorInputVisible = false;
      this.colorInputValue = "";

      this.aromaTags = [];
      this.aromaInputVisible = false;
      this.aromaInputValue = "";

      this.tasteTags = [];
      this.tasteInputVisible = false;
      this.tasteInputValue = "";

      this.selectedOrigin = { province: {}, city: {}, area: {} };
      const fileInput = document.getElementById("imageUpload");
      if (fileInput) {
        fileInput.value = "";
      }
    },
    closeModal() {
      this.$emit("update:visible", false);
      this.$emit("close");
      this.resetFormState();
    },
    handleRegionChange(data) {
      const selectedParts = [
        data.province && data.province.value ? data.province.value : "",
        data.city && data.city.value ? data.city.value : "",
        data.area && data.area.value ? data.area.value : "",
      ].filter(Boolean);
      this.currentItem.origin = selectedParts.join("-");
    },
    getAbsoluteImageUrl(relativePath) {
      if (relativePath && !relativePath.startsWith("http")) {
        return `http://localhost:5000${relativePath.replace(/\\\\/g, "/")}`;
      }
      return relativePath;
    },
    async fetchTeaCategories() {
      try {
        const response = await getDictionaryItems({ type: "tea_category" });
        this.teaCategories = response.data;
      } catch (err) {
        console.error("获取茶叶类别失败:", err.message);
      }
    },
    async fetchTeaLevels() {
      try {
        const response = await getDictionaryItems({ type: "tea_level" });
        this.teaLevels = response.data;
      } catch (err) {
        console.error("获取茶叶等级失败:", err.message);
      }
    },
    async fetchTeaColors() {
      try {
        const response = await getDictionaryItems({ type: "tea_color" });
        this.teaColors = response.data;
      } catch (err) {
        console.error("获取茶叶色泽失败:", err.message);
      }
    },
    async fetchTeaAromas() {
      try {
        const response = await getDictionaryItems({ type: "tea_aroma" });
        this.teaAromas = response.data;
      } catch (err) {
        console.error("获取茶叶香气失败:", err.message);
      }
    },
    async fetchTeaTastes() {
      try {
        const response = await getDictionaryItems({ type: "tea_taste" });
        this.teaTastes = response.data;
      } catch (err) {
        console.error("获取茶叶滋味失败:", err.message);
      }
    },
    async fetchTeaProductionProcesses() {
      try {
        const response = await getDictionaryItems({
          type: "tea_production_process",
        });
        this.teaProductionProcesses = response.data;
      } catch (err) {
        console.error("获取茶叶制作工艺失败:", err.message);
      }
    },
    handleFileChange(event) {
      const file = event.target.files[0];
      if (file) {
        this.imageFile = file;
        this.imagePreviewUrl = URL.createObjectURL(file);
      } else {
        this.imageFile = null;
        this.imagePreviewUrl = null;
      }
    },
    removeImage() {
      this.imageFile = null;
      this.imagePreviewUrl = null;
      this.currentItem.imageUrl = "";
      const fileInput = document.getElementById("imageUpload");
      if (fileInput) {
        fileInput.value = "";
      }
    },
    // Generic tag handling methods
    handleClose(field, tag) {
      const tags = this[`${field}Tags`];
      const index = tags.indexOf(tag);
      if (index !== -1) {
        tags.splice(index, 1);
      }
    },
    showInput(field) {
      this[`${field}InputVisible`] = true;
      this.$nextTick(() => {
        // Dynamically reference the input element
        const inputRefName = `save${
          field.charAt(0).toUpperCase() + field.slice(1)
        }Input`;
        if (this.$refs[inputRefName]) {
          this.$refs[inputRefName].focus();
        }
      });
    },
    handleInputConfirm(field) {
      let inputValue = this[`${field}InputValue`].trim();
      const tags = this[`${field}Tags`];
      if (inputValue && !tags.includes(inputValue)) {
        tags.push(inputValue);
      }
      this[`${field}InputVisible`] = false;
      this[`${field}InputValue`] = "";
    },

    imageHandler() {
      const input = document.createElement("input");
      input.setAttribute("type", "file");
      input.setAttribute("accept", "image/*");
      input.click();

      input.onchange = async () => {
        const file = input.files[0];
        if (file) {
          const quill = this.$refs.descriptionFullQuillEditor.quill;
          if (!quill) {
            console.error("Quill editor instance not found.");
            return;
          }

          const range = quill.getSelection(true);
          if (!range) {
            console.error("Quill editor selection not found.");
            return;
          }

          // 显示占位符或加载提示
          const imageUrl = "uploading..."; // 临时占位符
          quill.insertEmbed(range.index, "image", imageUrl, Quill.sources.USER);
          quill.setSelection(range.index + 1, Quill.sources.SILENT); // 移动光标

          try {
            const formData = new FormData();
            formData.append("image", file);

            const response = await uploadEditorImage(formData);
            if (response.code === 200 && response.data && response.data.url) {
              // 关键改动：在这里将相对路径转换为绝对路径
              const newImageUrl = this.getAbsoluteImageUrl(response.data.url);
              console.log(newImageUrl);
              
              // 替换占位符为实际图片URL
              quill.deleteText(range.index, 1, Quill.sources.USER); // 删除占位符
              quill.insertEmbed(
                range.index,
                "image",
                newImageUrl, // 使用绝对路径
                Quill.sources.USER
              );
            } else {
              console.error("图片上传失败:", response.message || "未知错误");
              quill.deleteText(range.index, 1, Quill.sources.USER); // 上传失败，移除占位符
              this.$message.error("图片上传失败!");
            }
          } catch (error) {
            console.error("图片上传错误:", error);
            quill.deleteText(range.index, 1, Quill.sources.USER); // 错误，移除占位符
            this.$message.error("图片上传发生错误!");
          }
        }
      };
    },
    async addItem() {
      try {
        const formData = new FormData();

        formData.append("category", this.currentItem.category);
        formData.append("name", this.currentItem.name);
        formData.append(
          "description_short",
          this.currentItem.description_short
        );
        formData.append("description_full", this.currentItem.description_full);
        formData.append("origin", this.currentItem.origin);
        formData.append("appearance", JSON.stringify(this.appearanceTags));
        formData.append("liquorColor", JSON.stringify(this.liquorColorTags));
        formData.append(
          "infusedLeaves",
          JSON.stringify(this.infusedLeavesTags)
        );
        formData.append("benefits", JSON.stringify(this.benefitsTags));
        formData.append("brewingMethod", this.currentItem.brewingMethod);
        formData.append("storageMethod", this.currentItem.storageMethod || "");
        formData.append("suitableFor", JSON.stringify(this.suitableForTags));
        formData.append(
          "notSuitableFor",
          JSON.stringify(this.notSuitableForTags)
        );
        formData.append(
          "productionProcess",
          JSON.stringify(this.productionProcessTags)
        );
        formData.append(
          "referencePrice",
          this.currentItem.referencePrice || ""
        );
        formData.append("grade", this.currentItem.grade || 0);
        formData.append("color", JSON.stringify(this.colorTags));
        formData.append("aroma", JSON.stringify(this.aromaTags));
        formData.append("taste", JSON.stringify(this.tasteTags));

        if (this.imageFile) {
          formData.append("image", this.imageFile);
        } else if (this.currentItem.imageUrl) {
          formData.append("imageUrl", this.currentItem.imageUrl);
        } else {
          formData.append("imageUrl", "");
        }

        const response = await addTeaKnowledge(formData);
        this.$emit("saved", response.message);
      } catch (err) {
        console.error("新增茶知识失败:", err.message);
        this.$emit("error", err.message || "新增茶知识失败。");
      } finally {
        this.closeModal();
      }
    },
    async updateItem() {
      try {
        const formData = new FormData();

        formData.append("category", this.currentItem.category);
        formData.append("name", this.currentItem.name);
        formData.append(
          "description_short",
          this.currentItem.description_short
        );
        formData.append("description_full", this.currentItem.description_full);
        formData.append("origin", this.currentItem.origin);
        formData.append("appearance", JSON.stringify(this.appearanceTags));
        formData.append("liquorColor", JSON.stringify(this.liquorColorTags));
        formData.append(
          "infusedLeaves",
          JSON.stringify(this.infusedLeavesTags)
        );
        formData.append("benefits", JSON.stringify(this.benefitsTags));
        formData.append("brewingMethod", this.currentItem.brewingMethod);
        formData.append("storageMethod", this.currentItem.storageMethod || "");
        formData.append("suitableFor", JSON.stringify(this.suitableForTags));
        formData.append(
          "notSuitableFor",
          JSON.stringify(this.notSuitableForTags)
        );
        formData.append(
          "productionProcess",
          JSON.stringify(this.productionProcessTags)
        );
        formData.append(
          "referencePrice",
          this.currentItem.referencePrice || ""
        );
        formData.append("grade", this.currentItem.grade || 0);
        formData.append("color", JSON.stringify(this.colorTags));
        formData.append("aroma", JSON.stringify(this.aromaTags));
        formData.append("taste", JSON.stringify(this.tasteTags));

        if (this.imageFile) {
          formData.append("image", this.imageFile);
        } else if (this.currentItem.imageUrl === "") {
          formData.append("removeImage", "true");
        } else {
          formData.append("imageUrl", this.currentItem.imageUrl);
        }

        const response = await updateTeaKnowledge(
          this.currentItem._id,
          formData
        );
        this.$emit("saved", response.message);
      } catch (err) {
        console.error("更新茶知识失败:", err.message);
        this.$emit("error", err.message || "更新茶知识失败。");
      } finally {
        this.closeModal();
      }
    },
  },
};
</script>

<style scoped>
/* Modal backdrop and content styling */
.fixed.inset-0.bg-gray-600.bg-opacity-50 {
  display: flex;
  align-items: center;
  justify-content: center;
}

.max-h-\[90vh\] {
  max-height: 90vh;
}

/* Custom styles for tag input */
.tag-input-container {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  /* Removed border: 1px solid #d1d5db; */
  border-radius: 0.25rem; /* rounded */
  padding: 0.5rem; /* p-2 */
  min-height: 2.5rem; /* Matches input height */
  background-color: #fff;
}

.input-new-tag {
  /* Removed flex-grow: 1; to allow explicit width control */
  min-width: 200px; /* Default minimum width */
  width: auto; /* Allows width to adapt to content */
  margin-left: 0.5rem;
  vertical-align: bottom;
  /* Removed border: none !important; which was commented out anyway */
  outline: none !important; /* Keep outline removed for custom focus styling */
  box-shadow: none !important; /* Keep shadow removed for custom focus styling */
  padding: 0.5rem 0.75rem; /* py-2 px-3 equivalent */
  height: auto; /* Allow height to adjust */
  /* Add explicit border styles for consistent appearance and beauty */
  border: 1px solid #d1d5db; /* Default border color (gray-300) */
  border-radius: 0.25rem; /* Rounded corners */
  transition: border-color 0.3s ease, box-shadow 0.3s ease; /* Smooth transition */
}

/* Enhancing focus style, leveraging existing focus:border-stone-500 */
.input-new-tag:focus {
  border-color: #8b5cf6; /* Matches stone-500 from Tailwind if possible, or a similar vibrant color */
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.2); /* A subtle glow, color from stone-500 */
}

.button-new-tag {
  margin-left: 0.5rem;
  height: 32px;
  line-height: 30px;
  padding-top: 0;
  padding-bottom: 0;
  background-color: #e5e7eb; /* gray-200 */
  color: #4b5563; /* gray-700 */
  border-radius: 0.25rem;
  font-weight: 700;
  padding: 0.5rem 0.75rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
}
.button-new-tag:hover {
  background-color: #d1d5db; /* gray-300 */
}
</style>