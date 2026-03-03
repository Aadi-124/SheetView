


// // index.js
// const express = require("express");
// const cors = require("cors");
// const multer = require("multer");
// const XLSX = require("xlsx");
// const fs = require("fs");
// const path = require("path");
// const bodyParser = require("body-parser");
// const { MongoClient } = require("mongodb");
// // const router = require("./Routes/UserRouter.js");

// const app = express();
// const PORT = 3000;



// // app.use("/user",router);

// // ==============================
// // Config
// // ==============================
// const UPLOAD_DIR = path.join(__dirname, "uploads");
// const FILE_PATH = path.join(UPLOAD_DIR, "data.xlsx");
// const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB



// // ==============================
// // Middleware
// // ==============================
// app.use(cors({
//   origin: ["http://localhost:8080", "http://127.0.0.1:8080"],
//   credentials: true
// }));

// app.use(bodyParser.json());
// app.use(express.urlencoded({ extended: true })); 

// // ==============================
// // MongoDB Connection
// // ==============================

// const url = "mongodb://127.0.0.1:27017";
// const dbname = "myDB";

// async function connectDB() {
//   try {
//     const client = new MongoClient(url);
//     await client.connect();
//     console.log("Connected to MongoDB");

//     const db = client.db(dbName);
//     const collection = db.collection("users");

//     // Example: insert data
//     await collection.insertOne({ name: "John", age: 25 });

//   } catch (error) {
//     console.error("Connection error:", error);
//   }
// }



// // ==============================
// // Multer setup for file upload
// // ==============================
// if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => cb(null, UPLOAD_DIR),
//   filename: (req, file, cb) => cb(null, "data.xlsx"),
// });

// const upload = multer({
//   storage,
//   limits: { fileSize: MAX_FILE_SIZE },
//   fileFilter: (req, file, cb) => {
//     if (!file.originalname.endsWith(".xlsx")) {
//       return cb(new Error("Only .xlsx files allowed"));
//     }
//     cb(null, true);
//   }
// });

// // ==============================
// // Utility Functions
// // ==============================
// function loadExcel() {
//   if (!fs.existsSync(FILE_PATH)) {
//     throw { status: 404, message: "No Excel file uploaded yet." };
//   }
//   try {
//     const workbook = XLSX.readFile(FILE_PATH);
//     const sheetName = workbook.SheetNames[0];
//     const sheet = workbook.Sheets[sheetName];
//     const data = XLSX.utils.sheet_to_json(sheet, { defval: null });
//     return data;
//   } catch (err) {
//     throw { status: 500, message: "Error reading Excel file." };
//   }
// }

// function saveExcel(data) {
//   try {
//     const ws = XLSX.utils.json_to_sheet(data);
//     const wb = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
//     XLSX.writeFile(wb, FILE_PATH);
//   } catch (err) {
//     throw { status: 500, message: "Error saving Excel file." };
//   }
// }

// // ==============================
// // Routes
// // ==============================

// // Health check
// app.get("/", (req, res) => res.json({ status: "Backend running" }));


// // 1️⃣ Upload Excel
// app.post("/upload", upload.single("file"), (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ detail: "No file uploaded." });
//     }

//     // Just check that file is readable
//     loadExcel();

//     res.json({ message: "File uploaded successfully." });
//   } catch (err) {
//     res.status(err.status || 500).json({ detail: err.message || "Upload failed." });
//   }
// });



// // 2️⃣ Get Paginated Data
// app.get("/data", (req, res) => {
//   try {
//     const page = parseInt(req.query.page) || 1;
//     const page_size = parseInt(req.query.page_size) || 10;

//     const data = loadExcel();
//     const total_records = data.length;
//     const total_pages = Math.ceil(total_records / page_size);

//     const start = (page - 1) * page_size;
//     const end = start + page_size;

//     if (start >= total_records) {
//       return res.status(400).json({ detail: "Page number out of range." });
//     }

//     const paginated = data.slice(start, end);

//     res.json({
//       page,
//       page_size,
//       total_records,
//       total_pages,
//       data: paginated
//     });
//   } catch (err) {
//     res.status(err.status || 500).json({ detail: err.message || "Error fetching data." });
//   }
// });

// // 3️⃣ Create Row
// app.post("/row", (req, res) => {
//   try {
//     const { data: newRow } = req.body;
//     if (!newRow || typeof newRow !== "object") {
//       return res.status(400).json({ detail: "Invalid row data." });
//     }

