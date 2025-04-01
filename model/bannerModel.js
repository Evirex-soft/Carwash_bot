const mongoose = require("mongoose");

const BannerSchema = new mongoose.Schema({
    imageUrl: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Banner = mongoose.model("Banner", BannerSchema);

module.exports = Banner; 