import axios from 'axios';
// import { ElMessage } from 'element-plus'; // 假设你使用 Element Plus 作为 UI 库

// 创建 axios 实例
const service = axios.create({
    baseURL: process.env.VUE_APP_BASE_API || '/api', // api 的 base_url
    timeout: 5000, // 请求超时时间
});

// request 拦截器
service.interceptors.request.use(
    config => {
        // 检查是否存在 token，如果存在则添加到请求头中
        const token = localStorage.getItem('token'); // 假设 token 存储在 localStorage
        if (token) {
            config.headers['x-auth-token'] = token;
        }
        return config;
    },
    error => {
        // 请求错误处理
        console.error('请求发送错误:', error);
        return Promise.reject(error);
    }
);

// response 拦截器
service.interceptors.response.use(
    response => {
        const res = response.data;
        // 如果后端返回的 code 不是 200，则统一处理错误
        if (res.code !== 200) {
            // ElMessage({
            //     message: res.message || 'Error',
            //     type: 'error',
            //     duration: 5 * 1000
            // });
            alert(res.message || 'Error');

            // 根据不同的错误码，可以添加更细致的错误处理逻辑
            // 例如：401 未授权，可以跳转到登录页面
            if (res.code === 401) {
                // 假设你有某种机制来处理未授权（例如，清空 token 并跳转到登录页）
                // store.dispatch('user/resetToken').then(() => {
                //   location.reload()
                // })
                // 简单处理：提示并清空 token (如果需要跳转登录，可以在这里加上 router.push('/login'))
                alert('您的登录已过期或未授权，请重新登录。');
                localStorage.removeItem('token'); // 清除无效 token
                // window.location.href = '/login'; // 根据您的路由配置跳转到登录页
            }
            return Promise.reject(new Error(res.message || 'Error'));
        } else {
            return res;
        }
    },
    error => {
        console.error('请求错误:', error);
        let message = error.message;
        if (error.response && error.response.data) {
            message = error.response.data.message || error.response.data.msg || message;
        }

        // ElMessage({
        //     message: message,
        //     type: 'error',
        //     duration: 5 * 1000
        // });
        alert(message);
        return Promise.reject(error);
    }
);

export default service;