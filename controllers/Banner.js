const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Banner = require("../models/Banner");

// Ruta de destino para las imágenes de banners
const bannerDestination = "./uploadsBanners";

const bannerStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, bannerDestination);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const bannerUpload = multer({ storage: bannerStorage });
const getBanners = async (req, res) => {
  try {
    // Encuentra todos los banners en la base de datos
    const banners = await Banner.find();

    return res.status(200).send({
      status: "success",
      msg: "Banners recuperados con éxito",
      banners: banners,
    });
  } catch (error) {
    return res.status(500).send({
      status: "error",
      msg: "Hubo un error al recuperar los banners",
      error: error,
    });
  }
};

const postBanner = async (req, res) => {
  bannerUpload.single("bannerImage")(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).send({
        status: "error",
        msg: "Error en la carga de la imagen",
        error: err,
      });
    } else if (err) {
      return res.status(500).send({
        status: "error",
        msg: "Hubo un error al procesar la imagen",
        error: err,
      });
    }

    if (!req.file) {
      return res.status(400).send({
        status: "error",
        msg: "No se proporcionó ninguna imagen de banner",
      });
    }

    try {
      const bannerInstance = new Banner({
        images: [
          {
            fieldname: req.file.fieldname,
            originalname: req.file.originalname,
            encoding: req.file.encoding,
            mimetype: req.file.mimetype,
            destination: req.file.destination,
            filename: req.file.filename,
            path: req.file.path,
            size: req.file.size,
          },
        ],
      });

      const savedBanner = await bannerInstance.save();
      console.log("Banner guardado:", savedBanner);
      return res.status(200).send({
        status: "success",
        msg: "Banner subido con éxito",
        banner: savedBanner,
      });
    } catch (error) {
      console.error("Error al guardar el banner:", error);
      return res.status(500).send({
        status: "error",
        msg: "Hubo un error al guardar el banner",
        error: error,
      });
    }
  });
};
const deleteBanner = async (req, res) => {
  const bannerId = req.params.id.toString(); // Convertir a cadena

  try {
    const deletedBanner = await Banner.findByIdAndRemove(bannerId);

    if (!deletedBanner) {
      return res.status(404).send({
        status: "error",
        msg: "Banner no encontrado",
      });
    }

    // Asegúrate de que haya al menos una imagen asociada al banner
    if (deletedBanner.images && deletedBanner.images.length > 0) {
      // Obtén la primera imagen del array
      const firstImage = deletedBanner.images[0];

      // Construir la ruta del archivo utilizando la ruta relativa
      const imagePath = path.join("./uploadsBanners", firstImage.filename);

      console.log("Ruta del archivo:", imagePath);

      try {
        fs.unlinkSync(imagePath);
      } catch (err) {
        console.error(`Error al eliminar la imagen del banner: ${err}`);
        return res.status(500).send({
          status: "error",
          msg: "Hubo un error al eliminar la imagen del banner",
          error: err,
        });
      }
    }

    return res.status(200).send({
      status: "success",
      msg: "Banner eliminado con éxito",
      banner: deletedBanner,
    });
  } catch (error) {
    return res.status(500).send({
      status: "error",
      msg: "Hubo un error al eliminar el banner",
      error: error,
    });
  }
};

module.exports = {
  getBanners,
  postBanner,
  deleteBanner,
};
