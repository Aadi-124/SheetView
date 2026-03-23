



// Routes/SharedDocRouter.js
const express = require("express");
const router = express.Router();
const Document = require("../models/Document"); // Sequelize or Mongoose model

// Get a document by ID
router.get("/:id", async (req, res) => {
  try {
    const doc = await Document.findByPk(req.params.id); // Sequelize example
    if (!doc) return res.status(404).json({ error: "Document not found" });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});





// Create a new document
router.post("/", async (req, res) => {
  try {
    const doc = await Document.create({ content: req.body.content || "" });
    res.status(201).json(doc);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});




// Update a document
router.put("/:id", async (req, res) => {
  try {
    const [updated] = await Document.update(
      { content: req.body.content },
      { where: { id: req.params.id } }
    );
    if (!updated) return res.status(404).json({ error: "Document not found" });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;




