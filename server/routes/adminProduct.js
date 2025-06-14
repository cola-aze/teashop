const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const adminAuth = require('../middleware/adminAuth');
const upload = require('../middleware/upload');
const Product = require('../models/Product');

// @route   POST /api/admin/products
// @desc    新增茶品
// @access  Private (Admin)
router.post(
    '/',
    adminAuth,
    upload.single('image'), // 单文件上传，字段名为 'image'
    [
        check('name', '名称是必需的').not().isEmpty(),
        check('category', '类别是必需的').not().isEmpty(),
        check('price', '价格是必需的，且必须是数字').isFloat({ min: 0 }),
        check('stock', '库存是必需的，且必须是整数').isInt({ min: 0 }),
        check('description', '描述是必需的').not().isEmpty(),
    ],
    async(req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.error(400, "验证错误", errors.array());
        }

        const { name, category, price, stock, description, order, level } = req.body;
        const imageUrl = req.file ? `/uploads/products/${req.file.filename}` : null;

        if (!imageUrl) {
            return res.error(400, '图片是必需的');
        }

        try {
            const newProduct = new Product({
                name,
                category,
                price: parseFloat(price),
                stock: parseInt(stock),
                description,
                imageUrl, // 统一使用 imageUrl
                order: parseInt(order),
                level,
            });

            const product = await newProduct.save();
            res.success(product, "茶品新增成功");
        } catch (err) {
            console.error(err.message);
            res.error(500, "服务器错误", err.message);
        }
    }
);

// @route   GET /api/admin/products
// @desc    获取所有茶品
// @access  Private (Admin)
router.get('/', adminAuth, async(req, res) => {
    try {
        const products = await Product.find().sort({ category: 1, order: 1 });
        res.success(products, "获取茶品列表成功");
    } catch (err) {
        console.error(err.message);
        res.error(500, "服务器错误", err.message);
    }
});

// @route   PUT /api/admin/products/:id
// @desc    更新茶品
// @access  Private (Admin)
router.put(
    '/:id',
    adminAuth,
    upload.single('image'), [
        check('name', '名称是必需的').not().isEmpty(),
        check('category', '类别是必需的').not().isEmpty(),
        check('price', '价格是必需的，且必须是数字').isFloat({ min: 0 }),
        check('stock', '库存是必需的，且必须是整数').isInt({ min: 0 }),
        check('description', '描述是必需的').not().isEmpty(),
    ],
    async(req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.error(400, "验证错误", errors.array());
        }

        const { name, category, price, stock, description, order, level } = req.body;
        let imageUrl = req.body.imageUrl; // 获取现有 imageUrl

        if (req.file) {
            imageUrl = `/uploads/products/${req.file.filename}`;
        } else if (req.body.removeImage === 'true') {
            imageUrl = null;
        }

        const productFields = {
            name,
            category,
            price: parseFloat(price),
            stock: parseInt(stock),
            description,
            order: parseInt(order),
            level,
        };
        if (imageUrl !== undefined) {
            productFields.imageUrl = imageUrl; // 统一使用 imageUrl
        }

        try {
            let product = await Product.findById(req.params.id);

            if (!product) {
                return res.error(404, '茶品未找到');
            }

            product = await Product.findByIdAndUpdate(
                req.params.id, { $set: productFields }, { new: true }
            );

            res.success(product, "茶品更新成功");
        } catch (err) {
            console.error(err.message);
            res.error(500, "服务器错误", err.message);
        }
    }
);

// @route   DELETE /api/admin/products/:id
// @desc    删除茶品
// @access  Private (Admin)
router.delete('/:id', adminAuth, async(req, res) => {
    try {
        await Product.findByIdAndRemove(req.params.id);
        res.success(null, '茶品已删除');
    } catch (err) {
        console.error(err.message);
        res.error(500, "服务器错误", err.message);
    }
});

module.exports = router;