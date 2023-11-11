const express = require("express");
const productController = require("../controllers/Product");
const router = express.Router();
const upload = require('../config/multer');

// Ruta para manejar la carga de archivos con Multer
router.post('/postProduct', upload.array('images', 5), productController.postProduct);



// Otras rutas
router.get("/getProducts", productController.getAllProducts);
router.get("/getMatchProductsCategory/:id", productController.getProductosByCategoria)
router.put("/editProduct/:id", productController.editProduct);
router.delete("/deleteProduct/:id", productController.removeOneProduct);
router.delete("/products/:id/images/:image", productController.removeProductImage);
router.post("/products/:id/images", upload.single("image"), productController.uploadProductImage);
router.get('/getProductsDestacados', productController.getProductDestacado);
router.put('/marcar-producto-destacado/:productId', productController.marcarProductoComoDestacado);
router.delete('/eliminar-producto-destacado/:productId', productController.eliminarProductoDestacado);
router.get("/getProductDetail/:id", productController.getProductDetails);
router.get("/getProductFiltrado/:product", productController.filtrarProduct);
router.get("/getSearchProducts/:search", productController.searchProduct);

module.exports = router;