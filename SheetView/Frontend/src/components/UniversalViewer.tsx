
import React, { useEffect, useMemo, useRef, useState } from "react";

// ---- Editors you already have ----
import ExcelEditor from "@/components/editors/ExcelEditor";
import WordEditor from "@/components/editors/WordEditor";
import CodeEditor from "@/components/editors/CodeEditor";
import PDFViewer from "@/components/editors/PdfViewer";
import ImageViewer from "@/components/editors/ImageViewer";

// ---------- Helpers ----------
function getAuthToken(): string | null {
  console.log(localStorage.getItem("token"));
  try { return localStorage.getItem("token"); } catch { return null; }
}
function extFromName(name?: string) {
  if (!name) return "";
  const i = name.lastIndexOf(".");
  return i >= 0 ? name.slice(i + 1).toLowerCase() : "";
}
function isImage(mime?: string, ext?: string) {
  return (mime?.startsWith("image/")) || ["png","jpg","jpeg","gif","webp","bmp","svg"].includes(ext || "");
}
function isPdf(mime?: string, ext?: string) {
  return mime === "application/pdf" || ext === "pdf";
}
function isExcel(mime?: string, ext?: string) {
  return (
    ["xlsx", "xls", "csv"].includes(ext || "") ||
    mime === "application/vnd.ms-excel" ||
    mime === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
    mime === "text/csv"
  );
}
function isWord(mime?: string, ext?: string) {
  return (
    ["docx", "doc", "rtf"].includes(ext || "") ||
    mime === "application/msword" ||
    mime === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  );
}
function isTextOrCode(mime?: string, ext?: string) {
  if (mime?.startsWith("text/")) return true;
  const maybe = ["txt","md","csv","json","js","ts","tsx","css","html","xml","py","java","c","cpp","cs","go","rb","php","sql","log","rtf"];
  return maybe.includes(ext || "");
}
function parseFilenameFromContentDisposition(cd: string): string | null {
  if (!cd) return null;
  // RFC5987 filename*
  const star = /filename\*\s*=\s*([^']*)''([^;]+)/i.exec(cd);
  if (star) {
    try { return decodeURIComponent(star[2]); } catch { return star[2]; }
  }
  // filename="..."
  const basic = /filename\s*=\s*"([^"]+)"/i.exec(cd) || /filename\s*=\s*([^;]+)/i.exec(cd);
  return basic ? basic[1].trim() : null;
}

// ---------- Types ----------
type Props = {
  /** 'local' (blobUrl) or 'server' (downloadUrl/fileId) */
  mode: "local" | "server";

  /** Display name (will also help detect extension if MIME is missing) */
  name?: string;

  /** Optional: if you already know it; otherwise we infer from headers/blob */
  mimeType?: string;

  /** Optional: informational only */
  size?: number;

  /** Local mode: pass blobUrl (created via URL.createObjectURL(file)) */
  blobUrl?: string;

  /** Server mode: pass a direct URL to the file binary endpoint */
  downloadUrl?: string;

  /** Alternatively, pass an id and we construct the URL */
  fileId?: string;
  apiBase?: string; // default http://localhost:3000
  pathBuilder?: (id: string) => string; // default /file/files/:id

  /** If the GET requires Authorization: Bearer <token> */
  withAuth?: boolean;

  /** Optional: surface the computed fileId to action sidebars */
  exposeFileIdToChildren?: boolean;
};

/**
 * UniversalViewer (Editor-only)
 * - Builds a File object (from local blobUrl, or fetched server Blob)
 * - Chooses an editor based on MIME/extension
 * - NO inline <img>/<iframe> paths
 */
