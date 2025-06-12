const mongoose = require('mongoose');

const DictionaryItemSchema = new mongoose.Schema({
    type: { // 字典类型，例如: 'tea_category', 'product_level'
        type: String,
        required: true,
        trim: true,
        index: true // 为类型添加索引，方便查询
    },
    value: { // 字典项的值，例如: '红茶', '绿茶', '初级'
        type: String,
        required: true,
        trim: true
    },
    description: { // 描述 (可选)
        type: String,
        trim: true
    },
    order: { // 排序 (可选)
        type: Number,
        default: 0
    }
}, { timestamps: true });

// 确保在同一类型下，value 是唯一的
DictionaryItemSchema.index({ type: 1, value: 1 }, { unique: true });

module.exports = mongoose.model('DictionaryItem', DictionaryItemSchema);
