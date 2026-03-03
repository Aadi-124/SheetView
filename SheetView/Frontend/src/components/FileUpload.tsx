





// // // import { useState, useCallback, useRef } from "react";
// // // import { Upload, FileSpreadsheet, X, AlertCircle, LogIn } from "lucide-react";
// // // import { useToast } from "@/hooks/use-toast";
// // // import { uploadFile, fetchData } from "../services/BackendAPIs";

// // // interface FileUploadProps {
// // //   onFileLoaded: (data: Record<string, any>[]) => void;
// // // }

// // // const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// // // export function FileUpload({ onFileLoaded }: FileUploadProps) {
// // //   const [dragOver, setDragOver] = useState(false);
// // //   const [file, setFile] = useState<File | null>(null);
// // //   const [uploading, setUploading] = useState(false);
// // //   const [progress, setProgress] = useState(0);
// // //   const [error, setError] = useState<string | null>(null);
// // //   const inputRef = useRef<HTMLInputElement>(null);
// // //   const { toast } = useToast();

// // //   const validateFile = (f: File): string | null => {
// // //     if (!f) return "No file selected.";
// // //     if (!f.name.endsWith(".xlsx")) return "Only .xlsx files are allowed.";
// // //     if (f.size === 0) return "File is empty.";
// // //     if (f.size > MAX_FILE_SIZE)
// // //       return `File exceeds 5MB limit (${(f.size / 1024 / 1024).toFixed(1)}MB).`;
// // //     return null;
// // //   };

// // //   const formatSize = (bytes: number) => {
// // //     if (bytes < 1024) return bytes + " B";
// // //     if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
// // //     return (bytes / (1024 * 1024)).toFixed(1) + " MB";
// // //   };

// // //   const handleFile = useCallback(
// // //     async (f: File) => {
// // //       setError(null);
// // //       const validationError = validateFile(f);
// // //       if (validationError) {
// // //         setError(validationError);
// // //         setFile(null);
// // //         return;
// // //       }

// // //       setFile(f);
// // //       setUploading(true);
// // //       setProgress(10);

// // //       try {
// // //         // 1️⃣ Upload file

// // //         await uploadFile(f);
// // //         setProgress(60);


// // //         // 2️⃣ Fetch first page of data
// // //         const dataJson = await fetchData(1, 100);
// // //         setProgress(100);

// // //         setTimeout(() => {
// // //           setUploading(false);
// // //           onFileLoaded(dataJson.data);

// // //           toast({
// // //             title: "Upload successful",
// // //             description: `${f.name} loaded with ${dataJson.total_records} rows.`,
// // //           });
// // //         }, 300);
// // //       } catch (err: any) {
// // //         setUploading(false);
// // //         setProgress(0);
// // //         setFile(null);

// // //         const message = err?.response?.data?.detail || err?.message || "Upload failed.";

// // //         setError(message);

// // //         toast({
// // //           title: "Upload failed",
// // //           description: message,
// // //           variant: "destructive",
// // //         });
// // //       }
// // //     },
// // //     [onFileLoaded, toast]
// // //   );

// // //   const onDrop = useCallback(
// // //     (e: React.DragEvent) => {
// // //       e.preventDefault();
// // //       setDragOver(false);
// // //       const f = e.dataTransfer.files[0];
// // //       if (f) handleFile(f);
// // //     },
// // //     [handleFile]
// // //   );

// // //   const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
// // //     const f = e.target.files?.[0];
// // //     if (f) handleFile(f);
// // //     e.target.value = "";
// // //   };

// // //   const clearFile = () => {
// // //     setFile(null);
// // //     setError(null);
// // //     setProgress(0);
// // //   };
// // //   return (
// // //     <div className="animate-fade-in-up">
// // //       <div
// // //         onDragOver={(e) => {
// // //           e.preventDefault();
// // //           setDragOver(true);
// // //         }}
// // //         onDragLeave={() => setDragOver(false)}
// // //         onDrop={onDrop}
// // //         onClick={() => !uploading && inputRef.current?.click()}
// // //         className={`
// // //           relative cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-all duration-300
// // //           ${
// // //             dragOver
// // //               ? "border-primary bg-accent scale-[1.01]"
// // //               : "border-border hover:border-primary/50 hover:bg-accent/50"
// // //           }
// // //           ${error ? "border-destructive/50" : ""}
// // //         `}
// // //       >
// // //         <input
// // //           ref={inputRef}
// // //           type="file"
// // //           accept=".xlsx"
// // //           onChange={onInputChange}
// // //           className="hidden"
// // //         />

// // //         {!file && !uploading && (
// // //           <div className="flex flex-col items-center gap-3">
// // //             <div className="rounded-full bg-accent p-4">
// // //               <Upload className="h-8 w-8 text-primary" />
// // //             </div>
// // //             <div>
// // //               <p className="text-base font-medium text-foreground">
// // //                 Drag & drop your Excel file here
// // //               </p>
// // //               <p className="mt-1 text-sm text-muted-foreground">
// // //                 or click to browse • .xlsx only • max 5MB
// // //               </p>
// // //             </div>
// // //           </div>
// // //         )}

