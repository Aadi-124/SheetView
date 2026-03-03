const mongoose = require("mongoose");

const FileSchema = mongoose.Schema(
  {
    // ===============================
    // FILE INFO
    // ===============================
    originalName: {
      type: String,
      required: true,        // original filename e.g. "resume.pdf"
    },

    mimetype: {
      type: String,
      required: true,        // e.g. "image/png", "application/pdf"
    },

    size: {
      type: Number,
      required: true,        // file size in bytes
    },

    data: {
      type: Buffer,
      required: true,        // actual binary file stored in MongoDB
    },

    // ===============================
    // USER REFERENCE
    // Links this file to the user who uploaded it
    // ===============================
    uploadedBy: {
      type: String,
      ref: "User",           // references your existing User model
      required: true,
    },

    // ===============================
    // OPTIONAL METADATA
    // ===============================
    folder: {
      type: String,
      default: "root",       // lets users organize files into folders
    },

    isPublic: {
      type: Boolean,
      default: false,        // private by default, user can make it public
    },

    description: {
      type: String,
      default: "",           // optional file description/note by user
    },
  },
  { timestamps: true }       // adds createdAt and updatedAt automatically
);

// ===============================
// INDEX — fast lookup by user
// ===============================
FileSchema.index({ uploadedBy: 1, createdAt: -1 });

const File = mongoose.model("File", FileSchema);
module.exports = File;
