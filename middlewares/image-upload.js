const multer = require("multer");
const uuid = require("uuid").v4;

const MIME_TYPE_IMAGES = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
};

const imageUpload = multer({
  limits: 50000,
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "uploads/images");
    },
    filename: (req, file, cb) => {
      const exts = MIME_TYPE_IMAGES[file.mimetype];
      cb(null, `${uuid()}.${exts}`);
    },
    fileFilter: (req, file, cb) => {
      const isValid = !!MIME_TYPE_IMAGES[file.mimetype];
      let error = isValid ? null : "Mimetype not Allowed";
      cb(error, isValid);
    },
  }),
});

module.exports = imageUpload;
