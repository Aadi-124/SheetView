// components/UniversalViewer.tsx
import { useMemo } from "react";
import { File as FileIcon } from "lucide-react";

// Import your editors
import ExcelEditor from "@/components/editors/ExcelEditor";
import WordEditor from "@/components/editors/WordEditor";
import CodeEditor from "@/components/editors/CodeEditor";
import PDFViewer from "./Editors/PdfViewer";
import ImageViewer from "@/components/editors/ImageViewer";

type ViewerKind = "excel" | "word" | "pdf" | "image" | "code" | "unknown";

export default function UniversalViewer({ file }: { file: File }) {
  const kind = useMemo<ViewerKind>(() => {
    const name = (file?.name || "").toLowerCase();
    const type = (file?.type || "").toLowerCase();

    const ext = (() => {
      const clean = name.split("?")[0].split("#")[0].trim();
      const idx = clean.lastIndexOf(".");
      return idx >= 0 ? clean.slice(idx + 1) : "";
    })();

    // spreadsheets
    if (
      ["xlsx", "xls", "csv"].includes(ext) ||
      type === "application/vnd.ms-excel" ||
      type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      type === "text/csv"
    ) return "excel";

    // pdf
    if (ext === "pdf" || type === "application/pdf") return "pdf";

    // images
    if (type.startsWith("image/") || ["png", "jpg", "jpeg", "gif", "webp", "bmp", "svg"].includes(ext))
      return "image";

    // word-like
    if (
      ["docx", "doc", "rtf"].includes(ext) ||
      type === "application/msword" ||
      type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) return "word";

    // text/markdown → treat as code editor for now
    if (["txt", "md", "log"].includes(ext) || type.startsWith("text/")) return "code";

    // code/json
    if (
      ["json", "js", "ts", "tsx", "py", "java", "c", "cpp", "cs", "rb", "go", "php", "sql", "html", "css"].includes(ext) ||
      type === "application/json"
    ) return "code";

    return "unknown";
  }, [file]); // NOTE: depends on 'file', not 'File'

  switch (kind) {
    case "excel": return <ExcelEditor file={file} />;
    case "word":  return <WordEditor  file={file} />;
    case "pdf":   return <PDFViewer   file={file} />;
    case "image": return <ImageViewer file={file} />;
    case "code":  return <CodeEditor  file={file} />;
    default:
      return (
        <div className="flex h-full flex-col items-center justify-center gap-4 text-muted-foreground">
          <FileIcon className="h-16 w-16 opacity-40" />
          <p className="text-lg font-medium">{file.name}</p>
          <p className="text-sm">No preview available for this file type.</p>
          <a
            href={URL.createObjectURL(file)}   // ✅ correct
            download={file.name}
            className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-white hover:opacity-90"
          >
          ADSASDDDDD  ⬇ Download File
          </a>

        </div>
      );
  }
}