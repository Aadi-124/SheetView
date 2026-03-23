

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const { Sequelize } = require("sequelize");
const userRouterPostgreSQL = require("./Routes/UserRouterPostgreSQL");
const FileRoutesPostgreSQL = require("./Routes/FileRouterPostgreSQL");
const sharedDocRouter = require("./Routes/SharedDocRouter");
const { initDB } = require("./Service/db");

// Import socket handler
const initializeEditorSocket = require("./Service/editorSocket");

// ===============================
// EXPRESS APP
// ===============================
const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ===============================
// ROUTES
// ===============================
app.use("/", userRouterPostgreSQL);
app.use("/files", FileRoutesPostgreSQL);
app.use("/documents", sharedDocRouter);

// ===============================
// DATABASE
// ===============================
// const sequelize = new Sequelize("postgres", "postgres", "1149", {
//   host: "localhost",
//   dialect: "postgres",
// });


const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  logging: false,
  pool: { max: 5, min: 0, acquire: 30000, idle: 10000 },
});


initDB();

// ===============================
// HTTP + SOCKET SERVER
// ===============================
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// Initialize Socket Logic
initializeEditorSocket(io);

// ===============================
// START SERVER
// ===============================
sequelize
  .sync()
  .then(() => {
    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
      console.log(`🚀 Backend running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => console.error("❌ DB Sync Error:", err));



module.exports = app;

