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

    console.log("savedFile._id = "+savedFile._id);

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





router.get("/get-file",(req,res)=>{
  
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










//===============================================================================================================
// POSTGRESQL DATABASE INTEGRATION
//===============================================================================================================

// Multer memory storage: keeps uploaded file in RAM (good for small/medium files)

// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
//   // ssl: { rejectUnauthorized: false } // enable if your DB requires SSL (cloud)
// });

// // Helper: hash buffer -> sha256 hex
// function sha256Hex(buffer) {
//   return crypto.createHash('sha256').update(buffer).digest('hex');
// }

// /**
//  * POST /uploadSingle
//  * Form field name must be: "file"
//  * Stores the file directly in Postgres (BYTEA) with metadata.
//  */
// app.post('/uploadSingle', upload.single('file'), async (req, res) => {
//   if (!req.file) return res.status(400).json({ error: 'file is required (form field name: "file")' });

//   const { originalname, mimetype, size, buffer } = req.file;
//   const sha256 = sha256Hex(buffer);
//   const id = randomUUID();

//   const client = await pool.connect();
//   try {
//     await client.query('BEGIN');

//     // If you want deduplication by hash, check here:
//     const existing = await client.query(
//       'SELECT id FROM files WHERE sha256 = $1 LIMIT 1',
//       [sha256]
//     );
//     if (existing.rowCount > 0) {
//       await client.query('ROLLBACK');
//       return res.status(200).json({
//         message: 'Duplicate file detected; returning existing record',
//         id: existing.rows[0].id,
//         duplicateOf: existing.rows[0].id,
//       });
//     }

//     // Insert file bytes and metadata
//     await client.query(
//       `INSERT INTO files (id, original_name, mime_type, size_bytes, sha256, data)
//        VALUES ($1, $2, $3, $4, $5, $6)`,
//       [id, originalname, mimetype || 'application/octet-stream', size, sha256, buffer]
//     );

//     await client.query('COMMIT');

//     return res.status(201).json({
//       id,
//       originalName: originalname,
//       mimeType: mimetype,
//       sizeBytes: size,
//       sha256,
//       message: 'File stored in PostgreSQL successfully',
//       downloadUrl: `/files/${id}`,
//     });
//   } catch (err) {
//     await client.query('ROLLBACK');
//     console.error('Upload error:', err);
//     return res.status(500).json({ error: 'Failed to store file' });
//   } finally {
//     client.release();
//   }
// });

// /**
//  * GET /files/:id
//  * Streams the file back to the client from BYTEA.
//  */
// app.get('/files/:id', async (req, res) => {
//   const { id } = req.params;

//   try {
//     const { rows } = await pool.query(
//       'SELECT original_name, mime_type, size_bytes, data FROM files WHERE id = $1',
//       [id]
//     );
//     if (rows.length === 0) return res.status(404).json({ error: 'Not found' });

//     const file = rows[0];

//     res.setHeader('Content-Type', file.mime_type);
//     res.setHeader('Content-Length', file.size_bytes);
//     // Change "attachment" -> "inline" if you want to preview in browser (e.g., PDFs/images)
//     res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(file.original_name)}"`);

//     return res.end(file.data); // Send the buffer
//   } catch (e) {
//     console.error('Download error:', e);
//     return res.status(500).json({ error: 'Failed to fetch file' });
//   }
// });

// const port = process.env.PORT || 3000;
// app.listen(port, () => {
//   console.log(`Server running → http://localhost:${port}`);
//   console.log(`POST   /uploadSingle  (form-data field: file)`);
//   console.log(`GET    /files/:id     (download)`);
// });






