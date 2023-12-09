const { Schema, model } = require("mongoose");

const BannerSchema = Schema({
    images: [{
        fieldname: String,
        originalname: String,
        encoding: String,
        mimetype: String,
        destination: String,
        filename: String,
        path: String,
        size: Number,
      }],
})

module.exports = model("Banner", BannerSchema);