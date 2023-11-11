const express = require("express");
const bannerController = require("../controllers/Banner")
const router = express.Router();

router.get("/getBanners", bannerController.getBanners)
router.post("/postBanner", bannerController.postBanner)
router.delete("/deleteBanner/:id", bannerController.deleteBanner)

module.exports = router;