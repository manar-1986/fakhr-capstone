import multer from "multer";
import path from "path";

// Define where to store the uploaded files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads"); // folder to store the images
  },
  filename: function (req, file, cb) {
    // Generate a unique name
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({ storage});

export default upload;