const multer = require('multer');

// Ruta de destino para las imágenes (relativa a la ubicación del archivo de servidor)
const destination = './server/uploadsProducts';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, destination);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage: storage });

module.exports = upload;