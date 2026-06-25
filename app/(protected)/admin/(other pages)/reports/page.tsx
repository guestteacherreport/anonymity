"use client";

import ViewReport from "@/app/components/ViewReport";
import { formatDate, getSentiment } from "@/lib/function";
import { ChevronLeftIcon, ChevronRightIcon, RatingBar, ScoreCircle, StarRating } from "@/lib/icons";
import { Report, Sentiment } from "@/lib/types";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

// ─── Icon Components ──────────────────────────────────────────────────────────

const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path fillRule="evenodd" clipRule="evenodd" d="M8 3.99979C6.93913 3.99979 5.92172 4.42122 5.17157 5.17136C4.42143 5.92151 4 6.93892 4 7.99979C4 9.06066 4.42143 10.0781 5.17157 10.8282C5.92172 11.5784 6.93913 11.9998 8 11.9998C9.06087 11.9998 10.0783 11.5784 10.8284 10.8282C11.5786 10.0781 12 9.06066 12 7.99979C12 6.93892 11.5786 5.92151 10.8284 5.17136C10.0783 4.42122 9.06087 3.99979 8 3.99979ZM2 7.99979C1.99988 7.05549 2.22264 6.1245 2.65017 5.28253C3.0777 4.44056 3.69792 3.71139 4.4604 3.15432C5.22287 2.59724 6.10606 2.228 7.03815 2.07662C7.97023 1.92524 8.92488 1.996 9.82446 2.28314C10.724 2.57028 11.5432 3.06569 12.2152 3.72909C12.8872 4.39248 13.3931 5.20512 13.6919 6.10092C13.9906 6.99672 14.0737 7.95038 13.9343 8.88434C13.795 9.8183 13.4372 10.7062 12.89 11.4758L17.707 16.2928C17.8892 16.4814 17.99 16.734 17.9877 16.9962C17.9854 17.2584 17.8802 17.5092 17.6948 17.6946C17.5094 17.88 17.2586 17.9852 16.9964 17.9875C16.7342 17.9897 16.4816 17.8889 16.293 17.7068L11.477 12.8908C10.5794 13.5291 9.52335 13.9079 8.42468 13.9859C7.326 14.0639 6.22707 13.8379 5.2483 13.3328C4.26953 12.8276 3.44869 12.0628 2.87572 11.1221C2.30276 10.1815 1.99979 9.10122 2 7.99979Z" fill="#323152" />
  </svg>
);

const SentimentIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <g clipPath="url(#clip0_sentiment)">
      <path d="M9.53792 6C9.66836 6.20146 9.84979 6.3676 10.0652 6.48277C10.2805 6.59795 10.5227 6.65839 10.769 6.65839C11.0152 6.65839 11.2574 6.59795 11.4728 6.48277C11.6881 6.3676 11.8696 6.20146 12 6M6.46144 6C6.33097 6.20132 6.14956 6.36733 5.93426 6.48242C5.71897 6.59751 5.47687 6.65789 5.23072 6.65789C4.98457 6.65789 4.74247 6.59751 4.52718 6.48242C4.31188 6.36733 4.13047 6.20132 4 6M4.30752 9.62581C4.61131 10.3289 5.12406 10.9296 5.78115 11.352C6.43825 11.7745 7.21029 12 8 12C8.78971 12 9.56175 11.7745 10.2188 11.352C10.8759 10.9296 11.3887 10.3289 11.6925 9.62581" stroke="#191919" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8.00033 15.3337C12.0503 15.3337 15.3337 12.0503 15.3337 8.00033C15.3337 3.95033 12.0503 0.666992 8.00033 0.666992C3.95033 0.666992 0.666992 3.95033 0.666992 8.00033C0.666992 12.0503 3.95033 15.3337 8.00033 15.3337Z" stroke="#191919" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" />
    </g>
    <defs>
      <clipPath id="clip0_sentiment"><rect width="16" height="16" fill="white" /></clipPath>
    </defs>
  </svg>
);

