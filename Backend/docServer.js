const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { Sequelize, DataTypes } = require('sequelize');

// --- Database Setup ---
const sequelize = new Sequelize('shared_docs', 'postgres', 'password', {
  host: 'localhost',
  dialect: 'postgres',
});

// --- Document Model ---
const Document = sequelize.define('Document', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Untitled Document',
  },
  content: {
    type: DataTypes.JSON, // Quill delta format is JSON
    allowNull: true,
  },
});

// --- Express + Socket.IO Setup ---
const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(express.json());

// --- REST API ---
app.get('/documents/:id', async (req, res) => {
  const { id } = req.params;
  let doc = await Document.findByPk(id);

  if (!doc) {
    doc = await Document.create({ id, title: `Document ${id}`, content: {} });
  }

  res.json(doc);
});

// --- WebSocket Collaboration ---
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-document', async (docId) => {
    socket.join(docId);

    let doc = await Document.findByPk(docId);
    if (!doc) {
      doc = await Document.create({ id: docId, title: `Document ${docId}`, content: {} });
    }

    socket.emit('load-document', doc.content);

    socket.on('send-changes', (delta) => {
      socket.to(docId).emit('receive-changes', delta);
    });

    socket.on('save-document', async (data) => {
      await Document.update({ content: data }, { where: { id: docId } });
      console.log(`Document ${docId} saved`);
    });
  });
});






// --- Start Server ---
sequelize.sync().then(() => {
  server.listen(5000, () => console.log('Backend running on http://localhost:5000'));
});
