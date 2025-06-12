const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const adminAuth = require('../middleware/adminAuth');
const upload = require('../middleware/upload'); // 引入 Multer 配置

// 引入模型
const CarouselItem = require('../models/CarouselItem');
const Poster = require('../models/Poster');
const Product = require('../models/Product');
const User = require('../models/User');
const TeaKnowledge = require('../models/TeaKnowledge'); // 引入 TeaKnowledge 模型
const DictionaryItem = require('../models/DictionaryItem'); // 新增：引入 DictionaryItem 模型

// @route   GET /api/admin/carousel
// @desc    获取所有轮播图
// @access  Private (Admin)
router.get('/carousel', adminAuth, async (req, res) => {
    try {
        const carouselItems = await CarouselItem.find().sort({ order: 1 });
        res.json(carouselItems);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
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
        check('link', '链接是必需的').not().isEmpty(),
        check('order', '排序是必需的，且必须是数字').isInt(),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { title, link, order } = req.body;
        const imageUrl = req.file ? `/uploads/carousel/${req.file.filename}` : null; // 保存相对路径

        try {
            const newCarouselItem = new CarouselItem({
                title,
                image_url: imageUrl,
                link,
                order: parseInt(order),
            });

            const carouselItem = await newCarouselItem.save();
            res.json(carouselItem);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    }
);

// @route   PUT /api/admin/carousel/:id
// @desc    更新轮播图
// @access  Private (Admin)
router.put(
    '/carousel/:id',
    adminAuth,
    upload.single('image'),
    [
        check('title', '标题是必需的').not().isEmpty(),
        check('link', '链接是必需的').not().isEmpty(),
        check('order', '排序是必需的，且必须是数字').isInt(),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { title, link, order } = req.body;
        let imageUrl = req.body.image_url; // 假设前端会传回当前的 image_url

        // 如果有新文件上传，则更新 imageUrl
        if (req.file) {
            imageUrl = `/uploads/carousel/${req.file.filename}`;
        } else if (req.body.removeImage === 'true') {
            // 如果前端明确指示移除图片
            imageUrl = null;
        }

        const carouselFields = {
            title,
            link,
            order: parseInt(order),
        };
        if (imageUrl !== undefined) {
            carouselFields.image_url = imageUrl;
        }

        try {
            let carouselItem = await CarouselItem.findById(req.params.id);

            if (!carouselItem) {
                return res.status(404).json({ msg: '轮播图未找到' });
            }

            carouselItem = await CarouselItem.findByIdAndUpdate(
                req.params.id,
                { $set: carouselFields },
                { new: true }
            );

            res.json(carouselItem);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    }
);

// @route   DELETE /api/admin/carousel/:id
// @desc    删除轮播图
// @access  Private (Admin)
router.delete('/carousel/:id', adminAuth, async (req, res) => {
    try {
        const carouselItem = await CarouselItem.findById(req.params.id);

        if (!carouselItem) {
            return res.status(404).json({ msg: '轮播图未找到' });
        }

        await CarouselItem.findByIdAndDelete(req.params.id);

        res.json({ msg: '轮播图已删除' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/admin/posters
// @desc    获取所有海报图
// @access  Private (Admin)
router.get('/posters', adminAuth, async (req, res) => {
    try {
        const posters = await Poster.find().sort({ order: 1 });
        res.json(posters);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/admin/posters
// @desc    新增海报图
// @access  Private (Admin)
router.post(
    '/posters',
    adminAuth,
    upload.single('image'), // 单文件上传，字段名为 'image'
    [
        check('title', '标题是必需的').not().isEmpty(),
        check('link', '链接是必需的').not().isEmpty(),
        check('order', '排序是必需的，且必须是数字').isInt(),
        check('location', '位置是必需的').not().isEmpty(),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { title, link, order, location } = req.body;
        const imageUrl = req.file ? `/uploads/posters/${req.file.filename}` : null;

        try {
            const newPoster = new Poster({
                title,
                image_url: imageUrl,
                link,
                order: parseInt(order),
                location,
            });

            const poster = await newPoster.save();
            res.json(poster);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    }
);

// @route   PUT /api/admin/posters/:id
// @desc    更新海报图
// @access  Private (Admin)
router.put(
    '/posters/:id',
    adminAuth,
    upload.single('image'),
    [
        check('title', '标题是必需的').not().isEmpty(),
        check('link', '链接是必需的').not().isEmpty(),
        check('order', '排序是必需的，且必须是数字').isInt(),
        check('location', '位置是必需的').not().isEmpty(),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { title, link, order, location } = req.body;
        let imageUrl = req.body.image_url;

        if (req.file) {
            imageUrl = `/uploads/posters/${req.file.filename}`;
        } else if (req.body.removeImage === 'true') {
            imageUrl = null;
        }

        const posterFields = {
            title,
            link,
            order: parseInt(order),
            location,
        };
        if (imageUrl !== undefined) {
            posterFields.image_url = imageUrl;
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
            res.status(500).send('Server Error');
        }
    }
);

// @route   DELETE /api/admin/posters/:id
// @desc    删除海报图
// @access  Private (Admin)
router.delete('/posters/:id', adminAuth, async (req, res) => {
    try {
        const poster = await Poster.findById(req.params.id);

        if (!poster) {
            return res.status(404).json({ msg: '海报图未找到' });
        }

        await Poster.findByIdAndDelete(req.params.id);

        res.json({ msg: '海报图已删除' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/admin/products
// @desc    获取所有茶品
// @access  Private (Admin)
router.get('/products', adminAuth, async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.json(products);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
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

        const { name, category, price, stock, description } = req.body;
        const imageUrl = req.file ? `/uploads/products/${req.file.filename}` : null;

        try {
            const newProduct = new Product({
                name,
                category,
                price: parseFloat(price),
                stock: parseInt(stock),
                description,
                image_url: imageUrl,
            });

            const product = await newProduct.save();
            res.json(product);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    }
);

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

        const { name, category, price, stock, description } = req.body;
        let imageUrl = req.body.image_url;

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
        };
        if (imageUrl !== undefined) {
            productFields.image_url = imageUrl;
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
            res.status(500).send('Server Error');
        }
    }
);

// @route   DELETE /api/admin/products/:id
// @desc    删除茶品
// @access  Private (Admin)
router.delete('/products/:id', adminAuth, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ msg: '茶品未找到' });
        }

        await Product.findByIdAndDelete(req.params.id);

        res.json({ msg: '茶品已删除' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/admin/users
// @desc    获取所有用户
// @access  Private (Admin)
router.get('/users', adminAuth, async (req, res) => {
    try {
        const users = await User.find().select('-password'); // 不返回密码
        res.json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/admin/users/:id/role
// @desc    更新用户角色
// @access  Private (Admin)
router.put(
    '/users/:id/role',
    adminAuth,
    [check('isAdmin', 'isAdmin 必须是布尔值').isBoolean()],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            let user = await User.findById(req.params.id);

            if (!user) {
                return res.status(404).json({ msg: '用户未找到' });
            }

            // 更新 isAdmin 字段
            user.isAdmin = req.body.isAdmin;
            await user.save();

            res.json({ msg: '用户角色已更新', user });
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    }
);

// @route   DELETE /api/admin/users/:id
// @desc    删除用户
// @access  Private (Admin)
router.delete('/users/:id', adminAuth, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ msg: '用户未找到' });
        }

        await User.findByIdAndDelete(req.params.id);

        res.json({ msg: '用户已删除' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/admin/tea-knowledge
// @desc    获取所有茶知识
// @access  Private (Admin)
router.get('/tea-knowledge', adminAuth, async (req, res) => {
    try {
        const teaKnowledgeItems = await TeaKnowledge.find().sort({ createdAt: -1 });
        res.json(teaKnowledgeItems);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/admin/tea-knowledge
// @desc    新增茶知识
// @access  Private (Admin)
router.post(
    '/tea-knowledge',
    adminAuth,
    upload.single('image'), // 单文件上传，字段名为 'image'
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
        const imageUrl = req.file ? `/uploads/tea-knowledge/${req.file.filename}` : null;

        try {
            const newTeaKnowledge = new TeaKnowledge({
                category,
                name,
                description_short,
                description_full,
                image_url: imageUrl,
                origin: origin || '',
                features: features ? JSON.parse(features) : [], // 解析 features 字符串
                brewing_guide: brewing_guide || '',
            });

            const teaKnowledge = await newTeaKnowledge.save();
            res.json(teaKnowledge);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    }
);

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
        let imageUrl = req.body.imageUrl; // 注意这里是 imageUrl，前端传回的

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
            origin: origin || '',
            features: features ? JSON.parse(features) : [],
            brewing_guide: brewing_guide || '',
        };
        if (imageUrl !== undefined) {
            teaKnowledgeFields.image_url = imageUrl;
        }

        try {
            let teaKnowledge = await TeaKnowledge.findById(req.params.id);

            if (!teaKnowledge) {
                return res.status(404).json({ msg: '茶知识未找到' });
            }

            teaKnowledge = await TeaKnowledge.findByIdAndUpdate(
                req.params.id,
                { $set: teaKnowledgeFields },
                { new: true }
            );

            res.json(teaKnowledge);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    }
);

// @route   DELETE /api/admin/tea-knowledge/:id
// @desc    删除茶知识
// @access  Private (Admin)
router.delete('/tea-knowledge/:id', adminAuth, async (req, res) => {
    try {
        const teaKnowledge = await TeaKnowledge.findById(req.params.id);

        if (!teaKnowledge) {
            return res.status(404).json({ msg: '茶知识未找到' });
        }

        await TeaKnowledge.findByIdAndDelete(req.params.id);

        res.json({ msg: '茶知识已删除' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


// ==================== 数据字典管理 API ====================

// @route   GET /api/admin/dictionary
// @desc    获取所有字典项或按类型筛选
// @access  Private (Admin)
router.get('/dictionary', adminAuth, async (req, res) => {
    try {
        const { type } = req.query;
        let query = {};
        if (type) {
            query.type = type; // 如果提供了 type 参数，则按类型筛选
        }
        const dictionaryItems = await DictionaryItem.find(query).sort({ type: 1, order: 1, value: 1 });
        res.json(dictionaryItems);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/admin/dictionary/:id
// @desc    根据 ID 获取单个字典项
// @access  Private (Admin)
router.get('/dictionary/:id', adminAuth, async (req, res) => {
    try {
        const dictionaryItem = await DictionaryItem.findById(req.params.id);
        if (!dictionaryItem) {
            return res.status(404).json({ msg: '字典项未找到' });
        }
        res.json(dictionaryItem);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
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
        check('order', '排序必须是数字').optional().isInt(),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { type, value, description, order } = req.body;

        try {
            // 检查是否已存在相同 type 和 value 的字典项
            let existingItem = await DictionaryItem.findOne({ type, value });
            if (existingItem) {
                return res.status(400).json({ msg: '相同类型和值的字典项已存在' });
            }

            const newDictionaryItem = new DictionaryItem({
                type,
                value,
                description,
                order: order ? parseInt(order) : 0,
            });

            const dictionaryItem = await newDictionaryItem.save();
            res.json(dictionaryItem);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    }
);

// @route   PUT /api/admin/dictionary/:id
// @desc    更新字典项
// @access  Private (Admin)
router.put(
    '/dictionary/:id',
    adminAuth,
    [
        check('type', '字典类型是必需的').not().isEmpty(),
        check('value', '字典值是必需的').not().isEmpty(),
        check('order', '排序必须是数字').optional().isInt(),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { type, value, description, order } = req.body;

        const dictionaryFields = {
            type,
            value,
            description,
            order: order ? parseInt(order) : 0,
        };

        try {
            let dictionaryItem = await DictionaryItem.findById(req.params.id);

            if (!dictionaryItem) {
                return res.status(404).json({ msg: '字典项未找到' });
            }

            // 检查更新后的 type 和 value 是否会与其他现有项冲突
            let existingConflictItem = await DictionaryItem.findOne({
                type,
                value,
                _id: { $ne: req.params.id } // 排除当前项
            });

            if (existingConflictItem) {
                return res.status(400).json({ msg: '更新后的类型和值组合已存在于其他字典项中' });
            }

            dictionaryItem = await DictionaryItem.findByIdAndUpdate(
                req.params.id,
                { $set: dictionaryFields },
                { new: true }
            );

            res.json(dictionaryItem);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    }
);

// @route   DELETE /api/admin/dictionary/:id
// @desc    删除字典项
// @access  Private (Admin)
router.delete('/dictionary/:id', adminAuth, async (req, res) => {
    try {
        const dictionaryItem = await DictionaryItem.findById(req.params.id);

        if (!dictionaryItem) {
            return res.status(404).json({ msg: '字典项未找到' });
        }

        await DictionaryItem.findByIdAndDelete(req.params.id);

        res.json({ msg: '字典项已删除' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


module.exports = router;