'use client';

import RiskChart from "@/app/components/chart";
import ViewReport from "@/app/components/ViewReport";
import { colors, formatDate, getSentiment, getTeacherColor } from "@/lib/function";
import { RatingBar, ScoreCircle, StarRating } from "@/lib/icons";
import { DashboardStats, ObjectType, Report } from "@/lib/types";
import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const EyeIcon = () => (
  <svg width="16" height="11" viewBox="0 0 16 11" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15.4392 4.94562C15.4161 4.895 14.8686 3.67937 13.6592 2.47C12.0411 0.854375 10.0017 0 7.75171 0C5.50171 0 3.46234 0.854375 1.84609 2.47C0.63671 3.67937 0.0892102 4.895 0.0642102 4.94562C0.0218684 5.04162 0 5.14539 0 5.25031C0 5.35523 0.0218684 5.459 0.0642102 5.555C0.0873352 5.60625 0.634835 6.82125 1.84484 8.03063C3.46234 9.64625 5.50171 10.5 7.75171 10.5C10.0017 10.5 12.0411 9.64625 13.6567 8.03063C14.8667 6.82125 15.4142 5.60625 15.4373 5.555C15.48 5.45913 15.5022 5.35543 15.5025 5.25051C15.5028 5.14559 15.4813 5.04175 15.4392 4.94562ZM12.5605 7.00813C11.2186 8.32938 9.60109 9 7.75171 9C5.90234 9 4.28484 8.32937 2.94484 7.0075C2.41757 6.48575 1.96401 5.89445 1.59671 5.25C1.96412 4.60581 2.41768 4.01474 2.94484 3.49312C4.28546 2.17062 5.90234 1.5 7.75171 1.5C9.60109 1.5 11.218 2.17062 12.5586 3.49312C13.0858 4.01469 13.5394 4.60577 13.9067 5.25C13.5393 5.89441 13.0858 6.48569 12.5586 7.0075L12.5605 7.00813ZM7.75171 2.5C7.20781 2.5 6.67613 2.66128 6.22389 2.96346C5.77166 3.26563 5.41918 3.69512 5.21104 4.19762C5.0029 4.70012 4.94844 5.25305 5.05455 5.7865C5.16066 6.31995 5.42257 6.80995 5.80717 7.19454C6.19176 7.57914 6.68176 7.84105 7.21521 7.94716C7.74866 8.05327 8.30159 7.99881 8.80409 7.79067C9.30659 7.58253 9.73608 7.23005 10.0383 6.77782C10.3404 6.32558 10.5017 5.7939 10.5017 5.25C10.5009 4.52091 10.2109 3.82192 9.69534 3.30637C9.17979 2.79082 8.4808 2.50083 7.75171 2.5ZM7.75171 6.5C7.50448 6.5 7.26281 6.42669 7.05725 6.28934C6.85169 6.15199 6.69147 5.95676 6.59686 5.72835C6.50225 5.49995 6.4775 5.24861 6.52573 5.00614C6.57396 4.76366 6.69301 4.54093 6.86783 4.36612C7.04264 4.1913 7.26537 4.07225 7.50785 4.02402C7.75032 3.97579 8.00166 4.00054 8.23006 4.09515C8.45847 4.18976 8.6537 4.34998 8.79105 4.55554C8.9284 4.7611 9.00171 5.00277 9.00171 5.25C9.00171 5.58152 8.87001 5.89946 8.63559 6.13388C8.40117 6.3683 8.08323 6.5 7.75171 6.5Z" fill="white" />
  </svg>
);

const CheckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7.95881 12.625L15.0213 5.5625C15.188 5.39583 15.3824 5.3125 15.6046 5.3125C15.8269 5.3125 16.0213 5.39583 16.188 5.5625C16.3546 5.72917 16.438 5.92722 16.438 6.15667C16.438 6.38611 16.3546 6.58389 16.188 6.75L8.54214 14.4167C8.37548 14.5833 8.18103 14.6667 7.95881 14.6667C7.73659 14.6667 7.54214 14.5833 7.37548 14.4167L3.79214 10.8333C3.62548 10.6667 3.54548 10.4689 3.55214 10.24C3.55881 10.0111 3.64575 9.81306 3.81298 9.64583C3.9802 9.47861 4.17825 9.39528 4.40714 9.39583C4.63603 9.39639 4.83381 9.47972 5.00048 9.64583L7.95881 12.625Z" fill="#086047" />
  </svg>
);

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9.99967 11.1668L5.91634 15.2502C5.76356 15.4029 5.56912 15.4793 5.33301 15.4793C5.0969 15.4793 4.90245 15.4029 4.74967 15.2502C4.5969 15.0974 4.52051 14.9029 4.52051 14.6668C4.52051 14.4307 4.5969 14.2363 4.74967 14.0835L8.83301 10.0002L4.74967 5.91683C4.5969 5.76405 4.52051 5.56961 4.52051 5.3335C4.52051 5.09738 4.5969 4.90294 4.74967 4.75016C4.90245 4.59738 5.0969 4.521 5.33301 4.521C5.56912 4.521 5.76356 4.59738 5.91634 4.75016L9.99967 8.8335L14.083 4.75016C14.2358 4.59738 14.4302 4.521 14.6663 4.521C14.9025 4.521 15.0969 4.59738 15.2497 4.75016C15.4025 4.90294 15.4788 5.09738 15.4788 5.3335C15.4788 5.56961 15.4025 5.76405 15.2497 5.91683L11.1663 10.0002L15.2497 14.0835C15.4025 14.2363 15.4788 14.4307 15.4788 14.6668C15.4788 14.9029 15.4025 15.0974 15.2497 15.2502C15.0969 15.4029 14.9025 15.4793 14.6663 15.4793C14.4302 15.4793 14.2358 15.4029 14.083 15.2502L9.99967 11.1668Z" fill="#991B1B" />
  </svg>
);

const TrendUpGreenIcon = ({ label }: { label: string }) => (
  <div className="flex items-center gap-1.5 px-1.5 py-0.5 rounded-[5px] bg-[#CDFFEE]">

    <svg width="16" height="9" viewBox="0 0 16 9" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M15.5 5V0.5H11" stroke="#10B981" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15.5 0.5L10.2073 5.79267C10.1145 5.88559 10.0042 5.95931 9.88283 6.0096C9.76146 6.0599 9.63138 6.08579 9.5 6.08579C9.36862 6.08579 9.23854 6.0599 9.11717 6.0096C8.9958 5.95931 8.88553 5.88559 8.79267 5.79267L6.70733 3.70733C6.61447 3.61441 6.5042 3.54069 6.38283 3.4904C6.26146 3.4401 6.13138 3.41421 6 3.41421C5.86862 3.41421 5.73854 3.4401 5.61717 3.4904C5.4958 3.54069 5.38553 3.61441 5.29267 3.70733L0.5 8.5" stroke="#10B981" strokeLinecap="round" strokeLinejoin="round" />
    </svg>

    <span className="font-inter text-sm font-medium text-[#10B981]">{label}</span>
  </div>
);

const TrendDownRedIcon = ({ label }: { label: string }) => (
  <div className="flex items-center gap-1.5 px-1.5 py-0.5 rounded-[5px] bg-[#FEE2E2]">
    <svg
      width="16"
      height="9"
      viewBox="0 0 16 9"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M15.5 4V8.5H11"
        stroke="#EF4444"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15.5 8.5L10.2073 3.20733C10.1145 3.11441 10.0042 3.04069 9.88283 2.9904C9.76146 2.9401 9.63138 2.91421 9.5 2.91421C9.36862 2.91421 9.23854 2.9401 9.11717 2.9904C8.9958 3.04069 8.88553 3.11441 8.79267 3.20733L6.70733 5.29267C6.61447 5.38559 6.5042 5.45931 6.38283 5.5096C6.26146 5.5599 6.13138 5.58579 6 5.58579C5.86862 5.58579 5.73854 5.5599 5.61717 5.5096C5.4958 5.45931 5.38553 5.38559 5.29267 5.29267L0.5 0.5"
        stroke="#EF4444"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>

    <span className="font-inter text-sm font-medium text-[#EF4444]">
      {label}
    </span>
  </div>
);


