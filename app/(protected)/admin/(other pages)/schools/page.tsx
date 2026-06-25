"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "@/lib/icons";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";



// ─── Icons ────────────────────────────────────────────────────────────────────

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
    <path fillRule="evenodd" clipRule="evenodd" d="M8 3.99979C6.93913 3.99979 5.92172 4.42122 5.17157 5.17136C4.42143 5.92151 4 6.93892 4 7.99979C4 9.06066 4.42143 10.0781 5.17157 10.8282C5.92172 11.5784 6.93913 11.9998 8 11.9998C9.06087 11.9998 10.0783 11.5784 10.8284 10.8282C11.5786 10.0781 12 9.06066 12 7.99979C12 6.93892 11.5786 5.92151 10.8284 5.17136C10.0783 4.42122 9.06087 3.99979 8 3.99979ZM2 7.99979C1.99988 7.05549 2.22264 6.1245 2.65017 5.28253C3.0777 4.44056 3.69792 3.71139 4.4604 3.15432C5.22287 2.59724 6.10606 2.228 7.03815 2.07662C7.97023 1.92524 8.92488 1.996 9.82446 2.28314C10.724 2.57028 11.5432 3.06569 12.2152 3.72909C12.8872 4.39248 13.3931 5.20512 13.6919 6.10092C13.9906 6.99672 14.0737 7.95038 13.9343 8.88434C13.795 9.8183 13.4372 10.7062 12.89 11.4758L17.707 16.2928C17.8892 16.4814 17.99 16.734 17.9877 16.9962C17.9854 17.2584 17.8802 17.5092 17.6948 17.6946C17.5094 17.88 17.2586 17.9852 16.9964 17.9875C16.7342 17.9897 16.4816 17.8889 16.293 17.7068L11.477 12.8908C10.5794 13.5291 9.52335 13.9079 8.42468 13.9859C7.326 14.0639 6.22707 13.8379 5.2483 13.3328C4.26953 12.8276 3.44869 12.0628 2.87572 11.1221C2.30276 10.1815 1.99979 9.10122 2 7.99979Z" fill="#323152" />
  </svg>
);

const SentimentIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <g clipPath="url(#clip0_smile)">
      <path d="M9.53792 6C9.66836 6.20146 9.84979 6.3676 10.0652 6.48277C10.2805 6.59795 10.5227 6.65839 10.769 6.65839C11.0152 6.65839 11.2574 6.59795 11.4728 6.48277C11.6881 6.3676 11.8696 6.20146 12 6M6.46144 6C6.33097 6.20132 6.14956 6.36733 5.93426 6.48242C5.71897 6.59751 5.47687 6.65789 5.23072 6.65789C4.98457 6.65789 4.74247 6.59751 4.52718 6.48242C4.31188 6.36733 4.13047 6.20132 4 6M4.30752 9.62581C4.61131 10.3289 5.12406 10.9296 5.78115 11.352C6.43825 11.7745 7.21029 12 8 12C8.78971 12 9.56175 11.7745 10.2188 11.352C10.8759 10.9296 11.3887 10.3289 11.6925 9.62581" stroke="#191919" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8.00033 15.3337C12.0503 15.3337 15.3337 12.0503 15.3337 8.00033C15.3337 3.95033 12.0503 0.666992 8.00033 0.666992C3.95033 0.666992 0.666992 3.95033 0.666992 8.00033C0.666992 12.0503 3.95033 15.3337 8.00033 15.3337Z" stroke="#191919" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" />
    </g>
    <defs>
      <clipPath id="clip0_smile"><rect width="16" height="16" fill="white" /></clipPath>
    </defs>
  </svg>
);



