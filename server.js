const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from "public"
app.use(express.static("public"));

// Create an "uploads" folder if it doesn't exist
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Configure Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// File type validation (allow only images & text files for example)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|txt|pdf/;
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedTypes.test(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only images, txt, and pdf are allowed."));
  }
};

const upload = multer({ storage, fileFilter });

// Route for uploading files
app.post("/upload", upload.single("myfile"), (req, res) => {
  try {
    res.send(`File uploaded successfully: ${req.file.filename}`);
  } catch (err) {
    res.status(500).send("Error uploading file.");
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    res.status(400).send("File upload error: " + err.message);
  } else if (err) {
    res.status(400).send(err.message);
  } else {
    next();
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});