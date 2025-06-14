import service from '@/utils/request';

// 用户管理
/**
 * @description 获取所有用户列表 (管理员权限)
 * @returns {Promise} - 返回一个 Promise 对象，包含用户列表数据（不含密码）
 */
export function getUsers() {
    return service({
        url: '/admin/users',
        method: 'get'
    });
}

/**
 * @description 删除指定用户 (管理员权限)
 * @param {string} id - 用户 ID
 * @returns {Promise} - 返回一个 Promise 对象，表示删除操作的结果
 */
export function deleteUser(id) {
    return service({
        url: `/admin/users/${id}`,
        method: 'delete'
    });
}

// 轮播图管理
/**
 * @description 获取所有轮播图列表 (管理员权限)
 * @returns {Promise} - 返回一个 Promise 对象，包含轮播图列表数据
 */
export function getCarouselItems() {
    return service({
        url: '/admin/carousel',
        method: 'get'
    });
}

/**
 * @description 新增轮播图 (管理员权限)
 * @param {FormData} data - 轮播图数据，包含 title, linkUrl, order, 和 image 文件
 * @param {string} data.title - 轮播图标题
 * @param {string} data.linkUrl - 轮播图链接 URL
 * @param {number} data.order - 轮播图排序
 * @param {File} data.image - 轮播图图片文件
 * @returns {Promise} - 返回一个 Promise 对象，包含新增的轮播图信息
 */