// // //         {file && !uploading && (
// // //           <div className="flex items-center justify-center gap-3">
// // //             <FileSpreadsheet className="h-6 w-6 text-primary" />
// // //             <div className="text-left">
// // //               <p className="text-sm font-medium text-foreground">
// // //                 {file.name}
// // //               </p>
// // //               <p className="text-xs text-muted-foreground">
// // //                 {formatSize(file.size)}
// // //               </p>
// // //             </div>
// // //             <button
// // //               onClick={(e) => {
// // //                 e.stopPropagation();
// // //                 clearFile();
// // //               }}
// // //               className="ml-2 rounded-full p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
// // //             >
// // //               <X className="h-4 w-4" />
// // //             </button>
// // //           </div>
// // //         )}

// // //         {uploading && (
// // //           <div className="flex flex-col items-center gap-3">
// // //             <FileSpreadsheet className="h-8 w-8 text-primary animate-pulse" />
// // //             <div className="w-full max-w-xs">
// // //               <div className="mb-1 flex justify-between text-xs text-muted-foreground">
// // //                 <span>Uploading {file?.name}</span>
// // //                 <span>{Math.round(progress)}%</span>
// // //               </div>
// // //               <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
// // //                 <div
// // //                   className="h-full rounded-full bg-primary transition-all duration-300 ease-out"
// // //                   style={{ width: `${progress}%` }}
// // //                 />
// // //               </div>
// // //             </div>
// // //           </div>
// // //         )}
// // //       </div>

// // //       {error && (
// // //         <div className="mt-3 flex items-center gap-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive animate-fade-in">
// // //           <AlertCircle className="h-4 w-4 flex-shrink-0" />
// // //           <span>{error}</span>
// // //         </div>
// // //       )}
// // //     </div>
// // //   );
// // // }






// // import { useState, useCallback, useRef, useEffect } from "react";
// // import {
// //   Upload,
// //   X,
// //   AlertCircle,
// //   File as FileIcon,
// //   FileImage,
// //   FileVideo,
// //   FileAudio,
// //   FileArchive,
// //   FileText,
// //   FileSpreadsheet,
// //   FileCode,
// // } from "lucide-react";
// // import { useToast } from "@/hooks/use-toast";
// // import { uploadSingleFile, fetchData } from "../services/BackendAPIs.js";

// // interface FileUploadProps {
// //   /** Called only for .xlsx files after fetchData returns rows */
// //   onFileLoaded?: (data: Record<string, any>[]) => void;
// //   /** Max file size in bytes (default: 5MB) */
// //   maxFileSize?: number;
// //   /** Input accept string, defaults to any */
// //   accept?: string;
// //   /** Display label above dropzone */
// //   label?: string;
// //   /** Helper text below label */
// //   helperText?: string;
// //   /** Show preview for image files */
// //   showImagePreview?: boolean;
// // }

// // /** Default: 5MB */
// // const DEFAULT_MAX_FILE_SIZE = 5 * 1024 * 1024;

// // type FileCategory =
// //   | "image"
// //   | "video"
// //   | "audio"
// //   | "archive"
// //   | "spreadsheet"
// //   | "text"
// //   | "code"
// //   | "pdf"
// //   | "other";

// // function formatSize(bytes: number) {
// //   if (bytes < 1024) return bytes + " B";
// //   if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
// //   return (bytes / (1024 * 1024)).toFixed(1) + " MB";
// // }

// // function getFileCategory(f: File): FileCategory {
// //   const t = (f.type || "").toLowerCase();
// //   const name = f.name.toLowerCase();

// //   if (t.startsWith("image/")) return "image";
// //   if (t.startsWith("video/")) return "video";
// //   if (t.startsWith("audio/")) return "audio";
// //   if (t === "application/pdf" || name.endsWith(".pdf")) return "pdf";
// //   if (
// //     [
// //       ".zip",
// //       ".rar",
// //       ".7z",
// //       ".tar",
// //       ".gz",
// //       ".bz2",
// //       ".xz",
// //       ".tgz",
// //       ".tar.gz",
// //     ].some((ext) => name.endsWith(ext))
// //   )
// //     return "archive";
// //   if (
// //     ["application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"].includes(t) ||
// //     [".xls", ".xlsx", ".csv"].some((ext) => name.endsWith(ext))
// //   )
// //     return "spreadsheet";
// //   if (
// //     t.startsWith("text/") ||
// //     [".txt", ".md", ".rtf", ".log"].some((ext) => name.endsWith(ext))
// //   )
// //     return "text";
// //   if (
// //     t.startsWith("application/json") ||
// //     [".json", ".js", ".ts", ".tsx", ".py", ".java", ".c", ".cpp", ".cs", ".rb", ".go", ".php", ".sql", ".html", ".css"].some(
// //       (ext) => name.endsWith(ext)
// //     )
// //   )
// //     return "code";

// //   return "other";
// // }

