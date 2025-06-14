const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware"); // 引入认证中间件
const User = require("../models/User"); // 引入用户模型
const multer = require("multer"); // 引入 multer
const path = require("path"); // 引入 path 模块

// 配置 multer 用于文件上传
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, "public/uploads/avatars"); // 文件上传到 public/uploads/avatars 目录
    },
    filename: function(req, file, cb) {
        // 以当前时间戳和原始文件名创建唯一文件名
        cb(
            null,
            file.fieldname + "-" + Date.now() + path.extname(file.originalname)
        );
    },
});

const upload = multer({ storage: storage });

// @route   GET /api/user/profile
// @desc    获取当前用户的个人信息
// @access  Private (需要认证)
router.get("/profile", auth, async(req, res) => {
    try {
        // 从数据库中查找用户，但不返回密码
        const user = await User.findById(req.user.id).select("-password");
        if (!user) {
            return res.error(404, "用户未找到");
        }
        res.success(user, "获取用户资料成功");
    } catch (err) {
        console.error(err.message);
        res.error(500, "服务器错误", err.message);
    }
});

// @route   PUT /api/user/profile
// @desc    更新当前用户的个人信息
// @access  Private (需要认证)
router.put("/profile", auth, async(req, res) => {
    const { email, address, phone, avatar } = req.body;

    // 构建用户字段对象
    const userFields = {};
    if (email) userFields.email = email;
    if (address) userFields.address = address;
    if (phone) userFields.phone = phone;
    if (avatar) {
        // 如果头像 URL 包含后端地址，则将其转换回相对路径
        if (avatar.startsWith("http://localhost:5000")) {
            userFields.avatar = avatar.replace("http://localhost:5000", "");
        } else {
            userFields.avatar = avatar;
        }
    }

    try {
        let user = await User.findById(req.user.id);
        if (!user) {
            return res.error(404, "用户未找到");
        }

        // 更新用户
        user = await User.findOneAndUpdate({ _id: req.user.id }, { $set: userFields }, { new: true } // 返回更新后的文档
        ).select("-password"); // 不返回密码

        res.success(user, "更新用户资料成功");
    } catch (err) {
        console.error(err.message);
        res.error(500, "服务器错误", err.message);
    }
});

// @route   POST /api/user/avatar/upload
// @desc    上传用户头像
// @access  Private (需要认证)
router.post(
    "/avatar/upload",
    auth,
    upload.single("avatar"),
    async(req, res) => {
        try {
            if (!req.file) {
                return res.error(400, "没有文件被上传");
            }

            const avatarUrl = `/uploads/avatars/${req.file.filename}`;

            // 更新用户的头像字段
            const user = await User.findByIdAndUpdate(
                req.user.id, { avatar: avatarUrl }, { new: true }
            ).select("-password");

            if (!user) {
                return res.error(404, "用户未找到");
            }

            res.success({ avatarUrl: user.avatar }, "头像上传成功");
        } catch (err) {
            console.error(err.message);
            res.error(500, "服务器错误", err.message);
        }
    }
);

module.exports = router;