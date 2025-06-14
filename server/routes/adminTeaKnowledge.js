const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const adminAuth = require('../middleware/adminAuth');
const upload = require('../middleware/upload');
const TeaKnowledge = require('../models/TeaKnowledge');

// @route   POST /api/admin/tea-knowledge
// @desc    新增茶知识
// @access  Private (Admin)
router.post(
    '/',
    adminAuth,
    upload.single('image'), [
        check('category', '类别是必需的').not().isEmpty(),
        check('name', '名称是必需的').not().isEmpty(),
        check('description_short', '简短描述是必需的').not().isEmpty(),
        check('description_full', '完整描述是必需的').not().isEmpty(),
    ],
    async(req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.error(400, "验证错误", errors.array());
        }

        const { category, name, description_short, description_full, origin, appearance, liquorColor, infusedLeaves, benefits, brewingMethod, storageMethod, suitableFor, notSuitableFor, productionProcess, referencePrice, grade, shape, color, aroma, taste } = req.body;
        const imageUrl = req.file ? `/uploads/tea-knowledge/${req.file.filename}` : null; // 统一使用 imageUrl

        if (!imageUrl) {
            return res.error(400, '图片是必需的');
        }

        try {
            const newTeaKnowledge = new TeaKnowledge({
                category,
                name,
                description_short,
                description_full,
                imageUrl, // 统一使用 imageUrl
                origin,
                appearance,
                liquorColor: liquorColor ? JSON.parse(liquorColor) : [],
                infusedLeaves: infusedLeaves ? JSON.parse(infusedLeaves) : [],
                benefits: benefits ? JSON.parse(benefits) : [],
                brewingMethod,
                storageMethod,
                suitableFor: suitableFor ? JSON.parse(suitableFor) : [],
                notSuitableFor: notSuitableFor ? JSON.parse(notSuitableFor) : [],
                productionProcess: productionProcess ? JSON.parse(productionProcess) : [],
                referencePrice: parseFloat(referencePrice),
                grade: parseInt(grade),
                shape: shape ? JSON.parse(shape) : [],
                color: color ? JSON.parse(color) : [],
                aroma: aroma ? JSON.parse(aroma) : [],
                taste: taste ? JSON.parse(taste) : [],
            });

            const teaKnowledge = await newTeaKnowledge.save();
            res.success(teaKnowledge, "茶知识新增成功");
        } catch (err) {
            console.error(err.message);
            if (err.code === 11000 && err.keyPattern && err.keyPattern.name) {
                return res.error(400, "操作失败", "茶知识名称已存在，请使用其他名称。");
            }
            res.error(500, "服务器错误", err.message);
        }
    }
);

// @route   GET /api/admin/tea-knowledge
// @desc    获取所有茶知识
// @access  Private (Admin)
router.get('/', adminAuth, async(req, res) => {
    try {
        const items = await TeaKnowledge.find().sort({ createdAt: -1 });
        res.success(items, "获取茶知识列表成功");
    } catch (err) {
        console.error(err.message);
        res.error(500, "服务器错误", err.message);
    }
});

// @route   PUT /api/admin/tea-knowledge/:id
// @desc    更新茶知识
// @access  Private (Admin)
router.put(
    '/:id',
    adminAuth,
    upload.single('image'), [
        check('category', '类别是必需的').not().isEmpty(),
        check('name', '名称是必需的').not().isEmpty(),
        check('description_short', '简短描述是必需的').not().isEmpty(),
        check('description_full', '完整描述是必需的').not().isEmpty(),
    ],
    async(req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.error(400, "验证错误", errors.array());
        }

        const { category, name, description_short, description_full, origin, appearance, liquorColor, infusedLeaves, benefits, brewingMethod, storageMethod, suitableFor, notSuitableFor, productionProcess, referencePrice, grade, shape, color, aroma, taste } = req.body;
        let imageUrl = req.body.imageUrl; // 获取现有 imageUrl

        if (req.file) {
            imageUrl = `/uploads/tea-knowledge/${req.file.filename}`;
        } else if (req.body.removeImage === 'true') {
            imageUrl = null;
        }

        const teaKnowledgeFields = {
            category,
            name,
            description_short,
            description_full,
            origin,
            appearance,
            liquorColor: liquorColor ? JSON.parse(liquorColor) : [],
            infusedLeaves: infusedLeaves ? JSON.parse(infusedLeaves) : [],
            benefits: benefits ? JSON.parse(benefits) : [],
            brewingMethod,
            storageMethod,
            suitableFor: suitableFor ? JSON.parse(suitableFor) : [],
            notSuitableFor: notSuitableFor ? JSON.parse(notSuitableFor) : [],
            productionProcess: productionProcess ? JSON.parse(productionProcess) : [],
            referencePrice: parseFloat(referencePrice),
            grade: parseInt(grade),
            shape: shape ? JSON.parse(shape) : [],
            color: color ? JSON.parse(color) : [],
            aroma: aroma ? JSON.parse(aroma) : [],
            taste: taste ? JSON.parse(taste) : [],
        };

        if (imageUrl !== undefined) {
            teaKnowledgeFields.imageUrl = imageUrl;
        }

        try {
            let teaKnowledge = await TeaKnowledge.findById(req.params.id);

            if (!teaKnowledge) {
                return res.error(404, '茶知识未找到');
            }

            // 检查是否修改了名称并且新名称已存在
            if (name && name !== teaKnowledge.name) {
                const existingTeaKnowledge = await TeaKnowledge.findOne({ name });
                if (existingTeaKnowledge) {
                    return res.error(400, "操作失败", "茶知识名称已存在，请使用其他名称。");
                }
            }

            teaKnowledge = await TeaKnowledge.findByIdAndUpdate(
                req.params.id, { $set: teaKnowledgeFields }, { new: true }
            );

            res.success(teaKnowledge, "茶知识更新成功");
        } catch (err) {
            console.error(err.message);
            res.error(500, "服务器错误", err.message);
        }
    }
);

// @route   DELETE /api/admin/tea-knowledge/:id
// @desc    删除茶知识
// @access  Private (Admin)
router.delete('/:id', adminAuth, async(req, res) => {
    try {
        await TeaKnowledge.findByIdAndRemove(req.params.id);
        res.success(null, '茶知识项已删除');
    } catch (err) {
        console.error(err.message);
        res.error(500, "服务器错误", err.message);
    }
});

module.exports = router;