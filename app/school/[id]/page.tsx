"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { AvgRatings, formatDate } from "@/lib/function";
import { useId } from "react";
import { ChatIcon, ChevronLeftIcon, ChevronRightIcon, LocationIcon, SchoolIcon } from "@/lib/icons";
import toast from "react-hot-toast";

// --- Icon Components ---


const FileIcon = () => (
  <svg width="19" height="19" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14.0979 6.08171C14.0643 6.00485 14.0172 5.93458 13.959 5.87417L9.70904 1.62417C9.64863 1.56597 9.57836 1.51896 9.5015 1.48533C9.48025 1.47542 9.45758 1.46975 9.43492 1.46196C9.37563 1.44186 9.31394 1.42972 9.25146 1.42583C9.23659 1.42442 9.22313 1.41663 9.20825 1.41663H4.24992C3.46863 1.41663 2.83325 2.052 2.83325 2.83329V14.1666C2.83325 14.9479 3.46863 15.5833 4.24992 15.5833H12.7499C13.5312 15.5833 14.1666 14.9479 14.1666 14.1666V6.37496C14.1666 6.36008 14.1588 6.34663 14.1574 6.33104C14.1535 6.26856 14.1413 6.20687 14.1213 6.14758C14.1146 6.12492 14.1068 6.10296 14.0979 6.08171ZM11.7483 5.66663H9.91658V3.83488L11.7483 5.66663ZM4.24992 14.1666V2.83329H8.49992V6.37496C8.49992 6.56282 8.57455 6.74299 8.70738 6.87583C8.84022 7.00867 9.02039 7.08329 9.20825 7.08329H12.7499L12.7513 14.1666H4.24992Z" fill="#0171F9" />
    <path d="M5.66675 8.49996H11.3334V9.91663H5.66675V8.49996ZM5.66675 11.3333H11.3334V12.75H5.66675V11.3333ZM5.66675 5.66663H7.08341V7.08329H5.66675V5.66663Z" fill="#0171F9" />
  </svg>
);

const CalendarIcon = () => (

  <svg width="16" height="16" viewBox="0 0 10 11" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2.75 1.61111H2.3C1.67 1.61111 1.355 1.61111 1.11425 1.73222C0.902577 1.83875 0.730481 2.00872 0.622625 2.21778C0.5 2.45556 0.5 2.76667 0.5 3.38889V3.83333M2.75 1.61111H7.25M2.75 1.61111V0.5M0.5 3.83333V8.72222C0.5 9.34444 0.5 9.65556 0.622625 9.89333C0.730481 10.1024 0.902577 10.2724 1.11425 10.3789C1.35444 10.5 1.66944 10.5 2.29831 10.5H7.70169C8.33056 10.5 8.645 10.5 8.88519 10.3789C9.09725 10.2722 9.26937 10.1022 9.37737 9.89333C9.5 9.65556 9.5 9.34556 9.5 8.72445V3.83333M0.5 3.83333H9.5M7.25 1.61111H7.7C8.33 1.61111 8.645 1.61111 8.88519 1.73222C9.09725 1.83889 9.26937 2.00833 9.37737 2.21778C9.5 2.455 9.5 2.76611 9.5 3.38722V3.83333M7.25 1.61111V0.5M7.25 8.27778H7.25113V8.27889H7.25V8.27778ZM5 8.27778H5.00112V8.27889H5V8.27778ZM2.75 8.27778H2.75112V8.27889H2.75V8.27778ZM7.25113 6.05556V6.05667H7.25V6.05556H7.25113ZM5 6.05556H5.00112V6.05667H5V6.05556ZM2.75 6.05556H2.75112V6.05667H2.75V6.05556Z" stroke="#121212" strokeLinecap="round" strokeLinejoin="round" />
  </svg>

);



const UserIcon = () => (

  <svg width="14" height="15" viewBox="0 0 12 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6.00002 7.33335C7.84097 7.33335 9.33335 5.84097 9.33335 4.00002C9.33335 2.15907 7.84097 0.666687 6.00002 0.666687C4.15907 0.666687 2.66669 2.15907 2.66669 4.00002C2.66669 5.84097 4.15907 7.33335 6.00002 7.33335Z" stroke="#464555" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M11.3334 12.6667C11.3334 11.2522 10.7715 9.89567 9.77126 8.89547C8.77106 7.89528 7.41451 7.33337 6.00002 7.33337C4.58553 7.33337 3.22898 7.89528 2.22878 8.89547C1.22859 9.89567 0.666687 11.2522 0.666687 12.6667" stroke="#464555" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
  </svg>

);

const ChevronDownIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 7.08331L10 12.0833L15 7.08331H5Z" fill="#0171F9" stroke="#0171F9" strokeWidth="1.66667" strokeLinejoin="round" />
  </svg>
);



function StarRating({
  rating,
  size = "sm",
}: {
  rating: number;
  size?: "sm" | "lg";
}) {
  const starSize =
    size === "lg" ? "w-5 h-[19px]" : "w-[18px] h-[17px]";

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, index) => {
        const i = index + 1;

        // exact star fill for each star
        const fillPercent = Math.max(
          0,
          Math.min((rating - index) * 100, 100)
        );

        return (
          <div key={i} className={`${starSize} relative`}>
            {/* Empty Star */}
            <svg
              viewBox="0 0 20 19"
              className="w-full h-full absolute inset-0"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6.85 14.825L10 12.925L13.15 14.85L12.325 11.25L15.1 8.85L11.45 8.525L10 5.125L8.55 8.5L4.9 8.825L7.675 11.25L6.85 14.825ZM3.825 19L5.45 11.975L0 7.25L7.2 6.625L10 0L12.8 6.625L20 7.25L14.55 11.975L16.175 19L10 15.275L3.825 19Z"
                fill="#0171F9"
                fillOpacity="0.1"
              />
            </svg>

            {/* Filled Star */}
            {fillPercent > 0 && (
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${fillPercent}%` }}
              >
                <svg
                  viewBox="0 0 20 19"
                  className="h-full"
                  style={{ width: "20px", minWidth: "20px" }}
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M3.825 19L5.45 11.975L0 7.25L7.2 6.625L10 0L12.8 6.625L20 7.25L14.55 11.975L16.175 19L10 15.275L3.825 19Z"
                    fill="#0171F9"
                  />
                </svg>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

const reportSkeleton = () => {
  return <div className="flex flex-col gap-4 sm:gap-6">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="bg-white rounded-xl shadow-[0_4px_6px_-1px_rgba(0,0,0,0.10)] p-6">
        <div className="space-y-4">
          <div className="flex justify-between items-start gap-4">
            <div className="flex gap-2 flex-1">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, j) => (
                  <div key={j} className="w-4 h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-shimmer"></div>
                ))}
              </div>
              <div className="h-5 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-shimmer w-24"></div>
            </div>
            <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-shimmer w-20"></div>
          </div>
          <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-shimmer w-full"></div>
          <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-shimmer w-5/6"></div>
          <div className="flex gap-2">
            {[...Array(4)].map((_, j) => (
              <div key={j} className="h-8 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-shimmer w-20"></div>
            ))}
          </div>
          <div className="h-px bg-gray-200 my-4" />
          <div className="space-y-3">
            <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-shimmer w-full"></div>
            <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-shimmer w-full"></div>
          </div>
        </div>
      </div>
    ))}
  </div>
}

function ReviewStars({ count }: { count: number }) {
  const totalStars = 5;
  const uniqueId = useId();

  const starPath =
    "M6.5075 14.0447L9.5 12.2447L12.4925 14.0684L11.7087 10.6579L14.345 8.38421L10.8775 8.07632L9.5 4.85526L8.1225 8.05263L4.655 8.36053L7.29125 10.6579L6.5075 14.0447ZM3.63375 18L5.1775 11.3447L0 6.86842L6.84 6.27632L9.5 0L12.16 6.27632L19 6.86842L13.8225 11.3447L15.3662 18L9.5 14.4711L3.63375 18Z";

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: totalStars }).map((_, index) => {
        const fillPercent = Math.max(
          0,
          Math.min(100, (count - index) * 100)
        );

        const gradientId = `grad-${uniqueId}-${index}`;

        return (
          <svg
            key={index}
            width="19"
            height="18"
            viewBox="0 0 19 18"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient
                id={gradientId}
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop offset={`${fillPercent}%`} stopColor="#FFBF0F" />
                <stop offset={`${fillPercent}%`} stopColor="#E5E7EB" />
              </linearGradient>
            </defs>

            <path d={starPath} fill={`url(#${gradientId})`} />
          </svg>
        );
      })}
    </div>
  );
}

// --- Types ---
type SentimentType = "Positive" | "Neutral" | "Negative";
type ReturnAnswer = "Yes" | "No" | "Maybe";


interface Review {
  id: number;
  your_name: string;
  teacher_name?: string;
  created_at: string;
  AI_sentiment:SentimentType;
  avg_rating: number;
  feedback: string;
  tags: string[];
  classroom_behavior: number,
  lesson_preparedness: number,
  staff_friendliness: number,
  school_cleanliness: number,
  support_level: number,
  return_to_school: number,
  return_to_teacher: number,
  teacher_comment: string,
  school_comment: string,
}

