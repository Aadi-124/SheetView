
// index.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const userRoutes = require("./Routes/UserRouter");
const app = express();
const FileRoutes = require("./Routes/FileRouter");
const FileRoutesPostgreSQL = require("./Routes/FileRouterPostgreSQL");


app.use(cors());

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));


app.use("/",userRoutes);
// app.use("/file",FileRoutes);
app.use("/file",FileRoutesPostgreSQL);


// =======================
// CONNECT TO MONGO
// =======================
mongoose
  .connect("mongodb://localhost:27017/Sheetview")
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log(err));


// =======================
// START SERVER
// =======================
app.listen(3000, () => console.log("🚀 Server running on http://localhost:3000"));