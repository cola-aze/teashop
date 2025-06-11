const express = require("express");
const router = express.Router();
const CarouselItem = require("../models/CarouselItem");
const Poster = require("../models/Poster");
const Product = require("../models/Product");
const User = require("../models/User"); // 引入 User 模型
const adminAuth = require("../middleware/adminAuth"); // 引入管理员认证中间件
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// 设置 multer 存储
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, "..", "uploads", "carousel");
        fs.mkdirSync(uploadDir, { recursive: true }); // 确保目录存在
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const upload = multer({ storage: storage });

// 设置 multer 存储 - 海报图
const posterStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, "..", "uploads", "poster");
        fs.mkdirSync(uploadDir, { recursive: true }); // 确保目录存在
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const posterUpload = multer({ storage: posterStorage });

// 设置 multer 存储 - 产品图
const productStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, "..", "uploads", "products");
        fs.mkdirSync(uploadDir, { recursive: true }); // 确保目录存在
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const productUpload = multer({ storage: productStorage });

// Helper function to delete file from server
const deleteFileFromServer = (filePath) => {
    if (filePath && filePath.startsWith("/uploads/")) {
        const fullPath = path.join(__dirname, "..", filePath);
        fs.unlink(fullPath, (err) => {
            if (err) {
                console.error("Error deleting file:", fullPath, err);
            } else {
                console.log("File deleted successfully:", fullPath);
            }
        });
    }
};

// 后台管理路由
router.get("/", (req, res) => {
    res.send("Admin API is working!");
});

// @route   GET /api/admin/carousel
// @desc    获取所有轮播图项
// @access  Private (管理员)
router.get("/carousel", adminAuth, async (req, res) => {
    try {
        const items = await CarouselItem.find().sort({ order: 1 });
        res.json(items);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("服务器错误");
    }
});

// @route   GET /api/admin/carousel/:id
// @desc    根据 ID 获取单个轮播图项
// @access  Private (管理员)
router.get("/carousel/:id", adminAuth, async (req, res) => {
    try {
        const item = await CarouselItem.findById(req.params.id);
        if (!item) {
            return res.status(404).json({ msg: "轮播图项未找到" });
        }
        res.json(item);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("服务器错误");
    }
});

// @route   POST /api/admin/carousel
// @desc    创建新的轮播图项
// @access  Private (管理员)
router.post(
    "/carousel",
    adminAuth,
    upload.single("image"),
    async (req, res) => {
        const { title, description, order, linkUrl } = req.body;
        let imageUrl = req.body.imageUrl;

        if (req.file) {
            imageUrl = `/uploads/carousel/${req.file.filename}`;
        }

        try {
            const newItem = new CarouselItem({
                imageUrl,
                title,
                description,
                order,
                linkUrl,
            });
            const item = await newItem.save();
            res.status(201).json(item);
        } catch (err) {
            console.error(err.message);
            res.status(500).send("服务器错误");
        }
    }
);

// @route   PUT /api/admin/carousel/:id
// @desc    更新轮播图项
// @access  Private (管理员)
router.put(
    "/carousel/:id",
    adminAuth,
    upload.single("image"),
    async (req, res) => {
        const { title, description, order, linkUrl } = req.body;
        const itemFields = {};

        try {
            let item = await CarouselItem.findById(req.params.id);
            if (!item) {
                return res.status(404).json({ msg: "轮播图项未找到" });
            }

            // 如果上传了新文件，或者 imageUrl 字段被清空，则删除旧图片
            if (req.file || (req.body.imageUrl === "" && item.imageUrl)) {
                deleteFileFromServer(item.imageUrl);
            }

            if (req.file) {
                itemFields.imageUrl = `/uploads/carousel/${req.file.filename}`;
            } else if (req.body.imageUrl !== undefined) {
                // 只有当前端明确发送 imageUrl 字段时才更新它
                itemFields.imageUrl = req.body.imageUrl;
            }

            if (title) itemFields.title = title;
            if (description) itemFields.description = description;
            if (order) itemFields.order = order;
            if (linkUrl) itemFields.linkUrl = linkUrl;

            item = await CarouselItem.findByIdAndUpdate(
                req.params.id,
                { $set: itemFields },
                { new: true }
            );
            res.json(item);
        } catch (err) {
            console.error(err.message);
            res.status(500).send("服务器错误");
        }
    }
);

