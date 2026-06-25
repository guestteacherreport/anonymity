"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import toast from "react-hot-toast";

type FileResult = {
  fileName: string;
  parsed: number;
  inserted: number;
  skipped: number;
  failed: number;
  errors: string[];
};

type ImportSummary = {
  files: number;
  parsed: number;
  inserted: number;
  skipped: number;
  failed: number;
};

export default function SchoolImportPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [summary, setSummary] = useState<ImportSummary | null>(null);
  const [fileResults, setFileResults] = useState<FileResult[]>([]);
  const [batchId, setBatchId] = useState<string | null>(null);

  const onFilesSelected = (selected: FileList | null) => {
    if (!selected?.length) {
      return;
    }

    const xlsxFiles = Array.from(selected).filter((f) =>
      f.name.toLowerCase().endsWith(".xlsx")
    );

    if (xlsxFiles.length === 0) {
      toast.error("Please select .xlsx files only");
      return;
    }

    setFiles((prev) => {
      const names = new Set(prev.map((f) => f.name));
      const merged = [...prev];
      for (const file of xlsxFiles) {
        if (!names.has(file.name)) {
          merged.push(file);
        }
      }
      return merged;
    });
    setSummary(null);
    setFileResults([]);
  };

  const removeFile = (name: string) => {
    setFiles((prev) => prev.filter((f) => f.name !== name));
  };

  const handleImport = async () => {
    if (files.length === 0) {
      toast.error("Select at least one Excel file");
      return;
    }

    setUploading(true);
    setSummary(null);
    setFileResults([]);
    setBatchId(null);

    try {
      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));

      const response = await fetch("/api/admin/schools/import", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Import failed");
        return;
      }

      setSummary(data.summary);
      setFileResults(data.fileResults || []);
      if (data.batchId) {
        setBatchId(data.batchId);
      }

      if (data.summary.inserted > 0) {
        toast.success(`Imported ${data.summary.inserted} schools`);
      } else if (data.summary.skipped > 0) {
        toast.success("All schools were already in the database");
      } else {
        toast.error("No schools were imported");
      }
    } catch (error) {
      console.error(error);
      toast.error("Import failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImport = async () => {
    if (!batchId) {
      toast.error("No import batch to delete");
      return;
    }

    const confirmed = confirm(
      "Are you sure you want to delete all schools from this import? This action cannot be undone."
    );
    if (!confirmed) {
      return;
    }

    setDeleting(true);

    try {
      const response = await fetch("/api/admin/schools/import/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ batchId }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to delete schools");
        return;
      }

      toast.success(data.message || "Schools deleted successfully");
      setSummary(null);
      setFileResults([]);
      setBatchId(null);
      setFiles([]);
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete schools");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <main className="flex-1 overflow-y-auto p-6 lg:p-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <Link
          href="/admin/schools"
          className="font-inter text-sm text-[#0171F9] hover:underline"
        >
          ← Back to schools
        </Link>
        <div className="flex gap-4 flex-wrap">
          <Link
            href="/admin/schools/delete-by-csv"
            className="font-inter text-sm text-[#0171F9] hover:underline"
          >
            Delete by CSV →
          </Link>
          <Link
            href="/admin/schools/delete"
            className="font-inter text-sm text-[#0171F9] hover:underline"
          >
            Delete manually →
          </Link>
          <Link
            href="/admin/schools/import-history"
            className="font-inter text-sm text-[#0171F9] hover:underline"
          >
            View history →
          </Link>
        </div>
      </div>

      <div className="max-w-3xl">
        <h1 className="font-outfit font-semibold text-2xl sm:text-3xl text-[#121212] mb-2">
          Import Schools
        </h1>
        <p className="font-inter text-sm text-[#737786] mb-6">
          Upload Excel files (.xlsx) with columns:{" "}
          <strong className="text-[#212121]">School Name</strong>,{" "}
          <strong className="text-[#212121]">Street Address</strong>,{" "}
          <strong className="text-[#212121]">City</strong>,{" "}
          <strong className="text-[#212121]">State</strong>,{" "}
          <strong className="text-[#212121]">Zip</strong>. You can select
          multiple state files at once.
        </p>

        <div
          className="border-2 border-dashed border-[#BFDCFD] rounded-xl bg-[#EFF6FF] p-8 text-center cursor-pointer hover:border-[#0171F9]/50 transition-colors"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            onFilesSelected(e.dataTransfer.files);
          }}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            multiple
            className="hidden"
            onChange={(e) => onFilesSelected(e.target.files)}
          />
          <p className="font-inter font-medium text-[#0171F9] mb-1">
            Click or drag Excel files here
          </p>
          <p className="font-inter text-xs text-[#737786]">
            Example: Alabama Public Char and Private, USA.xlsx
          </p>
        </div>

        {files.length > 0 && (
          <div className="mt-4 bg-white rounded-lg border border-[#E5E7EB] overflow-hidden">
            <div className="px-4 py-3 border-b border-[#E5E7EB] font-inter font-medium text-sm text-[#212121]">
              {files.length} file{files.length > 1 ? "s" : ""} selected
            </div>
            <ul className="max-h-48 overflow-y-auto divide-y divide-[#F2F4F7]">
              {files.map((file) => (
                <li
                  key={file.name}
                  className="flex items-center justify-between px-4 py-2.5 text-sm font-inter"
                >
                  <span className="text-[#030711] truncate pr-4">
                    {file.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeFile(file.name)}
                    className="text-[#E53E3E] hover:underline flex-shrink-0 cursor-pointer"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <button
          type="button"
          onClick={handleImport}
          disabled={uploading || files.length === 0}
          className="mt-6 w-full sm:w-auto px-6 py-3 rounded-lg bg-[#0171F9] text-white font-inter font-semibold text-base hover:bg-[#0161d9] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {uploading ? "Importing..." : "Import schools"}
        </button>

        {summary && (
          <div className="mt-8 bg-white rounded-lg border border-[#E5E7EB] p-6">
            <div className="flex items-start justify-between mb-4">
              <h2 className="font-outfit font-semibold text-lg text-[#121212]">
                Import results
              </h2>
              {batchId && summary.inserted > 0 && (
                <button
                  type="button"
                  onClick={handleDeleteImport}
                  disabled={deleting}
                  className="px-4 py-2 rounded-lg bg-[#E53E3E] text-white font-inter font-semibold text-sm hover:bg-[#c71a1a] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {deleting ? "Deleting..." : "Delete import"}
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <div>
                <p className="text-xs text-[#737786] font-inter">Parsed</p>
                <p className="text-xl font-semibold text-[#121212]">
                  {summary.parsed}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#737786] font-inter">Inserted</p>
                <p className="text-xl font-semibold text-[#22A45D]">
                  {summary.inserted}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#737786] font-inter">Skipped</p>
                <p className="text-xl font-semibold text-[#FFA600]">
                  {summary.skipped}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#737786] font-inter">Failed</p>
                <p className="text-xl font-semibold text-[#E53E3E]">
                  {summary.failed}
                </p>
              </div>
            </div>

            {fileResults.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm font-inter">
                  <thead>
                    <tr className="border-b border-[#E5E7EB] text-left text-[#6F6C70]">
                      <th className="py-2 pr-4">File</th>
                      <th className="py-2 pr-4">Parsed</th>
                      <th className="py-2 pr-4">Inserted</th>
                      <th className="py-2 pr-4">Skipped</th>
                      <th className="py-2">Failed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fileResults.map((file) => (
                      <tr
                        key={file.fileName}
                        className="border-b border-[#F2F4F7]"
                      >
                        <td className="py-2 pr-4 text-[#030711] max-w-[200px] truncate">
                          {file.fileName}
                        </td>
                        <td className="py-2 pr-4">{file.parsed}</td>
                        <td className="py-2 pr-4 text-[#22A45D]">
                          {file.inserted}
                        </td>
                        <td className="py-2 pr-4">{file.skipped}</td>
                        <td className="py-2 text-[#E53E3E]">{file.failed}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
