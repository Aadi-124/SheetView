import { useEffect, useRef, useState } from "react";

// Uses mammoth via CDN for docx parsing - add to index.html:
// <script src="https://cdn.jsdelivr.net/npm/mammoth@1.6.0/mammoth.browser.min.js"></script>

export default function WordEditor({ file }) {
  const editorRef = useRef(null);
  const [loaded, setLoaded] = useState(false);
  const [fileName, setFileName] = useState("");

  useEffect(() => {
    if (!file) return;
    setFileName(file.name);

    const ext = file.name.split(".").pop().toLowerCase();

    if (ext === "txt") {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (editorRef.current) {
          editorRef.current.innerText = e.target.result;
          setLoaded(true);
        }
      };
      reader.readAsText(file);
    } else if (ext === "docx") {
      const reader = new FileReader();
      reader.onload = async (e) => {
        if (window.mammoth) {
          const result = await window.mammoth.convertToHtml({
            arrayBuffer: e.target.result,
          });
          if (editorRef.current) {
            editorRef.current.innerHTML = result.value;
            setLoaded(true);
          }
        } else {
          if (editorRef.current) {
            editorRef.current.innerHTML =
              "<p>⚠️ mammoth.js not loaded. Add CDN script to index.html</p>";
            setLoaded(true);
          }
        }
      };
      reader.readAsArrayBuffer(file);
    }
  }, [file]);

  const execCommand = (cmd, value = null) => {
    document.execCommand(cmd, false, value);
    editorRef.current?.focus();
  };

  const handleDownload = () => {
    const content = editorRef.current?.innerHTML || "";
    const blob = new Blob(
      [
        `<!DOCTYPE html><html><head><meta charset="utf-8"/><style>
        body { font-family: 'Times New Roman', serif; max-width: 800px; margin: 40px auto; padding: 0 40px; line-height: 1.6; }
      </style></head><body>${content}</body></html>`,
      ],
      { type: "text/html" }
    );
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = fileName.replace(/\.(docx|txt)$/, "") + "_edited.html";
    a.click();
  };

  const tools = [
    { label: "B", cmd: "bold", style: { fontWeight: "bold" } },
    { label: "I", cmd: "italic", style: { fontStyle: "italic" } },
    { label: "U", cmd: "underline", style: { textDecoration: "underline" } },
    { label: "S", cmd: "strikeThrough", style: { textDecoration: "line-through" } },
    { label: "H1", cmd: "formatBlock", value: "h1" },
    { label: "H2", cmd: "formatBlock", value: "h2" },
    { label: "¶", cmd: "formatBlock", value: "p" },
    { label: "• List", cmd: "insertUnorderedList" },
    { label: "1. List", cmd: "insertOrderedList" },
    { label: "↩ Undo", cmd: "undo" },
    { label: "↪ Redo", cmd: "redo" },
  ];

  return (
    <div style={styles.wrapper}>
      {/* Toolbar */}
      <div style={styles.toolbar}>
        <div style={styles.toolbarLeft}>
          <span style={styles.filename}>📄 {fileName}</span>
          <div style={styles.divider} />
          {tools.map((t) => (
            <button
              key={t.label}
              style={{ ...styles.toolBtn, ...t.style }}
              onMouseDown={(e) => {
                e.preventDefault();
                execCommand(t.cmd, t.value);
              }}
              title={t.label}
            >
              {t.label}
            </button>
          ))}
          <select
            style={styles.select}
            onChange={(e) => execCommand("fontSize", e.target.value)}
            defaultValue="3"
          >
            {[1, 2, 3, 4, 5, 6, 7].map((s) => (
              <option key={s} value={s}>
                {[10, 12, 14, 16, 18, 24, 36][s - 1]}px
              </option>
            ))}
          </select>
        </div>
        <button style={styles.saveBtn} onClick={handleDownload}>
          ⬇ Download
        </button>
      </div>

      {/* Page */}
      <div style={styles.pageWrapper}>
        <div style={styles.page}>
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            style={styles.editor}
            placeholder="Start typing..."
          />
        </div>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    background: "#f0f0f0",
    fontFamily: "Segoe UI, sans-serif",
  },
  toolbar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "6px 12px",
    background: "#2b579a",
    color: "#fff",
    flexWrap: "wrap",
    gap: 6,
  },
  toolbarLeft: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    flexWrap: "wrap",
  },
  filename: { fontWeight: 600, fontSize: 13, marginRight: 8 },
  divider: { width: 1, height: 20, background: "rgba(255,255,255,0.3)", margin: "0 6px" },
  toolBtn: {
    background: "rgba(255,255,255,0.15)",
    color: "#fff",
    border: "none",
    borderRadius: 3,
    padding: "3px 8px",
    cursor: "pointer",
    fontSize: 12,
    transition: "background 0.2s",
  },
  select: {
    background: "rgba(255,255,255,0.15)",
    color: "#fff",
    border: "1px solid rgba(255,255,255,0.3)",
    borderRadius: 3,
    padding: "2px 4px",
    fontSize: 12,
    cursor: "pointer",
  },
  saveBtn: {
    background: "#fff",
    color: "#2b579a",
    border: "none",
    borderRadius: 4,
    padding: "5px 14px",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: 13,
  },
  pageWrapper: {
    flex: 1,
    overflow: "auto",
    padding: "32px 16px",
    display: "flex",
    justifyContent: "center",
  },
  page: {
    background: "#fff",
    width: 816,
    minHeight: 1056,
    boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
    padding: "72px 96px",
  },
  editor: {
    minHeight: "100%",
    outline: "none",
    fontSize: 14,
    lineHeight: 1.8,
    fontFamily: "'Times New Roman', serif",
    color: "#1a1a1a",
  },
};