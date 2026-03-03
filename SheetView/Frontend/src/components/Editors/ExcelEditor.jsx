import { useEffect, useRef, useState } from "react";
import * as XLSX from "xlsx";

export default function ExcelEditor({ file }) {
  const [sheets, setSheets] = useState({});
  const [activeSheet, setActiveSheet] = useState("");
  const [sheetNames, setSheetNames] = useState([]);
  const [editingCell, setEditingCell] = useState(null);
  const [cellValue, setCellValue] = useState("");

  useEffect(() => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const allSheets = {};
      workbook.SheetNames.forEach((name) => {
        allSheets[name] = XLSX.utils.sheet_to_json(workbook.Sheets[name], {
          header: 1,
          defval: "",
        });
      });
      setSheets(allSheets);
      setSheetNames(workbook.SheetNames);
      setActiveSheet(workbook.SheetNames[0]);
    };
    reader.readAsArrayBuffer(file);
  }, [file]);

  const updateCell = (rowIdx, colIdx, value) => {
    setSheets((prev) => {
      const updated = prev[activeSheet].map((r) => [...r]);
      if (!updated[rowIdx]) updated[rowIdx] = [];
      updated[rowIdx][colIdx] = value;
      return { ...prev, [activeSheet]: updated };
    });
  };

  const handleDownload = () => {
    const wb = XLSX.utils.book_new();
    Object.entries(sheets).forEach(([name, data]) => {
      const ws = XLSX.utils.aoa_to_sheet(data);
      XLSX.utils.book_append_sheet(wb, ws, name);
    });
    XLSX.writeFile(wb, file?.name || "edited.xlsx");
  };

  const rows = sheets[activeSheet] || [];
  const colCount = Math.max(...rows.map((r) => r.length), 10);
  const colLetters = Array.from({ length: colCount }, (_, i) =>
    String.fromCharCode(65 + i)
  );

  return (
    <div style={styles.wrapper}>
      {/* Toolbar */}
      <div style={styles.toolbar}>
        <span style={styles.filename}>📊 {file?.name}</span>
        <button style={styles.saveBtn} onClick={handleDownload}>
          ⬇ Download
        </button>
      </div>

      {/* Sheet tabs */}
      <div style={styles.tabs}>
        {sheetNames.map((name) => (
          <button
            key={name}
            style={{
              ...styles.tab,
              ...(activeSheet === name ? styles.tabActive : {}),
            }}
            onClick={() => setActiveSheet(name)}
          >
            {name}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div style={styles.gridWrapper}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.cornerCell}></th>
              {colLetters.map((l) => (
                <th key={l} style={styles.colHeader}>
                  {l}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rIdx) => (
              <tr key={rIdx}>
                <td style={styles.rowHeader}>{rIdx + 1}</td>
                {colLetters.map((_, cIdx) => {
                  const isEditing =
                    editingCell?.r === rIdx && editingCell?.c === cIdx;
                  return (
                    <td
                      key={cIdx}
                      style={styles.cell}
                      onClick={() => {
                        setEditingCell({ r: rIdx, c: cIdx });
                        setCellValue(row[cIdx] ?? "");
                      }}
                    >
                      {isEditing ? (
                        <input
                          autoFocus
                          style={styles.cellInput}
                          value={cellValue}
                          onChange={(e) => setCellValue(e.target.value)}
                          onBlur={() => {
                            updateCell(rIdx, cIdx, cellValue);
                            setEditingCell(null);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              updateCell(rIdx, cIdx, cellValue);
                              setEditingCell(null);
                            }
                          }}
                        />
                      ) : (
                        row[cIdx] ?? ""
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    fontFamily: "Segoe UI, sans-serif",
    background: "#fff",
  },
  toolbar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "8px 16px",
    background: "#217346",
    color: "#fff",
  },
  filename: { fontWeight: 600, fontSize: 14 },
  saveBtn: {
    background: "#fff",
    color: "#217346",
    border: "none",
    borderRadius: 4,
    padding: "6px 14px",
    cursor: "pointer",
    fontWeight: 600,
  },
  tabs: {
    display: "flex",
    background: "#f3f3f3",
    borderBottom: "1px solid #ddd",
    padding: "0 8px",
  },
  tab: {
    padding: "6px 16px",
    border: "none",
    background: "transparent",
    cursor: "pointer",
    fontSize: 13,
    borderBottom: "2px solid transparent",
  },
  tabActive: {
    borderBottom: "2px solid #217346",
    fontWeight: 600,
    color: "#217346",
  },
  gridWrapper: { overflow: "auto", flex: 1 },
  table: { borderCollapse: "collapse", width: "100%" },
  cornerCell: {
    background: "#f3f3f3",
    border: "1px solid #ddd",
    width: 40,
    minWidth: 40,
  },
  colHeader: {
    background: "#f3f3f3",
    border: "1px solid #ddd",
    minWidth: 100,
    padding: "4px 8px",
    fontSize: 12,
    fontWeight: 600,
    textAlign: "center",
    color: "#444",
  },
  rowHeader: {
    background: "#f3f3f3",
    border: "1px solid #ddd",
    padding: "4px 8px",
    fontSize: 12,
    textAlign: "center",
    color: "#444",
    minWidth: 40,
  },
  cell: {
    border: "1px solid #e0e0e0",
    padding: "2px 6px",
    fontSize: 13,
    minWidth: 100,
    height: 24,
    cursor: "cell",
    whiteSpace: "nowrap",
  },
  cellInput: {
    width: "100%",
    border: "none",
    outline: "2px solid #217346",
    fontSize: 13,
    padding: 0,
    background: "#fff",
  },
};