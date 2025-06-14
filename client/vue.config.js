/*
 * @Author: cola 1459590357@qq.com
 * @Date: 2025-06-15 02:51:48
 * @LastEditors: cola 1459590357@qq.com
 * @LastEditTime: 2025-06-15 02:52:07
 * @FilePath: \teashop\client\vue.config.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
module.exports = {
    devServer: {
        proxy: {
            '/api': {
                target: 'http://localhost:5000', // 你的后端服务地址
                changeOrigin: true, // 改变源，解决跨域
                pathRewrite: {
                    '^/api': '/api' // 重写路径，如果后端接口不带 /api，这里需要调整
                }
            },
            // 如果你的静态资源（例如上传的图片）也是通过后端服务获取，并且路径是 /uploads，你可能还需要添加一个代理
            '/uploads': {
                target: 'http://localhost:5000',
                changeOrigin: true
            }
        }
    }
};