"use client";

import { useState, useEffect, use } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import PageLoader from "@/app/components/PageLoader";
import { AvgRatings, formatDate } from "@/lib/function";
import { ChatIcon, LocationIcon, SchoolIcon, TeacherIcon } from "@/lib/icons";
import { ObjectType } from "@/lib/types";

/* ─── Types ─────────────────────────────────────────────── */
interface Rating {
  label: string;
  score: number;
  max: number;
}

interface Report {
  id: number;
  school_name: string;
  return_to_teacher: number;
  return_to_school: number;
  teacher_comment: string;
  school_comment: string;
  feedback: string;
  city: string;
  state: string;
  teacher_name: string;
  grade_level: string;
  created_at: string;
  staff_friendliness: number;
  lesson_preparedness: number;
  classroom_behavior: number;
  school_cleanliness: number;
  support_level: number;
  schools: ObjectType;
  status: number;
  sentiments: "Positive" | "Negative" | "Neutral";
  body: string;
  tags: string[];
  returnToSchool: "Yes" | "No";
  returnToSchoolQuote: string;
  returnToTeacher: "Yes" | "No";
  returnToTeacherQuote: string;
  ratings: Rating[];
}

/* ─── Shared SVG icons ────────────────────────────────────── */

const CalendarIcon = () => (
  <svg width="14" height="13" viewBox="0 0 10 11" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2.75 1.61111H2.3C1.67 1.61111 1.355 1.61111 1.11425 1.73222C0.902577 1.83875 0.730481 2.00872 0.622625 2.21778C0.5 2.45556 0.5 2.76667 0.5 3.38889V3.83333M2.75 1.61111H7.25M2.75 1.61111V0.5M0.5 3.83333V8.72222C0.5 9.34444 0.5 9.65556 0.622625 9.89333C0.730481 10.1024 0.902577 10.2724 1.11425 10.3789C1.35444 10.5 1.66944 10.5 2.29831 10.5H7.70169C8.33056 10.5 8.645 10.5 8.88519 10.3789C9.09725 10.2722 9.26937 10.1022 9.37737 9.89333C9.5 9.65556 9.5 9.34556 9.5 8.72445V3.83333M0.5 3.83333H9.5M7.25 1.61111H7.7C8.33 1.61111 8.645 1.61111 8.88519 1.73222C9.09725 1.83889 9.26937 2.00833 9.37737 2.21778C9.5 2.455 9.5 2.76611 9.5 3.38722V3.83333M7.25 1.61111V0.5M7.25 8.27778H7.25113V8.27889H7.25V8.27778ZM5 8.27778H5.00112V8.27889H5V8.27778ZM2.75 8.27778H2.75112V8.27889H2.75V8.27778ZM7.25113 6.05556V6.05667H7.25V6.05556H7.25113ZM5 6.05556H5.00112V6.05667H5V6.05556ZM2.75 6.05556H2.75112V6.05667H2.75V6.05556Z" stroke="#121212" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const UserIcon = () => (
  <svg width="14" height="15" viewBox="0 0 12 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6.00002 7.33335C7.84097 7.33335 9.33335 5.84097 9.33335 4.00002C9.33335 2.15907 7.84097 0.666687 6.00002 0.666687C4.15907 0.666687 2.66669 2.15907 2.66669 4.00002C2.66669 5.84097 4.15907 7.33335 6.00002 7.33335Z" stroke="#464555" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M11.3334 12.6667C11.3334 11.2522 10.7715 9.89567 9.77126 8.89547C8.77106 7.89528 7.41451 7.33337 6.00002 7.33337C4.58553 7.33337 3.22898 7.89528 2.22878 8.89547C1.22859 9.89567 0.666687 11.2522 0.666687 12.6667" stroke="#464555" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);


function StarRating({
  count = 0,
}: {
  count?: number;
}) {
  const STAR_SIZE = 15;
  const GAP = 2;

  const starPath =
    "M7.89844 4.36816L8.00781 4.62012L8.28125 4.64258L11.8516 4.94336L9.16113 7.21094L8.94434 7.39355L9.00977 7.66992L9.81641 11.0576L6.73242 9.25L6.5 9.11426L6.26758 9.25L3.18262 11.0576L3.99023 7.66992L4.05566 7.39355L3.83887 7.21094L1.14746 4.94336L4.71875 4.64258L4.99219 4.62012L5.10156 4.36816L6.5 1.15332L7.89844 4.36816Z";

  return (
    <svg
      width={(STAR_SIZE + GAP) * 5}
      height={STAR_SIZE}
      viewBox={`0 0 ${(STAR_SIZE + GAP) * 5} ${STAR_SIZE}`}
      fill="none"
    >
      {[0, 1, 2, 3, 4].map((i) => {
        const x = i * (STAR_SIZE + GAP);

        // 0 → 1
        const fillPercent = Math.max(
          0,
          Math.min(1, count - i)
        );

        return (
          <g
            key={i}
            transform={`translate(${x}, 0) scale(${STAR_SIZE / 13})`}
          >
            {/* Empty Star */}
            <path
              d={starPath}
              fill="none"
              stroke="#0171F9"
              strokeWidth="0.92"
            />

            {/* Partial Fill */}
            <clipPath id={`clip-${i}-${count}`}>
              <rect
                x="0"
                y="0"
                width={13 * fillPercent}
                height="13"
              />
            </clipPath>

            <path
              clipPath={`url(#clip-${i}-${count})`}
              d={starPath}
              fill="#0171F9"
              stroke="#0171F9"
              strokeWidth="0.92"
            />
          </g>
        );
      })}
    </svg>
  );
}




/* ─── Outline star for header area ───────────────────────── */
function OutlineStars({ count }: { count: any }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: Math.ceil(count) }).map((_, index) => {
        const i = index + 1;
        const full = i <= Math.floor(count);
        const half = i === Math.floor(count) + 1 && count % 1 >= 0.5;

        const starPath =
          "M6.5075 14.0447L9.5 12.2447L12.4925 14.0684L11.7087 10.6579L14.345 8.38421L10.8775 8.07632L9.5 4.85526L8.1225 8.05263L4.655 8.36053L7.29125 10.6579L6.5075 14.0447ZM3.63375 18L5.1775 11.3447L0 6.86842L6.84 6.27632L9.5 0L12.16 6.27632L19 6.86842L13.8225 11.3447L15.3662 18L9.5 14.4711L3.63375 18Z";

        return (
          <svg
            key={i}
            width="19"
            height="18"
            viewBox="0 0 19 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <clipPath id={`half-${i}`}>
                <rect x="0" y="0" width="9.5" height="18" />
              </clipPath>
            </defs>

            {/* Full star */}
            {full && <path d={starPath} fill="#FFBF0F" />}

            {/* Half star */}
            {half && (
              <path
                d={starPath}
                fill="#FFBF0F"
                clipPath={`url(#half-${i})`}
              />
            )}

            {/* Empty star = no fill */}

          </svg>
        );
      })}
    </div>
  );
}

