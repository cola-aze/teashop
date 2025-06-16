// 示例: 在 server/routes/admin.js 或新创建的 server/routes/upload.js 中
const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload'); // 确保引入您的上传中间件

// 图片上传接口，用于 Quill 编辑器内部图片
router.post('/upload-editor-image', upload.single('image'), (req, res) => {
    if (req.file) {
        // 假设您的 upload 中间件会将文件保存到 /public/uploads/tea-knowledge/
        // 如果您希望将编辑器图片保存到不同的目录，请调整 upload 中间件的配置
        const imageUrl = `/uploads/tea-knowledge/${req.file.filename}`; // 请根据您的实际保存路径调整
        return res.json({ code: 200, message: '图片上传成功', data: { url: imageUrl } });
    } else {
        return res.status(400).json({ code: 400, message: '图片上传失败' });
    }
});

module.exports = router;