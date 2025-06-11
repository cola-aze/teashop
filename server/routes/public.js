const express = require("express");
const router = express.Router();
const CarouselItem = require("../models/CarouselItem");
const Poster = require("../models/Poster");
const Product = require("../models/Product");

// @route   GET /api/carousel
// @desc    获取所有轮播图项 (公开，无需认证)
// @access  Public
router.get("/carousel", async (req, res) => {
    try {
        const items = await CarouselItem.find().sort({ order: 1 });
        res.json(items);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("服务器错误");
    }
});

// @route   GET /api/posters
// @desc    获取所有海报图项 (公开，无需认证)
// @access  Public
router.get("/posters", async (req, res) => {
    try {
        const items = await Poster.find().sort({ order: 1 });
        res.json(items);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("服务器错误");
    }
});

// @route   GET /api/products
// @desc    获取所有产品项 (公开，无需认证)
// @access  Public
router.get("/products", async (req, res) => {
    try {
        const items = await Product.find();
        res.json(items);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("服务器错误");
    }
});

module.exports = router;
