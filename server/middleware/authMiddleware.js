const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
    // 从请求头中获取 token
    const token = req.header("x-auth-token");

    // 检查是否存在 token
    if (!token) {
        return res.status(401).json({ msg: "没有令牌，授权被拒绝" });
    }

    try {
        // 验证 token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 将用户添加到请求对象
        req.user = decoded.user;
        next();
    } catch (err) {
        res.status(401).json({ msg: "令牌无效" });
    }
};
