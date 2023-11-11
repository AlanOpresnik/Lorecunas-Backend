const { Schema, model } = require("mongoose");

const BannerSchema = Schema({
    img:{
        type: String,
        required: true,
    }
})

module.exports = model("Banner", BannerSchema);