// --- Data types ---
interface SchoolData {
  id: string;
  school_name: string;
  city: string;
  state: string;
  grade_level?: Array<string>;
  avg_rating: number;
  total_reports: number;
  return_to_school_yes_percentage: number;
  return_to_school_no_percentage: number;
  return_to_school_maybe_percentage: number;
  return_to_teacher_yes_percentage: number;
  return_to_teacher_no_percentage: number;
  return_to_teacher_maybe_percentage: number;
  total_reviews: number;
  positive_reports: number;
  negative_reports: number;
  neutral_reports: number;
}

interface ApiResponse {
  success: boolean;
  school: SchoolData;
  reports: Review[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// --- Helper functions ---
function getSentimentBadgeStyle(sentiment: SentimentType) {
  switch (sentiment) {
    case "Positive":
      return "bg-[#BBFBE6] text-[#2D7D65]";
    case "Negative":
      return "bg-[#FFE0E0] text-[#E02C2C]";
    default:
      return "bg-[#FFEABD] text-[#E8A411]";
  }
}

function getReturnAnswerStyle(answer: ReturnAnswer) {
  switch (answer) {
    case "Yes":
      return "bg-[#BBFBE6] text-[#2D7D65]";
    case "No":
      return "bg-[#FFE0E0] text-[#E02C2C]";
    default:
      return "bg-[#FFEABD] text-[#E8A411]";
  }
}

// --- Review Card Component ---
function ReviewCard({ review }: { review: Review }) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className={`bg-white rounded-xl shadow-[0_4px_6px_-1px_rgba(0,0,0,0.10)] ${showDetails ? "p-4 sm:p-6 lg:p-7" : "px-4 sm:px-6 lg:px-7 pt-4 sm:pt-6 lg:pt-7"} flex flex-col gap-4 sm:gap-5 lg:gap-6`}>
      {/* Top row: stars, reviewer, teacher, date, sentiment */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 lg:gap-4 flex-wrap">
        <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 flex-wrap">
          <ReviewStars count={Number(AvgRatings({
            classroom_behavior: review.classroom_behavior,
            lesson_preparedness: review.lesson_preparedness, school_cleanliness: review.school_cleanliness,
            staff_friendliness: review.staff_friendliness,
            support_level: review.support_level,
          }))} />

          <span className="text-[#121212] font-inter text-base sm:text-lg font-bold leading-5 capitalize">{review.your_name}</span>
          <span className="w-[3px] h-[3px] rounded-full bg-[#676767]" />
          {review.teacher_name && (
            <>
              <div className="flex items-center gap-1 sm:gap-1.5">

                <svg width="17" height="17" viewBox="0 0 14 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" clipRule="evenodd" d="M7.39539 7.41538C7.5097 7.45906 7.60199 7.54635 7.65195 7.65806C7.70192 7.76976 7.70548 7.89674 7.66185 8.01107C7.26862 9.03999 6.67047 9.60738 5.94431 9.89168C5.27231 10.1538 4.5277 10.1538 3.88585 10.1538H3.84585C3.15662 10.1538 2.57816 10.16 2.08339 10.3532C1.62862 10.5305 1.20462 10.8861 0.892625 11.7034C0.848884 11.8177 0.761519 11.91 0.649747 11.9599C0.537976 12.0098 0.410954 12.0133 0.296625 11.9695C0.182297 11.9258 0.0900263 11.8384 0.0401128 11.7267C-0.00980069 11.6149 -0.0132688 11.4879 0.0304715 11.3735C0.423087 10.3446 1.02124 9.77722 1.74739 9.49292C2.42001 9.23076 3.16462 9.23076 3.80585 9.23076H3.84585C4.53508 9.23076 5.11354 9.22461 5.60831 9.03138C6.0637 8.85415 6.4877 8.49845 6.7997 7.68122C6.84338 7.56691 6.93067 7.47463 7.04237 7.42466C7.15408 7.37469 7.28106 7.37175 7.39539 7.41538ZM7.19847 0H9.72585C10.4231 0 10.9929 3.35276e-08 11.4428 0.0603077C11.9129 0.123692 12.3203 0.260307 12.6458 0.585846C12.9708 0.911384 13.1074 1.31815 13.1708 1.78892C13.2311 2.23815 13.2311 2.808 13.2311 3.50584V4.80246C13.2311 5.49969 13.2311 6.06892 13.1708 6.51938C13.108 6.98892 12.9708 7.3963 12.6458 7.72184C12.3209 8.04738 11.9129 8.18399 11.4428 8.24738C10.9929 8.30769 10.4231 8.30769 9.72585 8.30769H8.76893C8.64652 8.30769 8.52912 8.25906 8.44257 8.1725C8.35601 8.08595 8.30739 7.96856 8.30739 7.84615C8.30739 7.72374 8.35601 7.60635 8.44257 7.51979C8.52912 7.43324 8.64652 7.38461 8.76893 7.38461H9.69262C10.4311 7.38461 10.9388 7.38338 11.3197 7.3323C11.6871 7.28307 11.8674 7.19446 11.9929 7.06892C12.1185 6.94399 12.2065 6.76369 12.2563 6.39569C12.3074 6.01476 12.3086 5.50769 12.3086 4.76923V3.53846C12.3086 2.8 12.3074 2.29292 12.2563 1.912C12.2071 1.544 12.1185 1.36431 11.9929 1.23877C11.8674 1.11323 11.6871 1.02461 11.3197 0.975384C10.9382 0.924307 10.4311 0.923076 9.69323 0.923076H7.2317C6.49324 0.923076 5.98554 0.924307 5.60462 0.975384C5.23724 1.02461 5.05693 1.11323 4.93139 1.23877C4.82431 1.34585 4.74554 1.49169 4.69385 1.75569C4.6397 2.03261 4.62185 2.4 4.61754 2.92677C4.61706 2.98738 4.60464 3.0473 4.581 3.10311C4.55736 3.15892 4.52295 3.20953 4.47975 3.25204C4.43655 3.29456 4.3854 3.32815 4.32922 3.35089C4.27304 3.37364 4.21292 3.3851 4.15231 3.38461C4.0917 3.38413 4.03178 3.37171 3.97597 3.34807C3.92016 3.32442 3.86955 3.29002 3.82704 3.24682C3.78452 3.20362 3.75093 3.15247 3.72819 3.09629C3.70544 3.0401 3.69398 2.97999 3.69447 2.91938C3.69878 2.39569 3.71539 1.94892 3.78801 1.57784C3.86308 1.19446 4.00401 0.860307 4.27847 0.585846C4.60462 0.260307 5.01139 0.123692 5.48154 0.0603077C5.93139 3.35276e-08 6.50124 0 7.19847 0Z" fill="#121212" />
                  <path fillRule="evenodd" clipRule="evenodd" d="M3.84564 5.23126C3.56002 5.23126 3.2861 5.34473 3.08414 5.54669C2.88218 5.74865 2.76872 6.02257 2.76872 6.30819C2.76872 6.5938 2.88218 6.86772 3.08414 7.06969C3.2861 7.27165 3.56002 7.38511 3.84564 7.38511C4.13126 7.38511 4.40518 7.27165 4.60714 7.06969C4.8091 6.86772 4.92256 6.5938 4.92256 6.30819C4.92256 6.02257 4.8091 5.74865 4.60714 5.54669C4.40518 5.34473 4.13126 5.23126 3.84564 5.23126ZM1.84564 6.30819C1.84564 5.77775 2.05636 5.26905 2.43143 4.89397C2.8065 4.5189 3.31521 4.30819 3.84564 4.30819C4.37607 4.30819 4.88478 4.5189 5.25985 4.89397C5.63492 5.26905 5.84564 5.77775 5.84564 6.30819C5.84564 6.83862 5.63492 7.34733 5.25985 7.7224C4.88478 8.09747 4.37607 8.30818 3.84564 8.30818C3.31521 8.30818 2.8065 8.09747 2.43143 7.7224C2.05636 7.34733 1.84564 6.83862 1.84564 6.30819ZM6.15333 2.92357C6.15333 2.80117 6.20196 2.68377 6.28851 2.59722C6.37507 2.51066 6.49246 2.46204 6.61487 2.46204H10.3072C10.4296 2.46204 10.547 2.51066 10.6335 2.59722C10.7201 2.68377 10.7687 2.80117 10.7687 2.92357C10.7687 3.04598 10.7201 3.16338 10.6335 3.24993C10.547 3.33649 10.4296 3.38511 10.3072 3.38511H6.61487C6.49246 3.38511 6.37507 3.33649 6.28851 3.24993C6.20196 3.16338 6.15333 3.04598 6.15333 2.92357ZM7.99948 5.38511C7.99948 5.2627 8.04811 5.14531 8.13466 5.05875C8.22122 4.9722 8.33861 4.92357 8.46102 4.92357H10.3072C10.4296 4.92357 10.547 4.9722 10.6335 5.05875C10.7201 5.14531 10.7687 5.2627 10.7687 5.38511C10.7687 5.50752 10.7201 5.62491 10.6335 5.71147C10.547 5.79802 10.4296 5.84665 10.3072 5.84665H8.46102C8.33861 5.84665 8.22122 5.79802 8.13466 5.71147C8.04811 5.62491 7.99948 5.50752 7.99948 5.38511Z" fill="#121212" />
                </svg>

                <span className="text-[#121212] font-inter text-xs sm:text-sm font-medium">{review.teacher_name}</span>
              </div>
              <span className="w-[3px] h-[3px] rounded-full bg-[#676767]" />
            </>
          )}
          <div className="flex items-center gap-1 sm:gap-1.5">
            <CalendarIcon />
            <span className="text-[#121212] font-inter text-xs sm:text-sm font-normal leading-5">{formatDate(review.created_at)}</span>
          </div>
        </div>
        <span className={`px-2 sm:px-2.5 py-1 w-fit h-fit rounded-md font-inter text-xs capitalize font-semibold leading-[15px] flex-shrink-0 ${getSentimentBadgeStyle(review.AI_sentiment)}`}>
          {review.AI_sentiment}
        </span>
      </div>

      {/* Review body */}
      <p className="text-black font-inter text-sm sm:text-base font-normal leading-6 sm:leading-7 opacity-70">{review.feedback}</p>

      {/* Tags */}
      <div className="flex items-center gap-2 sm:gap-3 flex-wrap w-full">
        {review.tags.map((tag) => (
          <span key={tag} className="px-2 sm:px-2.5 py-1.5 sm:py-2 rounded-md border border-[#EAEAEA] bg-[#F2F2F2] text-[#9A9A9A] font-inter text-xs sm:text-sm font-medium leading-[15px]">
            {tag}
          </span>
        ))}
      </div>

      {/* Final Thoughts section */}
      <div className="rounded-xl border border-[rgba(178,178,178,0.40)] bg-[#F8FAFF] overflow-hidden">
        {/* Header */}
        <div className="min-h-[42px] flex items-center gap-2 px-4 sm:px-6 py-3 sm:py-2.5 bg-[#EFF6FF] border-b border-[rgba(178,178,178,0.40)] rounded-t-xl">
          <ChatIcon />
          <span className="text-[#0171F9] font-inter text-xs sm:text-sm font-medium leading-[15px]">FINAL THOUGHTS</span>
        </div>

        {/* Divider between questions */}
        <div className="flex flex-col">

          <div className="px-4 sm:px-6 py-3 sm:py-4 flex flex-col gap-2 sm:gap-3">
            {/* Question + Answer badge */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                <SchoolIcon />
                <span className="text-[#0F1724] font-[Outfit] text-sm sm:text-base font-medium leading-5">Would you return to this school?</span>
              </div>
              <span className={`px-3 w-fit h-fit sm:px-[18px] py-1 rounded-full font-inter text-xs font-semibold leading-[15px] flex-shrink-0 ${getReturnAnswerStyle(review.return_to_school == 1 ? "Yes" : review.return_to_school == 2 ? "No" : "Maybe")}`}>
                {review.return_to_school == 1 ? "Yes" : review.return_to_school == 2 ? "No" : "Maybe"}
              </span>
            </div>
            {/* Quote */}
            <div className="flex gap-2 sm:gap-2.5 pl-4 sm:pl-5 items-center">
              <div className="min-h-[30px] w-[3px] self-stretch bg-[#22C55E] flex-shrink-0 rounded-full" />
              <p className="text-[#464555] font-inter text-sm sm:text-[15px] italic font-normal leading-5">{review.school_comment || "No Comment"}</p>
            </div>
          </div>
          <div className="h-px opacity-40 bg-[#B2B2B2] mx-0" />
          <div className="px-4 sm:px-6 py-3 sm:py-4 flex flex-col gap-2 sm:gap-3">
            {/* Question + Answer badge */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                <UserIcon />
                <span className="text-[#0F1724] font-[Outfit] text-sm sm:text-base font-medium leading-5">Would you return for this teacher or class?</span>
              </div>
              <span className={`px-3 w-fit h-fit sm:px-[18px] py-1 rounded-full font-inter text-xs font-semibold leading-[15px] flex-shrink-0 ${getReturnAnswerStyle(review.return_to_teacher == 1 ? "Yes" : review.return_to_teacher == 2 ? "No" : "Maybe")}`}>
                {review.return_to_teacher == 1 ? "Yes" : review.return_to_teacher == 2 ? "No" : "Maybe"}
              </span>
            </div>
            {/* Quote */}
            <div className="flex gap-2 sm:gap-2.5 pl-4 sm:pl-5 items-center">
              <div className="min-h-[30px] w-[3px] self-stretch bg-[#22C55E] flex-shrink-0 rounded-full" />
              <p className="text-[#464555] font-inter text-sm sm:text-[15px] italic font-normal leading-5">{review.
                teacher_comment
                || "No Comment"}</p>
            </div>
          </div>

        </div>
      </div>

      {/* Show rating details */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="flex items-center gap-1 text-[#0171F9] font-inter text-xs sm:text-sm font-medium leading-[15px] hover:opacity-80 transition-opacity cursor-pointer"
      >
        <span>{showDetails ? 'Hide rating details' : 'Show rating details'}</span>
        <span className={`transition-transform ${showDetails ? "rotate-180" : ""}`}>
          <ChevronDownIcon />
        </span>
      </button>


      {/* Rating Details — smooth CSS grid collapse */}
      <div
        className="grid transition-[grid-template-rows] duration-300 ease-in-out w-full sm:w-[60%] lg:w-[30%]"
        style={{ gridTemplateRows: showDetails ? '1fr' : '0fr' }}
      >
        <div className="overflow-hidden">
          <div className="space-y-2.5 sm:space-y-3 lg:space-y-3.5 pb-1">
            {[
              { label: "Classroom Behavior", score: review.classroom_behavior },
              { label: "Lesson Preparedness", score: review.lesson_preparedness },
              { label: "Staff Friendliness", score: review.staff_friendliness },
              { label: "School Cleanliness", score: review.school_cleanliness },
              { label: "Support Level", score: review.support_level },
            ].map(({ label, score }) => (
              <div
                key={label}
                className="flex flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 lg:gap-4"
              >
                <span className="text-sm sm:text-base font-normal text-[#6B7280] font-outfit flex-1">
                  {label}
                </span>

                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div className="flex items-center gap-0.5 min-w-[70px] sm:min-w-[88px]">
                    {Array.from({ length: 5 }).map((_, index) => {
                      const i = index + 1;
                      const full = i <= Math.floor(score);
                      const half =
                        i === Math.floor(score) + 1 && score % 1 >= 0.5;

                      const starPath =
                        "M9.60071 6.0918L9.72668 6.38574L10.045 6.41309L14.1515 6.76367L11.0509 9.41797L10.8038 9.62988L10.8781 9.94531L11.8038 13.8984L8.27258 11.7969L8.00012 11.6348L7.72766 11.7969L4.19446 13.8994L5.12219 9.94531L5.19641 9.62988L4.94934 9.41797L1.84778 6.76367L5.9552 6.41309L6.27356 6.38574L6.39954 6.0918L8.00012 2.35449L9.60071 6.0918Z";

                      return (
                        <svg
                          key={i}
                          width="14"
                          height="14"
                          viewBox="0 0 16 16"
                          fill="none"
                          className="sm:w-4 sm:h-4"
                        >
                          <defs>
                            <clipPath id={`half-${label}-${i}`}>
                              <rect x="0" y="0" width="8" height="16" />
                            </clipPath>
                          </defs>

                          {/* Full Star */}
                          {full && (
                            <path
                              d={starPath}
                              fill="#0171F9"
                              stroke="#0171F9"
                              strokeWidth="1.06667"
                            />
                          )}

                          {/* Half Star */}
                          {half && (
                            <>
                              <path
                                d={starPath}
                                fill="none"
                                stroke="#0171F9"
                                strokeWidth="1.06667"
                              />
                              <path
                                d={starPath}
                                fill="#0171F9"
                                stroke="#0171F9"
                                strokeWidth="1.06667"
                                clipPath={`url(#half-${label}-${i})`}
                              />
                            </>
                          )}

                          {/* Empty Star */}
                          {!full && !half && (
                            <path
                              d={starPath}
                              fill="none"
                              stroke="#0171F9"
                              strokeWidth="1.06667"
                            />
                          )}
                        </svg>
                      );
                    })}
                  </div>

                  <span className="text-xs sm:text-sm font-normal text-black font-outfit w-8 sm:w-10 text-right">
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


export default function SchoolDetailPage() {
  const params = useParams();
  const schoolId = params?.id as string;

  const [schoolData, setSchoolData] = useState<SchoolData | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>("All");
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(0);
  const [loadingReports, setLoadingReports] = useState<boolean>(false);
  const itemsPerPage = 10;


  useEffect(() => {

    const fetchReports = async () => {
      try {

        setLoadingReports(true);

        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: itemsPerPage.toString(),
          status: activeFilter,
        });
        const response = await fetch(`/api/view-school/${schoolId}/reports?${params}`);
        if (!response.ok) {
          throw new Error("Failed to fetch school data");
        }
        const data: ApiResponse = await response.json();

        if (data?.success) {
          setReviews(data.reports || []);
          setTotalPages(data?.pagination?.totalPages);
        } else {
          setError("Reports not found");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        setLoadingReports(false);
        toast.error(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoadingReports(false);
      }
    };

    if (currentPage > 0) fetchReports();

  }, [activeFilter, currentPage])

  useEffect(() => {
    if (!schoolId) return;

    const fetchSchoolData = async () => {
      try {

        setLoading(true);

        const response = await fetch(`/api/view-school/${schoolId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch school data");
        }
        const data: ApiResponse = await response.json();

        if (data?.success) {
          setSchoolData(data.school);
        } else {
          setError("School not found");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        setLoading(false);
        toast.error(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
        setCurrentPage(1)
      }
    };

    fetchSchoolData();
  }, [schoolId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFE] flex flex-col">
        <Header />
        <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-14 py-6 sm:py-10 pb-12 sm:pb-[80px]">
          {/* School Info Skeleton */}
          <div className="bg-white rounded-xl shadow-[0_4px_6px_-1px_rgba(0,0,0,0.10)] p-4 sm:p-6 lg:p-10 mb-6 sm:mb-10">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 sm:gap-6">
              <div className="flex flex-col gap-2 sm:gap-3 flex-1">
                <div className="h-8 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-shimmer w-64"></div>
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-shimmer w-48"></div>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="h-12 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-shimmer w-20"></div>
                <div className="flex flex-col gap-2">
                  <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-shimmer w-32"></div>
                  <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-shimmer w-24"></div>
                </div>
              </div>
            </div>

            <div className="h-px bg-black opacity-10 mt-6 sm:mt-8 lg:mt-10 mb-3 sm:mb-4" />

            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 flex-wrap">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex flex-col gap-1">
                  <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-shimmer w-24"></div>
                  <div className="h-5 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-shimmer w-32"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Reports Section Skeleton */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="h-8 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-shimmer w-40"></div>
              <div className="flex items-center gap-2 flex-wrap">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-10 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-lg animate-shimmer w-24"></div>
                ))}
              </div>
            </div>

            {reportSkeleton()}
          </div>
        </main>
        <Footer />

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
      </div>
    );
  }

  if (error || !schoolData) {
    return (
      <div className="min-h-screen bg-[#F8FAFE] flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-600 font-inter text-lg">{error || "School not found"}</div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-[#F8FAFE] flex flex-col">
      <Header />

      <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-14 py-6 sm:py-10 pb-12 sm:pb-[80px]">

        {/* School Info Card */}
        <div className="bg-white rounded-xl shadow-[0_4px_6px_-1px_rgba(0,0,0,0.10)] p-4 sm:p-6 lg:p-10 mb-6 sm:mb-10">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 sm:gap-6">
            {/* Left: name, location, grade */}
            <div className="flex flex-col gap-2 sm:gap-3">
              <h1 className="text-[#121212] font-inter font-bold text-2xl sm:text-3xl leading-tight">
                {schoolData.school_name}
              </h1>
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                <div className="flex gap-[7px] items-center">
                <LocationIcon />
                <p className="text-[#414141] text-sm font-normal leading-[20px] break-words"> {[schoolData.city, schoolData.state].filter(Boolean).join(", ")}</p>
                </div>
                {schoolData?.grade_level && schoolData.grade_level?.map((level: string, i: number) => (
                  <span key={i} className="inline-flex items-center px-2 sm:px-2.5 py-1 sm:py-1.5 rounded text-xs sm:text-sm bg-[#DFEEFF] text-[#0171F9] font-inter font-semibold leading-[15px]">
                    {level}
                  </span>
                ))}
              </div>
            </div>

            {/* Right: rating */}
            <div className="flex items-start gap-2 sm:gap-4 lg:flex-shrink-0 ">
              <span className="text-[#191C1D] font-[Outfit] font-bold text-3xl sm:text-4xl lg:text-5xl sm:mt-0 mt-[-7px] leading-10">{schoolData.avg_rating?.toFixed(1)}</span>
              <div className="flex flex-col items-end gap-1 sm:gap-1.5 pb-1">
                <StarRating rating={schoolData.avg_rating} size="lg" />
                <span className="text-[#9CA3AF] font-inter text-sm font-normal">{schoolData.total_reports} reviews</span>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-black opacity-10 mt-6 sm:mt-8 lg:mt-10 mb-3 sm:mb-4" />

          {/* Stats */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 lg:gap-7 flex-wrap">
            <div className="flex flex-col gap-1 sm:gap-2">
              <span className="text-[#AFAFB2] font-[Outfit] text-sm sm:text-base font-medium leading-6 sm:leading-7">Total Reports</span>
              <div className="flex items-center gap-1 sm:gap-1.5">
                <FileIcon />
                <span className="text-[#191C1D] font-[Outfit] text-lg sm:text-xl font-semibold">{schoolData.total_reports}</span>
              </div>
            </div>

            <div className="hidden sm:block w-px h-[46px] opacity-10 bg-black" />

            <div className="flex flex-col gap-1 sm:gap-2">
              <span className="text-[#AFAFB2] font-[Outfit] text-sm sm:text-base font-medium leading-6 sm:leading-7">Would Return to School</span>
              <div className="flex items-center gap-3 sm:gap-4 lg:gap-5 flex-wrap">
                <div className="flex items-center gap-1 sm:gap-1.5">
                  <span className="text-[#10B981] font-[Outfit] text-lg sm:text-xl font-semibold">{schoolData.return_to_school_yes_percentage}%</span>
                  <span className="text-[#10B981] font-[Outfit] text-lg sm:text-xl font-semibold">Yes</span>
                </div>
                <div className="flex items-center gap-1 sm:gap-1.5">
                  <span className="text-[#E8A411] font-[Outfit] text-lg sm:text-xl font-semibold">{schoolData.return_to_school_maybe_percentage}%</span>
                  <span className="text-[#E8A411] font-[Outfit] text-lg sm:text-xl font-semibold">Maybe</span>
                </div>
                <div className="flex items-center gap-1 sm:gap-1.5">
                  <span className="text-[#E02C2C] font-[Outfit] text-lg sm:text-xl font-semibold">{schoolData.return_to_school_no_percentage}%</span>
                  <span className="text-[#E02C2C] font-[Outfit] text-lg sm:text-xl font-semibold">No</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reports Section */}
        <div>
          {/* Section header + filter tabs */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
            <h2 className="text-[#121212] font-[Outfit] text-2xl sm:text-3xl font-semibold leading-none">Recent Report</h2>

            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              {[
                { label: "All", count: schoolData.total_reviews },
                { label: "Positive", count: schoolData.positive_reports },
                { label: "Neutral", count: schoolData.neutral_reports },
                { label: "Negative", count: schoolData.negative_reports },
              ].map(({ label, count }) => (
                <button
                  key={label}
                  onClick={() => setActiveFilter(label)}
                  className={`flex items-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-2 sm:py-3.5 rounded-lg font-inter text-xs sm:text-sm font-medium leading-none transition-colors cursor-pointer ${activeFilter === label
                    ? "bg-[#0B77F9] text-white font-bold"
                    : "bg-white border border-[rgba(178,178,178,0.20)] text-[#121212]"
                    }`}
                >
                  {label} ({count})
                </button>
              ))}
            </div>
          </div>

          {/* Review cards */}
          <div className="flex flex-col gap-4 sm:gap-6 lg:gap-8">
            {!loadingReports ?
              <>
                {reviews?.length > 0 ?
                  <>{reviews?.map((review, idx) => (
                    <ReviewCard key={idx} review={review} />
                  ))
                  }
                    {reviews?.length > 0 &&
                      <div className="flex items-center justify-center gap-1 sm:gap-2 mt-6 sm:mt-8 flex-wrap">
                        <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                          disabled={currentPage === 1} className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-md border border-[rgba(0,0,0,0.08)] bg-white hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ">
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
                              className={`w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-md font-inter text-xs sm:text-sm font-medium transition-colors cursor-pointer ${page === 1
                                ? "bg-[#0171F9] border border-[#0171F9] text-white"
                                : "border border-[rgba(0,0,0,0.08)] bg-white text-[#0171F9] hover:bg-gray-50"
                                }`}
                            >
                              {page}
                            </button>
                          ));
                        })()}


                        <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                          disabled={currentPage === totalPages} className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-md border border-[rgba(0,0,0,0.08)] bg-white hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
                          <ChevronRightIcon />
                        </button>
                      </div>}</>
                  :

                  <div className="w-full bg-white border border-[#E5E7EB] rounded-2xl p-8 sm:p-12 flex flex-col items-center justify-center text-center">

                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#F3F8FF] flex items-center justify-center mb-4">
                      <svg
                        width="28"
                        height="28"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#0B77F9"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M21 15V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9" />
                        <path d="M7 10h10" />
                        <path d="M7 14h6" />
                        <path d="M3 19h18" />
                      </svg>
                    </div>

                    <h3 className="text-[#121212] text-lg sm:text-xl font-semibold mb-2">
                      No Reports Found
                    </h3>

                    <p className="text-[#6B7280] text-sm sm:text-base max-w-md leading-relaxed">
                      There are currently no reports available for this filter.
                      Try selecting a different category or check back later.
                    </p>
                  </div>
                }
              </> :
              reportSkeleton()
            }
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