const FilterIcon = () => (
  <svg width="13" height="14" viewBox="0 0 13 14" fill="none">
    <path d="M12.3693 1.59682C12.3693 1.1779 12.3693 0.968438 12.287 0.80835C12.2155 0.667711 12.1013 0.553289 11.9609 0.481442C11.8008 0.399902 11.5913 0.399902 11.1724 0.399902H1.59706C1.17814 0.399902 0.968682 0.399902 0.808594 0.481442C0.667842 0.553162 0.553406 0.667598 0.481687 0.80835C0.400147 0.968438 0.400146 1.1779 0.400146 1.59682V2.14815C0.400146 2.33143 0.400146 2.42269 0.421092 2.50872C0.43941 2.58531 0.469706 2.65852 0.510861 2.72566C0.556494 2.80047 0.621576 2.86555 0.750245 2.99497L4.53774 6.78171C4.66716 6.91113 4.73224 6.97621 4.77787 7.05102C4.81926 7.11884 4.84919 7.19116 4.86764 7.26796C4.88858 7.35324 4.88858 7.44376 4.88858 7.62255V11.1804C4.88858 11.8215 4.88858 12.1424 5.02324 12.3354C5.08166 12.4189 5.15651 12.4895 5.24321 12.5431C5.32992 12.5966 5.42663 12.6318 5.52744 12.6466C5.76009 12.681 6.04735 12.5381 6.62037 12.2509L7.21883 11.9516C7.45971 11.832 7.5794 11.7721 7.66693 11.6823C7.74457 11.6031 7.8036 11.5075 7.83973 11.4026C7.88088 11.2844 7.88088 11.1497 7.88088 10.8812V7.62853C7.88088 7.44525 7.88088 7.35399 7.90182 7.26796C7.92014 7.19137 7.95044 7.11816 7.99159 7.05102C8.03648 6.97621 8.10156 6.91188 8.22873 6.78471L8.23172 6.78171L12.0192 2.99497C12.1479 2.86555 12.2122 2.80047 12.2586 2.72566C12.3 2.65784 12.3299 2.58552 12.3484 2.50872C12.3693 2.42419 12.3693 2.33292 12.3693 2.15413V1.59682Z" stroke="#191919" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg width="9" height="6" viewBox="0 0 9 6" fill="none">
    <path fillRule="evenodd" clipRule="evenodd" d="M4.91753 4.91753C4.79251 5.04251 4.62297 5.11272 4.44619 5.11272C4.26942 5.11272 4.09988 5.04251 3.97486 4.91753L0.203526 1.14619C0.139852 1.08469 0.0890639 1.01113 0.0541246 0.929795C0.0191852 0.848459 0.000794382 0.760979 2.51709e-05 0.67246C-0.00074404 0.58394 0.0161239 0.496154 0.0496445 0.414223C0.0831651 0.332292 0.132667 0.257857 0.195262 0.195262C0.257857 0.132667 0.332292 0.0831648 0.414223 0.0496442C0.496154 0.0161236 0.58394 -0.00074404 0.67246 2.51714e-05C0.760979 0.000794382 0.848459 0.0191852 0.929795 0.0541246C1.01113 0.0890639 1.08469 0.139852 1.14619 0.203525L4.44619 3.50353L7.74619 0.203525C7.87193 0.0820866 8.04033 0.0148904 8.21513 0.0164093C8.38992 0.0179282 8.55713 0.0880407 8.68074 0.211646C8.80434 0.335252 8.87446 0.50246 8.87598 0.677258C8.87749 0.852056 8.8103 1.02046 8.68886 1.14619L4.91753 4.91753Z" fill="#1E1E1E" />
  </svg>
);

const CheckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path d="M7.95881 12.625L15.0213 5.5625C15.188 5.39583 15.3824 5.3125 15.6046 5.3125C15.8269 5.3125 16.0213 5.39583 16.188 5.5625C16.3546 5.72917 16.438 5.92722 16.438 6.15667C16.438 6.38611 16.3546 6.58389 16.188 6.75L8.54214 14.4167C8.37548 14.5833 8.18103 14.6667 7.95881 14.6667C7.73659 14.6667 7.54214 14.5833 7.37548 14.4167L3.79214 10.8333C3.62548 10.6667 3.54548 10.4689 3.55214 10.24C3.55881 10.0111 3.64575 9.81306 3.81298 9.64583C3.9802 9.47861 4.17825 9.39528 4.40714 9.39583C4.63603 9.39639 4.83381 9.47972 5.00048 9.64583L7.95881 12.625Z" fill="#086047" />
  </svg>
);

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path d="M9.99967 11.1668L5.91634 15.2502C5.76356 15.4029 5.56912 15.4793 5.33301 15.4793C5.0969 15.4793 4.90245 15.4029 4.74967 15.2502C4.5969 15.0974 4.52051 14.9029 4.52051 14.6668C4.52051 14.4307 4.5969 14.2363 4.74967 14.0835L8.83301 10.0002L4.74967 5.91683C4.5969 5.76405 4.52051 5.56961 4.52051 5.3335C4.52051 5.09738 4.5969 4.90294 4.74967 4.75016C4.90245 4.59738 5.0969 4.521 5.33301 4.521C5.56912 4.521 5.76356 4.59738 5.91634 4.75016L9.99967 8.8335L14.083 4.75016C14.2358 4.59738 14.4302 4.521 14.6663 4.521C14.9025 4.521 15.0969 4.59738 15.2497 4.75016C15.4025 4.90294 15.4788 5.09738 15.4788 5.3335C15.4788 5.56961 15.4025 5.76405 15.2497 5.91683L11.1663 10.0002L15.2497 14.0835C15.4025 14.2363 15.4788 14.4307 15.4788 14.6668C15.4788 14.9029 15.4025 15.0974 15.2497 15.2502C15.0969 15.4029 14.9025 15.4793 14.6663 15.4793C14.4302 15.4793 14.2358 15.4029 14.083 15.2502L9.99967 11.1668Z" fill="#991B1B" />
  </svg>
);

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ReportsPage() {
  const [paginated, setPaginated] = useState<Report[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sentimentFilter, setSentimentFilter] = useState<"All" | Sentiment>("All");
  const [statusFilter, setStatusFilter] = useState<"All" | any>("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const itemsPerPage = 10;

  const ReportDetails = () => {
    const ratingItems = [
      {
        label: "Classroom Behavior",
        value: selectedReport?.classroom_behavior,
        max: 5,
      },
      {
        label: "Lesson Preparedness",
        value: selectedReport?.lesson_preparedness,
        max: 5,
      },
      {
        label: "Staff Friendliness",
        value: selectedReport?.staff_friendliness,
        max: 5,
      },
      {
        label: "School Cleanliness",
        value: selectedReport?.school_cleanliness,
        max: 5,
      },
      {
        label: "Support Level",
        value: selectedReport?.support_level,
        max: 5,
      },
    ];

    const averageRating =
      ratingItems.reduce(
        (sum, item) => sum + Number(item.value || 0),
        0
      ) / ratingItems.length;

    return (
      <>
        <div className="px-7 py-6 flex items-start gap-8">
          <div className="flex flex-col items-center gap-3 flex-shrink-0">
            <ScoreCircle score={averageRating} />
            <StarRating count={averageRating} />

            <span className="font-outfit text-xs text-[#6B7280] -mt-1">
              Overall
            </span>
          </div>

          <div className="flex flex-col gap-[10px] flex-1">
            {ratingItems?.map((r) => (
              <RatingBar key={r.label} {...r} />
            ))}
          </div>
        </div>
      </>
    );
  };

  const handleApproveReport = async (reportId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setLoadingAction(`approve-${reportId}`);
    try {
      const response = await fetch(`/api/reports/${reportId}/approve`, { method: "POST" });
      if (!response.ok) throw new Error("Failed to approve report");
      setPaginated((prev) =>
        prev.map((r: any) => (r.id === reportId ? { ...r, status: 2 } : r))
      );
    } catch (err) {
      console.error("Error approving report:", err);
    } finally {
      toast.success("Report request Approved!");
      setLoadingAction(null);
      setSelectedReport(null);
    }
  };

  const handleRejectReport = async (reportId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setLoadingAction(`reject-${reportId}`);
    try {
      const response = await fetch(`/api/reports/${reportId}/reject`, { method: "POST" });
      if (!response.ok) throw new Error("Failed to reject report");
      setPaginated((prev) =>
        prev.map((r: any) => (r.id === reportId ? { ...r, status: 3 } : r))
      );
    } catch (err) {
      console.error("Error rejecting report:", err);
    } finally {
      toast.error("Report request Rejected!");
      setLoadingAction(null);
      setSelectedReport(null);
    }
  };

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: itemsPerPage.toString(),
          search: search.trim(),
          sentiment: sentimentFilter,
          status: statusFilter,
        });

        const response = await fetch(`/api/reports?${params}`);

        if (!response.ok) {
          throw new Error(`Failed to fetch reports: ${response.statusText}`);
        }

        const data = await response.json();
        setPaginated(data.data || []);
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
  }, [currentPage, search, sentimentFilter, statusFilter, initialLoading]);

  const handleSentimentChange = (val: "All" | Sentiment) => { setSentimentFilter(val); setCurrentPage(1); };
  const handleStatusChange = (val: "All" | any) => { setStatusFilter(val); setCurrentPage(1); };

  if (initialLoading) {
    return (
      <main className="flex-1 overflow-y-auto p-6 lg:p-8 relative flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#E5E7EB] border-t-[#0171F9] rounded-full animate-spin" />
          <p className="font-inter text-[#6B7280]">Loading reports...</p>
        </div>
      </main>
    );
  }


  return (
    <main className="flex-1 overflow-y-auto p-6 lg:p-8 relative">
      <h1 className="font-outfit font-semibold text-2xl sm:text-3xl  text-[#121212] leading-5 mb-6 ">Reports</h1>

      {error && (
        <div className="mb-6 px-4 py-3 rounded-lg bg-[#FEE2E2] border border-[#FECACA] flex items-start gap-3">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="flex-shrink-0 mt-0.5">
            <path d="M10 0C4.48 0 0 4.48 0 10s4.48 10 10 10 10-4.48 10-10S15.52 0 10 0zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S14.33 6 13.5 6 12 6.67 12 7.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S7.33 6 6.5 6 5 6.67 5 7.5 5.67 9 6.5 9zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H4.89c.8 2.04 2.78 3.5 5.11 3.5z" fill="#DC2626" />
          </svg>
          <div>
            <p className="font-inter font-semibold text-sm text-[#991B1B]">{error}</p>
            <p className="font-inter text-sm text-[#DC2626] mt-1">Using default reports data</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg overflow-hidden">
        {/* Search + Filters */}
        <div className="px-4 pt-4 pb-0 flex flex-col gap-3 sm:gap-4">
          <div className="w-full max-w-[540px]">
            <div className="flex items-center gap-2 sm:gap-2.5 h-10 sm:h-11 px-3 sm:px-4 rounded-[14px] border border-[#EBEBF0] bg-[#FBFBFC]">
              <span className="opacity-70 flex-shrink-0"><SearchIcon /></span>
              <input
                type="text" placeholder="Search by School, Teacher, Submitted by name" value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                className="flex-1 bg-transparent outline-none font-inter font-medium text-sm sm:text-[15px] text-[#323152] placeholder:text-[#323152] placeholder:opacity-50 leading-[150%]"
              />
            </div>
          </div>

          <div className="flex flex-row items-stretch sm:items-center gap-2 sm:gap-3 pb-3 sm:pb-4">
            <div className="relative flex-1 sm:flex-none">
              <select
                value={sentimentFilter}
                onChange={(e) => handleSentimentChange(e.target.value as "All" | Sentiment)}
                className="w-full appearance-none pl-9 sm:pl-10 pr-7 sm:pr-8 py-2.5 sm:py-[11px] rounded-[10px] border border-[rgba(178,178,178,0.20)] bg-[#FAFCFF] font-inter text-xs sm:text-sm text-[#121212] opacity-80 cursor-pointer outline-none"
              >
                <option value="All">Sentiment: All</option>
                <option value="Positive">Sentiment: Positive</option>
                <option value="Negative">Sentiment: Negative</option>
                <option value="Neutral">Sentiment: Neutral</option>
              </select>
              <span className="pointer-events-none absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2"><SentimentIcon /></span>
              <span className="pointer-events-none absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2"><ChevronDownIcon /></span>
            </div>

            <div className="relative flex-1 sm:flex-none">
              <select
                value={statusFilter}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="w-full appearance-none pl-9 sm:pl-10 pr-7 sm:pr-8 py-2.5 sm:py-[11px] rounded-[10px] border border-[rgba(178,178,178,0.20)] bg-[#FAFCFF] font-inter text-xs sm:text-sm text-[#121212] opacity-80 cursor-pointer outline-none"
              >
                <option value="All">Status: All</option>
                <option value="Pending">Status: Pending</option>
                <option value="Approved">Status: Approved</option>
                <option value="Rejected">Status: Rejected</option>
              </select>
              <span className="pointer-events-none absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2"><FilterIcon /></span>
              <span className="pointer-events-none absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2"><ChevronDownIcon /></span>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-max">
            <thead>
              <tr className="border-y border-[#E5E7EB] bg-white">
                <th className="text-left px-2 sm:px-4 lg:px-5 py-2.5 sm:py-3.5 font-inter font-medium text-[12px] sm:text-xs text-[#6F6C70] uppercase whitespace-nowrap">ID</th>
                <th className="text-left px-2 sm:px-4 lg:px-5 py-2.5 sm:py-3.5 font-inter font-medium text-[12px] sm:text-xs text-[#6F6C70] uppercase whitespace-nowrap">School</th>
                <th className="text-left px-2 sm:px-4 lg:px-5 py-2.5 sm:py-3.5 font-inter font-medium text-[12px] sm:text-xs text-[#6F6C70] uppercase whitespace-nowrap">Teacher</th>
                <th className="text-left px-2 sm:px-4 lg:px-5 py-2.5 sm:py-3.5 font-inter font-medium text-[12px] sm:text-xs text-[#6F6C70] uppercase whitespace-nowrap">Sentiment Analysis</th>
                <th className="text-left px-2 sm:px-4 lg:px-5 py-2.5 sm:py-3.5 font-inter font-medium text-[12px] sm:text-xs text-[#6F6C70] uppercase whitespace-nowrap">Submitted By</th>
                <th className="text-left px-2 sm:px-4 lg:px-5 py-2.5 sm:py-3.5 font-inter font-medium text-[12px] sm:text-xs text-[#6F6C70] uppercase whitespace-nowrap">Submission Date</th>
                <th className="text-left px-2 sm:px-4 lg:px-5 py-2.5 sm:py-3.5 font-inter font-medium text-[12px] sm:text-xs text-[#6F6C70] uppercase whitespace-nowrap">Status</th>
                <th className="text-left px-2 sm:px-4 lg:px-5 py-2.5 sm:py-3.5 font-inter font-medium text-[12px] sm:text-xs text-[#6F6C70] uppercase whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 sm:px-6 lg:px-8 py-8 text-center font-inter text-sm text-[#6F6C70]">No reports found.</td>
                </tr>
              ) : (
                paginated.map((report: any) => {
                  const sc = getSentiment(report);
                  const isSelected = selectedReport?.id === report.id;
                  return (
                    <tr
                      key={report.id}
                      onClick={() => setSelectedReport(report)}
                      className={`border-b border-[#F2F4F7] cursor-pointer transition-colors hover:bg-[#F8FAFF] ${isSelected ? "bg-[#EFF6FF]" : ""}`}
                    >
                      <td className="px-2 sm:px-4 lg:px-5 py-2.5 sm:py-[17.5px] whitespace-nowrap">
                        <span className="font-inter font-medium text-[12px] sm:text-[13px] lg:text-sm text-[#0B77F9] opacity-80">{`RPT-${report.id}`}</span>
                      </td>
                      <td className="px-2 sm:px-4 lg:px-5 py-2.5 sm:py-[17.5px] whitespace-nowrap">
                        <span className="font-inter font-normal text-[12px] sm:text-[13px] lg:text-sm text-[#030711]">{report?.school_name}</span>
                      </td>
                      <td className="px-2 sm:px-4 lg:px-5 py-2.5 sm:py-[17.5px] whitespace-nowrap">
                        <span className="font-inter font-normal text-[12px] sm:text-[13px] lg:text-sm text-[#030711]">{report.teacher_name}</span>
                      </td>
                      <td className="px-2 sm:px-4 lg:px-5 py-2.5 sm:py-[17.5px] whitespace-nowrap">
                        <span className={`inline-flex items-center px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-md ${sc.bg} font-inter font-medium text-[10px] sm:text-xs ${sc.text}`}>
                          {sc.label}
                        </span>
                      </td>
                      <td className="px-2 sm:px-4 lg:px-5 py-2.5 sm:py-[17.5px] whitespace-nowrap">
                        <span className="font-inter font-normal text-[12px] sm:text-[13px] lg:text-sm text-[#030711]">{report.post_as == 1 ? "Anonymous" : report.your_name ? report.your_name : "NA"}</span>
                      </td>
                      <td className="px-2 sm:px-4 lg:px-5 py-2.5 sm:py-[17.5px] whitespace-nowrap">
                        <span className="font-inter font-normal text-[12px] sm:text-[13px] lg:text-sm text-[#030711]">{formatDate(report.created_at)}</span>
                      </td>
                      <td className="px-2 sm:px-4 lg:px-5 py-2.5 sm:py-[17.5px] whitespace-nowrap">
                        <span className="inline-flex items-center px-1.5 sm:px-3 py-0.5 sm:py-1 rounded-md border border-[#EFF0F2] bg-[#F6F6F6] font-inter font-normal text-[12px] sm:text-sm text-[#030711]">
                          {report.status == 1 ? "Pending" : report.status == 2 ? "Approved" : "Rejected"}
                        </span>
                      </td>
                      <td className="px-2 sm:px-4 lg:px-5 py-2.5 sm:py-[17.5px] whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-1 sm:gap-3">
                          {report.status === 1 && (
                            <>
                              <button
                                onClick={(e) => handleApproveReport(report.id, e)}
                                disabled={loadingAction === `approve-${report.id}`}
                                className={`${loadingAction === `approve-${report.id}` ? "" : "cursor-pointer"} p-1 sm:p-2 rounded-md bg-[#D1FAE5] hover:opacity-80 disabled:opacity-60 transition-opacity flex items-center justify-center`}
                                aria-label="Approve"
                              >
                                {loadingAction === `approve-${report.id}` ? (
                                  <div className="w-4 h-4 border-2 border-[#32A85B] border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <CheckIcon />
                                )}
                              </button>
                              <button
                                onClick={(e) => handleRejectReport(report.id, e)}
                                disabled={loadingAction === `reject-${report.id}`}
                                className={`${loadingAction === `reject-${report.id}` ? "" : "cursor-pointer"} p-1 sm:p-2 rounded-md bg-[#FEE2E2] hover:opacity-80 disabled:opacity-60 transition-opacity flex items-center justify-center`}
                                aria-label="Reject"
                              >
                                {loadingAction === `reject-${report.id}` ? (
                                  <div className="w-4 h-4 border-2 border-[#DD393D] border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <CloseIcon />
                                )}
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => setSelectedReport(report)}
                            className="cursor-pointer flex items-center justify-center h-8 sm:h-9 px-2 sm:px-3.5 rounded-md border border-[#EFF0F2] bg-white font-inter font-normal text-[12px] sm:text-[14px] text-black opacity-80 tracking-[-0.2px] hover:opacity-100 transition-opacity"
                          >
                            View
                          </button>
                        </div>
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
            Showing {total === 0 ? "0" : `${(currentPage - 1) * itemsPerPage + 1}  to ${Math.min(currentPage * itemsPerPage, total)}`} of {total.toLocaleString()} reports
          </span>
          <div className="flex items-center gap-1 sm:gap-2 order-1 sm:order-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={`${currentPage == 1 ? "" : "cursor-pointer"} w-8 sm:w-[38px] h-8 sm:h-[38px] flex items-center justify-center rounded-lg border border-[#E5E7EB] bg-white disabled:opacity-40 hover:bg-gray-50 transition-colors`}
            >
              <ChevronLeftIcon />
            </button>
            {(() => {
              const pageWindow = 4;
              const startPage = Math.max(1, currentPage - Math.floor(pageWindow / 2));
              const endPage = Math.min(totalPages, startPage + pageWindow - 1);
              const adjustedStart = Math.max(1, endPage - pageWindow + 1);

              return Array.from(
                { length: Math.min(pageWindow, totalPages) },
                (_, i) => adjustedStart + i
              ).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`cursor-pointer w-8 sm:w-[38px] h-8 sm:h-[38px] flex items-center justify-center rounded-lg font-inter text-[13px] sm:text-[15px] transition-colors ${currentPage === page ? "bg-[#0171F9] text-white font-semibold" : "border border-[#E5E7EB] bg-white text-[#323152] font-medium hover:bg-gray-50"
                    }`}
                >
                  {page}
                </button>
              ));
            })()}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className={`${currentPage === totalPages ? "" : "cursor-pointer" } w-8 sm:w-[38px] h-8 sm:h-[38px] flex items-center justify-center rounded-lg border border-[#E5E7EB] bg-white disabled:opacity-40 hover:bg-gray-50 transition-colors`}
            >
              <ChevronRightIcon />
            </button>
          </div>
        </div>
      </div>

      {/* Dark backdrop overlay */}
      <div
        className={`fixed inset-0 bg-black z-40 transition-opacity duration-300 ${selectedReport ? "opacity-40 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={() => setSelectedReport(null)}
      />

      {/* Right slide-in panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:max-w-[556px] bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${selectedReport ? "translate-x-0" : "translate-x-full"}`}
      >
        {selectedReport && 
            <ViewReport
              selectedReport={selectedReport}
              loadingAction={loadingAction}
              setSelectedReport={setSelectedReport}
              handleApproveReport={handleApproveReport}
              handleRejectReport={handleRejectReport}
              ReportDetails={ReportDetails}
            />
 
        }
      </div>
    </main>
  );
}