export default function UniversalViewer({
  mode,
  name,
  mimeType,
  size,
  blobUrl,
  downloadUrl,
  fileId,
  apiBase = "http://localhost:3000",
  pathBuilder = (id: string) => `/file/files/${id}`,
  withAuth = false,
}: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [detectedMime, setDetectedMime] = useState<string | undefined>(mimeType);
  const [detectedName, setDetectedName] = useState<string | undefined>(name);
  const [loading, setLoading] = useState<boolean>(mode === "server");
  const [error, setError] = useState<string | null>(null);

  // Build final server URL from inputs
  const finalServerUrl = useMemo(() => {
    if (mode !== "server") return null;
    if (downloadUrl) return downloadUrl;
    if (fileId) return `${apiBase}${pathBuilder(fileId)}`;
    return null;
  }, [mode, downloadUrl, fileId, apiBase, pathBuilder]);

  // Fetch in server mode and create a File object
  useEffect(() => {
    if (mode !== "server") return;

    let aborted = false;
    (async () => {
      if (!finalServerUrl) {
        setError("No server URL or fileId provided.");
        return;
      }
      setLoading(true);
      setError(null);

      try {
        // Try HEAD for metadata (optional)
        let headMime: string | undefined;
        let displayName: string | undefined = name;

        try {
          const headRes = await fetch(finalServerUrl, {
            method: "HEAD",
            headers: withAuth && getAuthToken() ? { Authorization: `Bearer ${getAuthToken()}` } : {},
          });
          if (headRes.ok) {
            headMime = headRes.headers.get("Content-Type") || undefined;
            const cd = headRes.headers.get("Content-Disposition") || "";
            const xf = headRes.headers.get("X-Filename") || "";
            const candidate = parseFilenameFromContentDisposition(cd) || xf || name;
            if (candidate) displayName = candidate;
          }
        } catch {
          // HEAD may not be allowed; continue
        }

        const res = await fetch(finalServerUrl, {
          method: "GET",
          headers: withAuth && getAuthToken() ? { Authorization: `Bearer ${getAuthToken()}` } : {},
        });
        if (!res.ok) {
          throw new Error(`Failed to fetch file (${res.status})`);
        }

        // Read headers to refine name + mime
        const ct = res.headers.get("Content-Type") || headMime || undefined;
        const cd = res.headers.get("Content-Disposition") || "";
        const xf = res.headers.get("X-Filename") || "";

        const filename =
          parseFilenameFromContentDisposition(cd) ||
          xf ||
          displayName ||
          name ||
          (fileId ? `file-${fileId}` : "file.bin");

        const blob = await res.blob();
        const type = ct || blob.type || "application/octet-stream";

        const f = new File([blob], filename, { type });
        if (!aborted) {
          setDetectedMime(type);
          setDetectedName(filename);
          setFile(f);
        }
      } catch (e: any) {
        if (!aborted) setError(e?.message || "Failed to load file");
      } finally {
        if (!aborted) setLoading(false);
      }
    })();

    return () => { aborted = true; };
  }, [mode, finalServerUrl, withAuth, name, fileId]);

  // Local mode → transform blobUrl into a File object (optional but useful for editors)
  useEffect(() => {
    if (mode !== "local") return;
    if (!blobUrl) return;

    let aborted = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const resp = await fetch(blobUrl);
        const blob = await resp.blob();
        const type = mimeType || blob.type || "application/octet-stream";
        const filename = name || "local-file";
        const f = new File([blob], filename, { type });
        if (!aborted) {
          setDetectedMime(type);
          setDetectedName(filename);
          setFile(f);
        }
      } catch (e: any) {
        if (!aborted) setError(e?.message || "Failed to materialize local file");
      } finally {
        if (!aborted) setLoading(false);
      }
    })();

    return () => { aborted = true; };
  }, [mode, blobUrl, mimeType, name]);

  // ---- UI states ----
  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center text-sm text-muted-foreground">
        Loading file…
      </div>
    );
  }
  if (error) {
    return (
      <div className="p-4">
        <p className="text-red-600 text-sm mb-2">{error}</p>
        {finalServerUrl && (
          <a href={finalServerUrl} target="_blank" rel="noreferrer" className="text-primary underline">
            Try opening directly
          </a>
        )}
      </div>
    );
  }
  if (!file) {
    return (
      <div className="p-6 h-full flex items-center justify-center text-sm text-muted-foreground">
        No file available.
      </div>
    );
  }

  // ---- Decide editor by kind ----
  const ext = extFromName(detectedName);
  const mime = detectedMime;

  let Editor: React.ReactElement | null = null;

  if (isExcel(mime, ext)) {
    Editor = <ExcelEditor file={file} /* add extra props here if needed */ />;
  } else if (isWord(mime, ext)) {
    Editor = <WordEditor file={file} />;
  } else if (isPdf(mime, ext)) {
    Editor = <PDFViewer file={file} />;
  } else if (isImage(mime, ext)) {
    Editor = <ImageViewer file={file} />;
  } else if (isTextOrCode(mime, ext)) {
    Editor = <CodeEditor file={file} />;
  } else {
    // Fallback: unknown kind → no inline rendering; offer download
    Editor = (
      <div className="p-6 h-full flex flex-col items-center justify-center gap-3 text-sm text-muted-foreground">
        <p>No preview available for this file type.</p>
        <a
          href={mode === "local" ? blobUrl : finalServerUrl || downloadUrl || "#"}
          download={detectedName}
          target={mode === "server" ? "_blank" : undefined}
          rel="noreferrer"
          className="px-4 py-2 rounded-md bg-primary text-white"
        >
          Open / Download
        </a>
      </div>
    );
  }

  // ---- Render the chosen editor only ----
  return (
    <div className="h-full w-full min-h-0">
      {Editor}
    </div>
  );
}
