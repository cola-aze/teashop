const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const adminAuth = require('../middleware/adminAuth');
const upload = require('../middleware/upload');
const Poster = require('../models/Poster');

// @route   POST /
// @desc    新增海报图
// @access  Private (Admin)
router.post(
    '/',
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
        const imageUrl = req.file ? `/uploads/posters/${req.file.filename}` : null;

        if (!imageUrl) {
            return res.error(400, '图片是必需的');
        }

        try {
            const newPoster = new Poster({
                title,
                imageUrl,
                linkUrl,
                order: parseInt(order),
            });

            const poster = await newPoster.save();
            res.success(poster, "海报图新增成功");
        } catch (err) {
            console.error(err.message);
            res.error(500, "服务器错误", err.message);
        }
    }
);

// @route   GET /
// @desc    获取所有海报图
// @access  Private (Admin)
router.get('/', adminAuth, async(req, res) => {
    try {
        const items = await Poster.find().sort({ order: 1 });
        res.success(items, "获取海报图列表成功");
    } catch (err) {
        console.error(err.message);
        res.error(500, "服务器错误", err.message);
    }
});

// @route   PUT /:id
// @desc    更新海报图
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
        let imageUrl = req.body.imageUrl;

        if (req.file) {
            imageUrl = `/uploads/posters/${req.file.filename}`;
        } else if (req.body.removeImage === 'true') {
            imageUrl = null;
        }

        const posterFields = {
            title,
            linkUrl,
            order: parseInt(order),
        };

        if (imageUrl !== undefined) {
            posterFields.imageUrl = imageUrl;
        }

        try {
            let poster = await Poster.findById(req.params.id);

            if (!poster) {
                return res.error(404, '海报图项未找到');
            }

            poster = await Poster.findByIdAndUpdate(
                req.params.id, { $set: posterFields }, { new: true }
            );

            res.success(poster, "海报图更新成功");
        } catch (err) {
            console.error(err.message);
            res.error(500, "服务器错误", err.message);
        }
    }
);

// @route   DELETE /:id
// @desc    删除海报图
// @access  Private (Admin)
router.delete('/:id', adminAuth, async(req, res) => {
    try {
        await Poster.findByIdAndRemove(req.params.id);
        res.success(null, '海报图项已删除');
    } catch (err) {
        console.error(err.message);
        res.error(500, "服务器错误", err.message);
    }
});

module.exports = router;