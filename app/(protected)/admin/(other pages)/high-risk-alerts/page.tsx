'use client';

import { colors, getTeacherColor } from "@/lib/function";
import { ChevronLeftIcon, ChevronRightIcon } from "@/lib/icons";
import { Report } from "@/lib/types";
import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const EmptyStateIcon = () => (
  <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="60" cy="60" r="60" fill="#F3F4F6" />
    <path d="M60 30C43.4315 30 30 43.4315 30 60C30 76.5685 43.4315 90 60 90C76.5685 90 90 76.5685 90 60C90 43.4315 76.5685 30 60 30ZM60 84C46.7452 84 36 73.2548 36 60C36 46.7452 46.7452 36 60 36C73.2548 36 84 46.7452 84 60C84 73.2548 73.2548 84 60 84Z" fill="#D1D5DB" />
    <path d="M60 42C58.9 42 58 42.9 58 44V60C58 61.1 58.9 62 60 62C61.1 62 62 61.1 62 60V44C62 42.9 61.1 42 60 42Z" fill="#D1D5DB" />
    <path d="M60 66C58.9 66 58 66.9 58 68C58 69.1 58.9 70 60 70C61.1 70 62 69.1 62 68C62 66.9 61.1 66 60 66Z" fill="#D1D5DB" />
  </svg>
);

