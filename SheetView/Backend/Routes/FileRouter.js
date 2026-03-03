const express = require("express");
const router = express.Router();
const multer = require("multer");
const File = require("../Models/File.js");

// ===============================
// MULTER - MEMORY STORAGE
// Files go straight into RAM buffer, then into MongoDB
// ===============================
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 16 * 1024 * 1024 }, // 16MB — MongoDB document limit
});





// ===============================
// UPLOAD SINGLE FILE
// POST /upload/single
// Body: form-data { file: <file>, uploadedBy: "username" }
// ===============================
router.post("/single", upload.single("file"), async (req, res) => {
  console.log("I am here!");
  console.log(req.file);  

  try {
    if (!req.file) {
      return res.status(400).json({ detail: "No file uploaded" });
    }

    const { uploadedBy } = req.body;

    const savedFile = await File.create({
      originalName: req.file.originalname,
      mimetype:     req.file.mimetype,
      size:         req.file.size,
      data:         req.file.buffer,        // binary stored in MongoDB
      uploadedBy:   "anonymous",
    });

    return res.status(201).json({
      message: "File uploaded to MongoDB successfully",
      file: {
        id:           savedFile._id,
        originalName: savedFile.originalName,
        mimetype:     savedFile.mimetype,
        size:         savedFile.size,
        uploadedBy:   savedFile.uploadedBy,
        uploadedAt:   savedFile.createdAt,
      },
    });
  } catch (err) {
    console.error("Upload error:", err);
    return res.status(500).json({ detail: "Server error during upload" });
  }
});



















// ===============================
// UPLOAD MULTIPLE FILES
// POST /upload/multiple
// Body: form-data { files: <file[]>, uploadedBy: "username" }
// ===============================
router.post("/multiple", upload.array("files", 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ detail: "No files uploaded" });
    }

    const { uploadedBy } = req.body;

    const fileDocs = req.files.map((file) => ({
      originalName: file.originalname,
      mimetype:     file.mimetype,
      size:         file.size,
      data:         file.buffer,
      uploadedBy:   uploadedBy || "anonymous",
    }));

    const savedFiles = await File.insertMany(fileDocs);

    return res.status(201).json({
      message: `${savedFiles.length} file(s) uploaded to MongoDB`,
      files: savedFiles.map((f) => ({
        id:           f._id,
        originalName: f.originalName,
        mimetype:     f.mimetype,
        size:         f.size,
        uploadedBy:   f.uploadedBy,
        uploadedAt:   f.createdAt,
      })),
    });
  } catch (err) {
    console.error("Upload error:", err);
    return res.status(500).json({ detail: "Server error during upload" });
  }
});

// ===============================
// DOWNLOAD / SERVE A FILE
// GET /upload/file/:id
// ===============================
router.get("/file/:id", async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) return res.status(404).json({ detail: "File not found" });

    res.set("Content-Type", file.mimetype);
    res.set("Content-Disposition", `inline; filename="${file.originalName}"`);
    return res.send(file.data);
  } catch (err) {
    return res.status(500).json({ detail: "Could not retrieve file" });
  }
});

// ===============================
// LIST ALL FILES (no binary data)
// GET /upload/files?uploadedBy=john
// ===============================
router.get("/files", async (req, res) => {
  try {
    const { uploadedBy } = req.query;
    const filter = uploadedBy ? { uploadedBy } : {};

    // Exclude the heavy `data` buffer from the list response
    const files = await File.find(filter).select("-data").sort({ createdAt: -1 });
    return res.json(files);
  } catch (err) {
    return res.status(500).json({ detail: "Could not retrieve files" });
  }
});

// ===============================
// DELETE A FILE
// DELETE /upload/:id
// ===============================
router.delete("/:id", async (req, res) => {
  try {
    const file = await File.findByIdAndDelete(req.params.id);
    if (!file) return res.status(404).json({ detail: "File not found" });
    return res.json({ message: "File deleted from MongoDB successfully" });
  } catch (err) {
    return res.status(500).json({ detail: "Could not delete file" });
  }
});

module.exports = router;