


// routes/userRouter.js
const express = require("express");
const router = express.Router();
const {pool} = require("../Service/db");
const crypto = require("crypto");
const id = crypto.randomUUID();

// REGISTER
router.post("/register", async (req, res) => {
  const { username, email, password, profilePic } = req.body;

  if (!username || !email || !password) {
    return res.status(400).send("All fields required");
  }

  try {
    // Check if username or email already exists
    const checkUser = await pool.query(
      "SELECT * FROM users WHERE username = $1 OR email = $2",
      [username, email]
    );

    if (checkUser.rows.length > 0) {
      return res.status(400).send("Username or email already exists");
    }

    // Insert new user
    
await pool.query(
  "INSERT INTO users (id, username, email, password, profile_pic) VALUES ($1, $2, $3, $4, $5)",
  [
    id,
    username,
    email,
    password,
    profilePic ? Buffer.from(profilePic.base64, "base64") : null,
  ]
);

    return res.json({ message: "User registered successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).send("Server error");
  }
});




// LOGIN
router.post("/login", async (req, res) => {
  const { userNameOrEmail, password } = req.body;
console.log("HIHIHI");
  if (!userNameOrEmail || !password) {
    return res.status(400).json({ detail: "Username & password required" });
  }

  try {
    const result = await pool.query(
      "SELECT * FROM users WHERE (username = $1 OR email = $1) AND password = $2",
      [userNameOrEmail, password]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ detail: "Invalid username or password" });
    }

    const user = result.rows[0];
    console.log("USERID = "+user.id);
    return res.json({
      message: "Login successful",
      user: {
        userId:user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).send("Server error");
  }
});

module.exports = router;
