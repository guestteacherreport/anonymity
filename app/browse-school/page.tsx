"use client";

import Link from "next/link";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useEffect, useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@/lib/icons";
import { ObjectType } from "@/lib/types";
import { useDebounce } from "@/lib/useDebounce";

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16.6 18L10.3 11.7C9.8 12.1 9.225 12.4167 8.575 12.65C7.925 12.8833 7.23333 13 6.5 13C4.68333 13 3.14583 12.3708 1.8875 11.1125C0.629167 9.85417 0 8.31667 0 6.5C0 4.68333 0.629167 3.14583 1.8875 1.8875C3.14583 0.629167 4.68333 0 6.5 0C8.31667 0 9.85417 0.629167 11.1125 1.8875C12.3708 3.14583 13 4.68333 13 6.5C13 7.23333 12.8833 7.925 12.65 8.575C12.4167 9.225 12.1 9.8 11.7 10.3L18 16.6L16.6 18ZM6.5 11C7.75 11 8.8125 10.5625 9.6875 9.6875C10.5625 8.8125 11 7.75 11 6.5C11 5.25 10.5625 4.1875 9.6875 3.3125C8.8125 2.4375 7.75 2 6.5 2C5.25 2 4.1875 2.4375 3.3125 3.3125C2.4375 4.1875 2 5.25 2 6.5C2 7.75 2.4375 8.8125 3.3125 9.6875C4.1875 10.5625 5.25 11 6.5 11Z" fill="#737685" />
  </svg>
);

const LocationPinIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g opacity="0.6">
      <path d="M10.6666 6.66667C10.6666 5.19333 9.47325 4 7.99992 4C6.52659 4 5.33325 5.19333 5.33325 6.66667C5.33325 8.14 6.52659 9.33333 7.99992 9.33333C9.47325 9.33333 10.6666 8.14 10.6666 6.66667ZM6.66659 6.66667C6.66659 5.93333 7.26659 5.33333 7.99992 5.33333C8.73325 5.33333 9.33325 5.93333 9.33325 6.66667C9.33325 7.4 8.73325 8 7.99992 8C7.26659 8 6.66659 7.4 6.66659 6.66667Z" fill="#1E1E1E" />
      <path d="M7.61323 14.54C7.72657 14.62 7.86657 14.6667 7.9999 14.6667C8.13323 14.6667 8.27323 14.6267 8.38657 14.54C8.58657 14.3933 13.3532 10.96 13.3332 6.65999C13.3332 3.71999 10.9399 1.32666 7.9999 1.32666C5.0599 1.32666 2.66657 3.71999 2.66657 6.65999C2.64657 10.9533 7.41323 14.3933 7.61323 14.54ZM7.9999 2.66666C10.2066 2.66666 11.9999 4.45999 11.9999 6.66666C12.0132 9.62666 9.07323 12.2867 7.9999 13.16C6.92657 12.2867 3.98657 9.63333 3.9999 6.66666C3.9999 4.45999 5.79323 2.66666 7.9999 2.66666Z" fill="#1E1E1E" />
    </g>
  </svg>
);

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6.36671 10.1L12.0167 4.45C12.15 4.31667 12.3056 4.25 12.4834 4.25C12.6611 4.25 12.8167 4.31667 12.95 4.45C13.0834 4.58333 13.15 4.74178 13.15 4.92533C13.15 5.10889 13.0834 5.26711 12.95 5.4L6.83337 11.5333C6.70004 11.6667 6.54448 11.7333 6.36671 11.7333C6.18893 11.7333 6.03337 11.6667 5.90004 11.5333L3.03337 8.66667C2.90004 8.53333 2.83604 8.37511 2.84137 8.192C2.84671 8.00889 2.91626 7.85044 3.05004 7.71667C3.18382 7.58289 3.34226 7.51622 3.52537 7.51667C3.70848 7.51711 3.86671 7.58378 4.00004 7.71667L6.36671 10.1Z" fill="white" />
  </svg>
);

