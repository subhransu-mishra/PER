const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../utils/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "receipts",
    format: async (req, file) => {
      // Allow only these formats
      const allowedFormats = ["jpeg", "png", "jpg", "pdf"];
      const ext = file.mimetype.split("/")[1];
      if (!allowedFormats.includes(ext)) throw new Error("Invalid file type");
      return ext;
    },
    public_id: (req, file) => `${uuidv4()}-${file.originalname}`,
  },
});

const upload = multer({ storage });

module.exports = upload;
