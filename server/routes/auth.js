const express = require("express");
const router = express.Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken");

// 注册用户
router.post("/register", async(req, res) => {
    try {
        const { username, password } = req.body;

        // 检查用户是否已存在
        let user = await User.findOne({ username });
        if (user) {
            return res.error(400, "用户已存在");
        }

        user = new User({
            username,
            password,
        });

        await user.save(); // 密码会在 User.js 的 pre('save') 钩子中自动哈希

        // 生成 JWT Token
        const payload = {
            user: {
                id: user.id,
            },
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET, { expiresIn: "1h" },
            (err, token) => {
                if (err) throw err;
                res.success({
                    token,
                    username: user.username,
                    avatar: user.avatar,
                    isAdmin: user.isAdmin,
                }, "注册成功");
            }
        );
    } catch (err) {
        console.error(err.message);
        res.error(500, "服务器错误", err.message);
    }
});

// 登录用户
router.post("/login", async(req, res) => {
    try {
        const { username, password } = req.body;

        // 检查用户是否存在
        let user = await User.findOne({ username });
        if (!user) {
            return res.error(400, "无效的凭据");
        }

        // 验证密码
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.error(400, "无效的凭据");
        }

        // 生成 JWT Token
        const payload = {
            user: {
                id: user.id,
            },
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET, { expiresIn: "1h" },
            (err, token) => {
                if (err) throw err;
                res.success({
                    token,
                    username: user.username,
                    avatar: user.avatar,
                    isAdmin: user.isAdmin,
                }, "登录成功");
            }
        );
    } catch (err) {
        console.error(err.message);
        res.error(500, "服务器错误", err.message);
    }
});

module.exports = router;