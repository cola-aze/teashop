const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const adminAuth = require('../middleware/adminAuth');
const upload = require('../middleware/upload'); // 引入文件上传中间件

// 引入模型
const User = require('../models/User');
const Product = require('../models/Product');
const CarouselItem = require('../models/CarouselItem');
const Poster = require('../models/Poster');
const TeaKnowledge = require('../models/TeaKnowledge');
const DictionaryItem = require('../models/DictionaryItem'); // 引入 DictionaryItem 模型

// @route   GET /api/admin/users
// @desc    获取所有用户 (管理员权限)
// @access  Private (Admin)
router.get('/users', adminAuth, async (req, res) => {
    try {
        const users = await User.find().select('-password'); // 不返回密码
        res.json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('服务器错误');
    }
});

// @route   DELETE /api/admin/users/:id
// @desc    删除用户 (管理员权限)
// @access  Private (Admin)
router.delete('/users/:id', adminAuth, async (req, res) => {
    try {
        await User.findByIdAndRemove(req.params.id);
        res.json({ msg: '用户已删除' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('服务器错误');
    }
});

// @route   POST /api/admin/carousel
// @desc    新增轮播图
// @access  Private (Admin)
router.post(
    '/carousel',
    adminAuth,
    upload.single('image'), // 单文件上传，字段名为 'image'
    [
        check('title', '标题是必需的').not().isEmpty(),
        check('linkUrl', '链接是必需的').not().isEmpty(), // 确保 linkUrl 是必需的
        check('order', '排序是必需的，且必须是数字').isInt(),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { title, linkUrl, order } = req.body;
        const imageUrl = req.file ? `/uploads/carousel/${req.file.filename}` : null; // 保存相对路径

        // 如果没有上传文件且 imageUrl 为空，则返回错误
        if (!imageUrl) {
            return res.status(400).json({ msg: '图片是必需的' });
        }

        try {
            const newCarouselItem = new CarouselItem({
                title,
                imageUrl, // 统一使用 imageUrl
                linkUrl,
                order: parseInt(order),
            });

            const carouselItem = await newCarouselItem.save();
            res.json(carouselItem);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('服务器错误');
        }
    }
);

// @route   GET /api/admin/carousel
// @desc    获取所有轮播图
// @access  Private (Admin)
router.get('/carousel', adminAuth, async (req, res) => {
    try {
        const items = await CarouselItem.find().sort({ order: 1 });
        res.json(items);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('服务器错误');
    }
});

// @route   PUT /api/admin/carousel/:id
// @desc    更新轮播图
// @access  Private (Admin)
router.put(
    '/carousel/:id',
    adminAuth,
    upload.single('image'),
    [
        check('title', '标题是必需的').not().isEmpty(),
        check('linkUrl', '链接是必需的').not().isEmpty(),
        check('order', '排序是必需的，且必须是数字').isInt(),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
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
                return res.status(404).json({ msg: '轮播图项未找到' });
            }

            carouselItem = await CarouselItem.findByIdAndUpdate(
                req.params.id,
                { $set: carouselItemFields },
                { new: true }
            );

            res.json(carouselItem);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('服务器错误');
        }
    }
);

// @route   DELETE /api/admin/carousel/:id
// @desc    删除轮播图
// @access  Private (Admin)
router.delete('/carousel/:id', adminAuth, async (req, res) => {
    try {
        await CarouselItem.findByIdAndRemove(req.params.id);
        res.json({ msg: '轮播图项已删除' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('服务器错误');
    }
});

// @route   POST /api/admin/posters
// @desc    新增海报图
// @access  Private (Admin)
router.post(
    '/posters',
    adminAuth,
    upload.single('image'),
    [
        check('title', '标题是必需的').not().isEmpty(),
        check('linkUrl', '链接是必需的').not().isEmpty(),
        check('order', '排序是必需的，且必须是数字').isInt(),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { title, linkUrl, order } = req.body;
        const imageUrl = req.file ? `/uploads/posters/${req.file.filename}` : null;

        if (!imageUrl) {
            return res.status(400).json({ msg: '图片是必需的' });
        }

        try {
            const newPoster = new Poster({
                title,
                imageUrl,
                linkUrl,
                order: parseInt(order),
            });

            const poster = await newPoster.save();
            res.json(poster);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('服务器错误');
        }
    }
);

// @route   GET /api/admin/posters
// @desc    获取所有海报图
// @access  Private (Admin)
router.get('/posters', adminAuth, async (req, res) => {
    try {
        const items = await Poster.find().sort({ order: 1 });
        res.json(items);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('服务器错误');
    }
});

// @route   PUT /api/admin/posters/:id
// @desc    更新海报图
// @access  Private (Admin)
router.put(
    '/posters/:id',
    adminAuth,
    upload.single('image'),
    [
        check('title', '标题是必需的').not().isEmpty(),
        check('linkUrl', '链接是必需的').not().isEmpty(),
        check('order', '排序是必需的，且必须是数字').isInt(),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
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
                return res.status(404).json({ msg: '海报图未找到' });
            }

            poster = await Poster.findByIdAndUpdate(
                req.params.id,
                { $set: posterFields },
                { new: true }
            );

            res.json(poster);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('服务器错误');
        }
    }
);

