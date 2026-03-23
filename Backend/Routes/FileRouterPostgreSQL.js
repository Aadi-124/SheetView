
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






// --- helpers: get user id (from auth or dev header) ---
function getUserId(req) {
  if (req.user?.id) return req.user.id; // if you have auth middleware
  const hdr = req.header('x-user-id');  // dev/testing fallback
  return hdr && /^[0-9a-f-]{8}-[0-9a-f-]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(hdr)
    ? hdr
    : null;
}

/**
 * GET /files
 * Returns array of { id, name, mimeType, size, updatedAt, folderId? }
 * Scopes to current user if available; otherwise returns global list.
 */
router.get('/', async (req, res) => {
  const userId = getUserId(req);
  try {
    const params = [];
    let where = '';
    if (userId) {
      params.push(userId);
      where = 'WHERE user_id = $1';
    }

    const { rows } = await pool.query(
      `SELECT
         id,
         original_name AS name,
         mime_type     AS "mimeType",
         size_bytes    AS size,
         folder_id     AS "folderId",
         COALESCE(updated_at, created_at, NOW()) AS "updatedAt"
       FROM files
       ${where}
       ORDER BY "updatedAt" DESC
       LIMIT 200`,
      params
    );

    res.json(rows);
  } catch (e) {
    console.error('List files error:', e);
    res.status(500).json({ error: 'Failed to list files' });
  }
});

/**
 * GET /folders
 * Returns array of { id, name, fileCount, updatedAt }
 * Counts only the current user's files inside each folder.
 */
router.get('/folders', async (req, res) => {
  const userId = getUserId(req);
  try {
    const params = [];
    let where = '';
    let joinFilter = '';
    if (userId) {
      params.push(userId);
      where = 'WHERE f.user_id = $1';
      joinFilter = 'AND fl.user_id = $1';
    }

    const { rows } = await pool.query(
      `SELECT
         f.id,
         f.name,
         COALESCE(f.updated_at, f.created_at, NOW()) AS "updatedAt",
         COALESCE(COUNT(fl.id), 0)::int AS "fileCount"
       FROM folders f
       LEFT JOIN files fl ON fl.folder_id = f.id ${joinFilter}
       ${where}
       GROUP BY f.id
       ORDER BY "updatedAt" DESC
       LIMIT 200`,
      params
    );
    console.log(rows);

    res.json(rows);
  } catch (e) {
    console.error('List folders error:', e);
    res.status(500).json({ error: 'Failed to list folders' });
  }
});

/**
 * GET /storage/stats
 * Returns { used, quota }
 * - used: total bytes of current user's files (or global if no user)
 * - quota: from env STORAGE_QUOTA_BYTES, defaults to 5GB
 */
router.get('/storage/stats', async (req, res) => {
  const userId = getUserId(req);
  console.log(userId);
  try {
    const quota =
      parseInt(process.env.STORAGE_QUOTA_BYTES || '', 10) ||
      5 * 1024 * 1024 * 1024; // 5 GB default

    let used = 0;

    if (userId) {
      const { rows } = await pool.query(
        `SELECT COALESCE(SUM(size_bytes), 0)::bigint AS used
         FROM files
         WHERE user_id = $1`,
        [userId]
      );
      used = Number(rows[0]?.used || 0);
    } else {
      const { rows } = await pool.query(
        `SELECT COALESCE(SUM(size_bytes), 0)::bigint AS used
         FROM files`
      );
      used = Number(rows[0]?.used || 0);
    }

    res.json({ used, quota });
  } catch (e) {
    console.error('Storage stats error:', e);
    res.status(500).json({ error: 'Failed to fetch storage stats' });
  }
});

/**
 * DELETE /files/:id
 * Returns { success: true } if deleted, 404 if not found or not owned by user.
 */
router.delete('/files/:id', async (req, res) => {
  const userId = getUserId(req);
  const { id } = req.params;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const params = [id];
    let where = 'WHERE id = $1';
    if (userId) {
      params.push(userId);
      where += ' AND user_id = $2';
    }

    const { rowCount } = await client.query(
      `DELETE FROM files
       ${where}`,
      params
    );

    await client.query('COMMIT');

    if (rowCount === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('Delete file error:', e);
    res.status(500).json({ error: 'Failed to delete file' });
  } finally {
    client.release();
  }
});




module.exports = router;












// const express = require("express");
// const multer = require("multer");
// const crypto = require("crypto");
// const { Pool } = require("pg");
// require("dotenv").config();

// const router = express.Router();

// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
// });

// // memory storage
// const upload = multer({
//   storage: multer.memoryStorage(),
//   limits: { fileSize: 20 * 1024 * 1024 },
// });

// // Helper: sha256
// function sha256Hex(buffer) {
//   return crypto.createHash("sha256").update(buffer).digest("hex");
// }

// // Extract user ID
// function getUserId(req) {
//   if (req.user?.id) return req.user.id; 
//   const id = req.header("x-user-id");
//   return id || null;
// }

// /* ---------------------------
//    1️⃣ Upload Single File
// ---------------------------- */
// router.post(
//   "/uploadSingle",
//   upload.single("file"),
//   async (req, res) => {
//     const userId = getUserId(req);
//     const folderId = req.body.folder_id || null;

