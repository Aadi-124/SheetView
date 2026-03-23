

import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Trash2,
  Pencil,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  Upload,
  Filter,
  Search,
  RefreshCw,
  FileSpreadsheet,
  FileText,
  Image,
  MoreVertical,
  Eye,
  Edit,
  Copy,
  Printer,
  Mail,
  Archive,
  AlertCircle,
  CheckCircle,
  Info,
  XCircle,
} from "lucide-react";
import { useSnackbar } from "notistack";
import { AddRowModal } from "./AddRowModal";
import { DeleteConfirmModal } from "./DeleteConfirmModal";
import { getData, addRow, updateRow, deleteRow } from "../services/BackendAPIs";
import { CSSTransition, TransitionGroup } from "react-transition-group";

import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  TextRun,
  WidthType,
} from "docx";

interface DataRow {
  [key: string]: any;
  _index: number;
}

type ExportFormat = "xlsx" | "csv" | "json" | "pdf" | "docx" | "pptx";
type ExportScope = "current" | "all";

export function DataTable() {
  const { enqueueSnackbar } = useSnackbar();

  const [data, setData] = useState<DataRow[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [editingRow, setEditingRow] = useState<number | null>(null);
  const [editValues, setEditValues] = useState<Record<string, any>>({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteRowData, setDeleteRowData] = useState<DataRow | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");

  const [exporting, setExporting] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportFileName, setExportFileName] = useState("table_export");
  const [exportFormat, setExportFormat] = useState<ExportFormat>("xlsx");

  // Alert states
  const [alert, setAlert] = useState<{
    type: "success" | "error" | "warning" | "info";
    message: string;
    show: boolean;
  }>({
    type: "info",
    message: "",
    show: false,
  });

  const showAlert = (
    type: "success" | "error" | "warning" | "info",
    message: string
  ) => {
    setAlert({ type, message, show: true });
    setTimeout(() => setAlert((prev) => ({ ...prev, show: false })), 5000);
  };

  const fetchTableData = useCallback(async () => {
    try {
      setLoading(true);
      const json = await getData(currentPage, rowsPerPage);

      const indexed = json.data.map((row: any, i: number) => ({
        ...row,
        _index: (currentPage - 1) * rowsPerPage + i,
      }));

      setData(indexed);
      setTotalPages(json.total_pages);
      setTotalRecords(json.total_records);

      if (indexed.length > 0) {
        setColumns(Object.keys(indexed[0]).filter((k) => k !== "_index"));
      }
    } catch (err: any) {
      showAlert("error", err?.message || "Failed to load data");
      // enqueueSnackbar(err?.message || "Failed to load data", {
      //   variant: "error",
      // });
    } finally {
      setLoading(false);
    }
  }, [currentPage, rowsPerPage, enqueueSnackbar]);

  useEffect(() => {
    fetchTableData();
  }, [fetchTableData]);

  const handleAddRow = async (row: Record<string, any>) => {
    try {
      await addRow(row);
      showAlert("success", "Row added successfully");
      // enqueueSnackbar("Row added successfully", { variant: "success" });
      setShowAddModal(false);
      fetchTableData();
    } catch (err: any) {
      showAlert("error", err?.message || "Failed to add row");
      // enqueueSnackbar(err?.message || "Failed to add row", {
      //   variant: "error",
      // });
    }
  };

  const saveEdit = async () => {
    if (editingRow === null) return;

    const clean: Record<string, any> = {};
    columns.forEach((c) => (clean[c] = editValues[c]));

    if (columns.some((c) => !clean[c]?.toString().trim())) {
      showAlert("warning", "Fields cannot be empty");
      // enqueueSnackbar("Fields cannot be empty", { variant: "warning" });
      return;
    }

    try {
      await updateRow(editingRow, clean);
      showAlert("success", "Row updated successfully");
      // enqueueSnackbar("Row updated successfully", { variant: "success" });
      setEditingRow(null);
      fetchTableData();
    } catch (err: any) {
      showAlert("error", err?.message || "Update failed");
      // enqueueSnackbar(err?.message || "Update failed", {
        // variant: "error",
      // });
    }
  };

  const confirmDelete = async () => {
    if (!deleteRowData) return;
    try {
      await deleteRow(deleteRowData._index);
      showAlert("success", "Row deleted successfully");
      // enqueueSnackbar("Row deleted successfully", { variant: "success" });
      setDeleteRowData(null);
      fetchTableData();
    } catch (err: any) {
      showAlert("error", err?.message || "Delete failed");
      // enqueueSnackbar(err?.message || "Delete failed", {variant: "error",});
    }
  };

  const handleSelectAll = () => {
    if (selectedRows.size === data.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(data.map((row) => row._index)));
    }
  };

  const handleSelectRow = (index: number) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedRows(newSelected);
  };

  const handleSort = (key: string) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
    
    const sortedData = [...data].sort((a, b) => {
      if (a[key] < b[key]) return direction === "asc" ? -1 : 1;
      if (a[key] > b[key]) return direction === "asc" ? 1 : -1;
      return 0;
    });
    setData(sortedData);
  };

  const filteredData = data.filter((row) =>
    columns.some((col) =>
      row[col]?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const exportXLSX = () => {
    const sheet = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, sheet, "Data");
    XLSX.writeFile(wb, `${exportFileName}.xlsx`);
  };

  const handleConfirmExport = async () => {
    try {
      setExporting(true);
      showAlert("info", "Export started...");
      // enqueueSnackbar("Export started...", { variant: "info" });

      switch (exportFormat) {
        case "xlsx":
          exportXLSX();
          break;
        case "pdf":
          const doc = new jsPDF();
          autoTable(doc, {
            head: [columns],
            body: data.map((r) => columns.map((c) => r[c] ?? "")),
          });
          doc.save(`${exportFileName}.pdf`);
          break;
        case "json":
          const blob = new Blob([JSON.stringify(data, null, 2)], {
            type: "application/json",
          });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `${exportFileName}.json`;
          a.click();
          break;
      }

      showAlert("success", "Export completed");
      // enqueueSnackbar("Export completed", { variant: "success" });
    } catch (err: any) {
      showAlert("error", "Export failed");
      // enqueueSnackbar("Export failed", { variant: "error" });
    } finally {
      setExporting(false);
      setExportDialogOpen(false);
    }
  };

  const AlertComponent = () => {
    if (!alert.show) return null;

    const icons = {
      success: <CheckCircle className="w-5 h-5 text-green-500" />,
      error: <XCircle className="w-5 h-5 text-red-500" />,
      warning: <AlertCircle className="w-5 h-5 text-yellow-500" />,
      info: <Info className="w-5 h-5 text-blue-500" />,
    };

    const colors = {
      success: "bg-green-50 border-green-200 text-green-800",
      error: "bg-red-50 border-red-200 text-red-800",
      warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
      info: "bg-blue-50 border-blue-200 text-blue-800",
    };

    return (
      <div
        className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg animate-slide-in ${colors[alert.type]}`}
      >
        {icons[alert.type]}
        <span className="text-sm font-medium">{alert.message}</span>
        <button
          onClick={() => setAlert((prev) => ({ ...prev, show: false }))}
          className="ml-4 hover:opacity-70"
        >
          <X size={16} />
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <AlertComponent />

      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Data Management</h1>
        <p className="text-gray-600">Manage and organize your data efficiently</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Records</p>
              <p className="text-2xl font-bold text-gray-800">{totalRecords}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileSpreadsheet className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Current Page</p>
              <p className="text-2xl font-bold text-gray-800">{currentPage}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Selected Rows</p>
              <p className="text-2xl font-bold text-gray-800">{selectedRows.size}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Columns</p>
              <p className="text-2xl font-bold text-gray-800">{columns.length}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Filter className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border border-gray-100">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search records..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
              />
            </div>

            {/* View Toggle */}
            <div className="flex border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode("table")}
                className={`px-3 py-2 ${
                  viewMode === "table"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                <FileText size={18} />
              </button>
              <button
                onClick={() => setViewMode("cards")}
                className={`px-3 py-2 ${
                  viewMode === "cards"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Image size={18} />
              </button>
            </div>

            {/* Refresh Button */}
            <button
              onClick={fetchTableData}
              className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              title="Refresh"
            >
              <RefreshCw size={18} className="text-gray-600" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Export Button */}
            <button
              onClick={() => setExportDialogOpen(true)}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-all transform hover:scale-105 shadow-sm"
            >
              <Download size={16} /> Export
            </button>

            {/* Import Button */}
            <button className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-all transform hover:scale-105 shadow-sm">
              <Upload size={16} /> Import
            </button>

            {/* Add Row Button */}
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all transform hover:scale-105 shadow-sm"
            >
              <Plus size={16} /> Add Row
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {viewMode === "table" ? (
          /* Table View */
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                  <th className="px-4 py-3 w-10">
                    <input
                      type="checkbox"
                      checked={selectedRows.size === data.length && data.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  {columns.map((col) => (
                    <th
                      key={col}
                      onClick={() => handleSort(col)}
                      className="px-4 py-3 text-left font-semibold text-gray-700 cursor-pointer hover:bg-gray-200 transition-colors"
                    >
                      <div className="flex items-center gap-1">
                        {col}
                        {sortConfig?.key === col && (
                          <span>{sortConfig.direction === "asc" ? "↑" : "↓"}</span>
                        )}
                      </div>
                    </th>
                  ))}
                  <th className="px-4 py-3 text-right font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>

              <TransitionGroup component="tbody">
                {loading ? (
                  <tr>
                    <td colSpan={columns.length + 2} className="p-12">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <p className="text-gray-500">Loading data...</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length + 2} className="p-12">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <AlertCircle className="w-12 h-12 text-gray-400" />
                        <p className="text-gray-500">No data available</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredData.map((row) => {
                    const isEditing = editingRow === row._index;
                    const isSelected = selectedRows.has(row._index);

                    return (
                      <CSSTransition
                        key={row._index}
                        timeout={300}
                        classNames="fade"
                      >
                        <tr
                          className={`hover:bg-gray-50 border-b border-gray-100 transition-colors ${
                            isSelected ? "bg-blue-50" : ""
                          }`}
                        >
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleSelectRow(row._index)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                          </td>
                          {columns.map((col) => (
                            <td key={col} className="px-4 py-3">
                              {isEditing ? (
                                <input
                                  value={editValues[col] ?? row[col]}
                                  onChange={(e) =>
                                    setEditValues((v) => ({
                                      ...v,
                                      [col]: e.target.value,
                                    }))
                                  }
                                  className="border border-gray-300 px-3 py-1.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                                  autoFocus
                                />
                              ) : (
                                <span className="text-gray-700">
                                  {row[col]}
                                </span>
                              )}
                            </td>
                          ))}

                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-2">
                              {isEditing ? (
                                <>
                                  <button
                                    onClick={saveEdit}
                                    className="p-1.5 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                                    title="Save"
                                  >
                                    <Check size={16} />
                                  </button>
                                  <button
                                    onClick={() => setEditingRow(null)}
                                    className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                                    title="Cancel"
                                  >
                                    <X size={16} />
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() => {
                                      setEditingRow(row._index);
                                      setEditValues(row);
                                    }}
                                    className="p-1.5 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                                    title="Edit"
                                  >
                                    <Pencil size={16} />
                                  </button>
                                  <button
                                    onClick={() => setDeleteRowData(row)}
                                    className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                                    title="Delete"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                  <button
                                    className="p-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                                    title="More options"
                                  >
                                    <MoreVertical size={16} />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      </CSSTransition>
                    );
                  })
                )}
              </TransitionGroup>
            </table>
          </div>
        ) : (
          /* Card View */
          <div className="p-6">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : filteredData.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No data available</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredData.map((row) => (
                  <div
                    key={row._index}
                    className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all transform hover:scale-[1.02]"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedRows.has(row._index)}
                          onChange={() => handleSelectRow(row._index)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-xs text-gray-500">
                          ID: {row._index}
                        </span>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => {
                            setEditingRow(row._index);
                            setEditValues(row);
                          }}
                          className="p-1.5 hover:bg-blue-100 rounded-lg transition-colors"
                        >
                          <Edit size={14} className="text-blue-600" />
                        </button>
                        <button
                          onClick={() => setDeleteRowData(row)}
                          className="p-1.5 hover:bg-red-100 rounded-lg transition-colors"
                        >
                          <Trash2 size={14} className="text-red-600" />
                        </button>
                        <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                          <Copy size={14} className="text-gray-600" />
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {columns.map((col) => (
                        <div key={col} className="flex flex-col">
                          <span className="text-xs text-gray-500">{col}</span>
                          <span className="text-sm font-medium text-gray-800">
                            {row[col]}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Pagination */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Showing {data.length} of {totalRecords} records
              </span>
              <select
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {[10, 25, 50, 100].map((n) => (
                  <option key={n} value={n}>
                    {n} per page
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="p-2 border border-gray-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
              >
                <ChevronLeft size={18} />
              </button>

              <span className="text-sm font-medium px-4 py-2 bg-white border border-gray-300 rounded-lg">
                Page {currentPage} of {totalPages}
              </span>

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="p-2 border border-gray-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddRowModal
          columns={columns}
          onAdd={handleAddRow}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {deleteRowData && (
        <DeleteConfirmModal
          rowName={deleteRowData[columns[0]]}
          onConfirm={confirmDelete}
          onClose={() => setDeleteRowData(null)}
        />
      )}

      {/* Export Dialog */}
      {exportDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-xl shadow-xl p-6 transform transition-all animate-scale-in">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Export Data</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  File name
                </label>
                <input
                  value={exportFileName}
                  onChange={(e) => setExportFileName(e.target.value)}
                  placeholder="table_export"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Extension will be added automatically
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Format
                </label>
                <select
                  value={exportFormat}
                  onChange={(e) => setExportFormat(e.target.value as ExportFormat)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="xlsx">Excel (.xlsx)</option>
                  <option value="csv">CSV (.csv)</option>
                  <option value="json">JSON (.json)</option>
                  <option value="pdf">PDF (.pdf)</option>
                  <option value="docx">Word (.docx)</option>
                  <option value="pptx">PowerPoint (.pptx)</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setExportDialogOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={exporting}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmExport}
                disabled={exporting || columns.length === 0}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {exporting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download size={16} />
                    Export
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Styles */}
      <style>
        {`
          @keyframes slideIn {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }

          @keyframes scaleIn {
            from {
              transform: scale(0.9);
              opacity: 0;
            }
            to {
              transform: scale(1);
              opacity: 1;
            }
          }

          .animate-slide-in {
            animation: slideIn 0.3s ease-out;
          }

          .animate-scale-in {
            animation: scaleIn 0.2s ease-out;
          }

          .fade-enter {
            opacity: 0;
            transform: translateY(-10px);
          }
          .fade-enter-active {
            opacity: 1;
            transform: translateY(0);
            transition: all 300ms;
          }
          .fade-exit {
            opacity: 1;
            transform: translateY(0);
          }
          .fade-exit-active {
            opacity: 0;
            transform: translateY(-10px);
            transition: all 300ms;
          }
        `}
      </style>
    </div>
  );
}