// // function getCategoryVisuals(category: FileCategory) {
// //   switch (category) {
// //     case "image":
// //       return { Icon: FileImage, chip: "bg-pink-50 text-pink-700", glow: "ring-pink-200", bar: "bg-pink-500" };
// //     case "video":
// //       return { Icon: FileVideo, chip: "bg-indigo-50 text-indigo-700", glow: "ring-indigo-200", bar: "bg-indigo-500" };
// //     case "audio":
// //       return { Icon: FileAudio, chip: "bg-teal-50 text-teal-700", glow: "ring-teal-200", bar: "bg-teal-500" };
// //     case "archive":
// //       return { Icon: FileArchive, chip: "bg-amber-50 text-amber-700", glow: "ring-amber-200", bar: "bg-amber-500" };
// //     case "spreadsheet":
// //       return { Icon: FileSpreadsheet, chip: "bg-emerald-50 text-emerald-700", glow: "ring-emerald-200", bar: "bg-emerald-500" };
// //     case "text":
// //       return { Icon: FileText, chip: "bg-slate-50 text-slate-700", glow: "ring-slate-200", bar: "bg-slate-500" };
// //     case "code":
// //       return { Icon: FileCode, chip: "bg-purple-50 text-purple-700", glow: "ring-purple-200", bar: "bg-purple-500" };
// //     case "pdf":
// //       return { Icon: FileText, chip: "bg-red-50 text-red-700", glow: "ring-red-200", bar: "bg-red-500" };
// //     default:
// //       return { Icon: FileIcon, chip: "bg-muted text-foreground", glow: "ring-accent", bar: "bg-primary" };
// //   }
// // }

// // export function FileUpload({
// //   onFileLoaded,
// //   maxFileSize = DEFAULT_MAX_FILE_SIZE,
// //   accept = "*/*",
// //   label = "Upload a file",
// //   helperText = "Drag & drop or click to browse. Any file type • max 5MB (configurable)",
// //   showImagePreview = true,
// // }: FileUploadProps) {
// //   const [dragOver, setDragOver] = useState(false);
// //   const [file, setFile] = useState<File | null>(null);
// //   const [uploading, setUploading] = useState(false);
// //   const [progress, setProgress] = useState(0);
// //   const [error, setError] = useState<string | null>(null);
// //   const [previewUrl, setPreviewUrl] = useState<string | null>(null);

// //   const inputRef = useRef<HTMLInputElement>(null);
// //   const { toast } = useToast();

// //   const validateFile = (f: File): string | null => {
// //     if (!f) return "No file selected.";
// //     if (f.size === 0) return "File is empty.";
// //     if (f.size > maxFileSize)
// //       return `File exceeds ${(maxFileSize / 1024 / 1024).toFixed(1)}MB limit (${(f.size / 1024 / 1024).toFixed(1)}MB).`;
// //     return null;
// //   };

// //   const handleFile = useCallback(
// //     async (f: File) => {
// //       setError(null);
// //       const validationError = validateFile(f);
// //       if (validationError) {
// //         setError(validationError);
// //         setFile(null);
// //         setPreviewUrl(null);
// //         return;
// //       }

// //       setFile(f);
// //       setUploading(true);
// //       setProgress(10);

// //       // Image preview (client-side only)
// //       const category = getFileCategory(f);
// //       if (category === "image" && showImagePreview) {
// //         const url = URL.createObjectURL(f);
// //         setPreviewUrl(url);
// //       } else {
// //         setPreviewUrl(null);
// //       }

// //       // try {
// //       // 1) Upload to backend (generic)
// //       await uploadSingleFile(f).then((res) => 
// //       {
// //         setProgress(70);

// //         // 2) If it's an Excel file, fetch first page of data and pass to onFileLoaded (to preserve existing behavior)
// //         if (f.name.toLowerCase().endsWith(".xlsx")) {
// //           const dataJson = fetchData(1, 100);
// //           setProgress(100);

// //           setTimeout(() => {
// //             setUploading(false);
// //             onFileLoaded?.(dataJson.data);

// //             toast({
// //               title: "Upload complete",
// //               description: `${f.name} uploaded. Parsed ${dataJson.total_records} rows.`,
// //             });
// //           }, 250);
// //         } else {
// //           // For non-Excel: finish gracefully without data parsing
// //           setProgress(100);
// //           setTimeout(() => {
// //             setUploading(false);
// //             toast({
// //               title: "Upload complete",
// //               description: `${f.name} (${formatSize(f.size)}) uploaded successfully.`,
// //             });
// //           }, 200);
// //         }
// //       }).catch((err)=>{
// //          setUploading(false);
// //       setProgress(0);
// //       setFile(null);
// //       setPreviewUrl(null);

// //       const message = err?.response?.data?.detail || err?.message || "Upload failed.";
// //       setError(message);

// //       toast({
// //         title: "Upload failed",
// //         description: message,
// //         variant: "destructive",
// //       });
// //     });

// //       // } catch (err: any) {
     
// //       // }
// //     },
// //     [maxFileSize, onFileLoaded, showImagePreview, toast]
// //   );

