import express from "express"
import multer from "multer"
import path from "path"
import fs from "fs"
import axios from "axios"
import FormData from "form-data";

const router = express.Router();

// Create "uploads" directory if not exists
// const uploadDir = path.join(__dirname, "../uploads");
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const uploadDir = join(__dirname, "../uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Multer configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // cb(null, uploadDir);
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
     cb(null, Date.now() + path.extname(file.originalname));
    // const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    // const ext = path.extname(file.originalname);
    // cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

const upload = multer({ storage: storage });

router.post("/", upload.single("image"), async (req, res) => {
  try {
    const filePath = req.file.path;
    console.log("Image uploaded to:", filePath);

    // In Phase 3: Forward image to AI microservice and get results
    // For now, simulate fake response
    // const fakeProducts = [
    //   { name: "Red Sneakers" },
    //   { name: "Stylish Trainers" },
    //   { name: "Running Shoes" },
    // ];

    const formData = new FormData();
    formData.append("image", fs.createReadStream(filePath));

    const response = await axios.post("http://localhost:5001/recommend", formData, {
      headers: formData.getHeaders(),
    });

    res.json({
      message: "Image processed successfully",
      recommendations: response.data.recommendations,
    });

    // res.json({ message: "Image received", products: fakeProducts });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "Upload failed" });
  }
});

// module.exports = router;
export default router;