// @route   DELETE /api/admin/posters/:id
// @desc    删除海报图
// @access  Private (Admin)
router.delete('/posters/:id', adminAuth, async (req, res) => {
    try {
        await Poster.findByIdAndRemove(req.params.id);
        res.json({ msg: '海报图已删除' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('服务器错误');
    }
});

// @route   POST /api/admin/products
// @desc    新增茶品
// @access  Private (Admin)
router.post(
    '/products',
    adminAuth,
    upload.single('image'), // 单文件上传，字段名为 'image'
    [
        check('name', '名称是必需的').not().isEmpty(),
        check('category', '类别是必需的').not().isEmpty(),
        check('price', '价格是必需的，且必须是数字').isFloat({ min: 0 }),
        check('stock', '库存是必需的，且必须是整数').isInt({ min: 0 }),
        check('description', '描述是必需的').not().isEmpty(),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, category, price, stock, description, order, level } = req.body;
        const imageUrl = req.file ? `/uploads/products/${req.file.filename}` : null;

        if (!imageUrl) {
            return res.status(400).json({ msg: '图片是必需的' });
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
            res.json(product);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('服务器错误');
        }
    }
);

// @route   GET /api/admin/products
// @desc    获取所有茶品
// @access  Private (Admin)
router.get('/products', adminAuth, async (req, res) => {
    try {
        const products = await Product.find().sort({ category: 1, order: 1 });
        res.json(products);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('服务器错误');
    }
});

// @route   PUT /api/admin/products/:id
// @desc    更新茶品
// @access  Private (Admin)
router.put(
    '/products/:id',
    adminAuth,
    upload.single('image'),
    [
        check('name', '名称是必需的').not().isEmpty(),
        check('category', '类别是必需的').not().isEmpty(),
        check('price', '价格是必需的，且必须是数字').isFloat({ min: 0 }),
        check('stock', '库存是必需的，且必须是整数').isInt({ min: 0 }),
        check('description', '描述是必需的').not().isEmpty(),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
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
                return res.status(404).json({ msg: '茶品未找到' });
            }

            product = await Product.findByIdAndUpdate(
                req.params.id,
                { $set: productFields },
                { new: true }
            );

            res.json(product);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('服务器错误');
        }
    }
);

