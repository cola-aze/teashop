const express = require('express');
const router = express.Router();
const FeaturedCategory = require('../models/FeaturedCategory');
const adminAuth = require('../middleware/adminAuth');
const upload = require('../middleware/upload');

// 获取所有优选分类
router.get('/', adminAuth, async(req, res) => {
    try {
        const categories = await FeaturedCategory.find().sort({ order: 1 });
        res.success(categories, '获取优选分类成功');
    } catch (err) {
        res.error(500, '获取优选分类失败', err.message);
    }
});

// 添加新的优选分类
router.post('/', adminAuth, upload.array('images', 2), async(req, res) => {
    const { name, link, description } = req.body;
    const imageUrls = req.files ? req.files.map(file => `/uploads/featured-categories/${file.filename}`) : [];

    if (!name || !link || imageUrls.length === 0) {
        return res.error(400, '请提供名称、链接和至少一张图片');
    }

    // Get the maximum order value and set the new category's order to max + 1
    const latestCategory = await FeaturedCategory.findOne().sort({ order: -1 });
    const newOrder = latestCategory ? latestCategory.order + 1 : 0;

    const category = new FeaturedCategory({
        name,
        description,
        imageUrls,
        link,
        order: newOrder,
    });

    try {
        const newCategory = await category.save();
        res.success(newCategory, '优选分类添加成功');
    } catch (err) {
        res.error(400, '添加优选分类失败', err.message);
    }
});

// 更新优选分类的排序
router.put('/reorder', adminAuth, async(req, res) => {
    try {
        const { orderedIds } = req.body;

        if (!orderedIds || !Array.isArray(orderedIds)) {
            return res.error(400, '缺少或排序ID格式不正确');
        }

        for (let i = 0; i < orderedIds.length; i++) {
            await FeaturedCategory.findByIdAndUpdate(orderedIds[i], { order: i }, { new: true });
        }

        res.success(null, '优选分类排序更新成功');
    } catch (err) {
        console.error('更新优选分类排序失败:', err);
        res.error(500, '更新优选分类排序失败', err.message);
    }
});

// 更新优选分类
router.put('/:id', adminAuth, upload.array('images', 2), async(req, res) => {
    try {
        const category = await FeaturedCategory.findById(req.params.id);
        if (!category) {
            return res.error(404, '优选分类未找到');
        }

        category.name = req.body.name || category.name;
        category.link = req.body.link || category.link;
        category.description = req.body.description !== undefined ? category.description : category.description;

        let finalImageUrls = [];

        // Process retained image URLs from the frontend
        if (req.body.retainedImageUrls) {
            try {
                const retained = JSON.parse(req.body.retainedImageUrls);
                if (Array.isArray(retained)) {
                    finalImageUrls = [...retained];
                } else {
                    return res.error(400, 'retainedImageUrls 格式不正确');
                }
            } catch (jsonError) {
                return res.error(400, 'retainedImageUrls 解析失败', jsonError.message);
            }
        }

        // Add newly uploaded image URLs
        if (req.files && req.files.length > 0) {
            const newImageUrls = req.files.map(file => `/uploads/featured-categories/${file.filename}`);
            finalImageUrls = [...finalImageUrls, ...newImageUrls];
        }

        if (finalImageUrls.length === 0) {
            return res.error(400, '请至少保留一张图片或上传新图片');
        }

        if (finalImageUrls.length > 2) {
            return res.error(400, '图片总数不能超过两张');
        }

        category.imageUrls = finalImageUrls;

        const updatedCategory = await category.save();
        res.success(updatedCategory, '优选分类更新成功');
    } catch (err) {
        res.error(400, '更新优选分类失败', err.message);
    }
});

// 删除优选分类
router.delete('/:id', adminAuth, async(req, res) => {
    try {
        const category = await FeaturedCategory.findById(req.params.id);
        if (!category) {
            return res.error(404, '优选分类未找到');
        }

        await category.deleteOne();
        res.success(null, '优选分类删除成功');
    } catch (err) {
        res.error(500, '删除优选分类失败', err.message);
    }
});

module.exports = router;