const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 设置存储引擎
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        let uploadPath = 'public/uploads/';
        // 根据请求的URL或文件类型判断存储路径
        if (req.originalUrl.includes('/api/admin/carousel')) {
            uploadPath += 'carousel/';
        } else if (req.originalUrl.includes('/api/admin/posters')) {
            uploadPath += 'posters/';
        } else if (req.originalUrl.includes('/api/admin/products')) {
            uploadPath += 'products/';
        } else if (req.originalUrl.includes('/api/admin/tea-knowledge')) {
            uploadPath += 'tea-knowledge/';
        } else if (req.originalUrl.includes('/api/admin/featured-categories')) { // 新增：处理优选分类图片上传
            uploadPath += 'featured-categories/';
        } else if (req.originalUrl.includes('/upload-editor-image')) { // 新增：处理 Quill 编辑器图片上传
            uploadPath += 'tea-knowledge/';
        } else {
            uploadPath += 'general/'; // 默认上传路径
        }

        // 确保目录存在
        fs.mkdirSync(uploadPath, { recursive: true });
        cb(null, uploadPath);
    },
    filename: function(req, file, cb) {
        // 使用当前时间戳作为文件名，保留原始文件扩展名
        cb(
            null,
            file.fieldname + '-' + Date.now() + path.extname(file.originalname)
        );
    },
});

// 创建 multer 实例
const upload = multer({ storage: storage });

module.exports = upload;