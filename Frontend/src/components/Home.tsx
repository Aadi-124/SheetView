
/******************************************************************
  SIMPLIFIED, CLEAN, STABLE Home.tsx
  (UI COMPLETELY UNCHANGED — ONLY LOGIC CLEANED)
******************************************************************/

import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  UploadCloud,
  Pencil,
  Eye,
  Share2,
  Trash2,
  Cloud,
  PlusCircle,
  RefreshCw,
} from "lucide-react";

import FileUpload from "@/components/FileUpload";
import { useToast } from "@/hooks/use-toast";

import {
  listUserFiles,
  listUserFolders,
  getStorageStats,
  deleteFileById,
} from "@/services/BackendAPIs";

// ----------------------- Helpers -----------------------
function formatBytes(bytes: number): string {
  if (!bytes || bytes <= 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const value = bytes / Math.pow(k, i);
  const fixed = value < 10 ? 2 : 1;
  return `${value.toFixed(fixed)} ${sizes[i]}`;
}

function EmojiAvatar({ emoji }: { emoji: string }) {
  return (
    <div className="h-12 w-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-2xl border-2 ring-indigo-300">
      {emoji}
    </div>
  );
}

function Donut({ used, quota }: { used: number; quota: number }) {
  const pct = quota ? Math.min(100, Math.round((used / quota) * 100)) : 0;
  const conic = `conic-gradient(#10b981 ${pct * 3.6}deg, #e5e7eb 0)`;

  return (
    <div className="relative h-28 w-28">
      <div className="absolute inset-0 rounded-full" style={{ background: conic }} />
      <div className="absolute inset-2 rounded-full bg-white border-2 border-gray-200" />
      <div className="absolute inset-0 grid place-items-center">
        <div>
          <div className="text-xl font-extrabold">{pct}%</div>
          <div className="text-[11px] text-gray-500">Used</div>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// MAIN COMPONENT
// ----------------------------------------------------
export default function Home() {
  const navigate = useNavigate();
  const { toast } = useToast();

  // --- Simplified States ---
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [files, setFiles] = useState<any[]>([]);
  const [folders, setFolders] = useState<any[]>([]);
  const [storage, setStorage] = useState({ used: 0, quota: 5 * 1024 * 1024 * 1024 });
  const [lastUploaded, setLastUploaded] = useState<{ id: string; name: string } | null>(
    null
  );

  // --- Simple Login Handling ---
  const auth = JSON.parse(sessionStorage.getItem("app.auth") || "null");
  const userId = auth?.userId || null;
  const isLoggedIn = Boolean(userId);

  // ------------------ LOAD DATA ------------------
  const load = useCallback(async () => {
    try {
      setLoading(true);

      const [fRes, dRes, sRes] = await Promise.allSettled([
        listUserFiles(),
        listUserFolders(),
        getStorageStats(),
      ]);

      useEffect(()=>{
        console.log(listUserFolders().then());
      },[]);

      // console.log(listUserFiles());

      if (fRes.status === "fulfilled") setFiles(fRes.value || []);
      if (dRes.status === "fulfilled") setFolders(dRes.value || []);
      if (sRes.status === "fulfilled")
        setStorage({
          used: Number(sRes.value?.used) || 0,
          quota: Number(sRes.value?.quota) || 5 * 1024 * 1024 * 1024,
        });
    } catch (err) {
      toast({
        title: "Failed to load data",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (isLoggedIn) load();
    else setLoading(false);
  }, [isLoggedIn, load]);

  // ----------------- REFRESH -----------------
  const refresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  // ----------------- DELETE -----------------
  const handleDelete = async (id: string) => {
    try {
      await deleteFileById(id);
      setFiles((prev) => prev.filter((f) => f.id !== id));
      toast({ title: "File deleted" });
    } catch {
      toast({
        title: "Delete failed",
        description: "Try again.",
        variant: "destructive",
      });
    }
  };

  // ----------------- UPLOAD -----------------
  const handleUploaded = ({ fileId, file }: any) => {
    if (!isLoggedIn) return;

    setFiles((prev) => [
      {
        id: fileId,
        name: file.name,
        size: file.size,
        mimeType: file.type,
        updatedAt: new Date().toISOString(),
      },
      ...prev,
    ]);

    setStorage((s) => ({ ...s, used: s.used + file.size }));
    setLastUploaded({ id: fileId, name: file.name });
  };

  // ============ NOT LOGGED IN UI (UNCHANGED) ============
  if (!isLoggedIn) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-bold mb-4">Upload a File</h1>

        <FileUpload
          label="Upload"
          helperText="Drag or click"
          onUploaded={handleUploaded}
          accept="*/*"
        />

        {lastUploaded && (
          <div className="mt-4 border rounded-lg p-3 bg-green-50">
            Uploaded: {lastUploaded.name}
          </div>
        )}
      </div>
    );
  }

  // ============ FULL LOGGED-IN UI (UNCHANGED) ============
  return (
    /* ⚠️ EVERYTHING BELOW IS EXACTLY YOUR ORIGINAL UI */
    <div className="min-h-[calc(100vh-64px)] p-6">

      {/* HEADER */}
      <div className="flex items-center gap-3 mb-6">
        <EmojiAvatar emoji="📁" />
        <h1 className="text-3xl font-bold">Your Drive</h1>
      </div>

      {/* Upload + Storage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-10">

        <div className="lg:col-span-8 border rounded-xl p-6">
          <h2 className="text-lg font-bold flex items-center gap-2 mb-3">
            <UploadCloud className="h-5 w-5 text-emerald-600" /> Upload a File
          </h2>

          <FileUpload onUploaded={handleUploaded} label="Upload" accept="*/*" />

          {lastUploaded && (
            <div className="mt-4 p-3 rounded-xl bg-green-50 border border-green-300 flex justify-between items-center">
              <span>Uploaded: {lastUploaded.name}</span>
              <button
                className="px-3 py-1 bg-emerald-600 text-white rounded"
                onClick={() =>
                  navigate(`/file?id=${encodeURIComponent(lastUploaded.id)}`)
                }
              >
                Continue
              </button>
            </div>
          )}
        </div>

        <div className="lg:col-span-4 border rounded-xl p-6">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Cloud className="h-5 w-5 text-indigo-600" />
            Storage
          </h2>

          <div className="flex items-center gap-4 mt-4">
            <Donut used={storage.used} quota={storage.quota} />

            <div>
              <p className="text-sm text-gray-500">Used</p>
              <p className="font-bold">{formatBytes(storage.used)}</p>

              <p className="text-sm text-gray-500 mt-3">Total</p>
              <p className="font-bold">{formatBytes(storage.quota)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Folders & Files */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        <div className="lg:col-span-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Folders</h3>
            <button
              className="px-3 py-1.5 rounded-lg bg-yellow-100 border border-yellow-400"
              onClick={() => navigate("/new-folder")}
            >
              <PlusCircle className="inline h-4 w-4 mr-1" />
              New
            </button>
          </div>

          {loading ? (
            <p>Loading folders…</p>
          ) : folders.length === 0 ? (
            <p>No folders yet</p>
          ) : (
            folders.map((f) => (
              <div
                key={f.id}
                onClick={() => navigate(`/folder/${f.id}`)}
                className="border p-4 rounded-xl mb-3 cursor-pointer hover:bg-gray-50"
              >
                <p className="font-bold">{f.name}</p>
                <p className="text-sm text-gray-500">{f.fileCount} items</p>
              </div>
            ))
          )}
        </div>

        <div className="lg:col-span-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Recent Files</h3>

            <button
              className="px-3 py-1.5 rounded-lg bg-blue-100 border border-blue-400"
              onClick={refresh}
            >
              <RefreshCw
                className={`inline h-4 w-4 mr-1 ${refreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>

          {loading ? (
            <p>Loading files…</p>
          ) : files.length === 0 ? (
            <p>No files yet.</p>
          ) : (
            files.map((file) => (
              <div key={file.id} className="border rounded-xl p-4 mb-4">
                <p className="font-bold">{file.name}</p>
                <p className="text-sm text-gray-500">
                  {formatBytes(file.size)} •{" "}
                  {new Date(file.updatedAt).toLocaleString()}
                </p>

                <div className="mt-3 flex gap-2">
                  <button
                    className="px-3 py-1.5 bg-blue-600 text-white rounded"
                    onClick={() =>
                      navigate(`/file?id=${encodeURIComponent(file.id)}`)
                    }
                  >
                    <Eye className="inline h-4 w-4 mr-1" /> View
                  </button>

                  <button
                    className="px-3 py-1.5 bg-purple-600 text-white rounded"
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `${window.location.origin}/files/${file.id}`
                      );
                      toast({ title: "Share link copied!" });
                    }}
                  >
                    <Share2 className="inline h-4 w-4 mr-1" /> Share
                  </button>

                  <button
                    className="px-3 py-1.5 bg-red-600 text-white rounded"
                    onClick={() => handleDelete(file.id)}
                  >
                    <Trash2 className="inline h-4 w-4 mr-1" /> Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}