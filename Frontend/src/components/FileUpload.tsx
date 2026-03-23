


// components/FileUpload.tsx
"use client";

import { useRef, useState, useCallback } from "react";
import { Upload } from "lucide-react";
import { useNavigate } from "react-router-dom"; // React Router
import { useToast } from "@/hooks/use-toast";
import { uploadSingleFile } from "@/services/BackendAPIs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type Props = {
  accept?: string;               // e.g. "image/*,.pdf,.docx"
  maxFileSize?: number;          // in bytes
  label?: string;
  helperText?: string;
  /** If true (default), navigate to a file details page on success */
  navigateOnSuccess?: boolean;
  /** Build the target URL for navigation (receives fileId). Default: /file?id=<fileId> */
  buildTargetUrl?: (fileId: string) => string;
  /** Callback invoked when upload succeeds */
  onUploaded?: (payload: {
    fileId: string;
    file: File;
    response: any;
  }) => void;
};

const DEFAULT_MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const DEFAULT_ACCEPT = "*/*";

/** Format bytes as a human-readable string */
function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const value = bytes / Math.pow(k, i);
  const fixed = i === 0 ? 0 : value < 10 ? 1 : 2; // 0-2 decimals
  return `${value.toFixed(fixed)} ${sizes[i]}`;
}

/**
 * Check if a file matches an accept string.
 * Accept string supports:
 * - MIME types: "image/*", "application/pdf"
 * - Extensions: ".png,.jpg,.pdf"
 * - Combinations: "image/*,.pdf"
 */
function fileMatchesAccept(file: File, accept: string): boolean {
  if (!accept || accept === "*/*") return true;
  const parts = accept
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  const fileName = file.name.toLowerCase();
  const fileType = (file.type || "").toLowerCase();

  for (const rule of parts) {
    if (rule.startsWith(".")) {
      // extension
      if (fileName.endsWith(rule)) return true;
    } else if (rule.endsWith("/*")) {
      // type group e.g. image/*, video/*, application/*
      const group = rule.replace("/*", "");
      if (fileType.startsWith(`${group}/`)) return true;
    } else {
      // exact mime type
      if (fileType === rule) return true;
    }
  }
  return false;
}

