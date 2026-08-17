"use client";

import { ChevronLeftIcon as PageBackIcon, ChevronRightIcon as PageForwardIcon, ApproveIcon, RejectIcon } from "@/lib/icons";
import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useDebounce } from "@/lib/useDebounce";

type AccessStatus = "none" | "pending" | "approved" | "rejected" | "revoked";

interface SchoolAccessRow {
  id: string;
  school_name: string;
  city: string | null;
  state: string | null;
  access: {
    status: AccessStatus;
    decidedAt: string | null;
    requestedAt: string | null;
  };
}

interface TargetUser {
  id: string;
  full_name: string;
  email: string;
  role: string;
}

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M8 3.99979C6.93913 3.99979 5.92172 4.42122 5.17157 5.17136C4.42143 5.92151 4 6.93892 4 7.99979C4 9.06066 4.42143 10.0781 5.17157 10.8282C5.92172 11.5784 6.93913 11.9998 8 11.9998C9.06087 11.9998 10.0783 11.5784 10.8284 10.8282C11.5786 10.0781 12 9.06066 12 7.99979C12 6.93892 11.5786 5.92151 10.8284 5.17136C10.0783 4.42122 9.06087 3.99979 8 3.99979ZM2 7.99979C1.99988 7.05549 2.22264 6.1245 2.65017 5.28253C3.0777 4.44056 3.69792 3.71139 4.4604 3.15432C5.22287 2.59724 6.10606 2.228 7.03815 2.07662C7.97023 1.92524 8.92488 1.996 9.82446 2.28314C10.724 2.57028 11.5432 3.06569 12.2152 3.72909C12.8872 4.39248 13.3931 5.20512 13.6919 6.10092C13.9906 6.99672 14.0737 7.95038 13.9343 8.88434C13.795 9.8183 13.4372 10.7062 12.89 11.4758L17.707 16.2928C17.8892 16.4814 17.99 16.734 17.9877 16.9962C17.9854 17.2584 17.8802 17.5092 17.6948 17.6946C17.5094 17.88 17.2586 17.9852 16.9964 17.9875C16.7342 17.9897 16.4816 17.8889 16.293 17.7068L11.477 12.8908C10.5794 13.5291 9.52335 13.9079 8.42468 13.9859C7.326 14.0639 6.22707 13.8379 5.2483 13.3328C4.26953 12.8276 3.44869 12.0628 2.87572 11.1221C2.30276 10.1815 1.99979 9.10122 2 7.99979Z"
      fill="#323152"
    />
  </svg>
);

const ChevronDownIcon = () => (
  <svg width="9" height="6" viewBox="0 0 9 6" fill="none">
    <path fillRule="evenodd" clipRule="evenodd" d="M4.91762 4.91753C4.7926 5.04251 4.62306 5.11272 4.44628 5.11272C4.26951 5.11272 4.09997 5.04251 3.97495 4.91753L0.203617 1.14619C0.139944 1.08469 0.0891555 1.01113 0.0542161 0.929795C0.0192768 0.848459 0.000885935 0.760979 0.000116724 0.67246C-0.000652487 0.58394 0.0162155 0.496154 0.0497361 0.414223C0.0832567 0.332292 0.132759 0.257857 0.195354 0.195262C0.257949 0.132667 0.332383 0.0831648 0.414314 0.0496442C0.496245 0.0161236 0.584032 -0.00074404 0.672551 2.51714e-05C0.761071 0.000794382 0.848551 0.0191852 0.929887 0.0541246C1.01122 0.0890639 1.08479 0.139852 1.14628 0.203525L4.44628 3.50353L7.74628 0.203525C7.87202 0.0820866 8.04042 0.0148904 8.21522 0.0164093C8.39002 0.0179282 8.55722 0.0880407 8.68083 0.211646C8.80443 0.335252 8.87455 0.50246 8.87607 0.677258C8.87759 0.852056 8.81039 1.02046 8.68895 1.14619L4.91762 4.91753Z" fill="#1E1E1E" />
  </svg>
);

const STATUS_OPTIONS: { value: Exclude<AccessStatus, "none">; label: string }[] = [
  { value: "approved", label: "Access Granted" },
  { value: "pending", label: "Pending Request" },
  { value: "rejected", label: "Rejected" },
  { value: "revoked", label: "Revoked" },
];