export function addCarouselItem(data) {
    return service({
        url: '/admin/carousel',
        method: 'post',
        data,
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
}

/**
 * @description 更新轮播图 (管理员权限)
 * @param {string} id - 轮播图 ID
 * @param {FormData} data - 轮播图更新数据，包含 title, linkUrl, order, 可选的 image 文件或 removeImage 标识
 * @param {string} data.title - 轮播图标题
 * @param {string} data.linkUrl - 轮播图链接 URL
 * @param {number} data.order - 轮播图排序
 * @param {File} [data.image] - 新的轮播图图片文件（可选）
 * @param {boolean} [data.removeImage] - 是否移除现有图片（可选，如果为 true，则 imageUrl 设置为 null）
 * @returns {Promise} - 返回一个 Promise 对象，包含更新后的轮播图信息
 */
export function updateCarouselItem(id, data) {
    return service({
        url: `/admin/carousel/${id}`,
        method: 'put',
        data,
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
}

/**
 * @description 删除指定轮播图 (管理员权限)
 * @param {string} id - 轮播图 ID
 * @returns {Promise} - 返回一个 Promise 对象，表示删除操作的结果
 */
export function deleteCarouselItem(id) {
    return service({
        url: `/admin/carousel/${id}`,
        method: 'delete'
    });
}

// 海报管理
/**
 * @description 获取所有海报图列表 (管理员权限)
 * @returns {Promise} - 返回一个 Promise 对象，包含海报图列表数据
 */
export function getPosterItems() {
    return service({
        url: '/admin/posters',
        method: 'get'
    });
}

/**
 * @description 新增海报图 (管理员权限)
 * @param {FormData} data - 海报图数据，包含 title, linkUrl, order, 和 image 文件
 * @param {string} data.title - 海报图标题
 * @param {string} data.linkUrl - 海报图链接 URL
 * @param {number} data.order - 海报图排序
 * @param {File} data.image - 海报图图片文件
 * @returns {Promise} - 返回一个 Promise 对象，包含新增的海报图信息
 */
export function addPosterItem(data) {
    return service({
        url: '/admin/posters',
        method: 'post',
        data,
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
}

/**
 * @description 更新海报图 (管理员权限)
 * @param {string} id - 海报图 ID
 * @param {FormData} data - 海报图更新数据，包含 title, linkUrl, order, 可选的 image 文件或 removeImage 标识
 * @param {string} data.title - 海报图标题
 * @param {string} data.linkUrl - 海报图链接 URL
 * @param {number} data.order - 海报图排序
 * @param {File} [data.image] - 新的海报图图片文件（可选）
 * @param {boolean} [data.removeImage] - 是否移除现有图片（可选，如果为 true，则 imageUrl 设置为 null）
 * @returns {Promise} - 返回一个 Promise 对象，包含更新后的海报图信息
 */
export function updatePosterItem(id, data) {
    return service({
        url: `/admin/posters/${id}`,
        method: 'put',
        data,
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
}

/**
 * @description 删除指定海报图 (管理员权限)
 * @param {string} id - 海报图 ID
 * @returns {Promise} - 返回一个 Promise 对象，表示删除操作的结果
 */
export function deletePosterItem(id) {
    return service({
        url: `/admin/posters/${id}`,
        method: 'delete'
    });
}

// 茶品管理
/**
 * @description 获取所有茶品列表 (管理员权限)
 * @returns {Promise} - 返回一个 Promise 对象，包含茶品列表数据
 */
export function getProducts() {
    return service({
        url: '/admin/products',
        method: 'get'
    });
}

/**
 * @description 新增茶品 (管理员权限)
 * @param {FormData} data - 茶品数据，包含 name, category, price, stock, description, order, level 和 image 文件
 * @param {string} data.name - 茶品名称
 * @param {string} data.category - 茶品类别
 * @param {number} data.price - 茶品价格
 * @param {number} data.stock - 茶品库存
 * @param {string} data.description - 茶品描述
 * @param {number} data.order - 茶品排序
 * @param {string} data.level - 茶品等级
 * @param {File} data.image - 茶品图片文件
 * @returns {Promise} - 返回一个 Promise 对象，包含新增的茶品信息
 */
export function addProduct(data) {
    return service({
        url: '/admin/products',
        method: 'post',
        data,
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
}

/**
 * @description 更新茶品 (管理员权限)
 * @param {string} id - 茶品 ID
 * @param {FormData} data - 茶品更新数据，包含 name, category, price, stock, description, order, level, 可选的 image 文件或 removeImage 标识
 * @param {string} data.name - 茶品名称
 * @param {string} data.category - 茶品类别
 * @param {number} data.price - 茶品价格
 * @param {number} data.stock - 茶品库存
 * @param {string} data.description - 茶品描述
 * @param {number} data.order - 茶品排序
 * @param {string} data.level - 茶品等级
 * @param {File} [data.image] - 新的茶品图片文件（可选）
 * @param {boolean} [data.removeImage] - 是否移除现有图片（可选，如果为 true，则 imageUrl 设置为 null）
 * @returns {Promise} - 返回一个 Promise 对象，包含更新后的茶品信息
 */
export function updateProduct(id, data) {
    return service({
        url: `/admin/products/${id}`,
        method: 'put',
        data,
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
}

/**
 * @description 删除指定茶品 (管理员权限)
 * @param {string} id - 茶品 ID
 * @returns {Promise} - 返回一个 Promise 对象，表示删除操作的结果
 */
export function deleteProduct(id) {
    return service({
        url: `/admin/products/${id}`,
        method: 'delete'
    });
}

// 茶知识管理
/**
 * @description 获取所有茶知识列表 (管理员权限)
 * @returns {Promise} - 返回一个 Promise 对象，包含茶知识列表数据
 */
export function getTeaKnowledgeList() {
    return service({
        url: '/admin/tea-knowledge',
        method: 'get'
    });
}

/**
 * @description 新增茶知识 (管理员权限)
 * @param {FormData} data - 茶知识数据，包含 title, category, content, order 和可选的 image 文件
 * @param {string} data.title - 茶知识标题
 * @param {string} data.category - 茶知识分类
 * @param {string} data.content - 茶知识内容
 * @param {number} data.order - 排序字段
 * @param {File} [data.image] - 茶知识图片文件（可选）
 * @returns {Promise} - 返回一个 Promise 对象，包含新增的茶知识信息
 */
export function addTeaKnowledge(data) {
    return service({
        url: '/admin/tea-knowledge',
        method: 'post',
        data,
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
}

/**
 * @description 更新茶知识 (管理员权限)
 * @param {string} id - 茶知识 ID
 * @param {FormData} data - 茶知识更新数据，包含 title, category, content, order, 可选的 image 文件或 removeImage 标识
 * @param {string} data.title - 茶知识标题
 * @param {string} data.category - 茶知识分类
 * @param {string} data.content - 茶知识内容
 * @param {number} data.order - 排序字段
 * @param {File} [data.image] - 新的茶知识图片文件（可选）
 * @param {boolean} [data.removeImage] - 是否移除现有图片（可选，如果为 true，则 imageUrl 设置为 null）
 * @returns {Promise} - 返回一个 Promise 对象，包含更新后的茶知识信息
 */
export function updateTeaKnowledge(id, data) {
    return service({
        url: `/admin/tea-knowledge/${id}`,
        method: 'put',
        data,
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
}

/**
 * @description 删除指定茶知识 (管理员权限)
 * @param {string} id - 茶知识 ID
 * @returns {Promise} - 返回一个 Promise 对象，表示删除操作的结果
 */
export function deleteTeaKnowledge(id) {
    return service({
        url: `/admin/tea-knowledge/${id}`,
        method: 'delete'
    });
}

// 数据字典管理
/**
 * @description 获取所有数据字典项列表 (管理员权限)
 * @param {object} params - 查询参数对象
 * @param {string} [params.type] - 字典项类型，用于筛选
 * @returns {Promise} - 返回一个 Promise 对象，包含数据字典项列表数据
 */
export function getDictionaryItems(params) {
    return service({
        url: '/admin/dictionary',
        method: 'get',
        params
    });
}

/**
 * @description 新增数据字典项 (管理员权限)
 * @param {object} data - 数据字典项数据，包含 name, value, type, order
 * @param {string} data.name - 字典项名称
 * @param {string} data.value - 字典项值
 * @param {string} data.type - 字典项类型
 * @param {number} [data.order] - 排序字段（可选）
 * @returns {Promise} - 返回一个 Promise 对象，包含新增的字典项信息
 */
export function addDictionaryItem(data) {
    return service({
        url: '/admin/dictionary',
        method: 'post',
        data
    });
}

/**
 * @description 更新数据字典项 (管理员权限)
 * @param {string} id - 字典项 ID
 * @param {object} data - 数据字典项更新数据，包含 name, value, type, order
 * @param {string} data.name - 字典项名称
 * @param {string} data.value - 字典项值
 * @param {string} data.type - 字典项类型
 * @param {number} [data.order] - 排序字段（可选）
 * @returns {Promise} - 返回一个 Promise 对象，包含更新后的字典项信息
 */
export function updateDictionaryItem(id, data) {
    return service({
        url: `/admin/dictionary/${id}`,
        method: 'put',
        data
    });
}

/**
 * @description 删除指定数据字典项 (管理员权限)
 * @param {string} id - 字典项 ID
 * @returns {Promise} - 返回一个 Promise 对象，表示删除操作的结果
 */
export function deleteDictionaryItem(id) {
    return service({
        url: `/admin/dictionary/${id}`,
        method: 'delete'
    });
}

/**
 * @description 切换用户管理员状态 (管理员权限)
 * @param {string} id - 用户 ID
 * @returns {Promise} - 返回一个 Promise 对象，表示操作结果
 */
export function toggleUserAdminStatus(id) {
    return service({
        url: `/admin/users/${id}/toggle-admin`,
        method: 'patch' // 或者 put，取决于后端设计
    });
}