"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

type ImportBatch = {
  batch_id: string;
  imported_at: string;
  school_count: number;
};

type School = {
  id: string;
  school_name: string;
  city: string;
  state: string;
};

export default function ImportHistoryPage() {
  const [batches, setBatches] = useState<ImportBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [expandedBatch, setExpandedBatch] = useState<string | null>(null);
  const [batchSchools, setBatchSchools] = useState<Record<string, School[]>>({});
  const [loadingSchools, setLoadingSchools] = useState<string | null>(null);

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/schools/import/batches");
      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to fetch import history");
        return;
      }

      setBatches(data.batches || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch import history");
    } finally {
      setLoading(false);
    }
  };

  const fetchBatchSchools = async (batchId: string) => {
    if (batchSchools[batchId]) {
      setExpandedBatch(expandedBatch === batchId ? null : batchId);
      return;
    }

    try {
      setLoadingSchools(batchId);
      const response = await fetch(
        `/api/admin/schools/import/batches?batchId=${batchId}`
      );
      const data = await response.json();

      if (!response.ok) {
        toast.error("Failed to fetch schools");
        return;
      }

      setBatchSchools((prev) => ({
        ...prev,
        [batchId]: data.schools || [],
      }));
      setExpandedBatch(batchId);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch schools");
    } finally {
      setLoadingSchools(null);
    }
  };

  const handleDeleteBatch = async (batchId: string, count: number) => {
    const confirmed = confirm(
      `Are you sure you want to delete ${count} school(s) from this import? This action cannot be undone.`
    );
    if (!confirmed) {
      return;
    }

    setDeleting(batchId);

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
      fetchBatches();
      setExpandedBatch(null);
      setBatchSchools((prev) => {
        const updated = { ...prev };
        delete updated[batchId];
        return updated;
      });
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete schools");
    } finally {
      setDeleting(null);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };

  return (
    <main className="flex-1 overflow-y-auto p-6 lg:p-8">
      <div className="mb-6">
        <Link
          href="/admin/schools/import"
          className="font-inter text-sm text-[#0171F9] hover:underline"
        >
          ← Back to import
        </Link>
      </div>

      <div className="max-w-4xl">
        <h1 className="font-outfit font-semibold text-2xl sm:text-3xl text-[#121212] mb-2">
          Import History
        </h1>
        <p className="font-inter text-sm text-[#737786] mb-6">
          View and delete schools from previous imports
        </p>

        {loading ? (
          <div className="text-center py-12">
            <p className="font-inter text-[#737786]">Loading import history...</p>
          </div>
        ) : batches.length === 0 ? (
          <div className="bg-white rounded-lg border border-[#E5E7EB] p-6 text-center">
            <p className="font-inter text-[#737786]">No import history found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {batches.map((batch) => (
              <div
                key={batch.batch_id}
                className="bg-white rounded-lg border border-[#E5E7EB] overflow-hidden"
              >
                <div
                  className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-[#F9FAFB] transition-colors"
                  onClick={() => fetchBatchSchools(batch.batch_id)}
                >
                  <div className="flex-1">
                    <p className="font-inter font-medium text-[#121212]">
                      {formatDate(batch.imported_at)}
                    </p>
                    <p className="font-inter text-sm text-[#737786]">
                      {batch.school_count} school{batch.school_count !== 1 ? "s" : ""} imported
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteBatch(batch.batch_id, batch.school_count);
                      }}
                      disabled={deleting === batch.batch_id}
                      className="px-4 py-2 rounded-lg bg-[#E53E3E] text-white font-inter font-semibold text-sm hover:bg-[#c71a1a] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {deleting === batch.batch_id ? "Deleting..." : "Delete"}
                    </button>
                    <svg
                      className={`w-5 h-5 text-[#737786] transition-transform ${
                        expandedBatch === batch.batch_id ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 14l-7 7m0 0l-7-7m7 7V3"
                      />
                    </svg>
                  </div>
                </div>

                {expandedBatch === batch.batch_id && (
                  <div className="border-t border-[#E5E7EB] bg-[#F9FAFB] px-6 py-4">
                    {loadingSchools === batch.batch_id ? (
                      <p className="font-inter text-sm text-[#737786]">Loading schools...</p>
                    ) : batchSchools[batch.batch_id]?.length === 0 ? (
                      <p className="font-inter text-sm text-[#737786]">No schools in this batch</p>
                    ) : (
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {batchSchools[batch.batch_id]?.map((school) => (
                          <div
                            key={school.id}
                            className="flex items-center justify-between text-sm font-inter bg-white p-3 rounded border border-[#E5E7EB]"
                          >
                            <div>
                              <p className="font-medium text-[#121212]">
                                {school.school_name}
                              </p>
                              <p className="text-xs text-[#737786]">
                                {school.city}, {school.state}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