export default function FileUpload({
  accept = DEFAULT_ACCEPT,
  maxFileSize = DEFAULT_MAX_FILE_SIZE,
  label = "Upload a file",
  helperText = "Drag and drop or click to browse • any file type • max 5MB",
  navigateOnSuccess = true,
  buildTargetUrl = (id: string) => `/file?id=${encodeURIComponent(id)}`,
  onUploaded,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentFile, setCurrentFile] = useState<File | null>(null);

  const navigate = useNavigate(); // React Router
  const { toast } = useToast();

  /** Validate the selected file against size and accept rules */
  const validate = (f: File): string | null => {
    if (!f) return "No file selected.";
    if (f.size === 0) return "File is empty.";
    if (f.size > maxFileSize) {
      return `File exceeds ${formatBytes(maxFileSize)} limit (selected: ${formatBytes(f.size)}).`;
    }
    if (!fileMatchesAccept(f, accept)) {
      return `File type not allowed. Allowed: ${accept}`;
    }
    return null;
  };

  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [postUploadTarget, setPostUploadTarget] = useState<string | null>(null); // ⭐ ADDED

  const handleFile = useCallback(
    async (f: File) => {
      const err = validate(f);
      if (err) { 
        toast({
          title: "Invalid file",
          description: err,
          variant: "destructive",
        });
        return;
      }

      setUploading(true);
      setCurrentFile(f);
      setProgress(10);

      try {
        // Your backend should return: { id: string } or { _id } or { fileId }
        const res = await uploadSingleFile(
          f,
          (pct?: number) => {
            if (typeof pct === "number" && !Number.isNaN(pct)) {
              setProgress(Math.max(10, Math.min(99, Math.round(pct))));
            }
          }
          // If your upload API supports AbortController:
          // , { signal: abortController.signal }
        );

        // Try common id shapes
        const fileId =
          res?.data?.id ?? res?.data?._id ?? res?.data?.fileId ?? res?.id ?? res?._id ?? res?.fileId;

        if (!fileId || typeof fileId !== "string") {
          throw new Error("Upload succeeded but no file id returned.");
        }

        setProgress(100);
        toast({
          title: "Upload complete",
          description: `${f.name} uploaded successfully.`,
        });

        // Invoke callback
        onUploaded?.({ fileId, file: f, response: res });

        // ⭐ CHANGED: Always show the dialog after upload.
        // We also remember the target to use if the user chooses "Stay Logged Out".
        if (navigateOnSuccess) {
          const target = buildTargetUrl(fileId);
          if (target) {
            setPostUploadTarget(target);     // ⭐ ADDED
            setShowLoginDialog(true);        // ⭐ ADDED (always show)
          }
        }

        // (Keeping your original logic commented as-is; not removing any code)
        // // Navigate if enabled
        // if (navigateOnSuccess) {
        //   const target = buildTargetUrl(fileId);
        //   if (target) {
        //     navigate(target, { replace: false });
        //   }
        // }

        // // Navigate if enabled
        // if (navigateOnSuccess) {
        //   const target = buildTargetUrl(fileId);
        //   if (target) {
        //     const isLoggedIn = Boolean(localStorage.getItem("authToken"));

        //     if (isLoggedIn) {
        //       navigate(target, { replace: false });
        //     } else {
        //       // Instead of toast, show dialog
        //       setShowLoginDialog(true);
        //     }
        //   }
        // }

      } catch (e: any) {
        const message =
          e?.response?.data?.detail ||
          e?.response?.data?.message ||
          e?.message ||
          "Upload failed.";
        toast({
          title: "Upload failed",
          description: message,
          variant: "destructive",
        });
        setUploading(false);
        setProgress(0);
        setCurrentFile(null);
      }
    },
    [accept, maxFileSize, navigate, navigateOnSuccess, buildTargetUrl, onUploaded, toast]
  );

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (uploading) return;

    const f = e.dataTransfer?.files?.[0];
    if (f) handleFile(f);
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
    // allow reselecting the same file
    e.target.value = "";
  };

  return (
    <div className="animate-fade-in-up">
      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Login Required</DialogTitle>
            <DialogDescription>
              You need to log in to view your uploaded file. Would you like to log in now?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowLoginDialog(false);
                // ⭐ ADDED: If user stays logged out, go to the target if enabled
                if (navigateOnSuccess && postUploadTarget) {
                  navigate(postUploadTarget, { replace: false });
                }
              }}
            >
              Stay Logged Out
            </Button>
            <Button
              onClick={() => {
                setShowLoginDialog(false);
                navigate("/login");
              }}
            >
              Log In
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="mb-3">
        <h3 className="text-base font-semibold text-foreground">{label}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{helperText}</p>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!uploading) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => !uploading && inputRef.current?.click()}
        className={[
          "relative cursor-pointer rounded-2xl border-2 border-dashed p-6 md:p-8 text-center transition-all duration-300",
          "bg-background/40 backdrop-blur-sm",
          dragOver
            ? "border-primary/70 ring-4 ring-primary/10 scale-[1.01]"
            : "border-border hover:border-primary/40",
          uploading ? "opacity-90" : "",
        ].join(" ")}
        role="button"
        tabIndex={0}
        onKeyDown={(e) =>
          (e.key === "Enter" || e.key === " ") && !uploading && inputRef.current?.click()
        }
        aria-label="Dropzone for uploading a file"
        aria-disabled={uploading}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={onInputChange}
          className="hidden"
          aria-hidden="true"
          tabIndex={-1}
        />

        {!uploading ? (
          <div className="flex flex-col items-center gap-4">
            <div className="rounded-full bg-accent p-4 shadow-inner">
              <Upload className="h-8 w-8 text-primary" />
            </div>
            <div>
              <p className="text-base font-medium text-foreground">Drag and drop your file here</p>
              <p className="mt-1 text-sm text-muted-foreground">or click to browse</p>
              <p className="mt-2 text-xs text-muted-foreground">
                Allowed: <span className="font-mono">{accept}</span> • Max {formatBytes(maxFileSize)}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <Upload className="h-8 w-8 animate-pulse text-primary" />
            <div className="w-full max-w-md">
              <div className="mb-2 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>Uploading…</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                {currentFile && (
                  <div className="mt-1 truncate">
                    <span className="font-medium text-foreground">{currentFile.name}</span>
                    <span className="ml-2">• {formatBytes(currentFile.size)}</span>
                  </div>
                )}
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted" aria-hidden>
                <div
                  className="h-full rounded-full bg-primary transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            <div className="sr-only" aria-live="polite">
              {`Uploading ${currentFile?.name ?? "file"} ${Math.round(progress)} percent`}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
