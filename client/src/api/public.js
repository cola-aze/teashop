import service from '@/utils/request';

/**
 * @description 获取所有轮播图项 (公开，无需认证)
 * @returns {Promise} - 返回一个 Promise 对象，包含轮播图列表数据
 */
export function getCarouselItemsPublic() {
    return service({
        url: '/carousel',
        method: 'get'
    });
}

/**
 * @description 获取所有海报图项 (公开，无需认证)
 * @returns {Promise} - 返回一个 Promise 对象，包含海报图列表数据
 */
export function getPosterItemsPublic() {
    return service({
        url: '/posters',
        method: 'get'
    });
}

/**
 * @description 获取所有产品项 (公开，无需认证)
 * @returns {Promise} - 返回一个 Promise 对象，包含产品列表数据
 */
export function getProductsPublic() {
    return service({
        url: '/products',
        method: 'get'
    });
}

/**
 * @description 获取所有茶知识项 (公开，无需认证)
 * @returns {Promise} - 返回一个 Promise 对象，包含茶知识列表数据
 */
export function getTeaKnowledgeListPublic() {
    return service({
        url: '/tea-knowledge',
        method: 'get'
    });
}

/**
 * @description 获取字典项 (公开，无需认证)
 * @param {object} params - 查询参数，例如 { type: 'tea_category' }
 * @returns {Promise} - 返回一个 Promise 对象，包含字典项列表数据
 */
export function getDictionaryItemsPublic(params) {
    return service({
        url: '/dictionary',
        method: 'get',
        params
    });
}