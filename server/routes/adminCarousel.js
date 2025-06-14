const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const adminAuth = require('../middleware/adminAuth');
const upload = require('../middleware/upload');
const CarouselItem = require('../models/CarouselItem');

// @route   POST /api/admin/carousel
// @desc    新增轮播图
// @access  Private (Admin)
router.post(
    '/',
    adminAuth,
    upload.single('image'), // 单文件上传，字段名为 'image'
    [
        check('title', '标题是必需的').not().isEmpty(),
        check('linkUrl', '链接是必需的').not().isEmpty(), // 确保 linkUrl 是必需的
        check('order', '排序是必需的，且必须是数字').isInt(),
    ],
    async(req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.error(400, "验证错误", errors.array());
        }

        const { title, linkUrl, order } = req.body;
        const imageUrl = req.file ? `/uploads/carousel/${req.file.filename}` : null; // 保存相对路径

        // 如果没有上传文件且 imageUrl 为空，则返回错误
        if (!imageUrl) {
            return res.error(400, '图片是必需的');
        }

        try {
            const newCarouselItem = new CarouselItem({
                title,
                imageUrl, // 统一使用 imageUrl
                linkUrl,
                order: parseInt(order),
            });

            const carouselItem = await newCarouselItem.save();
            res.success(carouselItem, "轮播图新增成功");
        } catch (err) {
            console.error(err.message);
            res.error(500, "服务器错误", err.message);
        }
    }
);

// @route   GET /api/admin/carousel
// @desc    获取所有轮播图
// @access  Private (Admin)
router.get('/', adminAuth, async(req, res) => {
    try {
        const items = await CarouselItem.find().sort({ order: 1 });
        res.success(items, "获取轮播图列表成功");
    } catch (err) {
        console.error(err.message);
        res.error(500, "服务器错误", err.message);
    }
});

// @route   PUT /api/admin/carousel/:id
// @desc    更新轮播图
// @access  Private (Admin)
router.put(
    '/:id',
    adminAuth,
    upload.single('image'), [
        check('title', '标题是必需的').not().isEmpty(),
        check('linkUrl', '链接是必需的').not().isEmpty(),
        check('order', '排序是必需的，且必须是数字').isInt(),
    ],
    async(req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.error(400, "验证错误", errors.array());
        }

        const { title, linkUrl, order } = req.body;
        let imageUrl = req.body.imageUrl; // 前端可能直接传回现有 imageUrl

        // 如果有新文件上传，更新 imageUrl
        if (req.file) {
            imageUrl = `/uploads/carousel/${req.file.filename}`;
        } else if (req.body.removeImage === 'true') {
            // 如果前端指示移除图片
            imageUrl = null;
        }

        const carouselItemFields = {
            title,
            linkUrl,
            order: parseInt(order),
        };

        if (imageUrl !== undefined) {
            carouselItemFields.imageUrl = imageUrl;
        }


        try {
            let carouselItem = await CarouselItem.findById(req.params.id);

            if (!carouselItem) {
                return res.error(404, '轮播图项未找到');
            }

            carouselItem = await CarouselItem.findByIdAndUpdate(
                req.params.id, { $set: carouselItemFields }, { new: true }
            );

            res.success(carouselItem, "轮播图更新成功");
        } catch (err) {
            console.error(err.message);
            res.error(500, "服务器错误", err.message);
        }
    }
);

// @route   DELETE /api/admin/carousel/:id
// @desc    删除轮播图
// @access  Private (Admin)
router.delete('/:id', adminAuth, async(req, res) => {
    try {
        await CarouselItem.findByIdAndRemove(req.params.id);
        res.success(null, '轮播图项已删除');
    } catch (err) {
        console.error(err.message);
        res.error(500, "服务器错误", err.message);
    }
});

module.exports = router;