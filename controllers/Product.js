const Product = require("../models/Products");
const { promisify } = require("util");

const fs = require("fs");
const path = require("path");

const prueba = (req, res) => {
  return res.status(200).send({
    status: "200",
    msg: "prueba products",
  });
};

const getAllProducts = async (req, res) => {
  try {
    // Buscar todos los productos en la base de datos
    const products = await Product.find();

    return res.status(200).json({
      products, // Un objeto con una propiedad "products"
    });
  } catch (error) {
    console.error("Error al obtener productos:", error);
    return res.status(500).json({
      status: "error",
      message: "Error al obtener productos",
    });
  }
};

const getProductosByCategoria = async (req, res) => {
  const productId = req.params.id;

  try {
    // Buscar el producto por ID
    const producto = await Product.findOne({ _id: productId });

    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    // Filtrar productos por categoría
    const productosRelacionados = await Product.find({ category: producto.category }).exec();

    res.json(productosRelacionados);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

const postProduct = async (req, res) => {
  // Obtener información del formulario
  const params = req.body;

  // Obtener la información de las imágenes cargadas
  const images = req.files.map((file) => ({
    fieldname: file.fieldname,
    originalname: file.originalname,
    encoding: file.encoding,
    mimetype: file.mimetype,
    destination: file.destination,
    filename: file.filename,
    path: file.path,
    size: file.size,
  }));

  // Crear una instancia de Product con los datos del formulario
  const newProduct = new Product({
    title: params.title,
    description: params.description,
    price: params.price,
    images: images,
    category: params.category,
  });

  try {
    // Guardar el producto en la base de datos utilizando una promesa
    const savedProduct = await newProduct.save();

    // Mostrar información del producto guardado
    return res.status(200).send({
      status: "success",
      msg: "Producto guardado con éxito",
      product: savedProduct,
    });
  } catch (error) {
    console.error("Error al guardar el producto:", error);
    return res.status(500).send({
      status: "error",
      msg: "Error al guardar el producto",
    });
  }
};

const editProduct = async (req, res) => {
  const productId = req.params.id;

  try {
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        status: "error",
        message: "Producto no encontrado",
      });
    }

    product.title = req.body.title || product.title;
    product.description = req.body.description || product.description;
    product.price = req.body.price || product.price;
    product.category = req.body.category || product.category;
    product.ofert = req.body.ofert || product.ofert;
    product.destacado = req.body.destacado || product.destacado;

    const updatedProduct = await product.save();

    return res.status(200).json({
      status: "success",
      message: "Producto actualizado con éxito",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Error al editar el producto:", error);
    return res.status(500).json({
      status: "error",
      message: "Error al editar el producto",
    });
  }
};

const removeOneProduct = async (req, res) => {
  const product = req.params.id;

  try {
    const removedProduct = await Product.findById(product);

    if (!removedProduct) {
      return res.status(404).json({
        status: "error",
        message: "Producto no encontrado",
      });
    }

    if (removedProduct.images && Array.isArray(removedProduct.images)) {
      removedProduct.images.forEach((image) => {
        const imagePath = path.join(
          __dirname,
          "../uploadsProducts",
          image.filename
        );

        fs.unlink(imagePath, (err) => {
          if (err) {
            console.error(
              `Error al eliminar la imagen ${image.filename}: ${err}`
            );
          }
        });
      });
    }

    const removedProductFromDB = await Product.findByIdAndRemove(product);

    if (!removedProductFromDB) {
      return res.status(404).json({
        status: "error",
        message: "Producto no se pudo eliminar de la base de datos",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Producto eliminado con éxito",
      productRemove: removedProductFromDB,
    });
  } catch (error) {
    console.error("Error al eliminar el producto:", error);
    return res.status(500).json({
      status: "error",
      msg: "El producto no se puede eliminar",
      error: error.message,
    });
  }
};

const removeProductImage = async (req, res) => {
  const productId = req.params.id; // ID del producto
  const imageId = req.params.image; // ID de la imagen a eliminar

  try {
    // Busca el producto por ID
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        status: "error",
        message: "Producto no encontrado",
      });
    }

    // Busca la imagen en el producto por su ID
    const imageToRemove = product.images.find((image) => image._id == imageId);

    if (!imageToRemove) {
      return res.status(404).json({
        status: "error",
        message: "Imagen no encontrada en el producto",
      });
    }

    // Obtiene la ruta del archivo de imagen a eliminar
    const imagePath = path.join(
      __dirname,
      "../uploadsProducts",
      imageToRemove.filename
    );

    // Promisify la función fs.unlink para eliminar el archivo de imagen
    const unlinkAsync = promisify(fs.unlink);

    // Elimina el archivo de imagen físicamente
    await unlinkAsync(imagePath);

    // Elimina la imagen del producto en la base de datos
    product.images = product.images.filter((image) => image._id != imageId);

    // Guarda el producto actualizado en la base de datos
    const updatedProduct = await product.save();

    return res.status(200).json({
      status: "success",
      message: "Imagen eliminada con éxito",
    });
  } catch (error) {
    console.error("Error al eliminar la imagen:", error);
    return res.status(500).json({
      status: "error",
      message: "Error al eliminar la imagen",
    });
  }
};
const uploadProductImage = async (req, res) => {
  const productId = req.params.id;

  try {
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        status: "error",
        message: "Producto no encontrado",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        status: "error",
        message: "No se han proporcionado imágenes para subir",
      });
    }

    const uploadedImage = req.file;

    // Asegúrate de que tu modelo de datos maneje la información de la imagen adecuadamente
    product.images.push({ filename: uploadedImage.filename });

    const updatedProduct = await product.save();

    return res.status(201).json({
      status: "success",
      message: "Imagen subida con éxito",
      updatedProduct,
      image: uploadedImage.filename,
    });
  } catch (error) {
    console.error("Error al subir la imagen:", error);
    return res.status(500).json({
      status: "error",
      message: "Error al subir la imagen",
    });
  }
};
const getProductDestacado = (req, res) => {
  Product.find({ destacado: true })
    .then((productosDestacados) => {
      res.json(productosDestacados);
    })
    .catch((err) => {
      res.status(500).json({ error: "Error al obtener productos destacados" });
    });
};