const QuoteIcon = () => (
  <svg width="14" height="13" viewBox="0 0 14 13" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12.6667 0C12.8435 0 13.013 0.0702379 13.1381 0.195262C13.2631 0.320286 13.3333 0.489856 13.3333 0.666667V10C13.3333 10.1768 13.2631 10.3464 13.1381 10.4714C13.013 10.5964 12.8435 10.6667 12.6667 10.6667H2.97L0 13V0.666667C0 0.489856 0.0702379 0.320286 0.195262 0.195262C0.320286 0.0702379 0.489856 0 0.666667 0H12.6667ZM12 1.33333H1.33333V10.2567L2.50867 9.33333H12V1.33333ZM5.67667 2.94133L5.97467 3.4C4.86267 4.002 4.882 4.968 4.882 5.17667C4.98533 5.162 5.094 5.16 5.202 5.17C5.49418 5.19449 5.76661 5.32748 5.96564 5.54279C6.16466 5.7581 6.27586 6.04013 6.27733 6.33333C6.27733 6.64275 6.15442 6.9395 5.93562 7.15829C5.71683 7.37708 5.42009 7.5 5.11067 7.5C4.75267 7.5 4.41067 7.33667 4.19467 7.10667C3.85133 6.74267 3.66667 6.33333 3.66667 5.67C3.66667 4.50333 4.48533 3.458 5.67667 2.94133ZM9.01 2.94133L9.308 3.4C8.196 4.002 8.21533 4.968 8.21533 5.17667C8.31867 5.162 8.42733 5.16 8.53533 5.17C8.82752 5.19449 9.09994 5.32748 9.29897 5.54279C9.49799 5.7581 9.60919 6.04013 9.61067 6.33333C9.61067 6.64275 9.48775 6.9395 9.26896 7.15829C9.05017 7.37708 8.75342 7.5 8.444 7.5C8.086 7.5 7.744 7.33667 7.528 7.10667C7.18467 6.74267 7 6.33333 7 5.67C7 4.50333 7.81867 3.458 9.01 2.94133Z" fill="#0171F9" />
  </svg>
);

const StarOutlineIcon = ({ color = "#10B981" }: { color?: string }) => (
  <svg width="14" height="13" viewBox="0 0 14 13" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4.56667 9.88333L6.66667 8.61667L8.76667 9.9L8.21667 7.5L10.0667 5.9L7.63333 5.68333L6.66667 3.41667L5.7 5.66667L3.26667 5.88333L5.11667 7.5L4.56667 9.88333ZM2.55 12.6667L3.63333 7.98333L0 4.83333L4.8 4.41667L6.66667 0L8.53333 4.41667L13.3333 4.83333L9.7 7.98333L10.7833 12.6667L6.66667 10.1833L2.55 12.6667Z" fill={color} />
  </svg>
);

const CardMapPinIcon = () => (
  <svg width="11" height="14" viewBox="0 0 11 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g opacity="0.8">
      <path d="M8.00008 5.34001C8.00008 3.86667 6.80675 2.67334 5.33341 2.67334C3.86008 2.67334 2.66675 3.86667 2.66675 5.34001C2.66675 6.81334 3.86008 8.00667 5.33341 8.00667C6.80675 8.00667 8.00008 6.81334 8.00008 5.34001ZM4.00008 5.34001C4.00008 4.60667 4.60008 4.00667 5.33341 4.00667C6.06675 4.00667 6.66675 4.60667 6.66675 5.34001C6.66675 6.07334 6.06675 6.67334 5.33341 6.67334C4.60008 6.67334 4.00008 6.07334 4.00008 5.34001Z" fill="#414141" />
      <path d="M4.94673 13.2133C5.06006 13.2933 5.20006 13.34 5.3334 13.34C5.46673 13.34 5.60673 13.3 5.72006 13.2133C5.92006 13.0667 10.6867 9.63333 10.6667 5.33333C10.6667 2.39333 8.2734 0 5.3334 0C2.3934 0 0 2.39333 0 5.33333C-0.0199372 9.62667 4.74673 13.0667 4.94673 13.2133ZM5.3334 1.34C7.54006 1.34 9.3334 3.13333 9.3334 5.34C9.34673 8.3 6.40673 10.96 5.3334 11.8333C4.26006 10.96 1.32006 8.30667 1.3334 5.34C1.3334 3.13333 3.12673 1.34 5.3334 1.34Z" fill="#414141" />
    </g>
  </svg>
);