export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalReports: 0,
    positiveReports: 0,
    neutralReports: 0,
    totalReportsCurrentMonth: 0,
    totalReportsLastMonth: 0,
    reportsThisWeek: 0,
    reportsLastWeek: 0,
    negativeReportsCurrentMonth: 0,
    negativeReportsLastMonth: 0,
    negativeReports: 0,
    schoolChange: 0,
    totalSchools: 0,
    negativeByClassroomBehavior: 0,
    negativeByLessonPreparedness: 0,
    negativeByStaffFriendliness: 0,
    negativeBySchoolCleanliness: 0,
    negativeBySupportLevel: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [reportLoading, setReportLoading] = useState<boolean>(true);
  const [recentReports, setRecentReports] = useState<Array<ObjectType>>([])
  const [highRiskTeachers, setHighRiskTeachers] = useState<Array<any>>([])
  const [highRiskLoading, setHighRiskLoading] = useState<boolean>(true);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);


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
      setRecentReports(
        recentReports.map((r) =>
          r.id === reportId ? { ...r, status: 2 } : r
        )
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
      setRecentReports(
        recentReports.map((r) =>
          r.id === reportId ? { ...r, status: 3 } : r
        )
      );
    } catch (err) {
      console.error("Error rejecting report:", err);
    } finally {
      toast.error("Report request Rejected!");
      setLoadingAction(null);
      setSelectedReport(null);
    }
  };

  const fetchReports = async () => {
    setReportLoading(true);
    try {
      const params = new URLSearchParams({
        page: "1",
        limit: "3"
      });

      const response = await fetch(`/api/reports?${params}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch reports: ${response.statusText}`);
      }

      const reports = await response.json();
      setRecentReports(reports.data);
    } catch (err) {
      console.error("Error fetching reports:", err);

    } finally {
      if (reportLoading) setReportLoading(false);
    }
  };

  const fetchHighRiskTeachers = async () => {
    setHighRiskLoading(true);
    try {
      const params = new URLSearchParams({
        page: "1",
        limit: "2",
      });
      const response = await fetch(`/api/admin/high-risk-teachers?${params}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch high-risk teachers: ${response.statusText}`);
      }

      const teachers = await response.json();
      setHighRiskTeachers(teachers?.data);
    } catch (err) {
      console.error("Error fetching high-risk teachers:", err);
    } finally {
      setHighRiskLoading(false);
    }
  };

  useEffect(() => { console.log("recentReports", highRiskTeachers) }, [highRiskTeachers])

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/admin/dashboard-stats');
        if (response.ok) {
          const data = await response.json();
          setStats(data);

        }
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    fetchReports();
    fetchHighRiskTeachers();
  }, []);

  const calculateDifference = (current: number, previous: number) => {
    return current - previous;
  };

  const calculatePercentage = (totalReports: number, count: number) => {
    return totalReports > 0
      ? Math.round((count / totalReports) * 100)
      : 0;
  }

  const monthChange = calculateDifference(stats.totalReportsCurrentMonth, stats.totalReportsLastMonth);
  const weekChange = calculateDifference(stats.reportsThisWeek, stats.reportsLastWeek);
  const negativeMonthChange = calculateDifference(stats.negativeReportsCurrentMonth, stats.negativeReportsLastMonth);


  return (
    <main className="flex-1 overflow-y-auto p-6 lg:p-8">

      {/* Page title */}
      <div className="mb-6">
        <h1 className="font-outfit font-semibold text-2xl sm:text-3xl text-[#121212] leading-5">Dashboard</h1>
        <p className="font-outfit font-normal text-base sm:text-[18px] text-[#414141] mt-2">System Overview</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">

        {/* Total Reports All Time */}
        <div className="bg-white rounded-lg p-4 sm:p-5 flex flex-col gap-[10px] h-full justify-between">
          <div className="flex items-start justify-between flex-row sm:items-start gap-3 sm:gap-0">
            <div className="flex flex-col gap-2">
              <span className="font-inter font-medium text-xs sm:text-sm text-[#434654] uppercase">Total Reports</span>
              <span className="font-outfit font-bold text-2xl sm:text-3xl text-[#191C1D]">{loading ? '-' : stats.totalReports}</span>
            </div>
            <div className="w-11 h-11 rounded-md bg-[#DDEBFF] flex items-center justify-center flex-shrink-0">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 22C4.89617 22 4 21.1038 4 20V4C4 2.89617 4.89617 2 6 2H14C14.6394 1.99897 15.2527 2.25309 15.704 2.706L19.292 6.294C19.7461 6.74545 20.001 7.35966 20 8V20C20 21.1038 19.1038 22 18 22H6" stroke="#0171F9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M14 2V7C14 7.55192 14.4481 8 15 8H20M10 9H8M16 13H8M16 17H8" stroke="#0171F9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
          {!loading && <div className="flex items-center gap-1.5">
            {Number(monthChange) > 0 ? (
              <TrendUpGreenIcon label={`+${monthChange}`} />
            ) : Number(monthChange) < 0 ? (
              <TrendDownRedIcon label={`${monthChange}`} />
            ) : (
              <span className="text-sm text-gray-500">No difference</span>
            )}
            <span className="font-inter font-normal text-sm text-[#121212] opacity-64">from last month</span>
          </div>}
        </div>


        {/* Reports This Week */}
        <div className="bg-white rounded-lg p-4 sm:p-5 flex flex-col gap-[10px] h-full justify-between">
          <div className="flex items-start justify-between flex-row sm:items-start gap-3 sm:gap-0">
            <div className="flex flex-col gap-2">
              <span className="font-inter font-medium text-xs sm:text-sm text-[#434654] uppercase">Reports This Week</span>
              <span className="font-outfit font-bold text-2xl sm:text-3xl text-[#191C1D]">{loading ? '-' : stats.reportsThisWeek}</span>
            </div>
            <div className="w-11 h-11 rounded-md bg-[#EAFFF1] flex items-center justify-center flex-shrink-0">

              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M17 16V18C17 18.1394 17.0388 18.276 17.1121 18.3945C17.1854 18.513 17.2903 18.6088 17.415 18.671L18.415 19.171C18.593 19.26 18.799 19.2746 18.9877 19.2117C19.1765 19.1488 19.3325 19.0135 19.4215 18.8355C19.5105 18.6575 19.5251 18.4515 19.4622 18.2628C19.3993 18.074 19.264 17.918 19.086 17.829L18.5 17.536V16C18.5 15.8011 18.421 15.6103 18.2803 15.4697C18.1397 15.329 17.9489 15.25 17.75 15.25C17.5511 15.25 17.3603 15.329 17.2197 15.4697C17.079 15.6103 17 15.8011 17 16Z" fill="#33C466" />
                <path fillRule="evenodd" clipRule="evenodd" d="M22.5 18C22.5 15.378 20.372 13.25 17.75 13.25C15.128 13.25 13 15.378 13 18C13 20.622 15.128 22.75 17.75 22.75C20.372 22.75 22.5 20.622 22.5 18ZM21 18C20.979 18.848 20.6273 19.6542 20.0201 20.2465C19.4129 20.8388 18.5983 21.1704 17.75 21.1704C16.9017 21.1704 16.0871 20.8388 15.4799 20.2465C14.8727 19.6542 14.521 18.848 14.5 18C14.521 17.152 14.8727 16.3458 15.4799 15.7535C16.0871 15.1612 16.9017 14.8296 17.75 14.8296C18.5983 14.8296 19.4129 15.1612 20.0201 15.7535C20.6273 16.3458 20.979 17.152 21 18Z" fill="#33C466" />
                <path fillRule="evenodd" clipRule="evenodd" d="M12.75 21.25H4.25C3.91864 21.2495 3.60101 21.1176 3.3667 20.8833C3.13239 20.649 3.00053 20.3314 3 20V4C3.00053 3.66864 3.13239 3.35101 3.3667 3.1167C3.60101 2.88239 3.91864 2.75053 4.25 2.75H11.363C11.4255 2.74979 11.4858 2.77298 11.532 2.815L16.418 7.257C16.4437 7.2805 16.4643 7.30907 16.4784 7.34091C16.4925 7.37275 16.4999 7.40717 16.5 7.442V12C16.5 12.1989 16.579 12.3897 16.7197 12.5303C16.8603 12.671 17.0511 12.75 17.25 12.75C17.4489 12.75 17.6397 12.671 17.7803 12.5303C17.921 12.3897 18 12.1989 18 12V7.442C18 7.19813 17.949 6.95696 17.8503 6.73395C17.7517 6.51094 17.6075 6.31102 17.427 6.147L12.541 1.705C12.2185 1.41217 11.7986 1.24996 11.363 1.25H4.25C3.521 1.25 2.821 1.54 2.305 2.055C1.7898 2.57122 1.50031 3.27067 1.5 4V20C1.5 20.729 1.79 21.429 2.305 21.945C2.82122 22.4602 3.52067 22.7497 4.25 22.75H12.75C12.9489 22.75 13.1397 22.671 13.2803 22.5303C13.421 22.3897 13.5 22.1989 13.5 22C13.5 21.8011 13.421 21.6103 13.2803 21.4697C13.1397 21.329 12.9489 21.25 12.75 21.25Z" fill="#33C466" />
                <path fillRule="evenodd" clipRule="evenodd" d="M12.5 6.25V2.5C12.5 2.30109 12.421 2.11032 12.2803 1.96967C12.1397 1.82902 11.9489 1.75 11.75 1.75C11.5511 1.75 11.3603 1.82902 11.2197 1.96967C11.079 2.11032 11 2.30109 11 2.5V6.5C11.0005 6.83136 11.1324 7.14899 11.3667 7.3833C11.601 7.61761 11.9186 7.74947 12.25 7.75H16.75C16.9489 7.75 17.1397 7.67098 17.2803 7.53033C17.421 7.38968 17.5 7.19891 17.5 7C17.5 6.80109 17.421 6.61032 17.2803 6.46967C17.1397 6.32902 16.9489 6.25 16.75 6.25H12.5ZM5.75 9.75H9.25C9.44891 9.75 9.63968 9.67098 9.78033 9.53033C9.92098 9.38968 10 9.19891 10 9C10 8.80109 9.92098 8.61032 9.78033 8.46967C9.63968 8.32902 9.44891 8.25 9.25 8.25H5.75C5.55109 8.25 5.36032 8.32902 5.21967 8.46967C5.07902 8.61032 5 8.80109 5 9C5 9.19891 5.07902 9.38968 5.21967 9.53033C5.36032 9.67098 5.55109 9.75 5.75 9.75ZM5.75 13.25H12.25C12.4489 13.25 12.6397 13.171 12.7803 13.0303C12.921 12.8897 13 12.6989 13 12.5C13 12.3011 12.921 12.1103 12.7803 11.9697C12.6397 11.829 12.4489 11.75 12.25 11.75H5.75C5.55109 11.75 5.36032 11.829 5.21967 11.9697C5.07902 12.1103 5 12.3011 5 12.5C5 12.6989 5.07902 12.8897 5.21967 13.0303C5.36032 13.171 5.55109 13.25 5.75 13.25ZM5.75 16.75H9.75C9.94891 16.75 10.1397 16.671 10.2803 16.5303C10.421 16.3897 10.5 16.1989 10.5 16C10.5 15.8011 10.421 15.6103 10.2803 15.4697C10.1397 15.329 9.94891 15.25 9.75 15.25H5.75C5.55109 15.25 5.36032 15.329 5.21967 15.4697C5.07902 15.6103 5 15.8011 5 16C5 16.1989 5.07902 16.3897 5.21967 16.5303C5.36032 16.671 5.55109 16.75 5.75 16.75Z" fill="#33C466" />
              </svg>

            </div>
          </div>

          {!loading && <div className="flex items-center gap-1.5">
            {Number(weekChange) > 0 ? (
              <TrendUpGreenIcon label={`+${weekChange}`} />
            ) : Number(weekChange) < 0 ? (
              <TrendDownRedIcon label={`${weekChange}`} />
            ) : (
              <span className="text-sm text-gray-500">No difference</span>
            )}

            <span className="font-inter font-normal text-sm text-[#121212] opacity-64">{Number(weekChange) > 0 ? "more than" : Number(weekChange) < 0 ? "less than" : "from"} last week</span>
          </div>}
        </div>

        {/* Negative Reports */}
        <div className="bg-white rounded-lg p-4 sm:p-5 flex flex-col gap-[10px] h-full justify-between">
          <div className="flex items-start justify-between flex-row sm:items-start gap-3 sm:gap-0">
            <div className="flex flex-col gap-2">
              <span className="font-inter font-medium text-xs sm:text-sm text-[#434654] uppercase">Negative Reports</span>
              <span className="font-outfit font-bold text-2xl sm:text-3xl text-[#191C1D]">{loading ? '-' : stats.negativeReports}</span>
            </div>
            <div className="w-11 h-11 rounded-md bg-[#FFEFEF] flex items-center justify-center flex-shrink-0">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.2 17.6335L14.0016 3.39569C13.7967 3.04687 13.5042 2.75764 13.1532 2.55668C12.8021 2.35572 12.4046 2.25 12 2.25C11.5955 2.25 11.198 2.35572 10.8469 2.55668C10.4958 2.75764 10.2033 3.04687 9.99847 3.39569L1.80003 17.6335C1.60291 17.9709 1.49902 18.3546 1.49902 18.7454C1.49902 19.1361 1.60291 19.5199 1.80003 19.8572C2.00228 20.2082 2.29425 20.499 2.64599 20.6998C2.99773 20.9006 3.39658 21.0043 3.80159 21.0001H20.1985C20.6032 21.0039 21.0016 20.9001 21.353 20.6993C21.7044 20.4985 21.9961 20.2079 22.1982 19.8572C22.3956 19.52 22.4998 19.1364 22.5001 18.7456C22.5004 18.3549 22.3969 17.9711 22.2 17.6335Z" stroke="#EC4143" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M12 9V13.5M12 16.875V17.25" stroke="#EC4143" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>


          {!loading && <div className="flex items-center gap-1.5">
            {Number(negativeMonthChange) > 0 ? (
              <TrendUpGreenIcon label={`+${negativeMonthChange}`} />
            ) : Number(negativeMonthChange) < 0 ? (
              <TrendDownRedIcon label={`${negativeMonthChange}`} />
            ) : (
              <span className="text-sm text-gray-500">No difference</span>
            )}

            <span className="font-inter font-normal text-sm text-[#121212] opacity-64">from last month</span>
          </div>}

        </div>

        {/* Negative by Ratings */}
        <div className="bg-white rounded-lg p-4 sm:p-5 flex flex-col gap-[10px] h-full justify-between">
          <div className="flex items-start justify-between flex-row sm:items-start gap-3 sm:gap-0">
            <div className="flex flex-col gap-2">
              <span className="font-inter font-medium text-xs text-[#434654] uppercase">Active Schools</span>
              <span className="font-outfit font-bold text-xl sm:text-2xl text-[#191C1D]">{loading ? '-' : stats?.totalSchools}</span>
            </div>
            <div className="w-11 h-11 rounded-md bg-[#FFF9F0] flex items-center justify-center flex-shrink-0">
              <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9.75 11.9168H11.9167V14.0835H9.75V11.9168ZM9.75 7.5835H11.9167V9.75016H9.75V7.5835ZM14.0833 11.9168H16.25V14.0835H14.0833V11.9168ZM14.0833 7.5835H16.25V9.75016H14.0833V7.5835Z" fill="#F3AC4B" />
                <path d="M22.7498 9.75H19.4998V5.41667H20.5832V3.25H5.4165V5.41667H6.49984V9.75H3.24984C2.654 9.75 2.1665 10.2375 2.1665 10.8333V21.6667C2.1665 22.2625 2.654 22.75 3.24984 22.75H22.7498C23.3457 22.75 23.8332 22.2625 23.8332 21.6667V10.8333C23.8332 10.2375 23.3457 9.75 22.7498 9.75ZM4.33317 11.9167H6.49984V20.5833H4.33317V11.9167ZM10.8332 16.25V20.5833H8.6665V5.41667H17.3332V20.5833H15.1665V16.25H10.8332ZM21.6665 20.5833H19.4998V11.9167H21.6665V20.5833Z" fill="#F3AC4B" />
              </svg>
            </div>
          </div>

          {!loading && <div className="flex items-center gap-1.5">
            {Number(stats.schoolChange) > 0 ? (
              <TrendUpGreenIcon label={`+${stats.schoolChange}`} />
            ) : Number(stats.schoolChange) < 0 ? (
              <TrendDownRedIcon label={`${stats.schoolChange}`} />
            ) : (
              <span className="text-sm text-gray-500">No difference</span>
            )}
            <span className="font-inter font-normal text-sm text-[#121212] opacity-64">from last month</span>
          </div>}
        </div>
      </div>



      {/* Middle section: alerts + sentiment */}
      <div className="flex flex-col lg:flex-row gap-6 mb-6">

        {/* Recent High-Risk Alerts */}
        <div className="flex-1 min-w-0 bg-white rounded-xl p-4 sm:p-6 flex flex-col gap-6">
          <div className="flex flex-row items-center justify-between gap-4 sm:gap-0">
            <h2 className="font-outfit font-medium text-lg sm:text-2xl text-[#121212]">Recent High-Risk Alerts</h2>
            <Link href="/admin/high-risk-alerts" className="font-outfit font-normal text-[14px] sm:text-[16px] text-[#0171F9] whitespace-nowrap">View all</Link>
          </div>

          <div className="flex flex-col gap-3">
            {highRiskLoading && (
              <div className="flex items-center justify-center py-8">
                <span className="font-inter text-sm text-[#6B727F]">Loading high-risk alerts...</span>
              </div>
            )}
            {!highRiskLoading && highRiskTeachers.length === 0 && (
              <div className="flex items-center justify-center py-8">
                <span className="font-inter text-sm text-[#6B727F]">No high-risk teachers found.</span>
              </div>
            )}
            {!highRiskLoading && highRiskTeachers.map((teacher: any) => {
              const initials = teacher.name
                .split(' ')
                .map((n: string) => n[0])
                .join('')
                .toUpperCase();

              const color = getTeacherColor(teacher.name);

              return (
                <div key={teacher.id} className="flex items-start gap-6 p-4 rounded-xl border border-[#F0F0F0] shadow-[0_0_6px_-1px_rgba(0,0,0,0.05)]">
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
                            <span className="px-3 py-0.5 rounded-xl bg-[#EC4143] font-inter text-[11px] text-white tracking-[0.5px]">High Risk</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Link href={`/admin/schools/${teacher.school_id}`} className="font-inter text-sm text-[#0171f9]">{teacher.school_name}</Link>
                            <span className="font-inter text-sm text-[#6B727F]">•</span>
                            <span className="font-inter text-sm text-[#353941] ">Total {teacher.total_reports} {teacher.total_reports === 1 ? 'report' : 'reports'}</span>
                            <span className="font-inter text-sm text-[#6B727F]">•</span>
                            <span className="font-inter font-medium text-sm text-[#ec4143]">{(teacher.highRiskPercentage).toFixed(2)}% High Risk</span>
                          </div>
                        </div>
                        <p className="font-inter font-normal text-[13px] text-[#353941] leading-4">{teacher.ai_summary}</p>
                      </div>
                    </div>
                    {/* <button className="self-start flex items-center gap-1.5 px-4 py-1 rounded-lg bg-[#0171F9]">
                      <EyeIcon />
                      <span className="font-inter font-medium text-xs text-white leading-6">View</span>
                    </button> */}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sentiment Insights */}
        <div className="w-full lg:w-[300px] lg:flex-shrink-0 bg-white rounded-xl p-4 sm:p-6 flex flex-col gap-6">
          <h2 className="font-outfit font-semibold text-xl text-[#121212]">Sentiment Insights</h2>
          <div className="flex flex-col items-center gap-8">
            {/* Donut chart */}
            {!loading ? <RiskChart
              data={[
                {
                  label: "Positive",
                  Positive: calculatePercentage(
                    stats.totalReports,
                    stats.positiveReports
                  ),
                },
                {
                  label: "Negative",
                  Negative: calculatePercentage(
                    stats.totalReports,
                    stats.negativeReports
                  ),
                },
                {
                  label: "Neutral",
                  Neutral: calculatePercentage(
                    stats.totalReports,
                    stats.neutralReports
                  ),
                },
              ]}
            /> :  <div className="flex flex-col items-center justify-center gap-4 h-[100px]">
          <span className="font-inter text-sm text-[#6B727F]">Loading...</span>
        </div>}
            {/* Legend */}
            <div className="flex items-center gap-10">
              <div className="flex items-start gap-1.5">
                <div className="w-1 h-4.5 rounded bg-[#2FAF00] mt-1" />
                <div className="flex flex-col ">
                  <span className="font-inter font-normal text-sm text-[#424952]">Positive</span>
                  <span className="font-inter font-bold text-[17px] text-[#212B36]">{calculatePercentage(stats.totalReports, stats.positiveReports)}%</span>
                </div>
              </div>
              <div className="flex items-start gap-1.5">
                <div className="w-1 h-4.5 rounded bg-[#FFA600] mt-1" />
                <div className="flex flex-col ">
                  <span className="font-inter font-normal text-sm text-[#424952]">Neutral</span>
                  <span className="font-inter font-bold text-[17px] text-[#212B36]">{calculatePercentage(stats.totalReports, stats.neutralReports)}%</span>
                </div>
              </div>
              <div className="flex items-start gap-1.5">
                <div className="w-1 h-4.5 rounded bg-[#F32121] mt-1" />
                <div className="flex flex-col ">
                  <span className="font-inter font-normal text-sm text-[#424952]">Negative</span>
                  <span className="font-inter font-bold text-[17px] text-[#212B36]">{calculatePercentage(stats.totalReports, stats.negativeReports)}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Reports table */}
      <div className="bg-white rounded-lg overflow-hidden">
        <div className="flex flex-row items-center justify-between px-4 sm:px-6 py-6 gap-4 sm:gap-0">
          <h2 className="font-outfit font-medium text-lg sm:text-2xl text-[#121212]">Recent Reports</h2>
          <Link href="/admin/reports" className="font-outfit font-normal text-[14px] sm:text-[16px] text-[#0171F9] whitespace-nowrap">View all</Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-max">
            <thead>
              <tr className="border-y border-[#E5E7EB] bg-white">
                <th className="text-left px-3 sm:px-5 py-3 sm:py-3.5 font-inter font-medium text-[12px] sm:text-xs text-[#6F6C70] uppercase whitespace-nowrap min-w-12">ID</th>
                <th className="text-left px-3 sm:px-5 py-3 sm:py-3.5 font-inter font-medium text-[12px] sm:text-xs text-[#6F6C70] uppercase whitespace-nowrap min-w-32">School</th>
                <th className="text-left px-3 sm:px-5 py-3 sm:py-3.5 font-inter font-medium text-[12px] sm:text-xs text-[#6F6C70] uppercase whitespace-nowrap min-w-28">Teacher</th>
                <th className="text-left px-3 sm:px-5 py-3 sm:py-3.5 font-inter font-medium text-[12px] sm:text-xs text-[#6F6C70] uppercase whitespace-nowrap min-w-20">Sentiment</th>
                <th className="text-left px-3 sm:px-5 py-3 sm:py-3.5 font-inter font-medium text-[12px] sm:text-xs text-[#6F6C70] uppercase whitespace-nowrap min-w-24">Submitted By</th>
                <th className="text-left px-3 sm:px-5 py-3 sm:py-3.5 font-inter font-medium text-[12px] sm:text-xs text-[#6F6C70] uppercase whitespace-nowrap min-w-24">Date</th>
                <th className="text-left px-3 sm:px-5 py-3 sm:py-3.5 font-inter font-medium text-[12px] sm:text-xs text-[#6F6C70] uppercase whitespace-nowrap min-w-16">Status</th>
                <th className="text-left px-3 sm:px-5 py-3 sm:py-3.5 font-inter font-medium text-[12px] sm:text-xs text-[#6F6C70] uppercase whitespace-nowrap min-w-32">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reportLoading && (
                <tr>
                  <td colSpan={8} className="px-4 sm:px-5 py-8 sm:py-10 text-center font-inter text-xs sm:text-sm text-[#6F6C70]">
                    Loading reports...
                  </td>
                </tr>
              )}
              {!reportLoading && recentReports?.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 sm:px-6 lg:px-8 py-8 text-center font-inter text-sm text-[#6F6C70]">No reports found.</td>
                </tr>
              ) : (recentReports.map((report: any) => {
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
              }))}

            </tbody>
          </table>
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
