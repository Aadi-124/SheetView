// // db.js
// const { Pool } = require("pg");

// const pool = new Pool({
//   user: "postgres",
//   host: "localhost",
//   database: "SheetView",
//   password: "1149",
//   port: 5432,
// });

// // optional: test the connection once

// module.exports = pool;







// // db.js
// // Service/db.js
// const { Sequelize } = require("sequelize");
// require("dotenv").config();
// const { Pool } = require("pg");

// // Create Sequelize instance
// const sequelize = new Sequelize(process.env.DATABASE_URL, {
//   dialect: "postgres",          // or 'mysql', 'sqlite', etc.
//   logging: false,               // disable SQL logging in console
//   pool: {
//     max: 5,
//     min: 0,
//     acquire: 30000,
//     idle: 10000,
//   },
// });



// const pool = new Pool({
//   connectionString: "postgres://postgres:1149@localhost:5432/SheetView"
// });

// pool.connect()
//   .then(client => {
//     console.log("✅ Connected to PostgreSQL");
//     client.release();
//   })
//   .catch(err => console.error("❌ Connection error", err.stack));


// async function initDB() {
//   try {
//     // Create Users table
//     await pool.query(`
//       CREATE TABLE IF NOT EXISTS users (
//         id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
//         username VARCHAR(50) NOT NULL,
//         email VARCHAR(100) UNIQUE NOT NULL,
//         password VARCHAR(255) NOT NULL,
//         profile_pic BYTEA
//       )
//     `);

//     // Create Folders table
//     await pool.query(`
//        CREATE TABLE IF NOT EXISTS folders (
//   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
//   user_id UUID NULL,
//   parent_id UUID NULL,
//   name VARCHAR(255) NOT NULL,
//   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//   updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//   CONSTRAINT fk_user FOREIGN KEY (user_id)
//     REFERENCES users(id) ON DELETE SET NULL,
//   CONSTRAINT fk_parent FOREIGN KEY (parent_id)
//     REFERENCES folders(id) ON DELETE SET NULL
// );

//     `);

//     // Create Files table
//     await pool.query(`
//       CREATE TABLE IF NOT EXISTS files (
//         id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
//         folder_id UUID NULL,
//         user_id UUID NULL,
//         original_name VARCHAR(255) NOT NULL,
//         mime_type VARCHAR(100) NOT NULL,
//         size_bytes BIGINT NOT NULL,
//         sha256 CHAR(64) NOT NULL UNIQUE,
//         data BYTEA NOT NULL,
//         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//         updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//         CONSTRAINT fk_folder FOREIGN KEY (folder_id)
//           REFERENCES folders(id) ON DELETE SET NULL,
//         CONSTRAINT fk_user FOREIGN KEY (user_id)
//           REFERENCES users(id) ON DELETE SET NULL
//       )
//     `);

//     // Inside initDB
//     await pool.query(`
//   CREATE TABLE IF NOT EXISTS shares (
//     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
//     file_id UUID NULL,
//     shared_with UUID NULL,
//     permission VARCHAR(20) NOT NULL CHECK (permission IN ('read','write')),
//     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//     CONSTRAINT fk_file FOREIGN KEY (file_id)
//       REFERENCES files(id) ON DELETE SET NULL,
//     CONSTRAINT fk_shared_with FOREIGN KEY (shared_with)
//       REFERENCES users(id) ON DELETE SET NULL
//   )
// `);


//     // Optional index for fast lookup
//     await pool.query(`
//       CREATE INDEX IF NOT EXISTS idx_files_user_created_at
//       ON files (user_id, created_at DESC)
//     `);

//     console.log("✅ Tables ready");
//   } catch (err) {
//     console.error("❌ Error creating tables:", err);
//   }
// }




// module.exports = { sequelize,pool, initDB };
// // module.exports = { , initDB };









// Service/db.js
const { Sequelize } = require("sequelize");
const { Pool } = require("pg");
require("dotenv").config();

// Optional Sequelize instance
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  logging: false,
  pool: { max: 5, min: 0, acquire: 30000, idle: 10000 },
});

// PG Pool for raw SQL queries
const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    "postgres://postgres:1149@localhost:5432/SheetView",
});

// Test DB connection
pool.connect()
  .then(client => {
    console.log("✅ Connected to PostgreSQL");
    client.release();
  })
  .catch(err => console.error("❌ Connection error", err.stack));

// Initialize DB schema
async function initDB() {
  try {
    // Required extension for UUID generation
    await pool.query(`CREATE EXTENSION IF NOT EXISTS pgcrypto`);

    // USERS TABLE
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        username VARCHAR(50) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        profile_pic BYTEA,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS "Document" (
        id VARCHAR(255) PRIMARY KEY NOT NULL,
        title VARCHAR(255) NOT NULL DEFAULT 'Untitled Document',
        content JSONB,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL,
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL
        );
      `);

    // FOLDERS TABLE
    await pool.query(`
      CREATE TABLE IF NOT EXISTS folders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        parent_id UUID NULL,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_folder_user FOREIGN KEY (user_id)
          REFERENCES users(id) ON DELETE CASCADE,
        CONSTRAINT fk_folder_parent FOREIGN KEY (parent_id)
          REFERENCES folders(id) ON DELETE SET NULL
      );
    `);

    // FILES TABLE (UPDATED: user_id is NULLABLE now)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS files (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NULL,           -- <── CHANGED HERE
        folder_id UUID NULL,
        original_name VARCHAR(255) NOT NULL,
        mime_type VARCHAR(100) NOT NULL,
        size_bytes BIGINT NOT NULL,
        sha256 CHAR(64) UNIQUE NOT NULL,
        data BYTEA NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_file_user FOREIGN KEY (user_id)
          REFERENCES users(id) ON DELETE SET NULL,   -- <── IMPORTANT
        CONSTRAINT fk_file_folder FOREIGN KEY (folder_id)
          REFERENCES folders(id) ON DELETE SET NULL
      );
    `);

    // SHARES TABLE
    await pool.query(`
      CREATE TABLE IF NOT EXISTS shares (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        file_id UUID NOT NULL,
        shared_with UUID NOT NULL,
        permission VARCHAR(20) NOT NULL CHECK (permission IN ('read', 'write')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_share_file FOREIGN KEY (file_id)
          REFERENCES files(id) ON DELETE CASCADE,
        CONSTRAINT fk_share_user FOREIGN KEY (shared_with)
          REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    // INDEXES
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_files_user ON files (user_id);
      CREATE INDEX IF NOT EXISTS idx_files_folder ON files (folder_id);
      CREATE INDEX IF NOT EXISTS idx_folders_user ON folders (user_id);
      CREATE INDEX IF NOT EXISTS idx_shares_user ON shares (shared_with);
    `);

    console.log("✅ All tables created successfully!");
  } catch (err) {
    console.error("❌ Error initializing DB:", err);
  }
}

module.exports = { sequelize, pool, initDB };