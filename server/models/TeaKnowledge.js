const mongoose = require('mongoose');

const TeaKnowledgeSchema = new mongoose.Schema({
    category: { // 例如: "红茶", "绿茶", "乌龙茶"
        type: String,
        required: true,
        trim: true
    },
    name: { // 例如: "金骏眉", "西湖龙井", "大红袍"
        type: String,
        required: true,
        trim: true,
        unique: true // 确保茶的名称唯一
    },
    description_short: { // 用于列表页卡片上的简短描述
        type: String,
        required: true,
        trim: true
    },
    description_full: { // 用于详情页的完整茶知识内容
        type: String,
        required: true
    },
    image_url: { // 茶图片URL，用于卡片展示
        type: String,
        default: '/uploads/default_tea.jpg' // 可以设置一个默认图片
    },
    // 你可以根据需要添加更多字段，例如：产地、特点、冲泡方法等
    origin: {
        type: String,
        trim: true
    },
    features: {
        type: [String] // 数组形式的特点
    },
    brewing_guide: {
        type: String
    }
}, { timestamps: true }); // 自动添加 createdAt 和 updatedAt 字段

module.exports = mongoose.model('TeaKnowledge', TeaKnowledgeSchema);