//     for (let key in newRow) {
//       if (newRow[key] === null || String(newRow[key]).trim() === "") {
//         return res.status(400).json({ detail: `Field '${key}' cannot be empty.` });
//       }
//     }

//     const data = loadExcel();
//     const dfColumns = Object.keys(data[0] || {});

//     if (!dfColumns.every(c => c in newRow) || !Object.keys(newRow).every(c => dfColumns.includes(c))) {
//       return res.status(400).json({ detail: "Columns do not match Excel structure." });
//     }

//     data.push(newRow);
//     saveExcel(data);

//     res.json({ message: "Row added successfully." });
//   } catch (err) {
//     res.status(err.status || 500).json({ detail: err.message || "Error adding row." });
//   }
// });

// // 4️⃣ Update Row
// app.put("/row/:row_index", (req, res) => {
//   try {
//     const row_index = parseInt(req.params.row_index);
//     const { data: updatedRow } = req.body;

//     const data = loadExcel();

//     if (row_index < 0 || row_index >= data.length) {
//       return res.status(404).json({ detail: "Row index not found." });
//     }

//     for (let key in updatedRow) {
//       if (updatedRow[key] === null || String(updatedRow[key]).trim() === "") {
//         return res.status(400).json({ detail: `Field '${key}' cannot be empty.` });
//       }
//     }

//     const dfColumns = Object.keys(data[0]);
//     if (!dfColumns.every(c => c in updatedRow)) {
//       return res.status(400).json({ detail: "Missing columns in updated row." });
//     }

//     data[row_index] = updatedRow;
//     saveExcel(data);

//     res.json({ message: "Row updated successfully." });
//   } catch (err) {
//     res.status(err.status || 500).json({ detail: err.message || "Error updating row." });
//   }
// });






// // 5️⃣ Delete Row
// app.delete("/row/:row_index", (req, res) => {
//   try {
//     const row_index = parseInt(req.params.row_index);
//     const data = loadExcel();

//     if (row_index < 0 || row_index >= data.length) {
//       return res.status(404).json({ detail: "Row index not found." });
//     }

//     data.splice(row_index, 1);
//     saveExcel(data);

//     res.json({ message: "Row deleted successfully." });
//   } catch (err) {
//     res.status(err.status || 500).json({ detail: err.message || "Error deleting row." });
//   }
// });








// // ==============================
// // Global Error Handler
// // ==============================
// app.use((err, req, res, next) => {
//   console.error(err);
//   res.status(500).json({ detail: "Unexpected server error occurred." });
// });

// // ==============================
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


















// index.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const userRoutes = require("./Routes/UserRouter");
const app = express();
const FileRoutes = require("./Routes/FileRouter");



app.use(cors());

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));


app.use("/",userRoutes);
app.use("/file",FileRoutes);

// =======================
// CONNECT TO MONGO
// =======================
mongoose
  .connect("mongodb://localhost:27017/Sheetview")
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log(err));

// =======================
// USER MODEL
// =======================
const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String, // Stored as plain text (NOT secure)
});

const User = mongoose.model("User", userSchema);

// =======================
// REGISTER (plain password)
// =======================
// app.post("/register", async (req, res) => {
//   const { username, email, password } = req.body;

//   console.log("BODY =", req.body);
//   console.log(username);
//   console.log(email);
//   console.log(password);
//   if (!username || !email || !password) {
//     return res.status(400).send("All fields required");
//   }
//   const check1 = await User.findOne({ username:username });
//   const check2 = await User.findOne({email:email});

//   if (check1) {
//     return res.status(400).send("Username already exists");
//   }
//   if (check2) {
//     return res.status(400).send("email already exists");
//   }

//   await User.create({ username, email, password });

//   return res.json({ message: "User registered successfully" });
// });

// // =======================
// // LOGIN (plain password match)
// // =======================
// app.post("/login", async (req, res) => {
//   const { userNameOrEmail, password } = req.body;

//   if (!userNameOrEmail || !password) {
//     return res.status(400).json({ detail: "Username & password required" });
//   }

//   const userEmail = await User.findOne({ email:userNameOrEmail, password:password });
//   const userName = await User.findOne({username:userNameOrEmail, password:password});


//   let user = null;
//   if(userName != null) user = userName;
//   if(userEmail != null) user = userEmail;


//   if (user == null) {
//     return res.status(401).json({ detail: "Invalid username or password" });
//   }


//   return res.json({
//     message: "Login successful",
//     user: {
//       username: user.email,
//       identity: user.username,
//     },
//   });
// });

// =======================
// START SERVER
// =======================
app.listen(3000, () => console.log("🚀 Server running on http://localhost:3000"));