// //   const onDrop = useCallback(
// //     (e: React.DragEvent) => {
// //       e.preventDefault();
// //       setDragOver(false);
// //       const f = e.dataTransfer.files?.[0];
// //       if (f) handleFile(f);
// //     },
// //     [handleFile]
// //   );

// //   const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
// //     const f = e.target.files?.[0];
// //     if (f) handleFile(f);
// //     e.target.value = "";
// //   };

// //   const clearFile = () => {
// //     setFile(null);
// //     setError(null);
// //     setProgress(0);
// //     if (previewUrl) URL.revokeObjectURL(previewUrl);
// //     setPreviewUrl(null);
// //   };

// //   useEffect(() => {
// //     return () => {
// //       if (previewUrl) URL.revokeObjectURL(previewUrl);
// //     };
// //   }, [previewUrl]);

// //   const category = file ? getFileCategory(file) : "other";
// //   const visuals = getCategoryVisuals(category);
// //   const { Icon } = visuals;

// //   return (
// //     <div className="animate-fade-in-up">
// //       {/* Header */}
// //       <div className="mb-3">
// //         <h3 className="text-base font-semibold text-foreground">{label}</h3>
// //         <p className="mt-1 text-sm text-muted-foreground">{helperText}</p>
// //       </div>

// //       {/* Dropzone */}
// //       <div
// //         onDragOver={(e) => {
// //           e.preventDefault();
// //           setDragOver(true);
// //         }}
// //         onDragLeave={() => setDragOver(false)}
// //         onDrop={onDrop}
// //         onClick={() => !uploading && inputRef.current?.click()}
// //         className={[
// //           "relative cursor-pointer rounded-2xl border-2 border-dashed p-6 md:p-8 text-center transition-all duration-300",
// //           "bg-background/40 backdrop-blur-sm",
// //           dragOver ? `border-primary/70 ring-4 ${visuals.glow} scale-[1.01]` : "border-border hover:border-primary/40",
// //           error ? "border-destructive/50 ring-2 ring-destructive/20" : "",
// //         ].join(" ")}
// //         role="button"
// //         tabIndex={0}
// //         onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && !uploading && inputRef.current?.click()}
// //         aria-label="File upload dropzone"
// //       >
// //         <input
// //           ref={inputRef}
// //           type="file"
// //           accept={accept}
// //           onChange={onInputChange}
// //           className="hidden"
// //         />

// //         {/* Empty State */}
// //         {!file && !uploading && (
// //           <div className="flex flex-col items-center gap-4">
// //             <div className="rounded-full bg-accent p-4 shadow-inner">
// //               <Upload className="h-8 w-8 text-primary" />
// //             </div>
// //             <div>
// //               <p className="text-base font-medium text-foreground">
// //                 Drag & drop your file here
// //               </p>
// //               <p className="mt-1 text-sm text-muted-foreground">
// //                 or click to browse • accepts any file type
// //               </p>
// //             </div>
// //           </div>
// //         )}

// //         {/* File Selected */}
// //         {file && !uploading && (
// //           <div className="flex flex-col items-center gap-4 md:flex-row md:justify-center">
// //             {/* Thumbnail (images only) */}
// //             {previewUrl ? (
// //               <div className="relative h-20 w-20 overflow-hidden rounded-xl ring-1 ring-border">
// //                 <img
// //                   src={previewUrl}
// //                   alt={file.name}
// //                   className="h-full w-full object-cover"
// //                 />
// //               </div>
// //             ) : (
// //               <div className="rounded-xl bg-accent p-3">
// //                 <Icon className="h-8 w-8 text-foreground/80" />
// //               </div>
// //             )}

// //             {/* Meta */}
// //             <div className="text-left">
// //               <div className="flex items-center gap-2">
// //                 <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${visuals.chip}`}>
// //                   <Icon className="h-3.5 w-3.5" />
// //                   {category.toUpperCase()}
// //                 </span>
// //                 <span className="text-xs text-muted-foreground">{file.type || "Unknown type"}</span>
// //               </div>
// //               <p className="mt-1 truncate text-sm font-medium text-foreground max-w-[28ch] md:max-w-[44ch]" title={file.name}>
// //                 {file.name}
// //               </p>
// //               <p className="text-xs text-muted-foreground">{formatSize(file.size)}</p>
// //             </div>

// //             {/* Clear */}
// //             <button
// //               onClick={(e) => {
// //                 e.stopPropagation();
// //                 clearFile();
// //               }}
// //               className="ml-2 rounded-full p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
// //               aria-label="Clear selected file"
// //             >
// //               <X className="h-4 w-4" />
// //             </button>
// //           </div>
// //         )}