export default function HighRiskAlertsPage() {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [search, setSearch] = useState("");
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  const fetchReports = async (pageNum: number, searchQuery: string) => {
    // setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: "10",
        search: searchQuery,
      });

      const response = await fetch(`/api/admin/high-risk-teachers?${params}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch reports: ${response.statusText}`);
      }

      const data = await response.json();
      setTeachers(data.data);
      setPagination({
        page: data.page,
        limit: data.limit,
        total: data.total,
        totalPages: data.totalPages,
      });
    } catch (err) {
      console.error("Error fetching reports:", err);
      toast.error("Failed to fetch reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports(currentPage, search);
  }, [currentPage]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchReports(1, search);
  };

  const goToPage = (pageNum: number) => {
    setCurrentPage(pageNum);
  };

  if (loading) {
    return (
      <main className="flex-1 overflow-y-auto p-6 lg:p-8 relative flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#E5E7EB] border-t-[#0171F9] rounded-full animate-spin" />
          <p className="font-inter text-[#6B7280]">Loading high-risk alerts...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto p-6 lg:p-8">
      {/* Page title */}
      <div className="mb-6">
        <h1 className="font-outfit font-semibold text-2xl sm:text-3xl text-[#121212] leading-5">
          High-Risk Alerts
        </h1>
        <p className="font-outfit font-normal text-base sm:text-[18px] text-[#414141] mt-2">
          All high-risk reports
        </p>
      </div>

      {/* Search bar */}
      <div className="mb-6">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            placeholder="Search by teacher name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-lg border border-[#E5E7EB] bg-white font-inter text-sm text-[#121212] placeholder-[#9CA3AF] focus:outline-none focus:border-[#0171F9]"
          />
          <button
            type="submit"
            className="cursor-pointer px-6 py-2.5 rounded-lg bg-[#0171F9] font-inter font-medium text-sm text-white hover:bg-[#0159D4] transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {/* Alert cards */}
      <div className="bg-white rounded-lg overflow-hidden">
        <div className="px-4 py-6 flex flex-col gap-3 sm:gap-4">
        <div className="flex flex-col gap-6">
          
          {!loading && teachers?.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <EmptyStateIcon />
              <h3 className="mt-6 font-outfit font-semibold text-2xl text-[#121212]">
                No High-Risk Reports Found
              </h3>
              
              {search && <button
                onClick={() => {
                  setSearch("");
                  fetchReports(1, "");
                }}
                className="cursor-pointer mt-6 px-6 py-2.5 rounded-lg bg-[#0171F9] font-inter font-medium text-sm text-white hover:bg-[#0159D4] transition-colors"
              >
                Clear Filters
              </button>}
            </div>
          )}
          {!loading &&
            teachers?.map((teacher: any) => {
              const initials = teacher.name
                .split(' ')
                .map((n: string) => n[0])
                .join('')
                .toUpperCase();

              const color = getTeacherColor(teacher.name);
              
              return <div key={teacher.id} className="flex items-start gap-6 p-4 rounded-xl border border-[#F0F0F0] shadow-[0_0_6px_-1px_rgba(0,0,0,0.05)]">
                <div className="flex-1 flex flex-col gap-5">
                  <div className="flex items-start gap-3">
                    <div className="relative w-10 h-10 flex-shrink-0">
                      <div className={`w-10 h-10 rounded-[10px] ${color.bg}`} />

                      <span
                        className={`absolute inset-0 flex items-center justify-center font-outfit font-medium text-lg ${color.text}`}
                      >
                        {initials}
                      </span>
                    </div>
                    <div className="flex-1 flex flex-col gap-2">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <span className="font-outfit font-semibold text-md text-[#303030]">{teacher.name}</span>
                          <span className="px-3 py-0.5 rounded-xl bg-[#EC4143] font-inter text-sm text-white tracking-[0.5px]">High Risk</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Link href={`/admin/schools/${teacher.school_id}`} className="font-inter text-sm text-[#0171f9]">{teacher.school_name}</Link>
                          <span className="font-inter text-sm text-[#6B727F]">•</span>
                          <span className="font-inter text-sm text-[#353941]">Total {teacher.total_reports} {teacher.total_reports === 1 ? 'report' : 'reports'}</span>
                          <span className="font-inter text-sm text-[#6B727F]">•</span>
                          <span className="font-inter font-medium text-sm text-[#ec4143]">{(teacher.highRiskPercentage).toFixed(2)}% High Risk</span>
                        </div>
                      </div>
                      <p className="max-w-[70%] font-inter font-normal text-sm text-[#353941]">{teacher.ai_summary}</p>
                    </div>
                  </div>
                  {/* <button className="self-start flex items-center gap-1.5 px-4 py-1 rounded-lg bg-[#0171F9]">
                      <EyeIcon />
                      <span className="font-inter font-medium text-xs text-white leading-6">View</span>
                    </button> */}
                </div>
              </div>
            })}
        </div>
</div>
        {/* Pagination */}
        {!loading && teachers?.length !== 0 &&  (
          <div className="flex items-center justify-between px-4 sm:px-5 py-4 border-t border-[#E5E7EB]">
            <div className="font-inter text-sm text-[#6F6C70]">
              Showing {teachers.length > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0} to{" "}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} alerts
            </div>

            <div className="flex items-center gap-1 sm:gap-2 order-1 sm:order-2">
              <button
                onClick={() => goToPage(pagination.page - 1)}
                disabled={pagination.page === 1}
                className={`${pagination.page === 1 ? "" : "cursor-pointer"} w-8 sm:w-[38px] h-8 sm:h-[38px] flex items-center justify-center rounded-lg border border-[#E5E7EB] bg-white disabled:opacity-40 hover:bg-gray-50 transition-colors`}
              >
                <ChevronLeftIcon/>
              </button>

              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                .slice(Math.max(0, pagination.page - 2), Math.min(pagination.totalPages, pagination.page + 1))
                .map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => goToPage(pageNum)}
                    className={`cursor-pointer w-8 sm:w-[38px] h-8 sm:h-[38px] flex items-center justify-center rounded-lg font-inter text-[13px] sm:text-[15px] transition-colors ${pagination.page === pageNum
                      ? "bg-[#0171F9] text-white font-semibold"
                      : "border border-[#E5E7EB] bg-white text-[#323152] font-medium hover:bg-gray-50"
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}

              <button
                onClick={() => goToPage(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className={`${pagination.page === pagination.totalPages ? "" : "cursor-pointer"} w-8 sm:w-[38px] h-8 sm:h-[38px] flex items-center justify-center rounded-lg border border-[#E5E7EB] bg-white disabled:opacity-40 hover:bg-gray-50 transition-colors`}
              >
                <ChevronRightIcon/>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Dark backdrop overlay */}
      <div
        className={`fixed inset-0 bg-black z-40 transition-opacity duration-300 ${selectedReport ? "opacity-40 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
        onClick={() => setSelectedReport(null)}
      />

      {/* Right slide-in panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:max-w-[556px] bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${selectedReport ? "translate-x-0" : "translate-x-full"
          }`}
      >

      </div>
    </main>
  );
}
