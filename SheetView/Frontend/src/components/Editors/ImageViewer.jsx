import { useEffect, useRef, useState } from "react";

export default function ImageViewer({ file }) {
  const [src, setSrc] = useState("");
  const [fileName, setFileName] = useState("");
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [grayscale, setGrayscale] = useState(0);

  useEffect(() => {
    if (!file) return;
    setFileName(file.name);
    setSrc(URL.createObjectURL(file));
  }, [file]);

  const handleDownload = () => {
    const canvas = document.createElement("canvas");
    const img = document.getElementById("preview-img");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) grayscale(${grayscale}%)`;
    ctx.drawImage(img, 0, 0);
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = fileName;
    a.click();
  };

  const transform = `
    scale(${zoom})
    rotate(${rotation}deg)
    scaleX(${flipH ? -1 : 1})
    scaleY(${flipV ? -1 : 1})
  `;

  const filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) grayscale(${grayscale}%)`;

  return (
    <div style={styles.wrapper}>
      {/* Toolbar */}
      <div style={styles.toolbar}>
        <span style={styles.filename}>🖼 {fileName}</span>
        <div style={styles.controls}>
          <button style={styles.btn} onClick={() => setZoom((z) => Math.max(0.1, z - 0.1))}>🔍−</button>
          <span style={styles.label}>{Math.round(zoom * 100)}%</span>
          <button style={styles.btn} onClick={() => setZoom((z) => Math.min(5, z + 0.1))}>🔍+</button>
          <button style={styles.btn} onClick={() => setZoom(1)}>Reset</button>
          <div style={styles.divider} />
          <button style={styles.btn} onClick={() => setRotation((r) => r - 90)}>↺ Rotate</button>
          <button style={styles.btn} onClick={() => setRotation((r) => r + 90)}>↻ Rotate</button>
          <button style={styles.btn} onClick={() => setFlipH((f) => !f)}>⇄ Flip H</button>
          <button style={styles.btn} onClick={() => setFlipV((f) => !f)}>⇅ Flip V</button>
        </div>
        <button style={styles.saveBtn} onClick={handleDownload}>⬇ Download</button>
      </div>

      {/* Adjustments */}
      <div style={styles.adjustBar}>
        {[
          { label: "Brightness", value: brightness, set: setBrightness, min: 0, max: 200 },
          { label: "Contrast", value: contrast, set: setContrast, min: 0, max: 200 },
          { label: "Saturation", value: saturation, set: setSaturation, min: 0, max: 200 },
          { label: "Grayscale", value: grayscale, set: setGrayscale, min: 0, max: 100 },
        ].map(({ label, value, set, min, max }) => (
          <div key={label} style={styles.sliderGroup}>
            <span style={styles.sliderLabel}>{label}</span>
            <input
              type="range"
              min={min}
              max={max}
              value={value}
              onChange={(e) => set(Number(e.target.value))}
              style={styles.slider}
            />
            <span style={styles.sliderValue}>{value}</span>
          </div>
        ))}
        <button
          style={{ ...styles.btn, fontSize: 11 }}
          onClick={() => {
            setBrightness(100);
            setContrast(100);
            setSaturation(100);
            setGrayscale(0);
            setRotation(0);
            setFlipH(false);
            setFlipV(false);
            setZoom(1);
          }}
        >
          Reset All
        </button>
      </div>

      {/* Image */}
      <div style={styles.canvas}>
        {src && (
          <img
            id="preview-img"
            src={src}
            alt={fileName}
            style={{
              transform,
              filter,
              maxWidth: "100%",
              maxHeight: "100%",
              objectFit: "contain",
              transition: "transform 0.2s, filter 0.2s",
            }}
          />
        )}
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    background: "#1a1a1a",
    fontFamily: "Segoe UI, sans-serif",
  },
  toolbar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "8px 16px",
    background: "#2d2d2d",
    color: "#fff",
    flexWrap: "wrap",
    gap: 8,
  },
  filename: { fontSize: 13, fontWeight: 600, color: "#e0e0e0" },
  controls: { display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" },
  btn: {
    background: "rgba(255,255,255,0.1)",
    color: "#fff",
    border: "1px solid rgba(255,255,255,0.2)",
    borderRadius: 4,
    padding: "4px 10px",
    cursor: "pointer",
    fontSize: 12,
  },
  label: { color: "#ccc", fontSize: 12, minWidth: 36, textAlign: "center" },
  divider: { width: 1, height: 20, background: "rgba(255,255,255,0.2)" },
  saveBtn: {
    background: "#7b1fa2",
    color: "#fff",
    border: "none",
    borderRadius: 4,
    padding: "5px 14px",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: 13,
  },
  adjustBar: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    padding: "8px 16px",
    background: "#242424",
    borderBottom: "1px solid #333",
    flexWrap: "wrap",
  },
  sliderGroup: { display: "flex", alignItems: "center", gap: 6 },
  sliderLabel: { color: "#aaa", fontSize: 12, minWidth: 72 },
  slider: { width: 80, accentColor: "#7b1fa2" },
  sliderValue: { color: "#ccc", fontSize: 12, minWidth: 28 },
  canvas: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    padding: 24,
  },
};