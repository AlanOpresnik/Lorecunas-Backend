const Banner = require("../models/Banner");

const getBanners = async (req, res) => {
    try {
        // Encuentra todos los banners en la base de datos
        const banners = await Banner.find();

        return res.status(200).send({
            status: "success",
            msg: "Banners recuperados con éxito",
            banners: banners
        });
    } catch (error) {
        return res.status(500).send({
            status: "error",
            msg: "Hubo un error al recuperar los banners",
            error: error
        });
    }
};

const postBanner = async (req, res) => {
  const bannerData = req.body;

  if (Object.keys(bannerData).length === 0) {
    return res.status(400).send({
      status: "error",
      msg: "El banner está vacío o no se proporcionó",
    });
  }

  try {
    const banner = new Banner(bannerData);
    const savedBanner = await banner.save();

    return res.status(200).send({
      status: "success",
      msg: "Banner subido con éxito",
      banner: savedBanner,
    });
  } catch (error) {
    return res.status(500).send({
      status: "error",
      msg: "Hubo un error al guardar el banner",
      error: error,
    });
  }
};

const deleteBanner = async (req, res) => {
  const bannerId = req.params.id; 

  try {
    const deletedBanner = await Banner.findOneAndRemove({ _id: bannerId });

    if (!deletedBanner) {
      return res.status(404).send({
        status: "error",
        msg: "Banner no encontrado",
      });
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
  deleteBanner
};
