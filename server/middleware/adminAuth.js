const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = async function (req, res, next) {
    // 从请求头获取 token
    const token = req.header("x-auth-token");

    // 检查是否存在 token
    if (!token) {
        return res.status(401).json({ msg: "没有 token，授权被拒绝" });
    }

    try {
        // 验证 token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 获取用户并检查是否是管理员
        req.user = decoded.user;
        const user = await User.findById(req.user.id);

        if (!user || !user.isAdmin) {
            return res.status(403).json({ msg: "无权访问，非管理员用户" });
        }

        next();
    } catch (err) {
        res.status(401).json({ msg: "Token 无效" });
    }
};
