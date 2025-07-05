const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const adminAuth = require('../middleware/adminAuth');
const upload = require('../middleware/upload');
const Product = require('../models/Product');
const fs = require('fs'); // 引入fs模块
const path = require('path'); // 引入path模块

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
        let imageUrl; // 将 const 改为 let，以便后续赋值

        if (req.file) {
            // 如果有文件上传，使用上传文件的路径
            imageUrl = `/uploads/products/${req.file.filename}`;
        } else if (req.body.imageUrl && typeof req.body.imageUrl === 'string' && req.body.imageUrl.trim() !== '') {
            // 如果没有文件上传，但 req.body 中提供了有效的 imageUrl 字符串，则直接使用它
            imageUrl = req.body.imageUrl;
        } else {
            // 既没有文件上传，也没有提供 imageUrl 字符串，则返回错误
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
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const products = await Product.find().sort({ category: 1, order: 1 }).skip(skip).limit(limit);
        const totalProducts = await Product.countDocuments();

        res.success({ products, totalProducts }, "获取茶品列表成功");
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
        let newImageUrl = req.body.imageUrl; // 获取现有 imageUrl

        try {
            let product = await Product.findById(req.params.id);

            if (!product) {
                return res.error(404, '茶品未找到');
            }
            const oldImageUrl = product.imageUrl; // 保存旧的图片路径

            if (req.file) {
                newImageUrl = `/uploads/products/${req.file.filename}`;
                if (oldImageUrl) {
                    const oldImagePath = path.join(__dirname, '..', 'public', oldImageUrl);
                    fs.unlink(oldImagePath, (err) => {
                        if (err) console.error('删除旧图片失败:', err);
                    });
                }
            } else if (req.body.removeImage === 'true') {
                newImageUrl = null;
                if (oldImageUrl) {
                    const oldImagePath = path.join(__dirname, '..', 'public', oldImageUrl);
                    fs.unlink(oldImagePath, (err) => {
                        if (err) console.error('删除旧图片失败:', err);
                    });
                }
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
            if (newImageUrl !== undefined && newImageUrl !== oldImageUrl) {
                productFields.imageUrl = newImageUrl; // 统一使用 imageUrl
            }
            if (req.body.removeImage === 'true' && !newImageUrl) {
                productFields.imageUrl = null;
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
        let product = await Product.findById(req.params.id);
        if (!product) {
            return res.error(404, '茶品未找到');
        }

        // 删除文件
        if (product.imageUrl) {
            const imagePath = path.join(__dirname, '..', 'public', product.imageUrl);
            fs.unlink(imagePath, (err) => {
                if (err) console.error('删除茶品图片文件失败:', err);
            });
        }

        await Product.findByIdAndRemove(req.params.id);
        res.success(null, '茶品已删除');
    } catch (err) {
        console.error(err.message);
        res.error(500, "服务器错误", err.message);
    }
});

module.exports = router;