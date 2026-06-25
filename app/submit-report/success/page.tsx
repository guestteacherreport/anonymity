"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

function SuccessContent() {
  const searchParams = useSearchParams();
  const anonymous = searchParams.get("anonymous");

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#F7F9FE] via-[#F7F9FE] to-[#F7F9FE] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-[518px] bg-white rounded-lg shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)] px-10 py-10 flex flex-col items-center gap-6">

        {/* Checkmark icon */}
        <div className="flex items-center justify-center w-20 h-20 rounded-full bg-[#D1FAE5]">
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="80" height="80" rx="40" fill="#D1FAE5" />
            <path d="M53.3332 30.8334L34.9998 49.1667L26.6665 40.8334" stroke="#10B981" strokeWidth="3.33333" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        {/* Title */}
        <h1 className="font-[Outfit] text-[24px] font-bold text-[#111827] text-center leading-tight">
          Your report has been submitted
        </h1>

        {/* Description */}
        <p className="font-inter text-[15px] text-[#6B7280] text-center leading-[26px]">
          Thank you for sharing your experience. Your feedback helps other guest teachers make informed decisions before stepping into the classroom.
        </p>

        {/* Anonymous badge */}
        {anonymous && <div className="flex items-center gap-2 w-full px-4 py-3 rounded-md border border-black/[0.08] bg-[#F3F4F6]">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
            <path d="M15 9.74997C15 13.5 12.375 15.375 9.255 16.4625C9.09162 16.5178 8.91415 16.5152 8.7525 16.455C5.625 15.375 3 13.5 3 9.74997V4.49997C3 4.08603 3.33606 3.74997 3.75 3.74997C5.25 3.74997 7.125 2.84997 8.43 1.70997C8.75826 1.42952 9.24174 1.42952 9.57 1.70997C10.8825 2.85747 12.75 3.74997 14.25 3.74997C14.6639 3.74997 15 4.08603 15 4.49997V9.74997" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M6.75 9L8.25 10.5L11.25 7.5" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="font-inter text-[14px] font-medium text-[#111827] text-center flex-1">
            Your identity has been kept completely anonymous.
          </span>
        </div>}

        {/* Action buttons */}
        <div className="flex sm:flex-row flex-col items-center justify-center gap-4 w-full">
          <Link
            href="/browse-school"
            className="flex items-center w-full justify-center h-[45px] px-4 rounded-md border border-black/[0.08] font-inter text-sm sm:text-[14px] font-medium text-[#111827] hover:bg-gray-50 transition-colors"
          >
            View School
          </Link>
          <Link
            href="/submit-report"
            className="flex items-center w-full justify-center h-[45px] px-4 rounded-md bg-[#0171F9] font-inter text-sm sm:text-[14px] font-medium text-white hover:bg-blue-700 transition-colors"
          >
            Submit Another Report
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function SubmitReportSuccessPage() {
  return (
    <>
      <Header />
      <Suspense fallback={<div className="min-h-screen bg-[#F7F9FE]" />}>
        <SuccessContent />
      </Suspense>
      <Footer />
    </>
  );
}
