const mongoose = require('mongoose');

const featuredCategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        default: '',
    },
    imageUrls: [{
        type: String,
        required: true,
    }],
    link: {
        type: String,
        required: true,
        trim: true,
    },
    order: {
        type: Number,
        default: 0,
    },
}, {
    timestamps: true,
});

const FeaturedCategory = mongoose.model('FeaturedCategory', featuredCategorySchema);

module.exports = FeaturedCategory;