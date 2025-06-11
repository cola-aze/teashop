const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        trim: true,
        match: [
            /^[\w-]+(?:\.[\w-]+)*@(?:[\w-]+\.)+[a-zA-Z]{2,7}$/,
            "请输入有效的邮箱地址",
        ],
    },
    address: {
        type: String,
        trim: true,
    },
    phone: {
        type: String,
        trim: true,
        match: [
            /^(?:\+?86)?1(?:3\d{3}|4[3-9]\d{2}|5[0-35-9]\d{2}|6[5-7]\d{2}|7[0-8]\d{2}|8\d{3}|9[189]\d{2})\d{6}$/,
            "请输入有效的手机号",
        ],
    },
    avatar: {
        type: String,
    },
    isAdmin: {
        type: Boolean,
        default: false, // 默认不是管理员
    },
    // 可以添加其他用户相关字段，例如 email, avatar, role 等
});

// 在保存用户之前对密码进行哈希处理
UserSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// 验证用户密码的方法
UserSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", UserSchema);
