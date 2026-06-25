"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import toast from "react-hot-toast";

type School = {
  id: string;
  school_name: string;
  city: string;
  state: string;
  zipcode: string;
};

export default function DeleteByCSVPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [matchedSchools, setMatchedSchools] = useState<School[]>([]);
  const [totalInFile, setTotalInFile] = useState(0);
  const [showPreview, setShowPreview] = useState(false);

  const handleFileSelected = (selected: FileList | null) => {
    if (!selected?.length) {
      return;
    }

    const selectedFile = selected[0];
    const isValid =
      selectedFile.name.toLowerCase().endsWith(".xlsx") ||
      selectedFile.name.toLowerCase().endsWith(".csv");

    if (!isValid) {
      toast.error("Please select a .xlsx or .csv file only");
      return;
    }

    setFile(selectedFile);
    setMatchedSchools([]);
    setShowPreview(false);
  };

  const handlePreview = async () => {
    if (!file) {
      toast.error("Please select a file");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("action", "preview");

      const response = await fetch("/api/admin/schools/delete-by-csv", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to process file");
        return;
      }

      setMatchedSchools(data.schools || []);
      setTotalInFile(data.totalInFile || 0);
      setShowPreview(true);

      if (data.matchedCount === 0) {
        toast.error("No schools in the database matched your CSV file");
      } else {
        toast.success(`Found ${data.matchedCount} matching school(s)`);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to process file");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!file) {
      toast.error("Please select a file");
      return;
    }

    const confirmed = confirm(
      `Are you sure you want to delete ${matchedSchools.length} school(s) from the database? This action cannot be undone.`
    );
    if (!confirmed) {
      return;
    }

    setDeleting(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("action", "delete");

      const response = await fetch("/api/admin/schools/delete-by-csv", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to delete schools");
        return;
      }

      toast.success(data.message);
      setFile(null);
      setMatchedSchools([]);
      setShowPreview(false);
      setTotalInFile(0);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete schools");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <main className="flex-1 overflow-y-auto p-6 lg:p-8">
      <div className="mb-6">
        <Link
          href="/admin/schools"
          className="font-inter text-sm text-[#0171F9] hover:underline"
        >
          ← Back to schools
        </Link>
      </div>

      <div className="max-w-3xl">
        <h1 className="font-outfit font-semibold text-2xl sm:text-3xl text-[#121212] mb-2">
          Delete Schools by File
        </h1>
        <p className="font-inter text-sm text-[#737786] mb-6">
          Upload a CSV or Excel file and delete all schools from the database that match the rows in your file.
        </p>

        <div className="bg-white rounded-lg border border-[#E5E7EB] p-6 mb-6">
          <h2 className="font-outfit font-semibold text-lg text-[#121212] mb-4">
            Upload File
          </h2>

          <div
            className="border-2 border-dashed border-[#BFDCFD] rounded-xl bg-[#EFF6FF] p-8 text-center cursor-pointer hover:border-[#0171F9]/50 transition-colors mb-4"
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              handleFileSelected(e.dataTransfer.files);
            }}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".xlsx,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
              className="hidden"
              onChange={(e) => handleFileSelected(e.target.files)}
            />
            <p className="font-inter font-medium text-[#0171F9] mb-1">
              Click or drag Excel/CSV files here
            </p>
            <p className="font-inter text-xs text-[#737786]">
              File must have columns: School Name, State, Zip (and optionally Street Address, City)
            </p>
          </div>

          {file && (
            <div className="bg-[#F9FAFB] rounded-lg border border-[#E5E7EB] px-4 py-3 mb-4">
              <div className="flex items-center justify-between">
                <p className="font-inter text-sm text-[#030711]">{file.name}</p>
                <button
                  type="button"
                  onClick={() => {
                    setFile(null);
                    setMatchedSchools([]);
                    setShowPreview(false);
                    if (inputRef.current) {
                      inputRef.current.value = "";
                    }
                  }}
                  className="text-[#E53E3E] hover:underline text-sm cursor-pointer"
                >
                  Remove
                </button>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={handlePreview}
            disabled={!file || loading}
            className="w-full sm:w-auto px-6 py-3 rounded-lg bg-[#0171F9] text-white font-inter font-semibold text-base hover:bg-[#0161d9] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? "Processing..." : "Preview schools to delete"}
          </button>
        </div>

        {showPreview && (
          <div className="bg-white rounded-lg border border-[#E5E7EB] p-6">
            <div className="mb-6">
              <h2 className="font-outfit font-semibold text-lg text-[#121212] mb-2">
                Schools to Delete
              </h2>
              <p className="font-inter text-sm text-[#737786] mb-4">
                {matchedSchools.length} out of {totalInFile} schools in your file were found in the database
              </p>

              {matchedSchools.length > 0 && (
                <div className="bg-[#FEF2F2] border border-[#FDE8E8] rounded-lg p-4 mb-4">
                  <p className="font-inter text-sm text-[#B42318]">
                    <strong>Warning:</strong> These {matchedSchools.length} school(s) will be permanently deleted:
                  </p>
                </div>
              )}
            </div>

            {matchedSchools.length === 0 ? (
              <div className="text-center py-8">
                <p className="font-inter text-[#737786]">
                  No schools matched your file. No records will be deleted.
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto mb-6">
                  <table className="w-full text-sm font-inter">
                    <thead>
                      <tr className="border-b border-[#E5E7EB] text-left text-[#6F6C70]">
                        <th className="py-2 pr-4">School Name</th>
                        <th className="py-2 pr-4">Location</th>
                        <th className="py-2">Zip</th>
                      </tr>
                    </thead>
                    <tbody>
                      {matchedSchools.map((school) => (
                        <tr
                          key={school.id}
                          className="border-b border-[#F2F4F7]"
                        >
                          <td className="py-2 pr-4 text-[#030711]">
                            {school.school_name}
                          </td>
                          <td className="py-2 pr-4 text-[#737786]">
                            {school.city}, {school.state}
                          </td>
                          <td className="py-2 text-[#737786]">{school.zipcode}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPreview(false);
                      setMatchedSchools([]);
                    }}
                    className="px-6 py-3 rounded-lg border border-[#D1D5DB] text-[#121212] font-inter font-semibold text-base hover:bg-[#F9FAFB] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={deleting}
                    className="px-6 py-3 rounded-lg bg-[#E53E3E] text-white font-inter font-semibold text-base hover:bg-[#c71a1a] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {deleting ? "Deleting..." : "Delete these schools"}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
