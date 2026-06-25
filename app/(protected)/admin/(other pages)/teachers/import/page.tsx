"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import toast from "react-hot-toast";

const DEFAULT_SCHOOL_ID = "15680";

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

export default function TeacherImportPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [summary, setSummary] = useState<ImportSummary | null>(null);
  const [fileResults, setFileResults] = useState<FileResult[]>([]);

  const onFilesSelected = (selected: FileList | null) => {
    if (!selected?.length) {
      return;
    }

    const validFiles = Array.from(selected).filter((file) => {
      const lower = file.name.toLowerCase();
      return (
        lower.endsWith(".csv") ||
        lower.endsWith(".xlsx") ||
        lower.endsWith(".xls")
      );
    });

    if (validFiles.length === 0) {
      toast.error("Please select a CSV or Excel file");
      return;
    }

    setFiles((prev) => {
      const names = new Set(prev.map((f) => f.name));
      const merged = [...prev];
      for (const file of validFiles) {
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
      toast.error("Select at least one file");
      return;
    }

    setUploading(true);
    setSummary(null);
    setFileResults([]);

    try {
      const formData = new FormData();
      formData.append("school_id", DEFAULT_SCHOOL_ID);
      formData.append("status", "1");
      files.forEach((file) => formData.append("files", file));

      const response = await fetch("/api/admin/teachers/import", {
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

      if (data.summary.inserted > 0) {
        toast.success(`Imported ${data.summary.inserted} teachers`);
      } else if (data.summary.skipped > 0) {
        toast.success("All teachers were already in the database");
      } else {
        toast.error("No teachers were imported");
      }
    } catch (error) {
      console.error(error);
      toast.error("Import failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <main className="flex-1 overflow-y-auto p-6 lg:p-8">
      <div className="mb-6">
        <Link
          href={`/admin/schools/${DEFAULT_SCHOOL_ID}`}
          className="font-inter text-sm text-[#0171F9] hover:underline"
        >
          ← Back to school
        </Link>
      </div>

      <div className="max-w-3xl">
        <h1 className="font-outfit font-semibold text-2xl sm:text-3xl text-[#121212] mb-2">
          Import Teachers
        </h1>
        <p className="font-inter text-sm text-[#737786] mb-2">
          Upload a CSV or Excel file with teacher names. Each row is imported
          with:
        </p>
        <ul className="font-inter text-sm text-[#737786] mb-6 list-disc pl-5 space-y-1">
          <li>
            <strong className="text-[#212121]">school_id:</strong> {DEFAULT_SCHOOL_ID}
          </li>
          <li>
            <strong className="text-[#212121]">status:</strong> 1 (Active)
          </li>
        </ul>
        <p className="font-inter text-sm text-[#737786] mb-6">
          Supported columns: <strong className="text-[#212121]">Name</strong>,{" "}
          <strong className="text-[#212121]">Teacher</strong>, or{" "}
          <strong className="text-[#212121]">Teacher Name</strong>. A single
          column of names (no header) also works.
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
            accept=".csv,.xlsx,.xls,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            multiple
            className="hidden"
            onChange={(e) => onFilesSelected(e.target.files)}
          />
          <p className="font-inter font-medium text-[#0171F9] mb-1">
            Click or drag CSV / Excel file here
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
          {uploading ? "Importing..." : "Import teachers"}
        </button>

        {summary && (
          <div className="mt-8 bg-white rounded-lg border border-[#E5E7EB] p-6">
            <h2 className="font-outfit font-semibold text-lg text-[#121212] mb-4">
              Import results
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-[#737786] font-inter">Parsed</p>
                <p className="text-xl font-semibold">{summary.parsed}</p>
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
              <div className="mt-6 overflow-x-auto">
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
                        <td className="py-2 pr-4 max-w-[200px] truncate">
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
