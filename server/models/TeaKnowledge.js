const mongoose = require('mongoose');

const TeaKnowledgeSchema = new mongoose.Schema({
    category: { // 类别
        type: String,
        required: true,
        trim: true
    },
    name: { // 茶名称
        type: String,
        required: true,
        trim: true,
        unique: true // 确保茶的名称唯一
    },
    description_short: { // 简短描述 (用于列表页卡片)
        type: String,
        required: true,
        trim: true
    },
    description_full: { // 完整描述 (用于详情页，支持 Markdown)
        type: String,
        required: true
    },
    imageUrl: { // 茶图片URL，统一使用小驼峰
        type: String,
        default: '/uploads/default_tea.jpg'
    },
    origin: { // 产地
        type: String,
        trim: true
    },
    // 茶叶感官描述
    appearance: { // 茶叶外形
        type: String,
        trim: true
    },
    liquorColor: { // 汤色 (原汤底，改为汤色)
        type: [String] // 数组形式，可以有多种描述
    },
    infusedLeaves: { // 叶底
        type: [String] // 数组形式
    },
    // 其他详细信息
    benefits: { // 功效作用
        type: [String] // 数组形式
    },
    brewingMethod: { // 冲泡方法 (原 brewing_guide，现在支持Markdown)
        type: String
    },
    storageMethod: { // 存储方法
        type: String,
        trim: true
    },
    suitableFor: { // 适宜人群
        type: [String] // 数组形式
    },
    notSuitableFor: { // 禁忌人群
        type: [String] // 数组形式
    },
    productionProcess: { // 制作工艺 (多个标签录入)
        type: [String] // 数组形式
    },
    referencePrice: { // 参考价格
        type: String, // 使用字符串，可以包含 "¥XX-YY" 或 "¥XX起"
        trim: true
    },
    // 品鉴要素 (评分和多值)
    grade: { // 等级 (评分机制，1-5颗星)
        type: Number,
        min: 1,
        max: 5,
        default: 3
    },
    color: { // 色泽 (指干茶色泽)
        type: [String] // 数组形式
    },
    aroma: { // 香气
        type: [String] // 数组形式
    },
    taste: { // 滋味
        type: [String] // 数组形式
    }
}, { timestamps: true }); // 自动添加 createdAt 和 updatedAt 字段

module.exports = mongoose.model('TeaKnowledge', TeaKnowledgeSchema);