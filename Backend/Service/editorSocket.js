// sockets/editorSocket.js
const Document = require("../models/Document");

module.exports = function initializeEditorSocket(io) {
  io.on("connection", (socket) => {
    console.log("🟢 User connected:", socket.id);

    socket.on("join-document", async ({ docId, username }) => {
      socket.join(docId);
      socket.username = username;

      let doc = await Document.findByPk(docId);

      if (!doc) {
        doc = await Document.create({
          id: docId,
          title: `Document ${docId}`,
          content: {},
        });
      }

      socket.emit("load-document", doc.content);

      /**************** Text Editing Sync ****************/
      socket.on("send-changes", (delta) => {
        socket.to(docId).emit("receive-changes", {
          delta,
          username: socket.username,
        });
      });

      /**************** Cursor Movement Sync ***************/
      socket.on("cursor-move", (data) => {
        socket.broadcast.to(docId).emit("cursor-update", data);
      });

      /**************** Typing Indicator *******************/
      socket.on("user-typing", () => {
        socket.to(docId).emit("user-typing", socket.username);
      });

      socket.on("user-stop", () => {
        socket.to(docId).emit("user-stop");
      });

      /**************** Save Document **********************/
      socket.on("save-document", async (data) => {
        await Document.update({ content: data }, { where: { id: docId } });
        console.log(`💾 Document ${docId} saved by ${socket.username}`);
      });
    });

    socket.on("disconnect", () => {
      console.log("🔴 User disconnected:", socket.id);
    });
  });
};



