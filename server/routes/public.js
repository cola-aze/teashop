const express = require("express");
const router = express.Router();
const CarouselItem = require("../models/CarouselItem");
const Poster = require("../models/Poster");
const Product = require("../models/Product");
const TeaKnowledge = require("../models/TeaKnowledge");
const DictionaryItem = require("../models/DictionaryItem");

// @route   GET /api/carousel
// @desc    获取所有轮播图项 (公开，无需认证)
// @access  Public
router.get("/carousel", async(req, res) => {
    try {
        const items = await CarouselItem.find().sort({ order: 1 });
        res.success(items, "获取轮播图列表成功");
    } catch (err) {
        console.error(err.message);
        res.error(500, "服务器错误", err.message);
    }
});

// @route   GET /api/posters
// @desc    获取所有海报图项 (公开，无需认证)
// @access  Public
router.get("/posters", async(req, res) => {
    try {
        const items = await Poster.find().sort({ order: 1 });
        res.success(items, "获取海报图列表成功");
    } catch (err) {
        console.error(err.message);
        res.error(500, "服务器错误", err.message);
    }
});

// @route   GET /api/products
// @desc    获取所有产品项 (公开，无需认证)
// @access  Public
router.get("/products", async(req, res) => {
    try {
        const items = await Product.find();
        res.success(items, "获取产品列表成功");
    } catch (err) {
        console.error(err.message);
        res.error(500, "服务器错误", err.message);
    }
});

// @route   GET /api/public/tea-knowledge
// @desc    获取所有茶知识项 (公开，无需认证)
// @access  Public
router.get("/tea-knowledge", async(req, res) => {
    try {
        const items = await TeaKnowledge.find();
        res.success(items, "获取茶知识列表成功");
    } catch (err) {
        console.error(err.message);
        res.error(500, "服务器错误", err.message);
    }
});

// @route   GET /api/public/dictionary
// @desc    获取字典项 (公开，无需认证)
// @access  Public
router.get("/dictionary", async(req, res) => {
    try {
        const { type } = req.query;
        const query = type ? { type } : {};
        const items = await DictionaryItem.find(query).sort({ order: 1, value: 1 });
        res.success(items, "获取字典项列表成功");
    } catch (err) {
        console.error(err.message);
        res.error(500, "服务器错误", err.message);
    }
});

module.exports = router;