/* ─── Status badge ────────────────────────────────────────── */
function StatusBadge({ status }: { status: "Pending" | "Approved" | "Rejected" }) {
  if (status === "Pending") {
    return (
      <span className="px-2 py-1 rounded text-xs font-semibold font-inter bg-[rgba(232,164,17,0.10)] text-[#E8A411]">
        Pending
      </span>
    );
  }
  if (status === "Rejected") {
    return (
      <span className="px-2 py-1 rounded text-xs font-semibold font-inter bg-[#FFE0E0] text-[#E02C2C]">
        Rejected
      </span>
    );
  }
  return (
    <span className="px-2 py-1 rounded text-xs font-semibold font-inter bg-[rgba(16,185,129,0.10)] text-[#10B981]">
      Approved
    </span>
  );
}

/* ─── Sentiment badge ─────────────────────────────────────── */
function SentimentBadge({ sentiment }: { sentiment: "Positive" | "Negative" | "Neutral" }) {
  if (sentiment === "Positive") {
    return (
      <span className="px-2 py-1 rounded text-xs font-semibold font-inter min-w-[63px] text-center bg-[rgba(16,185,129,0.10)] text-[#10B981]">
        Positive
      </span>
    );
  }
  if (sentiment === "Negative") {
    return (
      <span className="px-2.5 py-1 rounded-md text-xs font-semibold font-inter bg-[#FFE0E0] text-[#E02C2C]">
        Negative
      </span>
    );
  }
  return (
    <span className="px-2.5 py-1 rounded-md text-xs font-semibold font-inter bg-[rgba(232,164,17,0.10)] text-[#E8A411]">
      Neutral
    </span>
  );
}

