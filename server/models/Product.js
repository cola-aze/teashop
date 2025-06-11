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
    imageUrl: {
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
        ], // 茶叶分类，可以根据实际需求调整
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

module.exports = mongoose.model("Product", ProductSchema);
