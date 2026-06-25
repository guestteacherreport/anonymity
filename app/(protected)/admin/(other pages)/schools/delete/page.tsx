"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

type School = {
  id: string;
  school_name: string;
  city: string;
  state: string;
  zipcode: string;
  street_address: string;
  created_at?: string;
  imported_at?: string;
};

export default function DeleteSchoolsPage() {
  const [schools, setSchools] = useState<School[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState("");
  const [searched, setSearched] = useState(false);

  const fetchSchools = async (searchTerm: string) => {
    try {
      setLoading(true);
      const url = new URL("/api/admin/schools/list", window.location.origin);
      if (searchTerm) {
        url.searchParams.append("search", searchTerm);
      }

      const response = await fetch(url.toString());
      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to fetch schools");
        return;
      }

      setSchools(data.schools || []);
      setSearched(true);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch schools");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setSelectedIds(new Set());
    fetchSchools(search);
  };

  const handleSelectAll = () => {
    if (selectedIds.size === schools.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(schools.map((s) => s.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) {
      toast.error("Please select schools to delete");
      return;
    }

    const confirmed = confirm(
      `Are you sure you want to permanently delete ${selectedIds.size} school(s)? This action cannot be undone.`
    );
    if (!confirmed) {
      return;
    }

    setDeleting(true);

    try {
      const response = await fetch("/api/admin/schools/list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schoolIds: Array.from(selectedIds) }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to delete schools");
        return;
      }

      toast.success(data.message);
      setSelectedIds(new Set());
      fetchSchools(search);
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete schools");
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "—";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
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

      <div className="max-w-6xl">
        <h1 className="font-outfit font-semibold text-2xl sm:text-3xl text-[#121212] mb-2">
          Delete Schools
        </h1>
        <p className="font-inter text-sm text-[#737786] mb-6">
          Search for and delete schools from your database
        </p>

        <div className="bg-white rounded-lg border border-[#E5E7EB] p-6 mb-6">
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="Search by school name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              className="flex-1 px-4 py-2 rounded-lg border border-[#D1D5DB] font-inter text-sm focus:outline-none focus:border-[#0171F9]"
            />
            <button
              type="button"
              onClick={handleSearch}
              disabled={loading}
              className="px-6 py-2 rounded-lg bg-[#0171F9] text-white font-inter font-semibold text-sm hover:bg-[#0161d9] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? "Searching..." : "Search"}
            </button>
          </div>
          <p className="font-inter text-xs text-[#737786]">
            Leave search empty to see all schools (limited to 100 most recent)
          </p>
        </div>

        {searched && schools.length === 0 && (
          <div className="bg-white rounded-lg border border-[#E5E7EB] p-6 text-center">
            <p className="font-inter text-[#737786]">No schools found</p>
          </div>
        )}

        {schools.length > 0 && (
          <div className="bg-white rounded-lg border border-[#E5E7EB] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedIds.size === schools.length && schools.length > 0}
                  onChange={handleSelectAll}
                  className="w-4 h-4 rounded border-[#D1D5DB] cursor-pointer"
                />
                <span className="font-inter font-medium text-sm text-[#212121]">
                  {selectedIds.size > 0
                    ? `${selectedIds.size} selected`
                    : `Select all (${schools.length})`}
                </span>
              </label>

              {selectedIds.size > 0 && (
                <button
                  type="button"
                  onClick={handleDeleteSelected}
                  disabled={deleting}
                  className="px-4 py-2 rounded-lg bg-[#E53E3E] text-white font-inter font-semibold text-sm hover:bg-[#c71a1a] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {deleting ? "Deleting..." : `Delete ${selectedIds.size}`}
                </button>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm font-inter">
                <thead>
                  <tr className="border-b border-[#E5E7EB] text-left text-[#6F6C70] bg-[#F9FAFB]">
                    <th className="w-12 px-6 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.size === schools.length && schools.length > 0}
                        onChange={handleSelectAll}
                        className="w-4 h-4 rounded border-[#D1D5DB] cursor-pointer"
                      />
                    </th>
                    <th className="px-6 py-3">School Name</th>
                    <th className="px-6 py-3">Location</th>
                    <th className="px-6 py-3">Imported</th>
                  </tr>
                </thead>
                <tbody>
                  {schools.map((school) => (
                    <tr
                      key={school.id}
                      className={`border-b border-[#F2F4F7] ${
                        selectedIds.has(school.id) ? "bg-[#FEF2F2]" : ""
                      } hover:bg-[#F9FAFB]`}
                    >
                      <td className="w-12 px-6 py-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(school.id)}
                          onChange={() => toggleSelect(school.id)}
                          className="w-4 h-4 rounded border-[#D1D5DB] cursor-pointer"
                        />
                      </td>
                      <td className="px-6 py-3 text-[#030711] font-medium">
                        {school.school_name}
                      </td>
                      <td className="px-6 py-3 text-[#737786]">
                        {school.city}, {school.state} {school.zipcode}
                      </td>
                      <td className="px-6 py-3 text-[#737786]">
                        {formatDate(school.imported_at || school.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