const marcarProductoComoDestacado = (req, res) => {
  const productId = req.params.id; // Asegúrate de obtener el ID del producto desde la solicitud

  Product.updateOne({ _id: productId }, { destacado: true })
    .then((result) => {
      if (result.nModified === 1) {
        res.json({ message: "error" });
      } else {
        res
          .status(200)
          .json({ msg: "Producto marcado como destacado con éxito" });
      }
    })
    .catch((err) => {
      res
        .status(500)
        .json({ error: "Error al marcar el producto como destacado" });
    });
};

const eliminarProductoDestacado = async (req, res) => {
  const productId = req.params.productId;

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    product.destacado = false; // Cambia el valor "destacado" a falso
    await product.save();

    res.json({ message: "Producto eliminado de destacados exitosamente" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Error al eliminar el producto de destacados" });
  }
};

const getProductDetails = async (req, res) => {
  try {
    const ProductDetailId = req.params.id;

    // Realiza una consulta a la base de datos para obtener los detalles de la oferta por su ID
    const productDetail = await Product.findById(ProductDetailId);

    if (!productDetail) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    // Si se encuentra la oferta, envía los detalles como respuesta
    res.status(200).send({
      status: "success",
      msg: "aqui esta el productoDetail completo",
      productDetail,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error al obtener los detalles de el product" });
  }
};
const filtrarProduct = async (req, res) => {
  try {
    const filtro = req.params.product;
    const productos = await Product.find({
      category: { $regex: new RegExp(filtro, "i") },
    });

    console.log("Productos que contienen el filtro en el título:", productos);
    res.status(200).json(productos);
  } catch (err) {
    console.error("Error al buscar productos:", err);
    res.status(500).send("Error al buscar productos");
  }
};

const searchProduct = async (req, res) => {
  try {
    const search = req.params.search;
    const productos = await Product.find({
      title: { $regex: new RegExp(search, "i") },
    });
    console.log("Productos que contienen el filtro en el título:", productos);
    res.status(200).json(productos);
  } catch (err) {
    console.error("Error al buscar productos:", err);
    res.status(500).send("Error al buscar productos");
  }
};

module.exports = {
  prueba,
  getAllProducts,
  postProduct,
  editProduct,
  removeOneProduct,
  getProductDestacado,
  marcarProductoComoDestacado,
  eliminarProductoDestacado,
  getProductDetails,
  filtrarProduct,
  searchProduct,
  removeProductImage,
  uploadProductImage,
  getProductosByCategoria
};
