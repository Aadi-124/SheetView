import React, { useEffect, useRef, useState } from "react";
import {ArrowLeft} from "lucide-react";
/* -------------------- Language map -------------------- */
const LANGUAGE_MAP = {
  js: "javascript", jsx: "javascript", ts: "typescript", tsx: "typescript",
  py: "python", java: "java", c: "c", cpp: "cpp", cs: "csharp",
  html: "html", css: "css", scss: "scss", json: "json",
  md: "markdown", xml: "xml", sql: "sql", sh: "shell",
  yaml: "yaml", yml: "yaml", txt: "plaintext",
};

/* -------- Load Monaco AMD loader via CDN (once) -------- */
function loadMonacoLoader() {
  if (window.require && window.monaco) return Promise.resolve();
  if (window.__monacoLoaderPromise) return window.__monacoLoaderPromise;

  window.__monacoLoaderPromise = new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/monaco-editor@0.44.0/min/vs/loader.js";
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Failed to load Monaco loader"));
    document.head.appendChild(s);
  });
  return window.__monacoLoaderPromise;
}

/* ---------------------- Component ---------------------- */
export default function CodeEditor({ file, height = "70vh" }) {
  const containerRef = useRef(null);
  const editorRef = useRef(null);

  const [content, setContent] = useState("");
  const [language, setLanguage] = useState("plaintext");
  const [fileName, setFileName] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [wordWrap, setWordWrap] = useState(true);

  /* --------- Read file + detect language on change --------- */
  useEffect(() => {
    if (!file) {
      setFileName("");
      setContent("");
      setLanguage("plaintext");
      return;
    }

    setFileName(file.name || "untitled");
    const ext = (file.name?.split(".").pop() || "").toLowerCase();
    setLanguage(LANGUAGE_MAP[ext] || "plaintext");

    const reader = new FileReader();
    reader.onload = (e) => setContent(String(e.target.result ?? ""));
    reader.onerror = () => setContent("// Failed to read file");
    reader.readAsText(file);
  }, [file]);

  /* --------- Initialize editor once (minimal UI) --------- */
  useEffect(() => {
    let disposed = false;

    async function init() {
      if (!containerRef.current) return;
      await loadMonacoLoader();

      window.require.config({
        paths: { vs: "https://cdn.jsdelivr.net/npm/monaco-editor@0.44.0/min/vs" },
      });

      await new Promise((resolve) => {
        window.require(["vs/editor/editor.main"], () => resolve());
      });

      if (disposed || !containerRef.current) return;

      editorRef.current = window.monaco.editor.create(containerRef.current, {
        value: content || "",
        language: language || "plaintext",
        theme: "vs-dark",
        automaticLayout: true,
        fontSize: 14,
        minimap: { enabled: false },

        // ✅ Remove line numbers and extra gutters
        lineNumbers: "off",
        lineNumbersMinChars: 0,
        glyphMargin: false,
        folding: false,
        renderLineHighlight: "none",
        lineDecorationsWidth: 0,

        // Clean behavior
        wordWrap: "on",
        scrollBeyondLastLine: false,
        padding: { top: 8, bottom: 8 },
      });
    }

    init();

    // Cleanup
    return () => {
      disposed = true;
      if (editorRef.current) {
        editorRef.current.dispose();
        editorRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* --------- Keep value in sync when content changes --------- */
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    const model = editor.getModel();
    if (!model) return;

    const current = editor.getValue();
    if (typeof content === "string" && content !== current) {
      editor.pushUndoStop();
      editor.executeEdits("replace-all", [
        { range: model.getFullModelRange(), text: content },
      ]);
      editor.pushUndoStop();
    }
  }, [content]);

  /* --------- Keep language in sync when it changes --------- */
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor || !window.monaco) return;
    const model = editor.getModel();
    if (model) {
      window.monaco.editor.setModelLanguage(model, language || "plaintext");
    }
  }, [language]);

  /* --------- Keep wordWrap in sync when toggled --------- */
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.updateOptions({ wordWrap: wordWrap ? "on" : "off" });
    }
  }, [wordWrap]);

  /* --------- Menu: close on outside click / Escape --------- */
  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e) => setMenuOpen(false);
    const onKey = (e) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("click", onClick);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("click", onClick);
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  /* ------------------ Actions in menu ------------------ */
  const handleDownload = () => {
    const value = editorRef.current?.getValue?.() ?? content ?? "";
    const blob = new Blob([value], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = fileName || "download.txt";
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 0);
    setMenuOpen(false);
  };

  return (
    <div style={styles.shell}>
    
      {/* Top bar: centered filename + kebab button on right */}
      <div style={styles.topbar} >
      {/* <div style={styles.topbar}> */}
        <div style={styles.topbarSpacer} aria-hidden />
          <button
            
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
        <div style={styles.title} title={fileName || "No file selected"}>
          {fileName || "No file selected"}
        </div>
        <button
          style={styles.kebab}
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen((v) => !v);
          }}
          aria-label="More options"
          title="More"
          type="button"
        >
          ⋮
        </button>

        {menuOpen && (
          <div
            style={styles.menu}
            onClick={(e) => e.stopPropagation()}
            role="menu"
          >
            <button style={styles.menuItem} onClick={handleDownload} type="button">
              Download
            </button>

            <label style={styles.menuItem}>
              <input
                type="checkbox"
                checked={wordWrap}
                onChange={(e) => setWordWrap(e.target.checked)}
                style={{ marginRight: 8 }}
              />
              Word wrap
            </label>

            <div style={{ ...styles.menuItem, padding: 6 }}>
              <label htmlFor="lang" style={{ marginRight: 8 }}>Language:</label>
              <select
                id="lang"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                style={styles.select}
              >
                {Array.from(new Set(Object.values(LANGUAGE_MAP))).map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
                <option value="plaintext">plaintext</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Editor container */}
      <div
        ref={containerRef}
        style={{ ...styles.editor, height }}
        aria-label="Code editor"
      />
    </div>
  );
}