// //         {/* Uploading */}
// //         {uploading && (
// //           <div className="flex flex-col items-center gap-3">
// //             <Icon className="h-8 w-8 animate-pulse text-primary" />
// //             <div className="w-full max-w-md">
// //               <div className="mb-1 flex justify-between text-xs text-muted-foreground">
// //                 <span>Uploading {file?.name}</span>
// //                 <span>{Math.round(progress)}%</span>
// //               </div>
// //               <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
// //                 <div
// //                   className={`h-full rounded-full transition-all duration-300 ease-out ${visuals.bar}`}
// //                   style={{ width: `${progress}%` }}
// //                 />
// //               </div>
// //             </div>
// //           </div>
// //         )}
// //       </div>

// //       {/* Error */}
// //       {error && (
// //         <div className="mt-3 flex items-center gap-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive animate-fade-in">
// //           <AlertCircle className="h-4 w-4 flex-shrink-0" />
// //           <span>{error}</span>
// //         </div>
// //       )}
// //     </div>
// //   );
// // }

























// import { useState, useCallback, useRef, useEffect } from "react";
// import {
//   Upload,
//   X,
//   AlertCircle,
//   File as FileIcon,
//   FileImage,
//   FileVideo,
//   FileAudio,
//   FileArchive,
//   FileText,
//   FileSpreadsheet,
//   FileCode,
//   ArrowLeft,
// } from "lucide-react";
// import { useToast } from "@/hooks/use-toast";
// import { uploadSingleFile, fetchData } from "../services/BackendAPIs.js";

// // ─── Import your editors ───────────────────────────────────────────────────────
// // import ExcelEditor from "./editors/ExcelEditor";
// import ExcelEditor from "./editors/ExcelEditor";
// import WordEditor from "./editors/WordEditor";
// import CodeEditor from "./editors/CodeEditor";
// import PDFViewer from "./editors/PDFViewer";
// import ImageViewer from "./editors/ImageViewer";

// interface FileUploadProps {
//   onFileLoaded?: (data: Record<string, any>[]) => void;
//   maxFileSize?: number;
//   accept?: string;
//   label?: string;
//   helperText?: string;
//   showImagePreview?: boolean;
// }

// const DEFAULT_MAX_FILE_SIZE = 5 * 1024 * 1024;

// type FileCategory =
//   | "image"
//   | "video"
//   | "audio"
//   | "archive"
//   | "spreadsheet"
//   | "text"
//   | "code"
//   | "pdf"
//   | "other";

// type EditorType = "excel" | "word" | "pdf" | "image" | "code" | null;

// function formatSize(bytes: number) {
//   if (bytes < 1024) return bytes + " B";
//   if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
//   return (bytes / (1024 * 1024)).toFixed(1) + " MB";
// }

// function getFileCategory(f: File): FileCategory {
//   const t = (f.type || "").toLowerCase();
//   const name = f.name.toLowerCase();
//   if (t.startsWith("image/")) return "image";
//   if (t.startsWith("video/")) return "video";
//   if (t.startsWith("audio/")) return "audio";
//   if (t === "application/pdf" || name.endsWith(".pdf")) return "pdf";
//   if ([".zip", ".rar", ".7z", ".tar", ".gz", ".bz2", ".xz", ".tgz", ".tar.gz"].some((ext) => name.endsWith(ext)))
//     return "archive";
//   if (
//     ["application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"].includes(t) ||
//     [".xls", ".xlsx", ".csv"].some((ext) => name.endsWith(ext))
//   )
//     return "spreadsheet";
//   if (t.startsWith("text/") || [".txt", ".md", ".rtf", ".log"].some((ext) => name.endsWith(ext)))
//     return "text";
//   if (
//     t.startsWith("application/json") ||
//     [".json", ".js", ".ts", ".tsx", ".py", ".java", ".c", ".cpp", ".cs", ".rb", ".go", ".php", ".sql", ".html", ".css"].some(
//       (ext) => name.endsWith(ext)
//     )
//   )
//     return "code";
//   return "other";
// }

// // ─── Map category → which editor to open ──────────────────────────────────────
// function getEditorType(f: File): EditorType {
//   const name = f.name.toLowerCase();
//   const category = getFileCategory(f);

//   if ([".xls", ".xlsx", ".csv"].some((ext) => name.endsWith(ext))) return "excel";
//   if ([".doc", ".docx", ".txt", ".rtf", ".md"].some((ext) => name.endsWith(ext))) return "word";
//   if (name.endsWith(".pdf")) return "pdf";
//   if (category === "image") return "image";
//   if (category === "code" || category === "text") return "code";

//   return null; // video, audio, archive → no editor, just show download
// }

