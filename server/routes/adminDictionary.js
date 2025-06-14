const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const adminAuth = require('../middleware/adminAuth');
const DictionaryItem = require('../models/DictionaryItem');

// @route   POST /api/admin/dictionary
// @desc    新增字典项
// @access  Private (Admin)
router.post(
    '/',
    adminAuth, [
        check('type', '类型是必需的').not().isEmpty(),
        check('value', '值是必需的').not().isEmpty(),
    ],
    async(req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.error(400, "验证错误", errors.array());
        }

        const { type, value, description, order } = req.body;

        try {
            const newDictionaryItem = new DictionaryItem({
                type,
                value,
                description,
                order: parseInt(order) || 0, // 默认值为 0
            });
            const dictionaryItem = await newDictionaryItem.save();
            res.success(dictionaryItem, '字典项新增成功');
        } catch (err) {
            console.error(err.message);
            res.error(500, "服务器错误", err.message);
        }
    }
);

// @route   GET /api/admin/dictionary
// @desc    获取所有字典项，可按类型过滤
// @access  Private (Admin)
router.get('/', adminAuth, async(req, res) => {
    try {
        const { type } = req.query;
        let query = {};
        if (type) {
            query.type = type;
        }
        const items = await DictionaryItem.find(query).sort({ order: 1 });
        res.success(items, '获取字典项列表成功');
    } catch (err) {
        console.error(err.message);
        res.error(500, "服务器错误", err.message);
    }
});

// @route   PUT /api/admin/dictionary/:id
// @desc    更新字典项
// @access  Private (Admin)
router.put(
    '/:id',
    adminAuth, [
        check('type', '类型是必需的').not().isEmpty(),
        check('value', '值是必需的').not().isEmpty(),
    ],
    async(req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.error(400, "验证错误", errors.array());
        }

        const { type, value, description, order } = req.body;

        try {
            let dictionaryItem = await DictionaryItem.findById(req.params.id);
            if (!dictionaryItem) {
                return res.error(404, '字典项未找到');
            }

            dictionaryItem.type = type;
            dictionaryItem.value = value;
            dictionaryItem.description = description;
            dictionaryItem.order = parseInt(order) || 0;

            const updatedItem = await dictionaryItem.save();
            res.success(updatedItem, '字典项更新成功');
        } catch (err) {
            console.error(err.message);
            res.error(500, "服务器错误", err.message);
        }
    }
);

// @route   DELETE /api/admin/dictionary/:id
// @desc    删除字典项
// @access  Private (Admin)
router.delete('/:id', adminAuth, async(req, res) => {
    try {
        await DictionaryItem.findByIdAndRemove(req.params.id);
        res.success(null, '字典项已删除');
    } catch (err) {
        console.error(err.message);
        res.error(500, "服务器错误", err.message);
    }
});

module.exports = router;