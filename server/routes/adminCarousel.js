const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const adminAuth = require('../middleware/adminAuth');
const upload = require('../middleware/upload');
const CarouselItem = require('../models/CarouselItem');
const fs = require('fs');
const path = require('path');

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
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const items = await CarouselItem.find().sort({ order: 1 }).skip(skip).limit(limit);
        const totalItems = await CarouselItem.countDocuments();

        res.success({ items, totalItems }, "获取轮播图列表成功");
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
        let newImageUrl = req.body.imageUrl; // 前端可能直接传回现有 imageUrl

        try {
            let carouselItem = await CarouselItem.findById(req.params.id);

            if (!carouselItem) {
                return res.error(404, '轮播图项未找到');
            }

            const oldImageUrl = carouselItem.imageUrl; // 保存旧的图片路径

            // 如果有新文件上传，更新 imageUrl 并删除旧文件
            if (req.file) {
                newImageUrl = `/uploads/carousel/${req.file.filename}`;
                if (oldImageUrl) {
                    const oldImagePath = path.join(__dirname, '..', 'public', oldImageUrl);
                    fs.unlink(oldImagePath, (err) => {
                        if (err) console.error('删除旧图片失败:', err);
                    });
                }
            } else if (req.body.removeImage === 'true') {
                // 如果前端指示移除图片，删除旧文件
                newImageUrl = null;
                if (oldImageUrl) {
                    const oldImagePath = path.join(__dirname, '..', 'public', oldImageUrl);
                    fs.unlink(oldImagePath, (err) => {
                        if (err) console.error('删除旧图片失败:', err);
                    });
                }
            }
            // 如果没有新文件且没有移除图片，newImageUrl保持req.body.imageUrl的值，即旧的imageUrl

            const carouselItemFields = {
                title,
                linkUrl,
                order: parseInt(order),
            };

            // 只有当图片路径发生变化时才更新 imageUrl 字段
            if (newImageUrl !== undefined && newImageUrl !== oldImageUrl) {
                carouselItemFields.imageUrl = newImageUrl;
            }
            // 如果前端没有上传新文件，并且没有显式请求删除图片，但是 currentItem.imageUrl 是空的，这意味着用户删除了图片但是没有上传新的
            // 这种情况下，imageUrl 会被设置为 null
            if (req.body.removeImage === 'true' && !newImageUrl) {
                carouselItemFields.imageUrl = null;
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