//     if (!userId)
//       return res.status(400).json({ error: "Missing x-user-id header" });

//     if (!req.file)
//       return res.status(400).json({ error: 'file is required as "file"' });

//     const { originalname, mimetype, size, buffer } = req.file;
//     const sha256 = sha256Hex(buffer);
//     const id = crypto.randomUUID();

//     const client = await pool.connect();

//     try {
//       await client.query("BEGIN");

//       // Duplicate detection
//       const existing = await client.query(
//         "SELECT id FROM files WHERE sha256=$1 LIMIT 1",
//         [sha256]
//       );

//       if (existing.rowCount > 0) {
//         await client.query("ROLLBACK");
//         return res.status(200).json({
//           message: "Duplicate file",
//           id: existing.rows[0].id,
//         });
//       }

//       // Insert file
//       await client.query(
//         `INSERT INTO files 
//          (id, user_id, folder_id, original_name, mime_type, size_bytes, sha256, data)
//          VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
//         [id, userId, folderId, originalname, mimetype, size, sha256, buffer]
//       );

//       await client.query("COMMIT");

//       return res.status(201).json({
//         id,
//         originalname,
//         mimetype,
//         size,
//         folderId,
//       });
//     } catch (err) {
//       await client.query("ROLLBACK");
//       console.error(err);
//       return res.status(500).json({ error: "Upload failed" });
//     } finally {
//       client.release();
//     }
//   }
// );

// /* ---------------------------
//    2️⃣ Download File
// ---------------------------- */
// router.get("/file/:id", async (req, res) => {
//   try {
//     const { rows } = await pool.query(
//       "SELECT original_name, mime_type, size_bytes, data FROM files WHERE id=$1",
//       [req.params.id]
//     );

//     if (!rows.length) return res.status(404).json({ error: "Not found" });

//     const f = rows[0];
//     res.setHeader("Content-Type", f.mime_type);
//     res.setHeader("Content-Disposition", `attachment; filename="${f.original_name}"`);
//     res.send(f.data);
//   } catch (err) {
//     res.status(500).json({ error: "Download failed" });
//   }
// });

// /* ---------------------------
//    3️⃣ Delete File
// ---------------------------- */
// router.delete("/file/:id", async (req, res) => {
//   const userId = getUserId(req);
//   if (!userId) return res.status(400).json({ error: "Missing x-user-id header" });

//   const { id } = req.params;

//   const { rowCount } = await pool.query(
//     "DELETE FROM files WHERE id=$1 AND user_id=$2",
//     [id, userId]
//   );

//   if (rowCount === 0)
//     return res.status(404).json({ error: "File not found or not owned" });

//   res.json({ success: true });
// });

// /* ---------------------------
//    4️⃣ Get ALL user files
// ---------------------------- */
// router.get("/user/files", async (req, res) => {
//   const userId = getUserId(req);
//   if (!userId) return res.status(400).json({ error: "Missing x-user-id" });

//   const { rows } = await pool.query(
//     `SELECT id, original_name, mime_type, size_bytes, folder_id, created_at
//      FROM files WHERE user_id=$1
//      ORDER BY created_at DESC`,
//     [userId]
//   );

//   res.json(rows);
// });

// /* ---------------------------
//    5️⃣ Get ALL user folders
// ---------------------------- */
// router.get("/user/folders", async (req, res) => {
//   const userId = getUserId(req);
//   if (!userId) return res.status(400).json({ error: "Missing x-user-id" });

//   const { rows } = await pool.query(
//     `SELECT id, name, parent_id, created_at 
//      FROM folders WHERE user_id=$1
//      ORDER BY created_at DESC`,
//     [userId]
//   );

//   res.json(rows);
// });

// /* ---------------------------
//    6️⃣ Get root folders + root files
// ---------------------------- */
// router.get("/user/root", async (req, res) => {
//   const userId = getUserId(req);
//   if (!userId) return res.status(400).json({ error: "Missing x-user-id" });

//   const folders = await pool.query(
//     "SELECT * FROM folders WHERE user_id=$1 AND parent_id IS NULL",
//     [userId]
//   );

//   const files = await pool.query(
//     "SELECT * FROM files WHERE user_id=$1 AND folder_id IS NULL",
//     [userId]
//   );

//   res.json({
//     folders: folders.rows,
//     files: files.rows,
//   });
// });

// /* ---------------------------
//    7️⃣ Get folder contents 
//    (subfolders + files)
// ---------------------------- */
// router.get("/folder/:id", async (req, res) => {
//   const userId = getUserId(req);
//   const folderId = req.params.id;

//   if (!userId) return res.status(400).json({ error: "Missing x-user-id" });

//   const folders = await pool.query(
//     `SELECT * FROM folders WHERE parent_id=$1 AND user_id=$2`,
//     [folderId, userId]
//   );

//   const files = await pool.query(
//     `SELECT * FROM files WHERE folder_id=$1 AND user_id=$2`,
//     [folderId, userId]
//   );

//   res.json({
//     subfolders: folders.rows,
//     files: files.rows,
//   });
// });

// module.exports = router;