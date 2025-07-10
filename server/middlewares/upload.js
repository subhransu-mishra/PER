const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

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

// Configure multer with file size limits and file filter
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
  fileFilter: (req, file, cb) => {
    // Accept images and pdf only
    if (!file.originalname.match(/\.(jpg|jpeg|png|pdf)$/)) {
      return cb(new Error("Only image files and PDFs are allowed!"), false);
    }
    cb(null, true);
  },
});

module.exports = upload;