/* -------------------- Minimal inline styles -------------------- */
const styles = {
  shell: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    background: "#1e1e1e",
    border: "1px solid #2f2f2f",
    borderRadius: 8,
    overflow: "hidden",
  },
  topbar: {
    position: "relative",
    display: "grid",
    gridTemplateColumns: "1fr auto",
    alignItems: "center",
    background: "#242424",
    color: "#e0e0e0",
    borderBottom: "1px solid #2f2f2f",
    height: 40,
  },
  topbarSpacer: {
    width: 1, // keeps grid structure; title will be centered absolutely
  },
  title: {
    position: "absolute",
    left: "50%",
    transform: "translateX(-50%)",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: "70%",
    fontSize: 13,
    fontWeight: 600,
    letterSpacing: 0.2,
  },
  kebab: {
    marginRight: 8,
    justifySelf: "end",
    height: 28,
    width: 28,
    borderRadius: 6,
    background: "transparent",
    color: "#e0e0e0",
    border: "1px solid #3a3a3a",
    cursor: "pointer",
    lineHeight: 1,
    fontSize: 16,
  },
  menu: {
    position: "absolute",
    right: 8,
    top: 44,
    background: "#2a2a2a",
    border: "1px solid #3a3a3a",
    borderRadius: 8,
    boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
    minWidth: 180,
    zIndex: 10,
  },
  menuItem: {
    display: "flex",
    alignItems: "center",
    width: "100%",
    padding: "8px 10px",
    background: "transparent",
    color: "#e0e0e0",
    border: "none",
    textAlign: "left",
    cursor: "pointer",
    fontSize: 13,
  },
  select: {
    background: "#3a3a3a",
    color: "#fff",
    border: "1px solid #4a4a4a",
    borderRadius: 6,
    padding: "4px 6px",
    fontSize: 12,
  },
  editor: {
    width: "100%",
    background: "#1e1e1e",
  },
};