// function getCategoryVisuals(category: FileCategory) {
//   switch (category) {
//     case "image":      return { Icon: FileImage,       chip: "bg-pink-50 text-pink-700",     glow: "ring-pink-200",    bar: "bg-pink-500" };
//     case "video":      return { Icon: FileVideo,        chip: "bg-indigo-50 text-indigo-700", glow: "ring-indigo-200",  bar: "bg-indigo-500" };
//     case "audio":      return { Icon: FileAudio,        chip: "bg-teal-50 text-teal-700",     glow: "ring-teal-200",    bar: "bg-teal-500" };
//     case "archive":    return { Icon: FileArchive,      chip: "bg-amber-50 text-amber-700",   glow: "ring-amber-200",   bar: "bg-amber-500" };
//     case "spreadsheet":return { Icon: FileSpreadsheet,  chip: "bg-emerald-50 text-emerald-700",glow:"ring-emerald-200", bar: "bg-emerald-500" };
//     case "text":       return { Icon: FileText,         chip: "bg-slate-50 text-slate-700",   glow: "ring-slate-200",   bar: "bg-slate-500" };
//     case "code":       return { Icon: FileCode,         chip: "bg-purple-50 text-purple-700", glow: "ring-purple-200",  bar: "bg-purple-500" };
//     case "pdf":        return { Icon: FileText,         chip: "bg-red-50 text-red-700",       glow: "ring-red-200",     bar: "bg-red-500" };
//     default:           return { Icon: FileIcon,         chip: "bg-muted text-foreground",     glow: "ring-accent",      bar: "bg-primary" };
//   }
// }

// // ─── Editor renderer ───────────────────────────────────────────────────────────
// function renderEditor(editorType: EditorType, file: File) {
//   switch (editorType) {
//     case "excel": return <ExcelEditor file={file} />;
//     case "word":  return <WordEditor file={file} />;
//     case "pdf":   return <PDFViewer file={file} />;
//     case "image": return <ImageViewer file={file} />;
//     case "code":  return <CodeEditor file={file} />;
//     default:
//       // Unsupported type — show a simple download card
//       return (
//         <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground" >
//           <FileIcon className="h-16 w-16 opacity-40" />
//           <p className="text-lg font-medium">{file.name}</p>
//           <p className="text-sm">No preview available for this file type.</p>
//           <a
//             href={URL.createObjectURL(file)}
//             download={file.name}
//             className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-white hover:opacity-90"
            
//           >
//             ⬇ Download File
//           </a>
//         </div>
//       );
//   }
// }

// // ─── Main Component ────────────────────────────────────────────────────────────
// export function FileUpload({
//   onFileLoaded,
//   maxFileSize = DEFAULT_MAX_FILE_SIZE,
//   accept = "*/*",
//   label = "Upload a file",
//   helperText = "Drag & drop or click to browse. Any file type • max 5MB (configurable)",
//   showImagePreview = true,
// }: FileUploadProps) {
//   const [dragOver, setDragOver]       = useState(false);
//   const [file, setFile]               = useState<File | null>(null);
//   const [uploading, setUploading]     = useState(false);
//   const [progress, setProgress]       = useState(0);
//   const [error, setError]             = useState<string | null>(null);
//   const [previewUrl, setPreviewUrl]   = useState<string | null>(null);
//   const [editorType, setEditorType]   = useState<EditorType>(null);
//   const [showEditor, setShowEditor]   = useState(false);  // ← controls editor view

//   const inputRef = useRef<HTMLInputElement>(null);
//   const { toast } = useToast();

//   const validateFile = (f: File): string | null => {
//     if (!f) return "No file selected.";
//     if (f.size === 0) return "File is empty.";
//     if (f.size > maxFileSize)
//       return `File exceeds ${(maxFileSize / 1024 / 1024).toFixed(1)}MB limit (${(f.size / 1024 / 1024).toFixed(1)}MB).`;
//     return null;
//   };


//   const handleFile = useCallback(
//   async (f: File) => {
//     setError(null);
//     const validationError = validateFile(f);
//     if (validationError) {
//       setError(validationError);
//       setFile(null);
//       setPreviewUrl(null);
//       return;
//     }

//     setFile(f);
//     setUploading(true);
//     setProgress(10);

//     const category = getFileCategory(f);
//     if (category === "image" && showImagePreview) {
//       setPreviewUrl(URL.createObjectURL(f));
//     } else {
//       setPreviewUrl(null);
//     }

//     await uploadSingleFile(f)
//       .then(() => {
//         setProgress(100);
//         setTimeout(() => {
//           setUploading(false);

//           const type = getEditorType(f);
//           setEditorType(type);
//           setShowEditor(true);

//           toast({
//             title: "Upload complete",
//             description: `${f.name} (${formatSize(f.size)}) uploaded successfully.`,
//           });
//         }, 200);
//       })
//       .catch((err) => {
//         setUploading(false);
//         setProgress(0);
//         setFile(null);
//         setPreviewUrl(null);
//         const message = err?.response?.data?.detail || err?.message || "Upload failed.";
//         setError(message);
//         toast({ title: "Upload failed", description: message, variant: "destructive" });
//       });
//   },
//   [maxFileSize, showImagePreview, toast]  // ← removed onFileLoaded since fetchData is gone
// );




//   const onDrop = useCallback(
//     (e: React.DragEvent) => {
//       e.preventDefault();
//       setDragOver(false);
//       const f = e.dataTransfer.files?.[0];
//       if (f) handleFile(f);
//     },
//     [handleFile]
//   );

//   const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const f = e.target.files?.[0];
//     if (f) handleFile(f);
//     e.target.value = "";
//   };

