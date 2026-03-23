






import React, { useEffect, useRef, useState } from "react";
import Quill from "quill";
import QuillCursors from "quill-cursors";
import { io } from "socket.io-client";
import "quill/dist/quill.snow.css";
import "./styles.css";

Quill.register("modules/cursors", QuillCursors);

const SAVE_INTERVAL_MS = 2000;

export default function SharedDocument({ docId, username }) {
  const quillRef = useRef(null);
  const socketRef = useRef(null);
  const editorRef = useRef(null);




  


  const [status, setStatus] = useState("Connecting...");
  const [lastSaved, setLastSaved] = useState(null);
  const [editor, setEditor] = useState("");

  /* ---------------------------------------------------
   * 1. Initialize socket only once
   * --------------------------------------------------*/
  useEffect(() => {
    const socket = io("http://localhost:3000");
    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, []);

  /* ---------------------------------------------------
   * 2. Initialize Quill only once
   * --------------------------------------------------*/
  useEffect(() => {
    if (!quillRef.current || editorRef.current) return;

    const quill = new Quill(quillRef.current, {
      theme: "snow",
      modules: {
        toolbar: [
          [{ header: [1, 2, 3, false] }],
          ["bold", "italic", "underline", "strike"],
          [{ list: "ordered" }, { list: "bullet" }],
          ["link", "blockquote", "code-block"],
          ["clean"],
        ],
        cursors: true,
      },
    });

    quill.disable();
    editorRef.current = quill;
  }, []);

  /* ---------------------------------------------------
   * 3. Attach socket + editor listeners (with cleanup)
   * --------------------------------------------------*/
  useEffect(() => {
    const socket = socketRef.current;
    const quill = editorRef.current;

    if (!socket || !quill) return;

    const cursorModule = quill.getModule("cursors");
    const userColor = "#" + Math.floor(Math.random() * 16777215).toString(16);

    // Remove old listeners to avoid duplication
    socket.off("load-document");
    socket.off("receive-changes");
    socket.off("cursor-update");

    // Join document
    socket.emit("join-document", { docId, username });

    // Load document
    socket.on("load-document", (doc) => {
      quill.setContents(doc);
      quill.enable();
      setStatus("Connected");
    });

    // Local → server
    quill.on("text-change", (delta, old, source) => {
      if (source !== "user") return;
      socket.emit("send-changes", delta);
    });

    // Server → local
    socket.on("receive-changes", ({ delta, username }) => {
      quill.updateContents(delta);
      setEditor(username);
    });

    // Cursor movement
    quill.on("selection-change", (range, old, source) => {
      if (source !== "user") return; // FIX loop duplication
      socket.emit("cursor-move", {
        docId,
        userId: username,
        username,
        range,
        color: userColor,
      });
    });

    socket.on("cursor-update", ({ userId, username, range, color }) => {
      if (!range) return;
      cursorModule.createCursor(userId, username, color);
      cursorModule.moveCursor(userId, range);
    });

    // Auto-save
    const interval = setInterval(() => {
      socket.emit("save-document", quill.getContents());
      setLastSaved(new Date().toLocaleTimeString());
      setStatus("Saved");
    }, SAVE_INTERVAL_MS);

    return () => {
      clearInterval(interval);
    };
  }, []);

  /* ---------------------------------------------------
   * 4. Clear "X is editing…" after 5 seconds
   * --------------------------------------------------*/
  useEffect(() => {
    // if (!editor) return;
    const t = setTimeout(() => setEditor(""), 1500);
    return () => clearTimeout(t);
  }, [editor]);

  /* ---------------------------------------------------
   * UI Rendering
   * --------------------------------------------------*/
  return (
    <div className="page">
      <header className="header">
        <h1>Shared Document</h1>
        {editor && <h2>{editor} is editing…</h2>}
        <span className="status">{status}</span>
      </header>

      <main className="editor-container" ref={quillRef} />

      <footer className="footer">
        <span>Last saved: {lastSaved || "Not yet"}</span>
      </footer>
    </div>
  );
}