// @route   DELETE /api/admin/carousel/:id
// @desc    删除轮播图项
// @access  Private (管理员)
router.delete("/carousel/:id", adminAuth, async (req, res) => {
    try {
        const item = await CarouselItem.findById(req.params.id);
        if (!item) {
            return res.status(404).json({ msg: "轮播图项未找到" });
        }
        // 删除关联的图片文件
        deleteFileFromServer(item.imageUrl);

        await item.remove();
        res.json({ msg: "轮播图项已删除" });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("服务器错误");
    }
});

// @route   GET /api/admin/poster
// @desc    获取所有海报图项
// @access  Private (管理员)
router.get("/poster", adminAuth, async (req, res) => {
    try {
        const items = await Poster.find().sort({ order: 1 });
        res.json(items);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("服务器错误");
    }
});

// @route   GET /api/admin/poster/:id
// @desc    根据 ID 获取单个海报图项
// @access  Private (管理员)
router.get("/poster/:id", adminAuth, async (req, res) => {
    try {
        const item = await Poster.findById(req.params.id);
        if (!item) {
            return res.status(404).json({ msg: "海报图项未找到" });
        }
        res.json(item);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("服务器错误");
    }
});

// @route   POST /api/admin/poster
// @desc    创建新的海报图项
// @access  Private (管理员)
router.post(
    "/poster",
    adminAuth,
    posterUpload.single("image"), // 使用posterUpload处理图片上传
    async (req, res) => {
        const { title, linkUrl, order } = req.body;
        let imageUrl = req.body.imageUrl; // 可能来自前端的现有图片URL

        if (req.file) {
            // 如果有新文件上传，则使用新文件路径
            imageUrl = `/uploads/poster/${req.file.filename}`;
        }

        try {
            const newItem = new Poster({
                imageUrl,
                title,
                linkUrl,
                order,
            });
            const item = await newItem.save();
            res.status(201).json(item);
        } catch (err) {
            console.error(err.message);
            res.status(500).send("服务器错误");
        }
    }
);

// @route   PUT /api/admin/poster/:id
// @desc    更新海报图项
// @access  Private (管理员)
router.put(
    "/poster/:id",
    adminAuth,
    posterUpload.single("image"), // 使用posterUpload处理图片上传
    async (req, res) => {
        const { title, linkUrl, order } = req.body;
        const itemFields = {};

        try {
            let item = await Poster.findById(req.params.id);
            if (!item) {
                return res.status(404).json({ msg: "海报图项未找到" });
            }

            // 如果上传了新文件，或者 imageUrl 字段被清空，则删除旧图片
            if (
                req.file ||
                (req.body.imageUrl === "" &&
                    item.imageUrl &&
                    item.imageUrl.startsWith("/uploads/poster/"))
            ) {
                deleteFileFromServer(item.imageUrl);
            }

            if (req.file) {
                // 如果有新文件上传
                itemFields.imageUrl = `/uploads/poster/${req.file.filename}`;
            } else if (req.body.imageUrl !== undefined) {
                // 如果没有新文件，但前端发送了 imageUrl 字段（可能是清空或保持不变）
                itemFields.imageUrl = req.body.imageUrl;
            }

            if (title) itemFields.title = title;
            if (linkUrl) itemFields.linkUrl = linkUrl;
            if (order) itemFields.order = order;

            item = await Poster.findByIdAndUpdate(
                req.params.id,
                { $set: itemFields },
                { new: true }
            );
            res.json(item);
        } catch (err) {
            console.error(err.message);
            res.status(500).send("服务器错误");
        }
    }
);

// @route   DELETE /api/admin/poster/:id
// @desc    删除海报图项
// @access  Private (管理员)
router.delete("/poster/:id", adminAuth, async (req, res) => {
    try {
        const item = await Poster.findById(req.params.id);
        if (!item) {
            return res.status(404).json({ msg: "海报图项未找到" });
        }
        // 删除关联的图片文件
        deleteFileFromServer(item.imageUrl);

        await item.remove();
        res.json({ msg: "海报图项已删除" });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("服务器错误");
    }
});

// @route   GET /api/admin/products
// @desc    获取所有产品项
// @access  Private (管理员)
router.get("/products", adminAuth, async (req, res) => {
    try {
        const items = await Product.find().sort({ order: 1 });
        res.json(items);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("服务器错误");
    }
});