//   const clearFile = () => {
//     setFile(null);
//     setError(null);
//     setProgress(0);
//     setShowEditor(false);
//     setEditorType(null);
//     if (previewUrl) URL.revokeObjectURL(previewUrl);
//     setPreviewUrl(null);
//   };

//   useEffect(() => {
//     return () => { if (previewUrl) URL.revokeObjectURL(previewUrl); };
//   }, [previewUrl]);

//   const category = file ? getFileCategory(file) : "other";
//   const visuals  = getCategoryVisuals(category);
//   const { Icon } = visuals;

//   // ─── Editor View ─────────────────────────────────────────────────────────────
//   if (showEditor && file) {
//     return (
//       <div className="flex flex-col h-full" >
//         {/* Top bar */}
//         <div className="flex items-center gap-3 px-4 py-2 border-b bg-background shrink-0">
//           <span className={`ml-auto inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${visuals.chip}`}>
//             <Icon className="h-3 w-3" />
//             {category.toUpperCase()}
//           </span>
//         </div>

//         {/* Editor — fills remaining height */}
//         <div className="flex-1 overflow-hidden">
//           {renderEditor(editorType, file)}
//         </div>
//       </div>
//     );
//   }

//   // ─── Upload View ──────────────────────────────────────────────────────────────
//   return (
//     <div className="animate-fade-in-up">
//       <div className="mb-3">
//         <h3 className="text-base font-semibold text-foreground">{label}</h3>
//         <p className="mt-1 text-sm text-muted-foreground">{helperText}</p>
//       </div>

//       <div
//         onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
//         onDragLeave={() => setDragOver(false)}
//         onDrop={onDrop}
//         onClick={() => !uploading && inputRef.current?.click()}
//         className={[
//           "relative cursor-pointer rounded-2xl border-2 border-dashed p-6 md:p-8 text-center transition-all duration-300",
//           "bg-background/40 backdrop-blur-sm",
//           dragOver ? `border-primary/70 ring-4 ${visuals.glow} scale-[1.01]` : "border-border hover:border-primary/40",
//           error ? "border-destructive/50 ring-2 ring-destructive/20" : "",
//         ].join(" ")}
//         role="button"
//         tabIndex={0}
//         onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && !uploading && inputRef.current?.click()}
//         aria-label="File upload dropzone"
//       >
//         <input ref={inputRef} type="file" accept={accept} onChange={onInputChange} className="hidden" />

//         {/* Empty State */}
//         {!file && !uploading && (
//           <div className="flex flex-col items-center gap-4">
//             <div className="rounded-full bg-accent p-4 shadow-inner">
//               <Upload className="h-8 w-8 text-primary" />
//             </div>
//             <div>
//               <p className="text-base font-medium text-foreground">Drag & drop your file here</p>
//               <p className="mt-1 text-sm text-muted-foreground">or click to browse • accepts any file type</p>
//             </div>
//           </div>
//         )}

//         {/* File Selected */}
//         {file && !uploading && (
//           <div className="flex flex-col items-center gap-4 md:flex-row md:justify-center">
//             {previewUrl ? (
//               <div className="relative h-20 w-20 overflow-hidden rounded-xl ring-1 ring-border">
//                 <img src={previewUrl} alt={file.name} className="h-full w-full object-cover" />
//               </div>
//             ) : (
//               <div className="rounded-xl bg-accent p-3">
//                 <Icon className="h-8 w-8 text-foreground/80" />
//               </div>
//             )}
//             <div className="text-left">
//               <div className="flex items-center gap-2">
//                 <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${visuals.chip}`}>
//                   <Icon className="h-3.5 w-3.5" />
//                   {category.toUpperCase()}
//                 </span>
//                 <span className="text-xs text-muted-foreground">{file.type || "Unknown type"}</span>
//               </div>
//               <p className="mt-1 truncate text-sm font-medium text-foreground max-w-[28ch] md:max-w-[44ch]" title={file.name}>
//                 {file.name}
//               </p>
//               <p className="text-xs text-muted-foreground">{formatSize(file.size)}</p>
//             </div>
//             <button
//               onClick={(e) => { e.stopPropagation(); clearFile(); }}
//               className="ml-2 rounded-full p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
//               aria-label="Clear selected file"
//             >
//               <X className="h-4 w-4" />
//             </button>
//           </div>
//         )}

//         {/* Uploading */}
//         {uploading && (
//           <div className="flex flex-col items-center gap-3">
//             <Icon className="h-8 w-8 animate-pulse text-primary" />
//             <div className="w-full max-w-md">
//               <div className="mb-1 flex justify-between text-xs text-muted-foreground">
//                 <span>Uploading {file?.name}</span>
//                 <span>{Math.round(progress)}%</span>
//               </div>
//               <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
//                 <div
//                   className={`h-full rounded-full transition-all duration-300 ease-out ${visuals.bar}`}
//                   style={{ width: `${progress}%` }}
//                 />
//               </div>
//             </div>
//           </div>
//         )}
//       </div>