function AccessBadge({ status }: { status: AccessStatus }) {
  const styles: Record<AccessStatus, string> = {
    approved: "bg-[#BBFBE6] text-[#2D7D65]",
    pending: "bg-[#FFEABD] text-[#E8A411]",
    rejected: "bg-[#FFE0E0] text-[#E02C2C]",
    revoked: "bg-[#F2F2F2] text-[#6F6C70]",
    none: "bg-[#F2F2F2] text-[#6F6C70]",
  };

  const labels: Record<AccessStatus, string> = {
    approved: "Access Granted",
    pending: "Pending Request",
    rejected: "Rejected",
    revoked: "Revoked",
    none: "No Access",
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-md font-inter text-xs font-semibold leading-[15px] ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

export default function SchoolAccessPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params?.userId as string;

  const [targetUser, setTargetUser] = useState<TargetUser | null>(null);
  const [schools, setSchools] = useState<SchoolAccessRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalSchools, setTotalSchools] = useState(0);
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [statusFilter, setStatusFilter] = useState<Exclude<AccessStatus, "none">[]>([]);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const debouncedSearch = useDebounce(search, 500);
  const hasLoadedOnceRef = useRef(false);
  const statusDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  useEffect(() => {
    if (!isStatusOpen) return;

    function handleClickOutside(e: MouseEvent) {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(e.target as Node)) {
        setIsStatusOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isStatusOpen]);

  const toggleStatusFilter = (value: Exclude<AccessStatus, "none">) => {
    setStatusFilter((prev) =>
      prev.includes(value) ? prev.filter((s) => s !== value) : [...prev, value]
    );
    setCurrentPage(1);
  };

  const clearStatusFilter = () => {
    setStatusFilter([]);
    setCurrentPage(1);
  };

  const fetchSchools = useCallback(async () => {
    try {
      // Only show the full-table loading state on the very first load.
      // Page/search/filter changes just refresh the rows in place.
      if (!hasLoadedOnceRef.current) setIsLoading(true);
      setIsFetching(true);

      const searchParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
        ...(debouncedSearch && { search: debouncedSearch }),
      });
      statusFilter.forEach((status) => searchParams.append("status", status));

      const response = await fetch(`/api/admin/users/${userId}/school-access?${searchParams}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch schools");
      }

      setTargetUser(data.user);
      setSchools(data.schools || []);
      setTotalPages(data.pagination?.totalPages || 0);
      setTotalSchools(data.pagination?.total || 0);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      hasLoadedOnceRef.current = true;
      setIsLoading(false);
      setIsFetching(false);
    }
  }, [userId, currentPage, debouncedSearch, statusFilter]);

  useEffect(() => {
    if (userId) fetchSchools();
  }, [userId, fetchSchools]);

  const handleAction = async (schoolId: string, action: "grant" | "approve" | "reject" | "revoke") => {
    try {
      setActioningId(schoolId);

      const response = await fetch(`/api/admin/users/${userId}/school-access`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schoolId, action }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to update access");
        return;
      }

      const messages: Record<string, string> = {
        grant: "Access granted",
        approve: "Request approved",
        reject: "Request rejected",
        revoke: "Access revoked",
      };

      toast.success(messages[action]);
      await fetchSchools();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setActioningId(null);
    }
  };

  return (
    <main className="flex-1 overflow-y-auto p-6 lg:p-8">
      {/* Page header */}
      <div className="flex flex-col gap-1 mb-4 sm:mb-6">
        <button
          onClick={() => router.push("/admin/users")}
          className="flex items-center gap-2 text-[#0171F9] hover:text-blue-700 transition-colors mb-2 cursor-pointer w-fit"
        >
          <PageBackIcon fill="#0171F9" />
          <span className="font-inter text-sm font-medium">Back to Users</span>
        </button>
        <h1 className="font-outfit font-semibold text-2xl sm:text-3xl text-[#121212] leading-5">
          Manage School Access
        </h1>
        {targetUser && (
          <p className="font-inter text-sm text-[#6F6C70] mt-1">
            {targetUser.full_name} &middot; {targetUser.email}
          </p>
        )}
      </div>

      {/* Table card */}
      <div className="bg-white rounded-lg overflow-hidden">
        {/* Search + status filter */}
        <div className="px-4 py-4 border-b border-[#E5E7EB] flex flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-2.5 w-full sm:max-w-[420px] px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border border-[#E5E7EB] bg-white">
            <SearchIcon />
            <input
              type="text"
              placeholder="Search schools by name"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent outline-none font-inter font-medium text-sm sm:text-[15px] text-[#323152] placeholder:text-[#323152] placeholder:opacity-50 leading-[150%]"
            />
          </div>

          <div className="relative" ref={statusDropdownRef}>
            <button
              type="button"
              onClick={() => setIsStatusOpen((open) => !open)}
              className="cursor-pointer flex items-center justify-between gap-2.5 w-full sm:w-[200px] px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border border-[#E5E7EB] bg-white font-inter font-medium text-sm sm:text-[15px] text-[#323152]"
            >
              <span>
                {statusFilter.length === 0
                  ? "Status: All"
                  : `Status (${statusFilter.length} selected)`}
              </span>
              <ChevronDownIcon />
            </button>

            {isStatusOpen && (
              <div className="absolute z-20 mt-2 w-full sm:w-[240px] rounded-lg border border-[#E5E7EB] bg-white shadow-lg p-2">
                {STATUS_OPTIONS.map((option) => (
                  <label
                    key={option.value}
                    className="flex items-center gap-2.5 px-2.5 py-2 rounded-md hover:bg-[#FAFAFA] cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={statusFilter.includes(option.value)}
                      onChange={() => toggleStatusFilter(option.value)}
                      className="w-4 h-4 accent-[#0171F9] cursor-pointer"
                    />
                    <span className="font-inter font-normal text-sm text-[#030711]">
                      {option.label}
                    </span>
                  </label>
                ))}

                {statusFilter.length > 0 && (
                  <>
                    <div className="h-px bg-[#E5E7EB] my-1.5" />
                    <button
                      type="button"
                      onClick={clearStatusFilter}
                      className="cursor-pointer w-full text-left px-2.5 py-1.5 rounded-md font-inter font-medium text-xs text-[#0171F9] hover:bg-[#EFF6FF]"
                    >
                      Clear filters
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-max">
            <thead>
              <tr className="border-y border-[#E5E7EB] bg-white">
                <th className="text-left px-2 sm:px-5 py-2.5 sm:py-[14px] font-inter font-medium text-[12px] sm:text-sm text-[#6F6C70] uppercase whitespace-nowrap">
                  School Name
                </th>
                <th className="text-left px-2 sm:px-3 py-2.5 sm:py-[14px] font-inter font-medium text-[12px] sm:text-sm text-[#6F6C70] uppercase whitespace-nowrap">
                  Location
                </th>
                <th className="text-left px-2 sm:px-3 py-2.5 sm:py-[14px] font-inter font-medium text-[12px] sm:text-sm text-[#6F6C70] uppercase whitespace-nowrap">
                  Access Status
                </th>
                <th className="text-left px-2 sm:px-3 py-2.5 sm:py-[14px] font-inter font-medium text-[12px] sm:text-sm text-[#6F6C70] uppercase whitespace-nowrap">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={4} className="px-4 sm:px-5 py-8 sm:py-10 text-center font-inter text-xs sm:text-sm text-[#6F6C70]">
                    Loading schools...
                  </td>
                </tr>
              )}

              {error && !isLoading && (
                <tr>
                  <td colSpan={4} className="px-4 sm:px-5 py-8 sm:py-10 text-center font-inter text-xs sm:text-sm text-red-600">
                    Error: {error}
                  </td>
                </tr>
              )}

              {!isLoading && !error && schools.map((school) => (
                <tr key={school.id} className="border-b border-[#F2F4F7] hover:bg-[#FAFAFA] transition-colors">
                  <td className="px-2 sm:px-5 py-3 sm:py-[17.5px] align-middle">
                    <span className="font-inter font-normal text-[12px] sm:text-[14px] text-[#030711] leading-5">
                      {school.school_name}
                    </span>
                  </td>
                  <td className="px-2 sm:px-3 py-3 sm:py-[17.5px] align-middle">
                    <span className="font-inter font-normal text-[11px] sm:text-[14px] text-[#030711] leading-5">
                      {[school.city, school.state].filter(Boolean).join(", ") || "-"}
                    </span>
                  </td>
                  <td className="px-2 sm:px-3 py-3 sm:py-[17.5px] align-middle">
                    <AccessBadge status={school.access.status} />
                  </td>
                  <td className="px-2 sm:px-3 py-3 sm:py-[17.5px] align-middle">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      {school.access.status === "pending" ? (
                        <>
                          <button
                            onClick={() => handleAction(school.id, "approve")}
                            disabled={actioningId === school.id}
                            className="cursor-pointer flex items-center gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded border border-[#E5E7EB] bg-white font-inter font-normal text-xs sm:text-[14px] text-[#030711] hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                          >
                            <ApproveIcon />
                            Approve
                          </button>
                          <button
                            onClick={() => handleAction(school.id, "reject")}
                            disabled={actioningId === school.id}
                            className="cursor-pointer flex items-center gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded border border-[#E5E7EB] bg-white font-inter font-normal text-xs sm:text-[14px] text-[#030711] hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                          >
                            <RejectIcon />
                            Reject
                          </button>
                        </>
                      ) : school.access.status === "approved" ? (
                        <button
                          onClick={() => handleAction(school.id, "revoke")}
                          disabled={actioningId === school.id}
                          className="cursor-pointer px-2 sm:px-4 py-1 sm:py-1.5 rounded border border-[#E02C2C] bg-white font-inter font-normal text-xs sm:text-[14px] text-[#E02C2C] hover:bg-[#FFF5F5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                        >
                          {actioningId === school.id ? "Revoking..." : "Revoke Access"}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleAction(school.id, "grant")}
                          disabled={actioningId === school.id}
                          className="cursor-pointer px-2 sm:px-4 py-1 sm:py-1.5 rounded bg-[#0171F9] font-inter font-normal text-xs sm:text-[14px] text-white hover:bg-[#0562d8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                        >
                          {actioningId === school.id ? "Granting..." : "Grant Access"}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {!isLoading && !error && schools.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 sm:px-5 py-8 sm:py-10 text-center font-inter text-xs sm:text-sm text-[#6F6C70]">
                    No schools found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!isLoading && !error && (
          <div className="flex items-center justify-between px-4 sm:px-5 py-4 border-t border-[#E5E7EB]">
            <div className="font-inter font-normal text-xs sm:text-sm text-[#6F6C70]">
              Showing {totalSchools === 0 ? 0 : (currentPage - 1) * 10 + 1} to {Math.min(currentPage * 10, totalSchools)} of {totalSchools} schools
            </div>
            <div className="flex items-center gap-1 sm:gap-2 order-1 sm:order-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1 || isFetching}
                className="cursor-pointer w-8 sm:w-[38px] h-8 sm:h-[38px] flex items-center justify-center rounded-lg border border-[#E5E7EB] bg-white disabled:opacity-40 hover:bg-gray-50 transition-colors disabled:cursor-not-allowed whitespace-nowrap"
              >
                <PageBackIcon />
              </button>

              {Array.from({ length: Math.min(4, totalPages) }, (_, i) => {
                const pageNumber = Math.max(1, currentPage - 2) + i;
                return pageNumber <= totalPages ? (
                  <button
                    key={pageNumber}
                    onClick={() => setCurrentPage(pageNumber)}
                    disabled={isFetching}
                    className={`cursor-pointer w-8 sm:w-[38px] h-8 sm:h-[38px] flex items-center justify-center rounded-lg font-inter text-[13px] sm:text-[15px] transition-colors ${
                      currentPage === pageNumber
                        ? "bg-[#0171F9] text-white font-semibold"
                        : "border border-[#E5E7EB] bg-white text-[#323152] font-medium hover:bg-gray-50"
                    }`}
                  >
                    {pageNumber}
                  </button>
                ) : null;
              })}

              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages || isFetching || totalPages === 0}
                className="cursor-pointer w-8 sm:w-[38px] h-8 sm:h-[38px] flex items-center justify-center rounded-lg border border-[#E5E7EB] bg-white disabled:opacity-40 hover:bg-gray-50 transition-colors disabled:cursor-not-allowed whitespace-nowrap"
              >
                <PageForwardIcon />
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