// @route   GET /api/admin/products/:id
// @desc    根据 ID 获取单个产品项
// @access  Private (管理员)
router.get("/products/:id", adminAuth, async (req, res) => {
    try {
        const item = await Product.findById(req.params.id);
        if (!item) {
            return res.status(404).json({ msg: "产品项未找到" });
        }
        res.json(item);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("服务器错误");
    }
});

// @route   POST /api/admin/products
// @desc    创建新的产品项
// @access  Private (管理员)
router.post(
    "/products",
    adminAuth,
    productUpload.single("image"),
    async (req, res) => {
        // 确保所有字段都被正确解构，包括 level
        const {
            name,
            description,
            price,
            category,
            stock,
            order,
            level,
            imageUrl: reqImageUrl,
        } = req.body;
        let imageUrl = reqImageUrl; // 使用解构后的 imageUrl

        if (req.file) {
            // 如果有新文件上传，则使用新文件路径
            imageUrl = `/uploads/products/${req.file.filename}`;
        }

        try {
            const newProduct = new Product({
                imageUrl,
                name,
                description,
                price,
                category,
                stock,
                order,
                level, // 确保 level 被传递给模型
            });
            const product = await newProduct.save();
            res.status(201).json(product);
        } catch (err) {
            console.error(err.message);
            res.status(500).send("服务器错误");
        }
    }
);

// @route   PUT /api/admin/products/:id
// @desc    更新产品项
// @access  Private (管理员)
router.put(
    "/products/:id",
    adminAuth,
    productUpload.single("image"),
    async (req, res) => {
        // 确保所有字段都被正确解构，包括 level
        const {
            name,
            description,
            price,
            category,
            stock,
            order,
            level,
            imageUrl: reqImageUrl,
        } = req.body;
        const itemFields = {};

        try {
            let item = await Product.findById(req.params.id);
            if (!item) {
                return res.status(404).json({ msg: "产品项未找到" });
            }

            // 如果上传了新文件，或者 imageUrl 字段被清空，则删除旧图片
            if (req.file || (req.body.imageUrl === "" && item.imageUrl)) {
                deleteFileFromServer(item.imageUrl);
            }

            if (req.file) {
                itemFields.imageUrl = `/uploads/products/${req.file.filename}`;
            } else if (reqImageUrl !== undefined) {
                // 只有当前端明确发送 imageUrl 字段时才更新它
                itemFields.imageUrl = reqImageUrl;
            }

            if (name) itemFields.name = name;
            if (description) itemFields.description = description;
            if (price) itemFields.price = price;
            if (category) itemFields.category = category;
            if (stock) itemFields.stock = stock;
            if (order) itemFields.order = order;
            if (level) itemFields.level = level; // 确保 level 被更新

            item = await Product.findByIdAndUpdate(
                req.params.id,
                { $set: itemFields },
                { new: true }
            );
            res.json(item);
        } catch (err) {
            console.error(err.message);
            res.status(500).send("服务器错误");
        }
    }
);

// @route   DELETE /api/admin/products/:id
// @desc    删除产品项
// @access  Private (管理员)
router.delete("/products/:id", adminAuth, async (req, res) => {
    try {
        const item = await Product.findById(req.params.id);
        if (!item) {
            return res.status(404).json({ msg: "产品项未找到" });
        }
        // 删除关联的图片文件
        deleteFileFromServer(item.imageUrl);

        await item.remove();
        res.json({ msg: "产品项已删除" });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("服务器错误");
    }
});

// @route   GET /api/admin/users
// @desc    获取所有用户 (管理员)
// @access  Private (管理员)
router.get("/users", adminAuth, async (req, res) => {
    try {
        const users = await User.find().select("-password"); // 不返回密码
        res.json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("服务器错误");
    }
});

// @route   PUT /api/admin/users/:id/toggle-admin
// @desc    切换用户管理员状态 (管理员)
// @access  Private (管理员)
router.put("/users/:id/toggle-admin", adminAuth, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ msg: "用户未找到" });
        }

        // 防止管理员撤销自己的管理员权限
        if (req.user.id === req.params.id && user.isAdmin) {
            return res.status(400).json({ msg: "不能撤销自己的管理员权限" });
        }

        user.isAdmin = !user.isAdmin;
        await user.save();

        res.json({ msg: "用户管理员状态已更新", user: user });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("服务器错误");
    }
});

module.exports = router;