const ChevronDownIcon = () => (
  <svg width="9" height="6" viewBox="0 0 9 6" fill="none">
    <path fillRule="evenodd" clipRule="evenodd" d="M4.91762 4.91753C4.7926 5.04251 4.62306 5.11272 4.44628 5.11272C4.26951 5.11272 4.09997 5.04251 3.97495 4.91753L0.203617 1.14619C0.139944 1.08469 0.0891555 1.01113 0.0542161 0.929795C0.0192768 0.848459 0.000885935 0.760979 0.000116724 0.67246C-0.000652487 0.58394 0.0162155 0.496154 0.0497361 0.414223C0.0832567 0.332292 0.132759 0.257857 0.195354 0.195262C0.257949 0.132667 0.332383 0.0831648 0.414314 0.0496442C0.496245 0.0161236 0.584032 -0.00074404 0.672551 2.51714e-05C0.761071 0.000794382 0.848551 0.0191852 0.929887 0.0541246C1.01122 0.0890639 1.08479 0.139852 1.14628 0.203525L4.44628 3.50353L7.74628 0.203525C7.87202 0.0820866 8.04042 0.0148904 8.21522 0.0164093C8.39002 0.0179282 8.55722 0.0880407 8.68083 0.211646C8.80443 0.335252 8.87455 0.50246 8.87607 0.677258C8.87759 0.852056 8.81039 1.02046 8.68895 1.14619L4.91762 4.91753Z" fill="#1E1E1E" />
  </svg>
);


const PlusIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path d="M9 11H4C3.71667 11 3.47934 10.904 3.288 10.712C3.09667 10.52 3.00067 10.2827 3 10C2.99934 9.71733 3.09534 9.48 3.288 9.288C3.48067 9.096 3.718 9 4 9H9V4C9 3.71667 9.096 3.47934 9.288 3.288C9.48 3.09667 9.71733 3.00067 10 3C10.2827 2.99934 10.5203 3.09534 10.713 3.288C10.9057 3.48067 11.0013 3.718 11 4V9H16C16.2833 9 16.521 9.096 16.713 9.288C16.905 9.48 17.0007 9.71733 17 10C16.9993 10.2827 16.9033 10.5203 16.712 10.713C16.5207 10.9057 16.2833 11.0013 16 11H11V16C11 16.2833 10.904 16.521 10.712 16.713C10.52 16.905 10.2827 17.0007 10 17C9.71733 16.9993 9.48 16.9033 9.288 16.712C9.096 16.5207 9 16.2833 9 16V11Z" fill="white" />
  </svg>
);

// ─── Types ────────────────────────────────────────────────────────────────────

type RiskLevel = "High" | "Medium" | "Low";