/* ─── Return answer pill ──────────────────────────────────── */
function ReturnPill({ answer }: { answer: "Yes" | "No" | "Maybe" }) {
  if (answer === "Yes") {
    return (
      <span className="px-[18px] py-1 rounded-full text-xs font-semibold font-inter bg-[#BBFBE6] text-[#2D7D65]">
        Yes
      </span>
    );
  }
  if (answer === "Maybe") {
    return (
      <span className="px-[18px] py-1 rounded-full text-xs font-semibold font-inter bg-[#FFF4E0] text-[#FFA600]">
        Maybe
      </span>
    );
  }
  return (
    <span className="px-[18px] py-1 rounded-full text-xs font-semibold font-inter bg-[#FFE0E0] text-[#E02C2C]">
      No
    </span>
  );
}

/* ─── Final Thoughts block ────────────────────────────────── */
function FinalThoughts({ report }: { report: Report }) {
  return (
    <div className="rounded-xl border border-[rgba(178,178,178,0.40)] bg-[#F8FAFF] overflow-hidden">
      {/* Header bar */}
      <div className="min-h-[42px] flex items-center gap-2 px-4 sm:px-6 py-3 sm:py-2.5 bg-[#EFF6FF] border-b border-[rgba(178,178,178,0.40)] rounded-t-xl">
        <ChatIcon />
        <span className="text-[#0171F9] font-inter text-xs sm:text-sm font-medium leading-[15px]">FINAL THOUGHTS</span>
      </div>


      {/* Return to school row */}
      <div className="px-4 sm:px-6 py-3 sm:py-4 flex flex-col gap-2 sm:gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <SchoolIcon />
            <span className="text-[#0F1724] font-[Outfit] text-sm sm:text-base font-medium leading-5">Would you return to this school?</span>
          </div>
          <ReturnPill
            answer={
              report.return_to_school == 3
                ? "Maybe"
                : report.return_to_school == 2
                  ? "No"
                  : "Yes"
            }
          />        </div>
        {report.school_comment && <div className="flex items-center gap-2.5 pl-5">
          <div className="min-h-[30px] w-[3px] self-stretch bg-[#22C55E] flex-shrink-0 rounded-full" />
          <p className="text-[#464555] font-inter sm:text-[15px] text-sm italic font-normal leading-5">{report.school_comment}</p>
        </div>}
      </div>

      {/* Horizontal divider */}
      <div className="h-px opacity-40 bg-[#B2B2B2] mx-0" />

      {/* Return to teacher row */}
      <div className="px-4 sm:px-6 py-3 sm:py-4 flex flex-col gap-2 sm:gap-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <UserIcon />
            <span className="text-[#0F1724] font-[Outfit] text-sm sm:text-base font-medium leading-5">Would you return for this teacher or class?</span>
          </div>
          <ReturnPill answer={
            report.return_to_teacher == 3
              ? "Maybe"
              : report.return_to_teacher == 2
                ? "No"
                : "Yes"
          } />
        </div>
        {report.teacher_comment && <div className="flex items-center gap-2.5 pl-5">
          <div className="min-h-[30px] w-[3px] self-stretch bg-[#22C55E] flex-shrink-0 rounded-full" />
          <p className="text-[#464555] font-inter sm:text-[15px] text-sm italic font-normal leading-5">{report.teacher_comment}</p>
        </div>}
      </div>
    </div>
  );
}


