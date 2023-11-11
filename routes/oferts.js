const express = require("express");
const OfertController = require("../controllers/Oferts");
const upload = require("../config/multer");
const router = express.Router();





router.post("/postOfert", upload.array('images', 5), OfertController.postOfert)

router.delete("/ofert/:id/images/:image", OfertController.removeOfertImage);
router.post("/ofert/:id/images", upload.single("image"), OfertController.uploadOfertImage);

// Define tus rutas y middleware para PRODUCT_ROUTES aquí
router.get("/prueba", OfertController.prueba)
router.get("/getOferts", OfertController.getAllOferts)
router.put("/editOfert/:id", OfertController.editOfert)
router.get("/getOfertDetails/:id", OfertController.getOfertDetails)
router.delete("/deleteOfert/:id", OfertController.removeOneOfert)
module.exports = router;