// Rating star SVGs for filter panel
const FourStars = () => (
  <svg width="72" height="15" viewBox="0 0 72 15" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5.1375 11.7039L7.5 10.2039L9.8625 11.7237L9.24375 8.88158L11.325 6.98684L8.5875 6.73026L7.5 4.04605L6.4125 6.71053L3.675 6.96711L5.75625 8.88158L5.1375 11.7039ZM2.86875 15L4.0875 9.45395L0 5.72368L5.4 5.23026L7.5 0L9.6 5.23026L15 5.72368L10.9125 9.45395L12.1312 15L7.5 12.0592L2.86875 15Z" fill="#FFBF0F" />
    <path d="M24.1375 11.7039L26.5 10.2039L28.8625 11.7237L28.2437 8.88158L30.325 6.98684L27.5875 6.73026L26.5 4.04605L25.4125 6.71053L22.675 6.96711L24.7563 8.88158L24.1375 11.7039ZM21.8687 15L23.0875 9.45395L19 5.72368L24.4 5.23026L26.5 0L28.6 5.23026L34 5.72368L29.9125 9.45395L31.1312 15L26.5 12.0592L21.8687 15Z" fill="#FFBF0F" />
    <path d="M43.1375 11.7039L45.5 10.2039L47.8625 11.7237L47.2437 8.88158L49.325 6.98684L46.5875 6.73026L45.5 4.04605L44.4125 6.71053L41.675 6.96711L43.7563 8.88158L43.1375 11.7039ZM40.8687 15L42.0875 9.45395L38 5.72368L43.4 5.23026L45.5 0L47.6 5.23026L53 5.72368L48.9125 9.45395L50.1312 15L45.5 12.0592L40.8687 15Z" fill="#FFBF0F" />
    <path d="M62.1375 11.7039L64.5 10.2039L66.8625 11.7237L66.2437 8.88158L68.325 6.98684L65.5875 6.73026L64.5 4.04605L63.4125 6.71053L60.675 6.96711L62.7563 8.88158L62.1375 11.7039ZM59.8687 15L61.0875 9.45395L57 5.72368L62.4 5.23026L64.5 0L66.6 5.23026L72 5.72368L67.9125 9.45395L69.1312 15L64.5 12.0592L59.8687 15Z" fill="#FFBF0F" />
  </svg>
);

const ThreeStars = () => (
  <svg width="53" height="15" viewBox="0 0 53 15" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5.1375 11.7039L7.5 10.2039L9.8625 11.7237L9.24375 8.88158L11.325 6.98684L8.5875 6.73026L7.5 4.04605L6.4125 6.71053L3.675 6.96711L5.75625 8.88158L5.1375 11.7039ZM2.86875 15L4.0875 9.45395L0 5.72368L5.4 5.23026L7.5 0L9.6 5.23026L15 5.72368L10.9125 9.45395L12.1312 15L7.5 12.0592L2.86875 15Z" fill="#FFBF0F" />
    <path d="M24.1375 11.7039L26.5 10.2039L28.8625 11.7237L28.2437 8.88158L30.325 6.98684L27.5875 6.73026L26.5 4.04605L25.4125 6.71053L22.675 6.96711L24.7563 8.88158L24.1375 11.7039ZM21.8687 15L23.0875 9.45395L19 5.72368L24.4 5.23026L26.5 0L28.6 5.23026L34 5.72368L29.9125 9.45395L31.1312 15L26.5 12.0592L21.8687 15Z" fill="#FFBF0F" />
    <path d="M43.1375 11.7039L45.5 10.2039L47.8625 11.7237L47.2437 8.88158L49.325 6.98684L46.5875 6.73026L45.5 4.04605L44.4125 6.71053L41.675 6.96711L43.7563 8.88158L43.1375 11.7039ZM40.8687 15L42.0875 9.45395L38 5.72368L43.4 5.23026L45.5 0L47.6 5.23026L53 5.72368L48.9125 9.45395L50.1312 15L45.5 12.0592L40.8687 15Z" fill="#FFBF0F" />
  </svg>
);

