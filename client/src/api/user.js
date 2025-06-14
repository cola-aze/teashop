import service from '@/utils/request';

/**
 * @description 获取当前用户的个人信息
 * @returns {Promise} - 返回一个 Promise 对象，包含用户的个人信息（不含密码）
 */
export function getUserProfile() {
    return service({
        url: '/user/profile',
        method: 'get',
    });
}

/**
 * @description 更新当前用户的个人信息
 * @param {Object} data - 用户更新数据，可选字段包括 email, address, phone, avatar
 * @param {string} [data.email] - 用户邮箱
 * @param {string} [data.address] - 用户地址
 * @param {string} [data.phone] - 用户电话
 * @param {string} [data.avatar] - 用户头像 URL
 * @returns {Promise} - 返回一个 Promise 对象，包含更新后的用户个人信息
 */
export function updateUserInfo(data) {
    return service({
        url: '/user/profile',
        method: 'put',
        data
    });
}

/**
 * @description 上传用户头像
 * @param {FormData} data - 包含头像文件的 FormData 对象，字段名为 'avatar'
 * @returns {Promise} - 返回一个 Promise 对象，包含头像上传成功后的信息（avatarUrl）
 */
export function uploadAvatar(data) {
    return service({
        url: '/user/avatar/upload',
        method: 'post',
        data,
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
}