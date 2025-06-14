import service from '@/utils/request';

/**
 * @description 用户登录
 * @param {Object} data - 登录数据，包含 username 和 password
 * @param {string} data.username - 用户名
 * @param {string} data.password - 密码
 * @returns {Promise} - 返回一个 Promise 对象，包含登录成功后的数据（token, username, avatar, isAdmin）
 */
export function login(data) {
    return service({
        url: '/auth/login',
        method: 'post',
        data
    });
}

/**
 * @description 用户注册
 * @param {Object} data - 注册数据，包含 username 和 password
 * @param {string} data.username - 用户名
 * @param {string} data.password - 密码
 * @returns {Promise} - 返回一个 Promise 对象，包含注册成功后的数据（token, username, avatar, isAdmin）
 */
export function register(data) {
    return service({
        url: '/auth/register',
        method: 'post',
        data
    });
}