const TwoStars = () => (
  <svg width="34" height="15" viewBox="0 0 34 15" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5.1375 11.7039L7.5 10.2039L9.8625 11.7237L9.24375 8.88158L11.325 6.98684L8.5875 6.73026L7.5 4.04605L6.4125 6.71053L3.675 6.96711L5.75625 8.88158L5.1375 11.7039ZM2.86875 15L4.0875 9.45395L0 5.72368L5.4 5.23026L7.5 0L9.6 5.23026L15 5.72368L10.9125 9.45395L12.1312 15L7.5 12.0592L2.86875 15Z" fill="#FFBF0F" />
    <path d="M24.1375 11.7039L26.5 10.2039L28.8625 11.7237L28.2437 8.88158L30.325 6.98684L27.5875 6.73026L26.5 4.04605L25.4125 6.71053L22.675 6.96711L24.7563 8.88158L24.1375 11.7039ZM21.8687 15L23.0875 9.45395L19 5.72368L24.4 5.23026L26.5 0L28.6 5.23026L34 5.72368L29.9125 9.45395L31.1312 15L26.5 12.0592L21.8687 15Z" fill="#FFBF0F" />
  </svg>
);

const OneStar = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5.1375 11.7039L7.5 10.2039L9.8625 11.7237L9.24375 8.88158L11.325 6.98684L8.5875 6.73026L7.5 4.04605L6.4125 6.71053L3.675 6.96711L5.75625 8.88158L5.1375 11.7039ZM2.86875 15L4.0875 9.45395L0 5.72368L5.4 5.23026L7.5 0L9.6 5.23026L15 5.72368L10.9125 9.45395L12.1312 15L7.5 12.0592L2.86875 15Z" fill="#FFBF0F" />
  </svg>
);

type SentimentType = "Positive" | "Neutral" | "Negative";

interface School {
  id: Number;
  school_name: string;
  ai_summary: string;
  city: string;
  state: string;
  grade_level: [];
  sentiment: SentimentType;
  avg_rating: number;
  return_to_school_percentage: number;
  total_reports: number;
  calculated_risk: SentimentType;
}

function NoSchoolsFound({
  onReset,
}: {
  onReset?: () => void;
}) {
  return (
    <div className="w-full flex flex-col items-center justify-center py-16 px-6 text-center">

      {/* Icon */}
      <div className="w-20 h-20 rounded-full bg-[#F3F6FF] flex items-center justify-center mb-4">
        <svg
          width="34"
          height="34"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path
            d="M10 2a8 8 0 105.293 14.293l4.707 4.707 1.414-1.414-4.707-4.707A8 8 0 0010 2z"
            stroke="#4B5563"
            strokeWidth="1.5"
          />
        </svg>
      </div>

      {/* Title */}
      <h2 className="text-lg font-semibold text-[#111827]">
        No Schools Found
      </h2>

      {/* Description */}
      <p className="text-sm text-[#6B7280] mt-2 max-w-md">
        We couldn’t find any schools matching your filters or search.
        Try adjusting your location, grade, or rating filters.
      </p>

      {/* Actions */}
      <div className="flex gap-3 mt-6">
        <button
          onClick={onReset}
          className="cursor-pointer px-4 py-2 rounded-lg bg-[#0B77F9] text-white text-sm font-medium hover:bg-blue-700 transition"
        >
          Reset Filters
        </button>

        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
        >
          Retry
        </button>
      </div>
    </div>
  );
}

function getRatingColor(rating: number): string {
  if (rating >= 4.0) return "#10B981";
  if (rating >= 3.0) return "#E8A411";
  return "#EF4444";
}

function getSentimentStyle(sentiment: SentimentType) {
  switch (sentiment) {
    case "Positive":
      return { bg: "bg-[rgba(16,185,129,0.10)]", text: "text-[#10B981]" };
    case "Neutral":
      return { bg: "bg-[rgba(232,164,17,0.10)]", text: "text-[#E8A411]" };
    default:
      return { bg: "bg-[rgba(239,68,68,0.10)]", text: "text-[#EF4444]" };
  }
}

