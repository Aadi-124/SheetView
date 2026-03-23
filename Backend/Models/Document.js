

// // // models/Document.js
// // const { DataTypes } = require("sequelize");
// // // const sequelize = require("../Service/db"); // your Sequelize instance
// // models/Document.js
// const { DataTypes } = require("sequelize");
// const { sequelize } = require("../Service/db");  // IMPORTANT: Use your actual sequelize instance

// const Document = sequelize.define("Document", {
//   id: {
//     type: DataTypes.STRING,
//     primaryKey: true,
//   },
//   title: {
//     type: DataTypes.STRING,
//     defaultValue: "Untitled Document",
//   },
//   content: {
//     type: DataTypes.JSON,
//     allowNull: true,
//   },
// });

// module.exports = Document;










// models/Document.js
const { DataTypes } = require("sequelize");
const { sequelize } = require("../Service/db");  // make sure this exports your Sequelize instance

const Document = sequelize.define("Document", {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "Untitled Document",
  },
  content: {
    type: DataTypes.JSON,
    allowNull: true,
  },
}, {
  tableName: "Document",     // explicitly set table name
  freezeTableName: true,     // prevents Sequelize from pluralizing
  timestamps: true           // adds createdAt and updatedAt automatically
});

module.exports = Document;
