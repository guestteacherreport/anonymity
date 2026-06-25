import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const now = new Date();

    const currentMonthStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    );

    const lastMonthStart = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1
    );

    const thisWeekStart = new Date(now);
    thisWeekStart.setDate(now.getDate() - now.getDay());
    thisWeekStart.setHours(0, 0, 0, 0);

    const lastWeekStart = new Date(thisWeekStart);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);

    const lastWeekEnd = new Date(thisWeekStart);
    lastWeekEnd.setMilliseconds(-1);

    const [
      totalSchoolsResult,

      currentMonthReportsResult,
      lastMonthReportsResult,

      thisWeekReportsResult,
      lastWeekReportsResult,

      positiveReportsResult,
      neutralReportsResult,
      negativeReportsResult,
      negativeReportsCurrentMonthResult,
      negativeReportsLastMonthResult,

      currentMonthSchoolsResult,
      lastMonthSchoolsResult,
    ] = await Promise.all([


      // Total unique schools (RPC)
      supabase.rpc("get_unique_school_count"),

      // Current month reports
      supabase
        .from("reports")
        .select("*", { count: "exact", head: true })
        .eq("status",2)
        .gte("created_at", currentMonthStart.toISOString())
        .lt("created_at", now.toISOString()),

      // Last month reports
      supabase
        .from("reports")
        .select("*", { count: "exact", head: true })
        .eq("status",2)
        .gte("created_at", lastMonthStart.toISOString())
        .lt("created_at", currentMonthStart.toISOString()),

      // This week reports
      supabase
        .from("reports")
        .select("*", { count: "exact", head: true })
        .eq("status",2)
        .gte("created_at", thisWeekStart.toISOString())
        .lt("created_at", now.toISOString()),

      // Last week reports
      supabase
        .from("reports")
        .select("*", { count: "exact", head: true })
        .eq("status",2)
        .gte("created_at", lastWeekStart.toISOString())
        .lte("created_at", lastWeekEnd.toISOString()),

      // Total positive reports
      supabase
        .from("reports")
        .select("*", { count: "exact", head: true })
        .eq("status",2)
        .eq("AI_sentiment", "Positive"),

      // Total neutral reports
      supabase
        .from("reports")
        .select("*", { count: "exact", head: true })
        .eq("status",2)
        .eq("AI_sentiment", "Neutral"),

      // Total negative reports
      supabase
        .from("reports")
        .select("*", { count: "exact", head: true })
        .eq("status",2)
        .eq("AI_sentiment", "Negative"),

      // Current month negative reports
      supabase
        .from("reports")
        .select("*", { count: "exact", head: true })
        .eq("AI_sentiment", "Negative")
        .eq("status",2)
        .gte("created_at", currentMonthStart.toISOString())
        .lt("created_at", now.toISOString()),

      // Last month negative reports
      supabase
        .from("reports")
        .select("*", { count: "exact", head: true })
        .eq("AI_sentiment", "Negative")
        .eq("status",2)
        .gte("created_at", lastMonthStart.toISOString())
        .lt("created_at", currentMonthStart.toISOString()),

      supabase.rpc("get_unique_school_count_by_date", {
        start_date: currentMonthStart.toISOString(),
        end_date: now.toISOString(),
      }),

      supabase.rpc("get_unique_school_count_by_date", {
        start_date: lastMonthStart.toISOString(),
        end_date: currentMonthStart.toISOString(),
      }),
    ]);

    const errors = [
      totalSchoolsResult.error,
      currentMonthReportsResult.error,
      lastMonthReportsResult.error,
      thisWeekReportsResult.error,
      lastWeekReportsResult.error,
      positiveReportsResult.error,
      neutralReportsResult.error,
      negativeReportsResult.error,
      negativeReportsCurrentMonthResult.error,
      negativeReportsLastMonthResult.error,
      currentMonthSchoolsResult.error,
      lastMonthSchoolsResult.error,
    ];

    if (errors.some(Boolean)) {
      throw new Error("Failed to fetch dashboard stats");
    }

    const totalSchools = totalSchoolsResult.data || 0;

    const currentMonthSchools =
      Number(currentMonthSchoolsResult.data) || 0;

    const lastMonthSchools =
      Number(lastMonthSchoolsResult.data) || 0;

    const schoolChange =
      currentMonthSchools - lastMonthSchools;

    const totalReports = (positiveReportsResult.count || 0) + (neutralReportsResult.count || 0) + (negativeReportsResult.count || 0);

    return NextResponse.json({
      totalReports: totalReports || 0,

      totalReportsCurrentMonth:
        currentMonthReportsResult.count || 0,

      totalReportsLastMonth:
        lastMonthReportsResult.count || 0,

      reportsThisWeek:
        thisWeekReportsResult.count || 0,

      reportsLastWeek:
        lastWeekReportsResult.count || 0,

      positiveReports: positiveReportsResult.count || 0,

      neutralReports: neutralReportsResult.count || 0,

      negativeReports:
        negativeReportsResult.count || 0,

      negativeReportsCurrentMonth:
        negativeReportsCurrentMonthResult.count || 0,

      negativeReportsLastMonth:
        negativeReportsLastMonthResult.count || 0,

      totalSchools,
      schoolChange,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch dashboard stats",
      },
      {
        status: 500,
      }
    );
  }
}