const riskStyles: any = {
  High: { bg: "bg-[#FFECEC]", text: "text-[#E53E3E]" },
  Medium: { bg: "bg-[#FFF4E0]", text: "text-[#FFA600]" },
  Low: { bg: "bg-[#E6FBF0]", text: "text-[#22A45D]" },
};

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SchoolsPage() {
  const [search, setSearch] = useState("");
  const [locationFilter, setLocationFilter] = useState("All");
  const [riskFilter, setRiskFilter] = useState<"All" | RiskLevel>("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [paginated, setPaginated] = useState<Report[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [states, setStates] = useState<string[]>([]);
  const router = useRouter();
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: itemsPerPage.toString(),
          search: search.trim(),
          risk: riskFilter,
          state: locationFilter
        });

        const response = await fetch(`/api/schools?${params}`);

        if (!response.ok) {
          throw new Error(`Failed to fetch reports: ${response.statusText}`);
        }

        const data = await response.json();
        // setStates(data.states || []);
        setPaginated(data?.schools || []);
        setTotalPages(data.totalPages || 1);
        setTotal(data.total || 0);
        setError(null);
      } catch (err) {
        console.error("Error fetching reports:", err);
        if (initialLoading) {
          setError(err instanceof Error ? err.message : "Failed to fetch reports");
          setPaginated([]);
          setTotalPages(1);
          setTotal(0);
        }
      } finally {
        if (initialLoading) setInitialLoading(false);
      }
    };

    fetchReports();
  }, [currentPage, search, initialLoading, locationFilter, riskFilter]);

 
  if (initialLoading) {
    return (
      <main className="flex-1 overflow-y-auto p-6 lg:p-8 relative flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#E5E7EB] border-t-[#0171F9] rounded-full animate-spin" />
          <p className="font-inter text-[#6B7280]">Loading schools...</p>
        </div>
      </main>
    );
  }

  const handleFilterChange = (setter: (v: any) => void) => (val: any) => {
    setter(val);
    setCurrentPage(1);
  };


  return (
    <main className="flex-1 overflow-y-auto p-6 lg:p-8">
      {/* Page header */}
      <div className="flex flex-row items-center justify-between gap-4 sm:gap-6 mb-4 sm:mb-6 lg:mb-8">
        <h1 className="font-outfit font-semibold text-2xl sm:text-3xl text-[#121212] leading-5">Schools</h1>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Link
            href="/admin/schools/import"
            className="flex items-center gap-1.5 px-3 sm:px-[17px] py-2 sm:py-3 rounded-lg border border-[#0171F9] bg-white shadow-sm hover:bg-[#EFF6FF] transition-colors cursor-pointer"
          >
            <span className="font-inter font-semibold text-sm sm:text-base text-[#0171F9] leading-6">
              Import
            </span>
          </Link>
          <Link
            href="/admin/schools/create"
            className="flex items-center gap-1.5 px-3 sm:px-[17px] py-2 sm:py-3 rounded-lg bg-[#0171F9] shadow-sm hover:bg-[#0161d9] transition-colors cursor-pointer"
          >
            <PlusIcon />
            <span className="font-inter font-semibold text-sm sm:text-base text-white leading-6">
              Create
            </span>
          </Link>
        </div>
      </div>

      {/* Table card */}
      <div className="bg-white rounded-lg overflow-hidden">
        {/* Search + Filters */}
        <div className="px-4 pt-4 pb-0 flex flex-col gap-3 sm:gap-4">
          {/* Search */}
          <div className="w-full max-w-[540px] ">
            <div className="flex items-center gap-2  sm:gap-2.5 h-10 sm:h-11 px-3 sm:px-4 rounded-[14px] border border-[#EBEBF0] bg-[#FBFBFC]">
              <span className="opacity-70 flex-shrink-0"><SearchIcon /></span>
              <input
                type="text"
                placeholder="Search by School name and Location"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                className="flex-1 bg-transparent outline-none font-inter font-medium text-sm sm:text-[15px] text-[#323152] placeholder:text-[#323152] placeholder:opacity-50 leading-[150%]"
              />
            </div>
          </div>

          {/* Filter dropdowns */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 pb-3 sm:pb-4">
            {/* Location */}
            {/* <div className="relative flex-1 sm:flex-none">
              <select
                  value={locationFilter}
                  onChange={(e) =>
                    handleFilterChange(setLocationFilter)(e.target.value)
                  }
                  className="w-full appearance-none pl-9 sm:pl-10 pr-7 sm:pr-8 py-2.5 sm:py-[11px] rounded-[10px] border border-[rgba(178,178,178,0.20)] bg-[#FAFCFF] font-inter text-xs sm:text-sm text-[#121212] opacity-80 cursor-pointer outline-none"
                >
                  <option value="All">Location: All</option>

                  {states?.map((state: string) => (
                    <option key={state} value={state}>
                      Location: {state}
                    </option>
                  ))}
                </select>
              <span className="pointer-events-none absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2"><LocationIcon /></span>
              <span className="pointer-events-none absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2"><ChevronDownIcon /></span>
            </div> */}

            {/* Risk */}
            <div className="relative flex-1 sm:flex-none">
              <select
                value={riskFilter}
                onChange={(e) => handleFilterChange(setRiskFilter)(e.target.value as "All" | RiskLevel)}
                className="w-full appearance-none pl-9 sm:pl-10 pr-7 sm:pr-8 py-2.5 sm:py-[11px] rounded-[10px] border border-[rgba(178,178,178,0.20)] bg-[#FAFCFF] font-inter text-xs sm:text-sm text-[#121212] opacity-80 cursor-pointer outline-none"
              >
                <option value="All">Risk: All</option>
                <option value="High">Risk: High</option>
                <option value="Medium">Risk: Medium</option>
                <option value="Low">Risk: Low</option>
              </select>
              <span className="pointer-events-none absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2"><SentimentIcon /></span>
              <span className="pointer-events-none absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2"><ChevronDownIcon /></span>
            </div>

            {/* Status */}
            {/* <div className="relative flex-1 sm:flex-none">
              <select
                value={statusFilter}
                onChange={(e) => handleFilterChange(setStatusFilter)(e.target.value as "All" | SchoolStatus)}
                className="w-full appearance-none pl-9 sm:pl-10 pr-7 sm:pr-8 py-2.5 sm:py-[11px] rounded-[10px] border border-[rgba(178,178,178,0.20)] bg-[#FAFCFF] font-inter text-xs sm:text-sm text-[#121212] opacity-80 cursor-pointer outline-none"
              >
                <option value="All">Status: All</option>
                <option value="Active">Status: Active</option>
                <option value="Inactive">Status: Inactive</option>
              </select>
              <span className="pointer-events-none absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2"><FilterIcon /></span>
              <span className="pointer-events-none absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2"><ChevronDownIcon /></span>
            </div> */}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-max border-collapse">
            <thead>
              <tr className="border-y border-[#E5E7EB] bg-white">
                <th className="text-left px-2 sm:px-4 lg:px-5 py-2.5 sm:py-3.5 font-inter font-medium text-[11px] sm:text-xs text-[#6F6C70] uppercase tracking-wide whitespace-nowrap">School Name</th>
                <th className="text-left px-2 sm:px-4 lg:px-5 py-2.5 sm:py-3.5 font-inter font-medium text-[11px] sm:text-xs text-[#6F6C70] uppercase tracking-wide whitespace-nowrap">Association</th>
                <th className="text-left px-2 sm:px-4 lg:px-5 py-2.5 sm:py-3.5 font-inter font-medium text-[11px] sm:text-xs text-[#6F6C70] uppercase tracking-wide whitespace-nowrap">School Year</th>
                <th className="text-left px-2 sm:px-4 lg:px-5 py-2.5 sm:py-3.5 font-inter font-medium text-[11px] sm:text-xs text-[#6F6C70] uppercase tracking-wide whitespace-nowrap">Location</th>
                <th className="text-left px-2 sm:px-4 lg:px-5 py-2.5 sm:py-3.5 font-inter font-medium text-[11px] sm:text-xs text-[#6F6C70] uppercase tracking-wide whitespace-nowrap">Teachers</th>
                <th className="text-left px-2 sm:px-4 lg:px-5 py-2.5 sm:py-3.5 font-inter font-medium text-[11px] sm:text-xs text-[#6F6C70] uppercase tracking-wide whitespace-nowrap">Risk</th>
                <th className="text-left px-2 sm:px-4 lg:px-5 py-2.5 sm:py-3.5 font-inter font-medium text-[11px] sm:text-xs text-[#6F6C70] uppercase tracking-wide whitespace-nowrap">Reports</th>
                {/* <th className="text-left px-2 sm:px-4 lg:px-5 py-2.5 sm:py-3.5 font-inter font-medium text-[11px] sm:text-xs text-[#6F6C70] uppercase tracking-wide whitespace-nowrap">Status</th> */}
                <th className="text-left px-2 sm:px-4 lg:px-5 py-2.5 sm:py-3.5 font-inter font-medium text-[11px] sm:text-xs text-[#6F6C70] uppercase tracking-wide whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 sm:px-6 lg:px-8 py-8 text-center font-inter text-sm text-[#6F6C70]">
                    No schools found.
                  </td>
                </tr>
              ) : (
                paginated.map((school: any) => {
                  const risk = riskStyles[school.calculated_risk];
                  return (
                    <tr key={school.id} onClick={()=>router.push(`/admin/schools/${school.id}`)} className="cursor-pointer border-b border-[#F2F4F7] hover:bg-[#F8FAFF] transition-colors">
                      <td className="px-2 sm:px-4 lg:px-5 py-2.5 sm:py-[17.5px] whitespace-nowrap">
                        <span className="font-inter font-normal text-[12px] sm:text-[14px] text-[#030711]">{school.school_name}</span>
                      </td>
                      <td className="px-3 sm:px-4 lg:px-5 py-3 sm:py-[15px] whitespace-nowrap">
                        <span className={`inline-flex items-center px-1.5 sm:px-3 py-0.5 sm:py-1 rounded-md font-inter font-medium text-[10px] sm:text-[13px] bg-[#DBECFF66] text-[#0171F9]`}>{school.school_association == "School District" ? school.school_district_name : school.school_association}</span>
                      </td>
                      <td className="px-2 sm:px-4 lg:px-5 py-2.5 sm:py-[17.5px] whitespace-nowrap">
                        <span className="font-inter font-normal text-[12px] sm:text-[14px] text-[#030711]">{school?.school_year}</span>
                      </td>
                      <td className="px-2 sm:px-4 lg:px-5 py-2.5 sm:py-[17.5px] whitespace-nowrap">
                        <span className="font-inter font-normal text-[12px] sm:text-[14px] text-[#030711]">
                          {school.city && school.state
                            ? `${school.city}, ${school.state}`
                            : school.city || school.state || ""}
                        </span>
                      </td>
                      <td className="px-2 sm:px-4 lg:px-5 py-2.5 sm:py-[17.5px] whitespace-nowrap">
                        <span className="font-inter font-normal text-[12px] sm:text-[14px] text-[#030711]">{school.teacher_count}</span>
                      </td>
                      <td className="px-2 sm:px-4 lg:px-5 py-2.5 sm:py-[17.5px] whitespace-nowrap">
                        {school.total_reports > 0 ? <span className={`inline-flex items-center px-1.5 sm:px-3 py-0.5 sm:py-1 rounded-md font-inter font-medium text-[10px] sm:text-[13px] ${risk?.bg} ${risk?.text}`}>
                          {school.calculated_risk}
                        </span> : 
                          <span className={`inline-flex items-center px-1.5 sm:px-3 py-0.5 sm:py-1 rounded-md font-inter font-medium text-[10px] sm:text-[13px] bg-[#F6F6F6] text-[#030711]`}>
                          Not sure
                        </span>
                        }
                      </td>
                      <td className="px-2 sm:px-4 lg:px-5 py-2.5 sm:py-[17.5px] whitespace-nowrap">
                        <span className="font-inter font-normal text-[12px] sm:text-[14px] text-[#030711]">{school.total_reports}</span>
                      </td>
                      {/* <td className="px-2 sm:px-4 lg:px-5 py-2.5 sm:py-[17.5px] whitespace-nowrap">
                        <span className="inline-flex items-center px-1.5 sm:px-3 py-0.5 sm:py-1 rounded-md border border-[#EFF0F2] bg-[#F6F6F6] font-inter font-normal text-[10px] sm:text-sm text-[#030711]">
                          {school.status}
                        </span>
                      </td> */}
                      <td className="px-2 sm:px-4 lg:px-5 py-2.5 sm:py-[17.5px] whitespace-nowrap">
                        <Link href={`/admin/schools/${school.id}`} className="flex items-center justify-center h-8 sm:h-9 px-2 sm:px-3.5 rounded-md border border-[#EFF0F2] bg-white font-inter font-normal text-[12px] sm:text-[14px] text-black opacity-80 tracking-[-0.2px] hover:opacity-100 transition-opacity">
                          View Detail
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-4 border-t border-[#E5E7EB]">
          <span className="font-inter font-normal text-xs sm:text-sm text-[#191C1E] opacity-80 order-2 sm:order-1">
            <div className="font-inter font-normal text-xs sm:text-sm text-[#6F6C70]">
                Showing {(currentPage - 1) * 10 + 1} to {Math.min(currentPage * 10, total)} of {total} schools
              </div>
          </span>
          <div className="flex items-center gap-1 sm:gap-2 order-1 sm:order-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={`${currentPage === 1 ? "" : "cursor-pointer"} w-8 sm:w-[38px] h-8 sm:h-[38px] flex items-center justify-center rounded-lg border border-[#E5E7EB] bg-white disabled:opacity-40 hover:bg-gray-50 transition-colors`}
            >
              <ChevronLeftIcon />
            </button>
            {Array.from({ length: Math.min(4, totalPages) }, (_, i) => {
              const pageNumber = Math.max(1, currentPage - 2) + i;
              return pageNumber <= totalPages ? (
                <button
                  key={pageNumber}
                  onClick={() => setCurrentPage(pageNumber)}
                  className={`cursor-pointer w-8 sm:w-[38px] h-8 sm:h-[38px] flex items-center justify-center rounded-lg font-inter text-[13px] sm:text-[15px] transition-colors ${currentPage === pageNumber
                      ? "bg-[#0171F9] text-white font-semibold"
                      : "border border-[#E5E7EB] bg-white text-[#323152] font-medium hover:bg-gray-50"
                    }`}
                >
                  {pageNumber}
                </button>
              ) : null;
            })}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className={`${currentPage === totalPages ? "" : "cursor-pointer"} w-8 sm:w-[38px] h-8 sm:h-[38px] flex items-center justify-center rounded-lg border border-[#E5E7EB] bg-white disabled:opacity-40 hover:bg-gray-50 transition-colors`}
            >
              <ChevronRightIcon />
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
