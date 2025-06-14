const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    price: {
        type: Number,
        required: true,
        min: 0,
    },
    imageUrl: { // 修改为 imageUrl
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
        enum: [
            "green",
            "black",
            "oolong",
            "white",
            "dark",
            "flower",
            "puer",
            "teaware",
            "yellow",
            "reprocessed",
            "substitute",
        ],
        trim: true,
    },
    stock: {
        type: Number,
        default: 0,
        min: 0,
    },
    order: {
        type: Number,
        default: 0,
    },
    level: {
        type: String,
        trim: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// 检查模型是否已经存在，如果存在则直接使用，否则编译新模型
module.exports = mongoose.models.Product || mongoose.model("Product", ProductSchema);