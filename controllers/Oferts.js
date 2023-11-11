const Ofert = require("../models/Oferts");
const { promisify } = require("util");

const fs = require("fs");
const path = require("path");
const prueba = (req, res) => {
  return res.status(200).send({
    msg: "dfafadf",
  });
};

const getAllOferts = async (req, res) => {
  try {
    // Buscar todos los productos en la base de datos
    const oferts = await Ofert.find();

    return res.status(200).json({
      oferts, // Un objeto con una propiedad "products"
    });
  } catch (error) {
    console.error("Error al obtener productos:", error);
    return res.status(500).json({
      status: "error",
      message: "Error al obtener productos",
    });
  }
};

const postOfert = async (req, res) => {
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
  const newOfert = new Ofert({
    title: params.title,
    description: params.description,
    price: params.price,
    images: images,
    category: params.category, // Asegúrate de que las imágenes se envíen en el formulario
  });

  try {
    // Guardar el producto en la base de datos utilizando una promesa
    const savedOfert = await newOfert.save();

    // Mostrar información del producto guardado
    return res.status(200).send({
      status: "success",
      msg: "Producto guardado con éxito",
      ofert: savedOfert,
    });
  } catch (error) {
    console.error("Error al guardar el producto:", error);
    return res.status(500).send({
      status: "error",
      msg: "Error al guardar el producto",
    });
  }
};

const editOfert = async (req, res) => {
  const ofertId = req.params.id;

  try {
    const ofert = await Ofert.findById(ofertId);

    if (!ofert) {
      return res.status(404).json({
        status: "error",
        message: "Oferta no encontrada",
      });
    }

    // Verifica y actualiza solo si req.body contiene valores
    ofert.title = req.body.title || ofert.title;
    ofert.description = req.body.description || ofert.description;
    ofert.price = req.body.price || ofert.price;
    ofert.category = req.body.category || ofert.category;
    ofert.ofert = req.body.ofert || ofert.ofert;
    ofert.destacado = req.body.destacado || ofert.destacado;

    const updatedOfert = await ofert.save();

    return res.status(200).json({
      status: "success",
      message: "Oferta actualizada con éxito",
      Ofert: updatedOfert,
    });
  } catch (error) {
    console.error("Error al editar la oferta:", error);
    return res.status(500).json({
      status: "error",
      message: "Error al editar la oferta",
      error: error,
    });
  }
};

const removeOneOfert = async (req, res) => {
  //encontrar product a eliminar
  const ofert = req.params.id;

  try {
    // Buscar el producto por su ID y eliminarlo
    const removedOfert = await Ofert.findByIdAndRemove(ofert);
    if (!removedOfert) {
      return res.status(404).json({
        status: "error",
        message: "oferta no encontrado",
      });
    }

    if (removedOfert.images && Array.isArray(removedOfert.images)) {
      removedOfert.images.forEach((image) => {
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
    const removedOfertFromDB = await Ofert.findByIdAndRemove(ofert);
    if (!removedOfertFromDB) {
      return res.status(404).json({
        status: "error",
        message: "Oferta no se pudo eliminar de la base de datos",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "oferta eliminado con éxito",
      ofertRemove: removedOfertFromDB,
    });
  } catch (error) {
    console.error("Error al eliminar la oferta:", error);
    return res.status(500).json({
      status: "error",
      msg: "la oferta no se puede eliminar",
      error: error.message,
    });
  }
};

const removeOfertImage = async (req, res) => {
  const ofertId = req.params.id; // ID del producto
  const imageId = req.params.image; // ID de la imagen a eliminar

  try {
    // Busca el producto por ID
    const ofert = await Ofert.findById(ofertId);

    if (!ofert) {
      return res.status(404).json({
        status: "error",
        message: "Oferta no encontrado",
      });
    }

    // Busca la imagen en el producto por su ID
    const imageToRemove = ofert.images.find((image) => image._id == imageId);

    if (!imageToRemove) {
      return res.status(404).json({
        status: "error",
        message: "Imagen no encontrada en la oferta",
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
    ofert.images = ofert.images.filter((image) => image._id != imageId);

    // Guarda el producto actualizado en la base de datos
    const updatedOfert = await ofert.save();

    return res.status(200).json({
      status: "success",
      message: "Imagen eliminada con éxito",
      updatedOfert,
    });
  } catch (error) {
    console.error("Error al eliminar la imagen:", error);
    return res.status(500).json({
      status: "error",
      message: "Error al eliminar la imagen",
    });
  }
};

const uploadOfertImage = async (req, res) => {
  const ofertId = req.params.id;

  try {
    const ofert = await Ofert.findById(ofertId);

    if (!ofert) {
      return res.status(404).json({
        status: "error",
        message: "oferta no encontrado",
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
    ofert.images.push({ filename: uploadedImage.filename });

    const updatedOfert = await ofert.save();

    return res.status(201).json({
      status: "success",
      message: "Imagen subida con éxito",
      updatedOfert,
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

const getOfertDetails = async (req, res) => {
  try {
    const OfertDetailId = req.params.id;

    // Realiza una consulta a la base de datos para obtener los detalles de la oferta por su ID
    const ofertDetails = await Ofert.findById(OfertDetailId);

    if (!ofertDetails) {
      return res.status(404).json({ message: "Oferta no encontrada" });
    }

    // Si se encuentra la oferta, envía los detalles como respuesta
    res.status(200).send({
      status: "success",
      msg: "aqui esta la oferta completa",
      ofertDetails,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error al obtener los detalles de la oferta" });
  }
};

const uploadImageOfert = (req, res) => {
  const ofertId = req.params.id;
  Ofert.findById(ofertId)
    .exec()
    .then((oferta) => {
      if (!oferta) {
        // Manejar si la oferta no se encuentra
        return res.status(404).json({ message: "Oferta no encontrada" });
      }

      // Agrega la nueva URL a la matriz de imágenes en el documento de oferta
      oferta.images.push(nuevaUrlDeImagen);

      // Guarda el documento actualizado en la base de datos
      return oferta.save();
    })
    .then((ofertaActualizada) => {
      // La oferta se ha actualizado correctamente
      return res.status(200).json({
        message: "Imagen agregada con éxito",
        oferta: ofertaActualizada,
      });
    })
    .catch((error) => {
      // Manejar cualquier error que ocurra
      return res.status(500).json({ error: error.message });
    });
};
module.exports = {
  prueba,
  getAllOferts,
  postOfert,
  editOfert,
  removeOneOfert,
  getOfertDetails,
  removeOfertImage,
  uploadOfertImage,
  uploadImageOfert,
};