/* ─── Single Report Card ──────────────────────────────────── */
function ReportCard({ report, defaultExpanded = false }: { report: Report; defaultExpanded?: boolean }) {
  const [showRatings, setShowRatings] = useState(defaultExpanded);

  return (

    <div className={`bg-white rounded-xl shadow-[0_4px_6px_-1px_rgba(0,0,0,0.10)] ${showRatings ? "p-4 sm:p-6 lg:p-7" : "px-4 sm:px-6 lg:px-7 pt-4 sm:pt-6 lg:pt-7"} flex flex-col gap-4 sm:gap-5 lg:gap-6`}>
      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-3">
        {/* Left: school info */}
        <div className="flex flex-col gap-3 flex-1">
          <h2 className="font-inter text-[20px]  font-bold text-[#121212]">{report.school_name}</h2>

          <div className="flex flex-col gap-3">
            {/* Location · Teacher · Grade */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5 opacity-80">
                <LocationIcon />
                <span className="font-[Outfit] text-sm text-[#414141]">{`${report?.schools?.
                  city}, ${report?.schools?.state
                  }`}</span>
              </div>

              <span className="w-[3px] h-[3px] rounded-full bg-[#676767] opacity-64" />

              <div className="flex items-center gap-1.5">
                <TeacherIcon />
                <span className="font-inter text-sm font-medium text-[#121212] opacity-70">{report.teacher_name}</span>
              </div>

              <span className="w-[3px] h-[3px] rounded-full bg-[#676767] opacity-64" />

              <span className="px-2 py-1 rounded text-sm font-semibold font-inter bg-[#DFEEFF] text-[#0171F9]">
                {report.grade_level}
              </span>
            </div>

            {/* Date */}
            <div className="flex items-center gap-1.5 opacity-80">
              <CalendarIcon />
              <span className="font-[Outfit] text-sm text-[#414141]">{formatDate(report.created_at)}</span>
            </div>
          </div>
        </div>

        {/* Right: stars + badges */}
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap sm:justify-end">
          <OutlineStars count={AvgRatings({
            classroom_behavior: report.classroom_behavior,
            lesson_preparedness: report.lesson_preparedness, school_cleanliness: report.school_cleanliness,
            staff_friendliness: report.staff_friendliness,
            support_level: report.support_level,
          })} />
          <div className="flex items-center gap-2.5">
<StatusBadge
  status={
    report.status == 1
      ? "Pending"
      : report.status == 2
      ? "Approved"
      : "Rejected"
  }
/>            <SentimentBadge sentiment={report.sentiments} />
          </div>
        </div>
      </div>

      {/* Body text */}
      <p className="text-black font-inter text-sm sm:text-base font-normal leading-6 sm:leading-7 opacity-70">{report.feedback}</p>

      {/* Tags */}
      <div className="flex flex-wrap items-center gap-3">
        {report.tags.map((tag) => (
          <span
            key={tag}
            className="px-2 sm:px-2.5 py-1.5 sm:py-2 rounded-md border border-[#EAEAEA] bg-[#F2F2F2] text-[#9A9A9A] font-inter text-xs sm:text-sm font-medium leading-[15px]"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Divider */}
      <div className="h-px bg-[#DADADA] opacity-40" />

      {/* Final Thoughts */}
      <FinalThoughts report={report} />

      {/* Toggle rating details */}
      <button
        onClick={() => setShowRatings(!showRatings)}
        className="flex items-center gap-1 text-[#0171F9] font-inter text-xs sm:text-sm font-medium leading-[15px] hover:opacity-80 transition-opacity cursor-pointer"
      >
        <span>{showRatings ? "Hide rating details" : "Show rating details"}</span>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          {showRatings ? (
            <path d="M5 12.0833L10 7.08331L15 12.0833H5Z" fill="#0171F9" stroke="#0171F9" strokeWidth="1.66667" strokeLinejoin="round" />
          ) : (
            <path d="M5 7.08333L10 12.0833L15 7.08333H5Z" fill="#0171F9" stroke="#0171F9" strokeWidth="1.66667" strokeLinejoin="round" />
          )}
        </svg>
      </button>

      {/* Expandable ratings */}
      <div
        className="grid transition-[grid-template-rows] duration-300 ease-in-out w-full sm:w-[60%] lg:w-[30%]"
        style={{ gridTemplateRows: showRatings ? '1fr' : '0fr' }}
      >
        <div className="overflow-hidden">
          <div className="space-y-2.5 sm:space-y-3 lg:space-y-3.5 pb-1">
            {[
              { label: "Classroom Behavior", score: Number(report.classroom_behavior) },
              {
                label: "Lesson Preparedness",
                score: report.lesson_preparedness,
              },
              {
                label: "Staff Friendliness",
                score: report.staff_friendliness,
              },
              {
                label: "School Cleanliness",
                score: report.school_cleanliness,
              },
              {
                label: "Support Level",
                score: report.support_level,
              },
            ].map(({ label, score }) => (
              <div
                key={label}
                className="flex flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 lg:gap-4"
              >
                <span className="text-sm sm:text-base font-normal text-[#6B7280] font-outfit flex-1">
                  {label}
                </span>

                <div className="flex items-center gap-1.5 sm:gap-2">
                  <StarRating count={Number(score)} />

                  <span className="text-sm font-normal text-black font-outfit w-10 text-right">
                    {score}/5
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Pagination ──────────────────────────────────────────── */
function Pagination({
  currentPage,
  totalPages,
  onPageChange
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  const getPageNumbers = () => {
    const pages: number[] = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= maxPagesToShow; i++) {
          pages.push(i);
        }
      } else if (currentPage >= totalPages - 2) {
        for (let i = totalPages - maxPagesToShow + 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        for (let i = currentPage - 2; i <= currentPage + 2; i++) {
          pages.push(i);
        }
      }
    }
    return pages;
  };

  const pages = getPageNumbers();

  return (
    <div className="flex items-center justify-center gap-2 pt-4">
      {/* Prev */}
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="cursor-pointer w-9 h-9 flex items-center justify-center rounded-md border border-[rgba(0,0,0,0.08)] bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Previous page"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 12L6 8L10 4" stroke="#0171F9" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Page numbers */}
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`cursor-pointer w-9 h-9 flex items-center justify-center rounded-md text-sm font-medium font-inter transition-colors ${currentPage === p
              ? "bg-[#0171F9] border border-[#0171F9] text-white"
              : "border border-[rgba(0,0,0,0.08)] bg-white text-[#0171F9] hover:bg-blue-50"
            }`}
        >
          {p}
        </button>
      ))}

      {/* Next */}
      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="cursor-pointer w-9 h-9 flex items-center justify-center rounded-md border border-[rgba(0,0,0,0.08)] bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Next page"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 12L10 8L6 4" stroke="#0171F9" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}
/* ─── Page ────────────────────────────────────────────────── */
export default function MyReportsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [identityCode, setIdentityCode] = useState<string | null>(null);
  const [fetchedReports, setFetchedReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [userId, setUserId] = useState<Number>();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }else{
      setUserId(Number(session?.user?.id))
    }
  }, [status, session, router]);

  useEffect(() => { if (userId) loadReports(1) }, [userId])

  const loadReports = async (page: number) => {
      try {
      setLoading(true);
        
      let url = `/api/reports/search?userid=${userId}&page=${page}&limit=10`;
      if (searchInput.trim()) {
        url += `&search=${encodeURIComponent(searchInput.trim())}`;
      }

      const response = await fetch(url);

        if (!response.ok) {
          throw new Error("Failed to fetch reports");
        }

        const result = await response.json();
        setFetchedReports(result?.data || []);
		    setTotalPages(result.totalPages || 0);
        setTotal(result.total || 0);
        setCurrentPage(page);
	  
        if (result?.data?.length === 0) {
          setError("No reports found.");
        }else{
          setError("");
        }
      } catch (err) {
        console.error("Error loading reports:", err);
        setError("Failed to load reports. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    
  



  if (status === "loading") {
    return (
      <PageLoader className="min-h-screen flex items-center justify-center bg-[#F8FAFE]" />
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  return (

    <div className="min-h-screen flex flex-col bg-[#F8FAFE]">
      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: -1000px 0;
          }
          100% {
            background-position: 1000px 0;
          }
        }

        .animate-shimmer {
          animation: shimmer 2s infinite;
          background-size: 1000px 100%;
        }
      `}</style>
      <Header />

      {/* Hero / Search section */}
      <div className="bg-white">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-14">
          {/* Title + subtitle */}
          <div className="pt-8 sm:pt-12 lg:pt-[72px] pb-8">
            <h1 className="text-[#121212] font-[Inter] text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold leading-[1.2]">My Reports</h1>
            <p className="text-[#121212] font-[Inter] text-sm sm:text-base lg:text-lg font-normal leading-[1.5] sm:leading-[26px] tracking-[0.2px] opacity-[0.88] mt-2">
              Your experiences shared with the guest teacher community.
              {identityCode && <span className="block text-sm mt-2 opacity-70">Showing reports for: <strong>{identityCode}</strong></span>}
            </p>
          </div>

          {/* Search bar — blue container with input + button as siblings */}
          <div className="flex items-center gap-2 bg-[#E9F2FF] rounded-2xl p-2">
            <div className="flex items-center w-[70%] gap-2 flex-1 py-3.5 px-3 sm:px-4 bg-white rounded-lg border border-[rgba(195,198,214,0.20)] px-4">
              <svg className="sm:block hidden" width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16.6 18L10.3 11.7C9.8 12.1 9.225 12.4167 8.575 12.65C7.925 12.8833 7.23333 13 6.5 13C4.68333 13 3.14583 12.3708 1.8875 11.1125C0.629167 9.85417 0 8.31667 0 6.5C0 4.68333 0.629167 3.14583 1.8875 1.8875C3.14583 0.629167 4.68333 0 6.5 0C8.31667 0 9.85417 0.629167 11.1125 1.8875C12.3708 3.14583 13 4.68333 13 6.5C13 7.23333 12.8833 7.925 12.65 8.575C12.4167 9.225 12.1 9.8 11.7 10.3L18 16.6L16.6 18ZM6.5 11C7.75 11 8.8125 10.5625 9.6875 9.6875C10.5625 8.8125 11 7.75 11 6.5C11 5.25 10.5625 4.1875 9.6875 3.3125C8.8125 2.4375 7.75 2 6.5 2C5.25 2 4.1875 2.4375 3.3125 3.3125C2.4375 4.1875 2 5.25 2 6.5C2 7.75 2.4375 8.8125 3.3125 9.6875C4.1875 10.5625 5.25 11 6.5 11Z" fill="#737685" />
              </svg>
              <input
                type="text"
                onChange={(e)=>setSearchInput(e.target.value)}
                placeholder="Search your review by school name and feedback..."
                className="flex-1 font-inter text-base text-[#737685] placeholder:text-[#737685] outline-none bg-transparent"
              />
            </div>

            <button onClick={(e)=>{
                  e.preventDefault();
                  setCurrentPage(1);
                  loadReports(1);
                }} 
                className="sm:block hidden flex-shrink-0 h-[54px] px-11 bg-[#0171F9] text-white font-[Inter] text-sm font-semibold leading-5 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap">
              Search
            </button>
            <button className="sm:hidden block flex-shrink-0 py-4 px-4 h-fit bg-[#0171F9] text-white font-[Inter] text-sm font-semibold leading-5 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap">

              <svg width="18" height="18" viewBox="0 0 18 18" fill="white" xmlns="http://www.w3.org/2000/svg">
                <path d="M16.6 18L10.3 11.7C9.8 12.1 9.225 12.4167 8.575 12.65C7.925 12.8833 7.23333 13 6.5 13C4.68333 13 3.14583 12.3708 1.8875 11.1125C0.629167 9.85417 0 8.31667 0 6.5C0 4.68333 0.629167 3.14583 1.8875 1.8875C3.14583 0.629167 4.68333 0 6.5 0C8.31667 0 9.85417 0.629167 11.1125 1.8875C12.3708 3.14583 13 4.68333 13 6.5C13 7.23333 12.8833 7.925 12.65 8.575C12.4167 9.225 12.1 9.8 11.7 10.3L18 16.6L16.6 18ZM6.5 11C7.75 11 8.8125 10.5625 9.6875 9.6875C10.5625 8.8125 11 7.75 11 6.5C11 5.25 10.5625 4.1875 9.6875 3.3125C8.8125 2.4375 7.75 2 6.5 2C5.25 2 4.1875 2.4375 3.3125 3.3125C2.4375 4.1875 2 5.25 2 6.5C2 7.75 2.4375 8.8125 3.3125 9.6875C4.1875 10.5625 5.25 11 6.5 11Z" fill="#fff" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Reports list */}
      <main className="flex flex-col w-full gap-4 sm:gap-6 lg:gap-8 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-14 py-6 sm:py-10 pb-12 sm:pb-[80px]">
        {loading ? (
          <div className="flex flex-col gap-4 sm:gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-[0_4px_6px_-1px_rgba(0,0,0,0.10)] p-4 sm:p-6">
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-3">
                    <div className="flex flex-col gap-3 flex-1">
                      <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-shimmer w-48"></div>
                      <div className="flex flex-col gap-3">
                        <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-shimmer w-full"></div>
                        <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-shimmer w-5/6"></div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                      <div className="h-5 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-shimmer w-32"></div>
                      <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-shimmer w-20"></div>
                    </div>
                  </div>
                  <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-shimmer w-full"></div>
                  <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-shimmer w-3/4"></div>
                  <div className="flex gap-2 flex-wrap">
                    {[...Array(3)].map((_, j) => (
                      <div key={j} className="h-8 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-shimmer w-20"></div>
                    ))}
                  </div>
                  <div className="h-px bg-gray-200 my-2" />
                  <div className="space-y-3">
                    <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-shimmer w-full"></div>
                    <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-shimmer w-5/6"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <p className="text-yellow-800 font-inter text-base">{error}</p>
          </div>
        ) : fetchedReports?.length === 0 ? (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
            <p className="text-blue-800 font-inter text-base">No reports found.</p>
          </div>
        ) : (
          <>
            {fetchedReports?.map((report, idx) => (
              <ReportCard key={report.id} report={report} defaultExpanded={idx === 0} />
            ))}
           {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={loadReports}
              />
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
   
  );
}
