const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');
const User = require('../models/User');

// @route   GET /api/admin/users
// @desc    获取所有用户 (管理员权限)
// @access  Private (Admin)
router.get('/', adminAuth, async(req, res) => {
    try {
        const users = await User.find().select('-password'); // 不返回密码
        res.success(users, "获取用户列表成功");
    } catch (err) {
        console.error(err.message);
        res.error(500, "服务器错误", err.message);
    }
});

// @route   DELETE /api/admin/users/:id
// @desc    删除用户 (管理员权限)
// @access  Private (Admin)
router.delete('/:id', adminAuth, async(req, res) => {
    try {
        await User.findByIdAndRemove(req.params.id);
        res.success(null, '用户已删除');
    } catch (err) {
        console.error(err.message);
        res.error(500, "服务器错误", err.message);
    }
});

module.exports = router;