//       {error && (
//         <div className="mt-3 flex items-center gap-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive animate-fade-in">
//           <AlertCircle className="h-4 w-4 flex-shrink-0" />
//           <span>{error}</span>
//         </div>
//       )}
//     </div>
//   );
// }












// components/FileUpload.tsx
import { useState, useCallback, useRef } from "react";
import { Upload, X, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { uploadSingleFile } from "../services/BackendAPIs"; // keep your existing import

// components/FileUpload.tsx
export interface FileUploadProps {
  onUploadComplete: (file: File, serverMeta?: any) => void;
  maxFileSize?: number;
  accept?: string;
  label?: string;
  helperText?: string;
}


const DEFAULT_MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function FileUpload({
  onUploadComplete,
  maxFileSize = DEFAULT_MAX_FILE_SIZE,
  accept = "*/*",
  label = "Upload a file",
  helperText = "Drag and drop or click to browse • any file type • max 5MB (configurable)",
}: FileUploadProps) {
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const validateFile = (f: File): string | null => {
    if (!f) return "No file selected.";
    if (f.size === 0) return "File is empty.";
    if (f.size > maxFileSize) {
      return `File exceeds ${(maxFileSize / 1024 / 1024).toFixed(1)}MB limit (${(f.size / 1024 / 1024).toFixed(1)}MB).`;
    }
    return null;
  };

  const handleFile = useCallback(
    async (f: File) => {
      setError(null);

      const validationError = validateFile(f);
      if (validationError) {
        setError(validationError);
        setFile(null);
        return;
      }

      setFile(f);
      setUploading(true);
      setProgress(10);

      try {
        // Upload to backend; keep your implementation of uploadSingleFile
        const res = await uploadSingleFile(f, (pct?: number) => {
          if (typeof pct === "number") setProgress(Math.max(10, Math.min(99, Math.round(pct))));
        });

        setProgress(100);
        setTimeout(() => {
          setUploading(false);
          toast({
            title: "Upload complete",
            description: `${f.name} (${formatSize(f.size)}) uploaded successfully.`,
          });
          // Hand off the raw File and optional server response to the parent
          onUploadComplete(f, res);
        }, 200);
      } catch (err: any) {
        setUploading(false);
        setProgress(0);
        setFile(null);
        const message = err?.response?.data?.detail || err?.message || "Upload failed.";
        setError(message);
        toast({ title: "Upload failed", description: message, variant: "destructive" });
      }
    },
    [maxFileSize, onUploadComplete, toast]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const f = e.dataTransfer.files?.[0];
      if (f) handleFile(f);
    },
    [handleFile]
  );

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
    // reset input value to allow reselecting the same file
    e.target.value = "";
  };

  const clearFile = () => {
    setFile(null);
    setError(null);
    setProgress(0);
  };

  return (
    <div className="animate-fade-in-up">
      {/* Header */}
      <div className="mb-3">
        <h3 className="text-base font-semibold text-foreground">{label}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{helperText}</p>
      </div>

      {/* Dropzone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => !uploading && inputRef.current?.click()}
        className={[
          "relative cursor-pointer rounded-2xl border-2 border-dashed p-6 md:p-8 text-center transition-all duration-300",
          "bg-background/40 backdrop-blur-sm",
          dragOver ? "border-primary/70 ring-4 ring-primary/10 scale-[1.01]" : "border-border hover:border-primary/40",
          error ? "border-destructive/50 ring-2 ring-destructive/20" : "",
        ].join(" ")}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && !uploading && inputRef.current?.click()}
        aria-label="File upload dropzone"
      >
        <input ref={inputRef} type="file" accept={accept} onChange={onInputChange} className="hidden" />

        {/* Empty State */}
        {!file && !uploading && (
          <div className="flex flex-col items-center gap-4">
            <div className="rounded-full bg-accent p-4 shadow-inner">
              <Upload className="h-8 w-8 text-primary" />
            </div>
            <div>
              <p className="text-base font-medium text-foreground">Drag and drop your file here</p>
              <p className="mt-1 text-sm text-muted-foreground">or click to browse</p>
            </div>
          </div>
        )}

        {/* File Selected (pre-upload or uploaded) */}
        {file && !uploading && (
          <div className="flex flex-col items-center gap-4 md:flex-row md:justify-center">
            <div className="rounded-xl bg-accent p-3">
              <Upload className="h-8 w-8 text-foreground/80" />
            </div>

            <div className="text-left">
              <p className="mt-1 truncate text-sm font-medium text-foreground max-w-[28ch] md:max-w-[44ch]" title={file.name}>
                {file.name}
              </p>
              <p className="text-xs text-muted-foreground">{formatSize(file.size)}</p>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                clearFile();
              }}
              className="ml-2 rounded-full p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
              aria-label="Clear selected file"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Uploading Progress */}
        {uploading && (
          <div className="flex flex-col items-center gap-3">
            <Upload className="h-8 w-8 animate-pulse text-primary" />
            <div className="w-full max-w-md">
              <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                <span>Uploading {file?.name}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mt-3 flex items-center gap-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive animate-fade-in">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}