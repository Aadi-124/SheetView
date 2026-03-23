import React, { useEffect, useState } from "react";
import { useSearchParams, useParams } from "react-router-dom";

import ExcelEditor from "./Editors/ExcelEditor.tsx";
import WordEditor from "./Editors/WordEditor.tsx";
import CodeEditor from "./Editors/CodeEditor.tsx";
import ImageViewer from "./Editors/ImageViewer.tsx";
import PDFViewer from "./Editors/PdfViewer.tsx";

import { getFile } from "@/services/BackendAPIs";

const extFromFileName = (n: string) => {
  const i = n.lastIndexOf(".");
  return i >= 0 ? n.slice(i + 1).toLowerCase() : "";
};

const detectType = (file: File) => {
  let mime = file.type || "";
  let ext = extFromFileName(file.name);

  if (!mime && ["xlsx", "xls", "csv"].includes(ext)) mime = "application/vnd.ms-excel";
  if (!mime && ["doc", "docx", "rtf"].includes(ext)) mime = "application/msword";
  if (!mime && ext === "pdf") mime = "application/pdf";
  if (!mime && ["png","jpg","jpeg","gif","webp","bmp","svg"].includes(ext)) mime = "image/" + ext;

  return { mime, ext };
};

export default function UniversalViewer() {
  const [search] = useSearchParams();
  const qId = search.get("id");
  const { id: pId } = useParams();
  const fileId = qId || pId;

  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        if (!fileId) throw new Error("Missing fileId in URL");

        const res = await getFile(fileId);
        const blob = res.data;
        const headers = res.headers;

        const cd = headers["content-disposition"];
        let name = `file-${fileId}`;

        if (cd) {
          const match = cd.match(/filename="?([^"]+)"?/i);
          if (match?.[1]) {
            try { name = decodeURIComponent(match[1]); } catch { name = match[1]; }
          }
        }

        const type = headers["content-type"] || blob.type || "application/octet-stream";
        const f = new File([blob], name, { type });

        if (!cancelled) setFile(f);

      } catch (err: any) {
        if (!cancelled) setError(err.message || "Failed to load file");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => (cancelled = true);
  }, [fileId]);

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;
  if (!file) return <div className="p-4">No file</div>;

  const { mime, ext } = detectType(file);

  if (mime.includes("excel") || ["xlsx","xls","csv"].includes(ext))
    return <ExcelEditor file={file} />;

  if (mime.includes("word") || ["doc","docx","rtf"].includes(ext))
    return <WordEditor file={file} />;

  if (mime === "application/pdf" || ext === "pdf")
    return <PDFViewer file={file} />;

  if (mime.startsWith("image/"))
    return <ImageViewer file={file} />;

  if (mime.startsWith("text/") || ["txt","md","json","js","ts","html","css","xml"].includes(ext))
    return <CodeEditor file={file} />;

  // --- Last fallback ---
  return (
    <div className="p-6 text-center">
      <h2 className="font-bold text-lg">No preview available</h2>
      <p className="text-sm text-gray-500">File type: {mime || ext}</p>
      <br />
      <a
        href={URL.createObjectURL(file)}
        download={file.name}
        className="px-4 py-2 rounded bg-blue-600 text-white"
      >
        Download File
      </a>
    </div>
  );
}