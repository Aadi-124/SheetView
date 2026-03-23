import React, { useEffect, useRef, useState } from "react";
import { PDFDocument } from "pdf-lib";
import * as FabricNS from "fabric";
import { motion, AnimatePresence } from "framer-motion";
import {
  Maximize2,
  Minimize2,
  FileDown,
  Upload,
  Type as TypeIcon,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
} from "lucide-react";

// ---------- Types / Globals ----------
declare global {
  interface Window {
    pdfjsLib?: any;
  }
}
type FitMode = "width" | "page";

// Resolve fabric namespace robustly (fabric v5/v6, Vite/CJS/ESM)
const fabric: any =
  (FabricNS as any).fabric ??
  (FabricNS as any).default ??
  (FabricNS as any);

// Only zoom with Ctrl/Cmd + wheel (like GDrive). Set false to zoom on plain wheel.
const WHEEL_ZOOM_REQUIRES_MODIFIER = true;

export default function GlamPDFStudio({ file: initialFile }: { file?: File }) {
  // Core state
  const [file, setFile] = useState<File | null>(initialFile ?? null);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [numPages, setNumPages] = useState(0);
  const [activePage, setActivePage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Viewer state
  const [zoom, setZoom] = useState(1.0);
  const [fitMode, setFitMode] = useState<FitMode>("width");

  // 3‑dot menu
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Refs
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const pagesHostRef = useRef<HTMLDivElement | null>(null);

  const pagesRef = useRef<HTMLDivElement[]>([]);
  const bgCanvasRef = useRef<HTMLCanvasElement[]>([]);
  const fabricRefs = useRef<any[]>([]);
  const renderInfoRef = useRef<{ baseW: number; baseH: number }[]>([]);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Drag & drop
  const [isDragOver, setDragOver] = useState(false);
  const zoomPct = Math.round(zoom * 100);

  // Accept initial file only once
  useEffect(() => {
    if (initialFile && !file) setFile(initialFile);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialFile]);

  // Close kebab on outside click / Esc
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  // Load PDF on file change
  useEffect(() => {
    let cancelled = false;
    if (!file) return;

    (async () => {
      setError("");
      setLoading(true);

      teardownObserver();
      disposeFabrics();
      clearHost(pagesHostRef.current);
      pagesRef.current = [];
      bgCanvasRef.current = [];
      fabricRefs.current = [];
      renderInfoRef.current = [];

      if (!window.pdfjsLib) {
        setError(
          [
            "PDF.js not found. Add to index.html before your bundle:",
            "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js",
          ].join("\n")
        );
        setLoading(false);
        return;
      }

      try {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc =
          "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js";

        const ab = await file.arrayBuffer();
        const task = window.pdfjsLib.getDocument({ data: ab });
        const pdf = await task.promise;
        if (cancelled) return;

        setPdfDoc(pdf);
        setNumPages(pdf.numPages);

        await buildPageShells(pdf);
        setupIntersectionObserver(pdf);
        applyFit();
      } catch (e: any) {
        console.error(e);
        if (!cancelled) setError("Failed to load PDF – " + (e?.message || ""));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      teardownObserver();
      disposeFabrics();
      clearHost(pagesHostRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file]);

  // Mouse/trackpad wheel zoom (Ctrl/Cmd + wheel; pinch yields ctrlKey=true in Chromium)
  useEffect(() => {
    const root = scrollRef.current;
    if (!root) return;

    const onWheel = (e: WheelEvent) => {
      const modifierPressed = e.ctrlKey || e.metaKey;
      if (WHEEL_ZOOM_REQUIRES_MODIFIER && !modifierPressed) return;

      e.preventDefault();
      const factor = e.deltaY > 0 ? 0.9 : 1.1;
      setZoom((z) => clamp(snapZoom(z * factor), 0.5, 3));
    };

    root.addEventListener("wheel", onWheel, { passive: false });
    return () => root.removeEventListener("wheel", onWheel as any);
  }, []);

  // Re-apply fit on container resize / pages ready
  useEffect(() => {
    if (!scrollRef.current || !renderInfoRef.current.length) return;
    const ro = new ResizeObserver(() => applyFit());
    ro.observe(scrollRef.current);
    applyFit();
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fitMode, numPages]);

  // Re-render pages at new zoom
  useEffect(() => {
    if (!pdfDoc || !numPages) return;

    // "Google Drive" feel: keep page width consistent and centered
    for (let i = 0; i < pagesRef.current.length; i++) {
      const info = renderInfoRef.current[i];
      const outer = pagesRef.current[i];
      if (!info || !outer) continue;
      outer.style.width = `${info.baseW * zoom}px`;
      outer.style.height = `${info.baseH * zoom}px`;
    }

    for (let i = 0; i < numPages; i++) {
      renderPageAtZoom(pdfDoc, i).catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoom]);

  // ----- Builders -----
  const buildPageShells = async (pdf: any) => {
    clearHost(pagesHostRef.current);

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const vp = page.getViewport({ scale: 1 });
      const baseW = vp.width;
      const baseH = vp.height;
      renderInfoRef.current[i - 1] = { baseW, baseH };

      // OUTER wrapper (Google Drive-like look)
      const outer = document.createElement("div");
      outer.className =
        "relative mx-auto my-4 rounded-lg border border-black/5 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.12)] overflow-hidden";
      outer.style.width = `${baseW * zoom}px`;
      outer.style.height = `${baseH * zoom}px`;

      // Background canvas (PDF raster)
      const bg = document.createElement("canvas");
      bg.className = "block select-none";

      // Overlay canvas (Fabric)
      const overlay = document.createElement("canvas");
      overlay.width = baseW;
      overlay.height = baseH;
      overlay.style.width = "100%";
      overlay.style.height = "100%";
      overlay.className = "absolute inset-0";

      outer.appendChild(bg);
      outer.appendChild(overlay);
      pagesHostRef.current?.appendChild(outer);

      pagesRef.current[i - 1] = outer;
      bgCanvasRef.current[i - 1] = bg as HTMLCanvasElement;

      outer.addEventListener("click", () => setActivePage(i - 1));

      const f = new fabric.Canvas(overlay, {
        selection: true,
        preserveObjectStacking: true,
      });
      (fabric.Object as any).prototype.transparentCorners = false;
      (fabric.Object as any).prototype.cornerColor = "#60a5fa";
      (fabric.Object as any).prototype.cornerStyle = "circle";
      (fabric.Object as any).prototype.cornerSize = 10;
      (fabric.Object as any).prototype.borderColor = "#60a5fa";
      fabricRefs.current[i - 1] = f;

      await renderPageAtZoom(pdf, i - 1);
    }
  };

  const renderPageAtZoom = async (pdf: any, index: number) => {
    const pageNum = index + 1;
    const page = await pdf.getPage(pageNum);
    const info = renderInfoRef.current[index];
    if (!info) return;

    const dpr = window.devicePixelRatio || 1;
    const viewport = page.getViewport({ scale: zoom * dpr });

    const canvas = bgCanvasRef.current[index];
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);

    const cssW = info.baseW * zoom;
    const cssH = info.baseH * zoom;
    canvas.style.width = `${cssW}px`;
    canvas.style.height = `${cssH}px`;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    await page.render({ canvasContext: ctx, viewport }).promise;
  };

  const setupIntersectionObserver = (pdf: any) => {
    teardownObserver();
    const root = scrollRef.current;
    if (!root) return;

    const obs = new IntersectionObserver(
      (entries) => {
        let best: IntersectionObserverEntry | null = null;
        for (const e of entries) {
          if (!best || e.intersectionRatio > best.intersectionRatio) best = e;
        }
        if (best?.isIntersecting) {
          const index = pagesRef.current.indexOf(best.target as HTMLDivElement);
          if (index >= 0) setActivePage(index);
        }
        for (const e of entries) {
          if (e.isIntersecting) {
            const index = pagesRef.current.indexOf(e.target as HTMLDivElement);
            if (index >= 0) renderPageAtZoom(pdf, index).catch(() => {});
          }
        }
      },
      { root, threshold: [0.25, 0.6, 0.9] }
    );

    observerRef.current = obs;
    pagesRef.current.forEach((el) => el && obs.observe(el));
  };

  const teardownObserver = () => {
    observerRef.current?.disconnect?.();
    observerRef.current = null;
  };

  // ----- Actions -----
  const onOpenFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    e.target.value = "";
    if (f) setFile(f);
  };

  const addText = () => {
    const canvas = fabricRefs.current[activePage];
    if (!canvas) return;
    const text = new fabric.IText("Edit me", {
      left: 80,
      top: 80,
      fill: "#111827",
      fontSize: 22,
      backgroundColor: "rgba(255,255,255,0.85)",
      padding: 6,
      fontFamily: "Segoe UI, system-ui, sans-serif",
    });
    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.requestRenderAll();
  };

  const addImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      fabric.Image.fromURL(
        (ev.target as any).result,
        (img: any) => {
          const canvas = fabricRefs.current[activePage];
          if (!canvas) return;
          img.scaleToWidth(Math.min(360, canvas.getWidth() * 0.72));
          img.set({ left: 90, top: 90 });
          canvas.add(img);
          canvas.setActiveObject(img);
          canvas.requestRenderAll();
        },
        { crossOrigin: "anonymous" }
      );
    };
    reader.readAsDataURL(f);
  };

  const exportPDF = async () => {
    try {
      const newPdf = await PDFDocument.create();
      for (let i = 0; i < numPages; i++) {
        const bg = bgCanvasRef.current[i];
        const fabricCanvas = fabricRefs.current[i];
        if (!bg || !fabricCanvas) continue;

        if (bg.width === 0 || bg.height === 0) {
          await renderPageAtZoom(pdfDoc, i);
        }

        const info = renderInfoRef.current[i];
        if (!info) continue;

        const merged = document.createElement("canvas");
        const w = Math.floor(info.baseW * zoom);
        const h = Math.floor(info.baseH * zoom);
        merged.width = w;
        merged.height = h;
        const mctx = merged.getContext("2d")!;
        mctx.clearRect(0, 0, w, h);

        mctx.drawImage(bg, 0, 0, bg.width, bg.height, 0, 0, w, h);

        const overlayEl: HTMLCanvasElement =
          (fabricCanvas.getElement?.() as HTMLCanvasElement) ??
          (fabricCanvas.lowerCanvasEl as HTMLCanvasElement) ??
          (fabricCanvas.toCanvasElement?.() as HTMLCanvasElement);

        const overlayW = overlayEl?.width ?? w;
        const overlayH = overlayEl?.height ?? h;
        mctx.drawImage(overlayEl, 0, 0, overlayW, overlayH, 0, 0, w, h);

        const dataUrl = merged.toDataURL("image/png");
        const base64 = dataUrl.split(",")[1];
        const page = newPdf.addPage([w, h]);
        const png = await newPdf.embedPng(base64);
        page.drawImage(png, { x: 0, y: 0, width: w, height: h });
      }

      const bytes = await newPdf.save();
      const blob = new Blob([new Uint8Array(bytes)], { type: "application/pdf" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = appendSuffix(file?.name || "document.pdf", "_edited");
      a.click();
      URL.revokeObjectURL(a.href);
    } catch (e: any) {
      console.error(e);
      alert("Export failed: " + (e?.message || ""));
    }
  };

  const scrollToPage = (index: number) => {
    const el = pagesRef.current[index];
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    setActivePage(index);
  };
  const goPrev = () => scrollToPage(Math.max(0, activePage - 1));
  const goNext = () => scrollToPage(Math.min(numPages - 1, activePage + 1));

  const applyFit = () => {
    if (!scrollRef.current || !renderInfoRef.current[0]) return;
    const { clientWidth, clientHeight } = scrollRef.current;
    const { baseW, baseH } = renderInfoRef.current[0];

    // Space around page (similar to Drive)
    const pad = 32;
    const byWidth = clientWidth / (baseW + pad);
    const byHeight = clientHeight / (baseH + pad);
    const target = fitMode === "width" ? byWidth : Math.min(byWidth, byHeight);
    setZoom((z) => snapZoom(target));
  };

  const fitToWidth = () => {
    setFitMode("width");
    setTimeout(applyFit, 0);
  };
  const fitToPage = () => {
    setFitMode("page");
    setTimeout(applyFit, 0);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag && ["INPUT", "TEXTAREA"].includes(tag)) return;
      if (e.key === "+" || (e.key === "=" && (e.ctrlKey || e.metaKey))) setZoom((z) => clamp(z + 0.1, 0.5, 3));
      if (e.key === "-" || (e.key === "_" && (e.ctrlKey || e.metaKey))) setZoom((z) => clamp(z - 0.1, 0.5, 3));
      if (e.key === "0" && (e.ctrlKey || e.metaKey)) applyFit();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePage, numPages]);

  function disposeFabrics() {
    try {
      for (const f of fabricRefs.current) {
        try {
          f?.dispose?.();
        } catch {}
      }
      fabricRefs.current = [];
    } catch {}
  }

  // Drag & Drop
  const onDrop = (ev: React.DragEvent<HTMLDivElement>) => {
    ev.preventDefault();
    ev.stopPropagation();
    setDragOver(false);
    const f = ev.dataTransfer?.files?.[0] || null;
    if (f && f.type === "application/pdf") setFile(f);
  };
  const onDrag = (ev: React.DragEvent<HTMLDivElement>) => {
    ev.preventDefault();
    ev.stopPropagation();
    if (ev.type === "dragenter" || ev.type === "dragover") setDragOver(true);
    if (ev.type === "dragleave") setDragOver(false);
  };

  // ----- Render -----
  return (
    <div className="h-screen w-full bg-zinc-900 text-white flex flex-col">
      {/* Top App Bar (Drive-like: translucent, subtle shadow) */}
      <div className="sticky top-0 z-20 border-b border-white/10 backdrop-blur bg-black/30 shadow-sm">
        <div className="mx-auto max-w-[1400px] px-3 md:px-5">
          <div className="flex items-center justify-between gap-2 py-3">
            {/* Left: 3‑dot menu */}
            <div className="flex items-center gap-2">
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen((s) => !s)}
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10 transition"
                  aria-haspopup="menu"
                  aria-expanded={menuOpen}
                  aria-label="More actions"
                >
                  <MoreVertical size={16} />
                  Options
                </button>

                <AnimatePresence>
                  {menuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.15 }}
                      className="absolute left-0 mt-2 w-56 rounded-xl border border-white/10 bg-zinc-900/95 p-1 shadow-2xl backdrop-blur"
                      role="menu"
                    >
                      {/* Open PDF */}
                      <label
                        className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-white/10"
                        title="Open PDF"
                      >
                        <Upload size={16} />
                        <span>Open PDF</span>
                        <input
                          type="file"
                          accept="application/pdf"
                          className="hidden"
                          onChange={(e) => {
                            setMenuOpen(false);
                            onOpenFile(e);
                          }}
                        />
                      </label>

                      {/* Add Text */}
                      <button
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-white/10"
                        onClick={() => {
                          setMenuOpen(false);
                          addText();
                        }}
                        role="menuitem"
                      >
                        <TypeIcon size={16} /> <span>Add text</span>
                      </button>

                      {/* Add Image */}
                      <label
                        className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-white/10"
                        title="Add image"
                      >
                        <ImageIcon size={16} />
                        <span>Add image…</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            setMenuOpen(false);
                            addImage(e);
                          }}
                        />
                      </label>

                      {/* Fit controls */}
                      <div className="my-1 h-px bg-white/10" />
                      <button
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-white/10"
                        onClick={() => {
                          setMenuOpen(false);
                          fitToWidth();
                        }}
                        role="menuitem"
                      >
                        <Maximize2 size={16} /> <span>Fit width</span>
                      </button>
                      <button
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-white/10"
                        onClick={() => {
                          setMenuOpen(false);
                          fitToPage();
                        }}
                        role="menuitem"
                      >
                        <Minimize2 size={16} /> <span>Fit page</span>
                      </button>

                      {/* Export */}
                      <div className="my-1 h-px bg-white/10" />
                      <button
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-white/10"
                        onClick={() => {
                          setMenuOpen(false);
                          exportPDF();
                        }}
                        role="menuitem"
                      >
                        <FileDown size={16} /> <span>Export edited PDF</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Center: Zoom indicator */}
            <div className="flex items-center gap-2">
              <div className="w-24 text-center text-sm opacity-90">{zoomPct}%</div>
            </div>

            {/* Right: page nav */}
            <div className="flex items-center gap-1 text-sm">
              <button
                onClick={goPrev}
                className="rounded-full border border-white/10 bg-white/5 p-2 hover:bg-white/10 transition"
                disabled={!numPages}
                title="Previous page"
              >
                <ChevronLeft size={18} />
              </button>
              <div className="px-2">{numPages ? activePage + 1 : "—"} / {numPages || "—"}</div>
              <button
                onClick={goNext}
                className="rounded-full border border-white/10 bg-white/5 p-2 hover:bg-white/10 transition"
                disabled={!numPages}
                title="Next page"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content area (Drive-like: single centered column, neutral bg) */}
      <div className="mx-auto h-[calc(100vh-64px)] w-full max-w-[1400px] px-3 md:px-5 py-4">
        <div
          ref={scrollRef}
          className="relative h-full overflow-auto rounded-xl bg-zinc-800/40 p-6"
          onDrop={onDrop}
          onDragEnter={onDrag}
          onDragOver={onDrag}
          onDragLeave={onDrag}
        >
          {/* Drop overlay */}
          <AnimatePresence initial={false}>
            {isDragOver && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="pointer-events-none absolute inset-0 z-10 grid place-items-center rounded-xl bg-sky-500/10"
              >
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.95 }}
                  className="rounded-xl border border-sky-300/40 bg-sky-500/20 px-5 py-3 text-sky-100 shadow-lg"
                >
                  Drop your PDF here
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Loading skeleton */}
          <AnimatePresence initial={false}>
            {loading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="mx-auto h-[520px] w-[380px] animate-pulse rounded-lg bg-white/10 shadow"
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Pages host (mutated imperatively) */}
          <div ref={pagesHostRef} className="relative" />

          {/* Error */}
          {error && (
            <div className="mt-4 whitespace-pre-wrap rounded-xl border border-rose-500/30 bg-rose-500/15 p-3 text-rose-100">
              ⚠️ {error}
            </div>
          )}

          {/* Empty state */}
          {!file && !loading && (
            <div className="grid h-full place-items-center">
              <div className="max-w-xl text-center text-white/90">
                <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-xl bg-white/10">
                  <Upload />
                </div>
                <h2 className="text-xl font-semibold">Open a PDF to get started</h2>
                <p className="mt-2 text-white/70">
                  Use <span className="font-semibold">Options → Open PDF</span> or drop a file here.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------- Utilities ----------
function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v));
}
function snapZoom(z: number) {
  const stops = [0.5, 0.66, 0.75, 0.9, 1, 1.1, 1.25, 1.33, 1.5, 1.75, 2, 2.5, 3];
  let best = stops[0];
  for (const s of stops) if (Math.abs(s - z) < Math.abs(best - z)) best = s;
  return clamp(best, 0.5, 3);
}
function appendSuffix(name: string, suffix: string) {
  const dot = name.lastIndexOf(".");
  if (dot === -1) return name + suffix + ".pdf";
  return name.slice(0, dot) + suffix + name.slice(dot);
}
function clearHost(host: HTMLElement | null) {
  if (!host) return;
  try {
    host.replaceChildren();
  } catch {
    while (host.firstChild) host.removeChild(host.firstChild);
  }
}