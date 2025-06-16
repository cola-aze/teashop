const express = require('express');
const router = express.Router();
// const { check, validationResult } = require('express-validator'); // 验证器现在在各自路由文件中导入
const adminAuth = require('../middleware/adminAuth');
// const upload = require('../middleware/upload'); // 文件上传中间件现在在各自路由文件中导入

// 引入新的路由文件
const adminUserRouter = require('./adminUser');
const adminCarouselRouter = require('././adminCarousel');
const adminPosterRouter = require('./adminPoster');
const adminProductRouter = require('./adminProduct');
const adminTeaKnowledgeRouter = require('./adminTeaKnowledge');
const adminDictionaryRouter = require('./adminDictionary');
const uploadRouter = require('./upload'); // 引入上传路由

// 挂载新的路由
router.use('/users', adminUserRouter);
router.use('/carousel', adminCarouselRouter);
router.use('/posters', adminPosterRouter);
router.use('/products', adminProductRouter);
router.use('/tea-knowledge', adminTeaKnowledgeRouter);
router.use('/dictionary', adminDictionaryRouter);
router.use('/', uploadRouter); // 挂载上传路由

module.exports = router;