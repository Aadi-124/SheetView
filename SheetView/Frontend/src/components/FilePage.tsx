// src/pages/FilePage.tsx
import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import UniversalViewer from "@/components/UniversalViewer";

// If you already have a helper, reuse it; else define base here:
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000";

// 🔧 Adjust this to your backend route shape:
//   If server is mounted as app.use('/file', fileRouter), GET route was /files/:id
//   So final URL = http://localhost:3000/file/files/:id
function buildDownloadUrl(fileId: string) {
  // If your backend is GET /files/:id (no /file prefix), use: `${API_BASE}/files/${fileId}`
  return `${API_BASE}/file/files/${fileId}`;
}

export default function FilePage() {
  const [params] = useSearchParams();
  const id = params.get("id");

  const downloadUrl = useMemo(() => {
    if (!id) return null;
    return buildDownloadUrl(id);
  }, [id]);

  if (!id) {
    return (
      <div className="p-6">
        <p className="text-sm text-red-600">Missing file id. Use /file?id=&lt;uuid&gt;</p>
      </div>
    );
  }

  if (!downloadUrl) {
    return (
      <div className="p-6">
        <p className="text-sm text-muted-foreground">Preparing viewer…</p>
      </div>
    );
  }

  // UniversalViewer should accept a server URL and handle fetching/previewing.
  // If your viewer needs both modes, pass mode="server" and the URL.
  return (
    <div className="h-screen">
      <UniversalViewer
        mode="server"
        name={`file-${id}`}
        mimeType={undefined}      // optional; viewer can detect from response or ignore
        size={0}                  // optional
        downloadUrl={downloadUrl} // ← key prop
      />
    </div>
  );
}