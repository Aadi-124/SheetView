const express = require("express");
const router = express.Router();
const User = require("../Models/User.js");

router.post("/register", async (req, res) => {
  const { username, email, password, profilePic } = req.body;

  console.log("BODY =", req.body);

  if (!username || !email || !password) {
    return res.status(400).send("All fields required");
  }

  const check1 = await User.findOne({ username });
  const check2 = await User.findOne({ email });

  if (check1) return res.status(400).send("Username already exists");
  if (check2) return res.status(400).send("email already exists");

  let profile = null;

  if (profilePic) {
    profile = {
      data: Buffer.from(profilePic.base64, "base64"),
      contentType: profilePic.contentType,
    };
  }

  await User.create({
    username,
    email,
    password,
    profilePic: profile,
  });

  return res.json({ message: "User registered successfully" });
});

// =======================
// LOGIN (plain password match)
// =======================
router.post("/login", async (req, res) => {
  const { userNameOrEmail, password } = req.body;
    console.log("Entered!");
    console.log(req.body);

  if (!userNameOrEmail || !password) {
    return res.status(400).json({ detail: "Username & password required" });
  }

  const userEmail = await User.findOne({ email:userNameOrEmail, password:password });
  const userName = await User.findOne({username:userNameOrEmail, password:password});


  let user = null;
  if(userName != null) user = userName;
  if(userEmail != null) user = userEmail;

  if (user == null) {
    return res.status(401).json({ detail: "Invalid username or password" });
  }


  return res.json({
    message: "Login successful",
    user: {
      username: user.email,
      identity: user.username,
    },
  });
});


module.exports = router;