function SchoolCard({ school }: { school: School }) {
  const ratingColor = getRatingColor(school.avg_rating);
  const schoolratingColor = getRatingColor(school.return_to_school_percentage);
  const sentimentStyle = getSentimentStyle(school.sentiment);

  return (
    <div className="bg-white rounded-xl shadow-[0_4px_6px_-1px_rgba(0,0,0,0.10)] flex flex-col">
      <div className="flex flex-col gap-3 sm:gap-4 p-4 sm:p-5 flex-1">
        {/* Card top section */}
        <div className="flex flex-col gap-3 sm:gap-[14px]">
          {/* School name, location, grade + sentiment badge */}
          <div className="flex flex-row sm:items-start gap-2 sm:gap-3">
            <div className="flex flex-col gap-2 sm:gap-3 flex-1 min-w-0">
              <h3 className="text-[#121212] font-[Inter] text-sm sm:text-base font-bold leading-5">{school.school_name}</h3>
              <div className="flex items-center gap-1.5 opacity-80">
                <CardMapPinIcon />
                <span className="font-[Outfit] text-xs text-[#414141]">
                  {[school.city, school.state].filter(Boolean).join(", ")}
                </span>              </div>
              <div className="flex flex-row gap-2">
                {school.grade_level?.map((grade: string, idx: number) => {
                  return <span key={idx} className="inline-flex self-start px-2 py-1 rounded bg-[#DFEEFF] text-[#0171F9] font-[Inter] text-xs font-semibold leading-[15px]">
                    {grade}
                  </span>
                })}
              </div>
            </div>
            {school?.sentiment && <span className={`flex-shrink-0 h-fit inline-flex px-2 py-1 w-fit rounded font-[Inter] text-xs font-semibold leading-[15px] ${sentimentStyle.bg} ${sentimentStyle.text}`}>
              {school.sentiment}
            </span>}
          </div>

          {/* Divider */}
          <div className="h-px w-full bg-[#DADADA] opacity-40" />

          {/* Stats: Avg Rating / Would Return / Reviews */}
          <div className="flex items-center gap-2">
            <div className="flex flex-col flex-1 p-2 sm:p-2.5 rounded-[8px_8px_0_8px] bg-white">
              <span className="text-[#434654] font-[Inter] text-xs font-normal leading-[13px] sm:leading-[15px] opacity-80">Avg Rating</span>
              <div className="flex justify-left items-center gap-1 mt-1">
                <span className="font-[Inter] text-base sm:text-lg font-semibold leading-6 sm:leading-7" style={{ color: ratingColor }}>
                  {school.avg_rating}
                </span>
                <div className="hidden sm:flex">
                  <StarOutlineIcon color={ratingColor} />
                </div>
              </div>
            </div>
            <div className="w-px h-[52px] bg-[#DADADA] opacity-40 flex-shrink-0" />
            <div className="flex flex-col flex-1 p-2 sm:p-2.5 rounded-lg bg-white">
              <span className="text-[#434654] font-[Inter] text-xs font-normal leading-[13px] sm:leading-[15px] opacity-80">Would Return</span>
              <span className="font-[Inter] text-base sm:text-lg font-semibold leading-6 sm:leading-7 mt-1" style={{ color: schoolratingColor }}>
                {school.return_to_school_percentage || 0}%
              </span>
            </div>
            <div className="w-px h-[52px] bg-[#DADADA] opacity-40 flex-shrink-0" />
            <div className="flex flex-col flex-1 p-2 sm:p-2.5 rounded-lg bg-white">
              <span className="text-[#434654] font-[Inter] text-xs font-normal leading-[13px] sm:leading-[15px] tracking-[-0.5px] opacity-80">Reviews</span>
              <span className="text-[#191C1D] font-[Inter] text-base sm:text-lg font-semibold leading-6 sm:leading-7 mt-1">{school.total_reports}</span>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px w-full bg-[#DADADA] opacity-40" />

          {/* Quote snippet */}
         {school.ai_summary && <div className="flex items-start gap-2 p-2 sm:p-2.5 rounded bg-[#F8F9FD]">
            <div className="flex-shrink-0 mt-0.5 sm:mt-1">
              <QuoteIcon />
            </div>
             <p className="flex-1 text-[#464555] font-[Inter] text-xs sm:text-[13px] font-normal leading-[16px] sm:leading-[18px]">{school.ai_summary}</p>
          </div>}
        </div>

        {/* View Details button */}
        <Link
          href={`/school/${school.id}`}
          className="flex items-center justify-center gap-2 w-full py-2 sm:py-2.5 px-6 sm:px-8 rounded-md bg-[#0171F9] text-white font-[Inter] text-xs sm:text-sm font-medium leading-6 hover:bg-blue-700 transition-colors cursor-pointer mt-auto"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}



const gradeOptions = ["Pre-K", "Elementary", "Middle School", "High School", "Special Ed"];

export default function BrowseSchoolPage() {
  const [fetchedSchools, setFetchedSchools] = useState<Report[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searchInput, setSearchInput] = useState<ObjectType>({});
  const [filters, setFilters] = useState<ObjectType>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [firstLoad, setFirstLoad] = useState<boolean>(true);
  const [searchingLoad, setSearchingLoad] = useState<boolean>(false);
  const [pageLoading, setPageLoading] = useState<boolean>(false);

  const debouncedFilters = useDebounce(filters, 1000);

  const loadSchools = async () => {
    try {
     

      if (firstLoad) {
        setLoading(true);
      }

console.log("loading",loading);
      const params = new URLSearchParams({
        page: String(currentPage),
        limit: "10",
        location: filters.location || "",
      });

      filters.grade?.forEach((g: string) => {
        params.append("grade", g);
      });

      filters.rating?.forEach((r: string) => {
        params.append("rating", r);
      });

      if (searchInput?.school_name?.trim()) {
        params.append("searchBySchool", searchInput.school_name.trim());
      }

      if (searchInput?.teacher_name?.trim()) {
        params.append("searchByTeacher", searchInput.teacher_name.trim());
      }

      const response = await fetch(
        `/api/browse-schools?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch schools");
      }

      const result = await response.json();

      setFetchedSchools(result?.schools || []);
      setTotalPages(result?.pagination?.totalPages || 0);
      setFirstLoad(false);
    } catch (err) {
      console.error("Error loading reports:", err);
      setLoading(false);
      setPageLoading(false);
      setFirstLoad(false);
      setSearchingLoad(false);
    } finally {
      setLoading(false);
      setFirstLoad(false);
      setPageLoading(false);
      setSearchingLoad(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    if (currentPage !== 1) {
      setCurrentPage(1);
      
    } else {
      loadSchools();
    }
    
  }, [debouncedFilters]);



  useEffect(() => {
 
    if(!searchingLoad){
      loadSchools();
      setPageLoading(true);
    }
    
  }, [currentPage]);

  useEffect(()=>{
    
    if(searchingLoad){
      loadSchools();
      setLoading(true);
    }
  },[searchingLoad])


  return (
    <div className="min-h-screen bg-[#F8FAFE] flex flex-col">
      <Header />

      {/* Hero + Search — white background section */}
      <div className="bg-white w-full">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-14">
          {/* Page title */}
          <div className="pt-8 sm:pt-12 lg:pt-[72px] pb-6 sm:pb-8">
            <h1 className="text-[#121212] font-[Inter] text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold leading-[1.2]">
              Browse School
            </h1>
            <p className="text-[#121212] font-[Inter] text-sm sm:text-base lg:text-lg font-normal leading-[1.5] sm:leading-[26px] tracking-[0.2px] opacity-[0.88] mt-2">
              Share your experience to help other guest teachers.
            </p>
          </div>

          {/* Search bar */}
          <div className="pb-6 sm:pb-8">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center bg-[#E9F2FF] rounded-2xl p-2  shadow-[0_1px_2px_0_rgba(0,0,0,0.05)]">
              {/* School name input */}
              <div className="flex items-center gap-2 flex-1 py-3.5 px-3 sm:px-4 bg-white rounded-lg border border-[rgba(195,198,214,0.20)]">
                <SearchIcon />
                <input
                  type="text"
                  value={searchInput?.school_name || ""}
                  onChange={(e) => { setSearchInput({ ...searchInput, school_name: e.target.value }); }}
                  placeholder="Search by School Name..."
                  className="flex-1 bg-transparent text-[#737685] font-[Inter] text-xs sm:text-base font-normal outline-none placeholder:text-[#737685] min-w-0"
                />
              </div>
              {/* Teacher name input */}
              <div className="flex items-center gap-2 flex-1 px-3 py-3.5 sm:px-4 bg-white rounded-lg border border-[rgba(195,198,214,0.20)]">
                <SearchIcon />
                <input
                  type="text"
                  value={searchInput?.teacher_name || ""}
                  onChange={(e) => { setSearchInput({ ...searchInput, teacher_name: e.target.value }) }}
                  placeholder="Search by Teacher Name..."
                  className="flex-1 bg-transparent text-[#737685] font-[Inter] text-xs sm:text-base font-normal outline-none placeholder:text-[#737685] min-w-0"
                />
              </div>
              {/* Search button */}
              <button disabled={searchingLoad} onClick={() => {
                setSearchingLoad(true);
                setCurrentPage(1);
              }} className="flex-shrink-0 h-12 sm:h-[54px] px-6 sm:px-11 bg-[#0171F9] text-white font-[Inter] text-xs sm:text-sm font-semibold leading-5 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap">
                {searchingLoad ? "Searching..." : "Search"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content: filter + cards */}
      <main className="flex-1 w-full">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-14 py-6 sm:py-8 pb-12 sm:pb-[80px]">
          <div className="flex flex-col lg:flex-row gap-5 sm:gap-7 items-start">

            {/* Filter sidebar */}
            <aside className="w-full lg:w-[302px] flex-shrink-0">
              <div className="bg-white rounded-xl shadow-[0_4px_6px_-1px_rgba(0,0,0,0.10)] p-4 sm:p-6">
                {/* Filter header */}
                <div className="flex items-end justify-between mb-5 sm:mb-7">
                  <span className="font-[Outfit] text-lg font-medium leading-5 text-black">Filter</span>
                  {Object.values(filters).some((value) => {
  if (Array.isArray(value)) return value.length > 0;
  return !!value;
}) &&
                  
                  <button onClick={() => {
                    setFilters({})
                    setSearchInput({})
                  }} className="font-[Outfit] text-sm  font-medium leading-5 text-[#0171F9] hover:underline cursor-pointer">
                    Clear all
                  </button>}
                </div>

                {/* Location filter */}
                <div className="flex flex-col gap-3 mb-5 sm:mb-7">
                  <span className="font-[Outfit] text-sm sm:text-base font-medium leading-6 text-[#121212]">
                    Location
                  </span>

                  <div className="flex items-center gap-1 px-[14px] py-3 bg-[#F3F4F5] rounded-lg">
                    <LocationPinIcon />

                    <input
                      type="text"
                      onChange={(e) => setFilters({ ...filters, ["location"]: e.target.value })}
                      placeholder="City or Zip Code"
                      value={filters?.location || ""}
                      className="ml-1 w-full bg-transparent outline-none border-none font-[Inter] text-xs font-normal text-[#121212] placeholder:text-[#6B7280]"
                    />
                  </div>
                </div>
                {/* Grade Level filter */}
                <div className="flex flex-col gap-4 sm:gap-5 mb-5 sm:mb-7">
                  <span className="font-[Outfit] text-sm sm:text-base font-medium leading-6 text-[#121212]">Grade Level</span>
                  <div className="flex flex-col gap-2 sm:gap-3">
                    {gradeOptions.map((grade, index) => (
                      <label
                        key={grade}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={(filters.grade || []).includes(grade)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFilters((prev: any) => ({
                                ...prev,
                                grade: [...(prev.grade || []), grade],
                              }));
                            } else {
                              setFilters((prev: any) => ({
                                ...prev,
                                grade: (prev.grade || []).filter(
                                  (item: string) => item !== grade
                                ),
                              }));
                            }
                          }}
                          className="peer sr-only"
                        />

                        <div
                          className="w-4 h-4 rounded-[2px] border border-[#D9D9D9] bg-white flex items-center justify-center flex-shrink-0 peer-checked:bg-[#0171F9] peer-checked:border-[#0171F9]"
                        >
                          <CheckIcon />
                        </div>

                        <span className="font-[Outfit] text-xs sm:text-sm font-normal text-[#212121] opacity-[0.88]">
                          {grade}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Rating filter */}
                <div className="flex flex-col gap-4 sm:gap-5">
                  <span className="font-[Outfit] text-sm sm:text-base font-medium leading-6 text-[#121212]">Rating</span>
                  <div className="flex flex-col gap-2 sm:gap-3">
                    {[
                      { label: "4.0+", icon: <FourStars />, value: 4 },
                      { label: "3.0+", icon: <ThreeStars />, value: 3 },
                      { label: "2.0+", icon: <TwoStars />, value: 2 },
                      { label: "1.0+", icon: <OneStar />, value: 1 },
                    ].map((item: ObjectType) => (
                      <label
                        key={item.label}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={(filters.rating || []).includes(item.value)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFilters((prev: any) => ({
                                ...prev,
                                rating: [...(prev.rating || []), item.value],
                              }));
                            } else {
                              setFilters((prev: any) => ({
                                ...prev,
                                rating: (prev.rating || []).filter(
                                  (rating: string) => rating !== item.value
                                ),
                              }));
                            }
                          }}
                          className="peer sr-only"
                        />

                        <div className="w-4 h-4 rounded-[2px] border border-[#D9D9D9] bg-white flex items-center justify-center flex-shrink-0 peer-checked:bg-[#0171F9] peer-checked:border-[#0171F9]">
                          <CheckIcon />
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="w-auto">
                            {item.icon}
                          </div>
                          <span className="font-[Outfit] text-xs sm:text-sm font-normal text-[#212121] opacity-[0.88]">
                            {item.label}
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </aside>
            {loading ?
              <div className="sm:min-h-[600px] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-5 lg:gap-7 content-start w-full">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="p-4 sm:p-5 rounded-xl border border-gray-100 bg-white animate-pulse">

                    {/* Top row: title + badge */}
                    <div className="flex justify-between items-start">
                      <div className="space-y-2 w-full">

                        {/* School name */}
                        <div className="h-5 bg-gray-200 rounded w-2/5" />

                        {/* Location */}
                        <div className="h-4 bg-gray-200 rounded w-1/3" />

                        {/* Grade chip */}
                      </div>

                      {/* Status badge */}
                      <div className="h-6 w-16 bg-gray-200 rounded-full" />
                    </div>

                    {/* Divider */}
                    <div className="my-4 h-px bg-gray-100" />

                    {/* Stats row */}
                    <div className="grid grid-cols-3 gap-3 text-center">

                      <div className="space-y-2">
                        <div className="h-4 w-16 bg-gray-200 rounded mx-auto" />
                        <div className="h-5 w-12 bg-gray-200 rounded mx-auto" />
                      </div>

                      <div className="space-y-2 border-l border-r border-gray-100">
                        <div className="h-4 w-20 bg-gray-200 rounded mx-auto" />
                        <div className="h-5 w-14 bg-gray-200 rounded mx-auto" />
                      </div>

                      <div className="space-y-2">
                        <div className="h-4 w-14 bg-gray-200 rounded mx-auto" />
                        <div className="h-5 w-10 bg-gray-200 rounded mx-auto" />
                      </div>
                    </div>

                    {/* Review box */}
                    <div className="mt-4 p-3 bg-gray-100 rounded-lg space-y-2">
                      <div className="h-3 bg-gray-200 rounded w-full" />
                      <div className="h-3 bg-gray-200 rounded w-5/6" />
                    </div>

                    {/* Button */}
                    <div className="mt-4 h-10 bg-gray-200 rounded-lg w-full" />
                  </div>
                ))}
              </div>
              : ""}
            {!loading && fetchedSchools.length === 0 && (
              <NoSchoolsFound
                onReset={() => {
                  setFilters({});
                  setSearchInput({});
                }}
              />
            )}
            {/* School cards grid */}
            {!loading && fetchedSchools?.length > 0 &&
              <div className="flex flex-col">


                <div className="sm:min-h-[600px] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-5 lg:gap-7 content-start w-full">
                  {fetchedSchools.map((school: any, idx: number) => (
                    <SchoolCard key={idx} school={school} />
                  ))}
                </div>



                <div className="flex items-center justify-center gap-3 mt-6 sm:mt-9 relative">
                  <div className="flex items-center gap-1 sm:gap-2">
                    <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1} className={`w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-md border border-[rgba(0,0,0,0.08)] disabled:cursor-not-allowed disabled:opacity-40 bg-white hover:bg-gray-50 transition-colors ${currentPage == 1 ? "" : "cursor-pointer"}`}>
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
                          onClick={() => {
                            setCurrentPage(page)
                          }}
                          className={`w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-md font-inter text-xs sm:text-sm font-medium transition-colors cursor-pointer ${page === currentPage
                            ? "bg-[#0171F9] border border-[#0171F9] text-white"
                            : "border border-[rgba(0,0,0,0.08)] bg-white text-[#0171F9] hover:bg-gray-50"
                            }`}
                        >
                          {page}
                        </button>
                      ));
                    })()}


                    <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-md border border-[rgba(0,0,0,0.08)] bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer">
                      <ChevronRightIcon />
                    </button>

                  </div>


                  <div className="text-sm text-gray-500 absolute right-0">
                    {pageLoading && (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-black border-t-white rounded-full animate-spin" />
                        <span>Loading...</span>
                      </div>
                    )}
                  </div>

                </div></div>}
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