// @route   DELETE /api/admin/products/:id
// @desc    删除茶品
// @access  Private (Admin)
router.delete('/products/:id', adminAuth, async (req, res) => {
    try {
        await Product.findByIdAndRemove(req.params.id);
        res.json({ msg: '茶品已删除' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('服务器错误');
    }
});


// @route   POST /api/admin/tea-knowledge
// @desc    新增茶知识
// @access  Private (Admin)
router.post(
    '/tea-knowledge',
    adminAuth,
    upload.single('image'),
    [
        check('category', '类别是必需的').not().isEmpty(),
        check('name', '名称是必需的').not().isEmpty(),
        check('description_short', '简短描述是必需的').not().isEmpty(),
        check('description_full', '完整描述是必需的').not().isEmpty(),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { category, name, description_short, description_full, origin, features, brewing_guide } = req.body;
        const imageUrl = req.file ? `/uploads/tea-knowledge/${req.file.filename}` : null; // 统一使用 imageUrl

        if (!imageUrl) {
            return res.status(400).json({ msg: '图片是必需的' });
        }

        try {
            const newTeaKnowledge = new TeaKnowledge({
                category,
                name,
                description_short,
                description_full,
                imageUrl, // 统一使用 imageUrl
                origin,
                features: features ? JSON.parse(features) : [],
                brewing_guide,
            });

            const teaKnowledge = await newTeaKnowledge.save();
            res.json(teaKnowledge);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('服务器错误');
        }
    }
);

// @route   GET /api/admin/tea-knowledge
// @desc    获取所有茶知识
// @access  Private (Admin)
router.get('/tea-knowledge', adminAuth, async (req, res) => {
    try {
        const items = await TeaKnowledge.find().sort({ createdAt: -1 });
        res.json(items);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('服务器错误');
    }
});

// @route   PUT /api/admin/tea-knowledge/:id
// @desc    更新茶知识
// @access  Private (Admin)
router.put(
    '/tea-knowledge/:id',
    adminAuth,
    upload.single('image'),
    [
        check('category', '类别是必需的').not().isEmpty(),
        check('name', '名称是必需的').not().isEmpty(),
        check('description_short', '简短描述是必需的').not().isEmpty(),
        check('description_full', '完整描述是必需的').not().isEmpty(),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { category, name, description_short, description_full, origin, features, brewing_guide } = req.body;
        let imageUrl = req.body.imageUrl; // 统一使用 imageUrl

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
            features: features ? JSON.parse(features) : [],
            brewing_guide,
        };

        if (imageUrl !== undefined) {
            teaKnowledgeFields.imageUrl = imageUrl; // 统一使用 imageUrl
        }

        try {
            let teaKnowledge = await TeaKnowledge.findById(req.params.id);

            if (!teaKnowledge) {
                return res.status(404).json({ msg: '茶知识项未找到' });
            }

            teaKnowledge = await TeaKnowledge.findByIdAndUpdate(
                req.params.id,
                { $set: teaKnowledgeFields },
                { new: true }
            );

            res.json(teaKnowledge);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('服务器错误');
        }
    }
);

// @route   DELETE /api/admin/tea-knowledge/:id
// @desc    删除茶知识
// @access  Private (Admin)
router.delete('/tea-knowledge/:id', adminAuth, async (req, res) => {
    try {
        await TeaKnowledge.findByIdAndRemove(req.params.id);
        res.json({ msg: '茶知识项已删除' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('服务器错误');
    }
});


// @route   POST /api/admin/dictionary
// @desc    新增字典项
// @access  Private (Admin)
router.post(
    '/dictionary',
    adminAuth,
    [
        check('type', '字典类型是必需的').not().isEmpty(),
        check('value', '字典值是必需的').not().isEmpty(),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { type, value, description, order } = req.body;

        try {
            const newDictionaryItem = new DictionaryItem({
                type,
                value,
                description,
                order: parseInt(order) || 0,
            });

            const dictionaryItem = await newDictionaryItem.save();
            res.json(dictionaryItem);
        } catch (err) {
            console.error(err.message);
            // 检查是否是重复键错误 (MongoDB E11000 duplicate key error)
            if (err.code === 11000) {
                return res.status(400).json({ msg: '该字典类型下已存在相同的字典值。' });
            }
            res.status(500).send('服务器错误');
        }
    }
);

// @route   GET /api/admin/dictionary
// @desc    获取所有字典项 或 按类型获取
// @access  Private (Admin)
router.get('/dictionary', adminAuth, async (req, res) => {
    try {
        const { type } = req.query; // 获取查询参数中的 type
        let query = {};
        if (type) {
            query.type = type; // 如果指定了 type，则按类型查询
        }
        const items = await DictionaryItem.find(query).sort({ type: 1, order: 1, value: 1 });
        res.json(items);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('服务器错误');
    }
});

// @route   PUT /api/admin/dictionary/:id
// @desc    更新字典项
// @access  Private (Admin)
router.put(
    '/dictionary/:id',
    adminAuth,
    [
        check('type', '字典类型是必需的').not().isEmpty(),
        check('value', '字典值是必需的').not().isEmpty(),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { type, value, description, order } = req.body;
        const dictionaryItemFields = {
            type,
            value,
            description,
            order: parseInt(order) || 0,
        };

        try {
            let dictionaryItem = await DictionaryItem.findById(req.params.id);

            if (!dictionaryItem) {
                return res.status(404).json({ msg: '字典项未找到' });
            }

            // 检查更新后的 type 和 value 是否会造成重复
            if (dictionaryItem.type !== type || dictionaryItem.value !== value) {
                const existing = await DictionaryItem.findOne({ type, value });
                if (existing && existing._id.toString() !== req.params.id) {
                    return res.status(400).json({ msg: '该字典类型下已存在相同的字典值。' });
                }
            }


            dictionaryItem = await DictionaryItem.findByIdAndUpdate(
                req.params.id,
                { $set: dictionaryItemFields },
                { new: true }
            );

            res.json(dictionaryItem);
        } catch (err) {
            console.error(err.message);
            if (err.code === 11000) {
                return res.status(400).json({ msg: '该字典类型下已存在相同的字典值。' });
            }
            res.status(500).send('服务器错误');
        }
    }
);

// @route   DELETE /api/admin/dictionary/:id
// @desc    删除字典项
// @access  Private (Admin)
router.delete('/dictionary/:id', adminAuth, async (req, res) => {
    try {
        await DictionaryItem.findByIdAndRemove(req.params.id);
        res.json({ msg: '字典项已删除' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('服务器错误');
    }
});


module.exports = router;