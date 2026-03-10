
const multer = require('multer');
const { Pool } = require('pg');
const crypto = require('crypto');
const express = require("express");
const router = express.Router();
require('dotenv').config();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
});

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

function sha256Hex(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

router.post('/uploadSingle',
 (req, res, next) => {
    console.log('Content-Type:', req.headers['content-type']);
    next();
  },
 upload.single('file'), async (req, res) => {
      if (!req.file) return res.status(400).json({ error: 'file is required (form field: "file")' });
  const { originalname, mimetype, size, buffer } = req.file;
  const sha256 = sha256Hex(buffer);
  const id = crypto.randomUUID();

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const existing = await client.query('SELECT id FROM files WHERE sha256 = $1 LIMIT 1', [sha256]);
    if (existing.rowCount > 0) {
      await client.query('ROLLBACK');
      return res.status(200).json({
        message: 'Duplicate file; returning existing record',
        id: existing.rows[0].id,
        duplicateOf: existing.rows[0].id,
      });
    }

    await client.query(
      `INSERT INTO files (id, original_name, mime_type, size_bytes, sha256, data)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [id, originalname, mimetype || 'application/octet-stream', size, sha256, buffer]
    );

    await client.query('COMMIT');

    res.status(201).json({
      id,
      originalName: originalname,
      mimeType: mimetype,
      sizeBytes: size,
      sha256,
      downloadUrl: `/files/${id}`,
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Failed to store file' });
  } finally {
    client.release();
  }
});


router.get('/files/:id', async (req, res) => {
    
  try {
    const { rows } = await pool.query(
      'SELECT original_name, mime_type, size_bytes, data FROM files WHERE id = $1',
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Not found' });

    const file = rows[0];
    res.setHeader('Content-Type', file.mime_type);
    res.setHeader('Content-Length', file.size_bytes);
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(file.original_name)}"`);
    res.end(file.data);
  } catch (e) {
    console.error('Download error:', e);
    res.status(500).json({ error: 'Failed to fetch file' });
  }
});




router.get("/sample",(req,res)=>{
    console.log();
});

module.exports = router;
