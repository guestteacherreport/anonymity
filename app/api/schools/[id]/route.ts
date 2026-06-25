import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const page = parseInt(req.nextUrl.searchParams.get("page") || "1");
    const limit = parseInt(req.nextUrl.searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;

    // =========================
    // 1. SCHOOL DETAILS (FAST)
    // =========================
    const { data: school, error: schoolError } = await supabase
      .from("schools")
      .select("*")
      .eq("id", id)
      .single();

    if (schoolError || !school) {
      return NextResponse.json(
        { success: false, message: "School not found" },
        { status: 404 }
      );
    }

    // =========================
    // 2. MONTHLY STATS (FAST INDEXED QUERY)
    // =========================
    const monthStart = new Date();
    monthStart.setDate(1);

    const lastMonthStart = new Date(monthStart);
    lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);

    const { data: thisMonthStats } = await supabase
      .from("school_monthly_stats")
      .select("*")
      .eq("school_id", id)
      .eq("month", monthStart.toISOString().slice(0, 10))
      .single();

    const { data: lastMonthStats } = await supabase
      .from("school_monthly_stats")
      .select("*")
      .eq("school_id", id)
      .eq("month", lastMonthStart.toISOString().slice(0, 10))
      .single();

    // =========================
    // 3. SAFE STATS
    // =========================
    const safeStats = {
      this_month: thisMonthStats?.total_reports || 0,
      last_month: lastMonthStats?.total_reports || 0,

      school_yes: school.school_yes || 0,
      school_no: school.school_no || 0,
      school_maybe: school.school_maybe || 0,

      teacher_yes: school.teacher_yes || 0,
      teacher_no: school.teacher_no || 0,
      teacher_maybe: school.teacher_maybe || 0,
    };

    // =========================
    // 4. REPORTS (PAGINATION ONLY)
    // =========================
    const { data: reportsData, count: totalReports, error: reportsError } =
      await supabase
        .from("reports")
        .select("*", { count: "exact" })
        .eq("school_id", id)
        .eq("status", 2)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

    if (reportsError) {
      return NextResponse.json(
        { success: false, message: reportsError.message },
        { status: 500 }
      );
    }

    const reports = (reportsData || []).map((row: any) => ({
      ...row,
      tags: row.tags || [],
    }));

    // =========================
    // 5. RESPONSE
    // =========================
    return NextResponse.json({
      success: true,

      school: {
        ...school,
        reports_this_month: safeStats.this_month,
        reports_last_month: safeStats.last_month,

        return_to_school_yes_percentage:
          safeStats.school_yes + safeStats.school_no + safeStats.school_maybe > 0
            ? Number(
                (
                  (safeStats.school_yes * 100) /
                  (safeStats.school_yes +
                    safeStats.school_no +
                    safeStats.school_maybe)
                ).toFixed(1)
              )
            : 0,

        return_to_school_no_percentage:
          safeStats.school_yes + safeStats.school_no + safeStats.school_maybe > 0
            ? Number(
                (
                  (safeStats.school_no * 100) /
                  (safeStats.school_yes +
                    safeStats.school_no +
                    safeStats.school_maybe)
                ).toFixed(1)
              )
            : 0,

        return_to_school_maybe_percentage:
          safeStats.school_yes + safeStats.school_no + safeStats.school_maybe > 0
            ? Number(
                (
                  (safeStats.school_maybe * 100) /
                  (safeStats.school_yes +
                    safeStats.school_no +
                    safeStats.school_maybe)
                ).toFixed(1)
              )
            : 0,

        return_to_teacher_yes_percentage:
          safeStats.teacher_yes + safeStats.teacher_no + safeStats.teacher_maybe > 0
            ? Number(
                (
                  (safeStats.teacher_yes * 100) /
                  (safeStats.teacher_yes +
                    safeStats.teacher_no +
                    safeStats.teacher_maybe)
                ).toFixed(1)
              )
            : 0,

        return_to_teacher_no_percentage:
          safeStats.teacher_yes + safeStats.teacher_no + safeStats.teacher_maybe > 0
            ? Number(
                (
                  (safeStats.teacher_no * 100) /
                  (safeStats.teacher_yes +
                    safeStats.teacher_no +
                    safeStats.teacher_maybe)
                ).toFixed(1)
              )
            : 0,

        return_to_teacher_maybe_percentage:
          safeStats.teacher_yes + safeStats.teacher_no + safeStats.teacher_maybe > 0
            ? Number(
                (
                  (safeStats.teacher_maybe * 100) /
                  (safeStats.teacher_yes +
                    safeStats.teacher_no +
                    safeStats.teacher_maybe)
                ).toFixed(1)
              )
            : 0,
      },

      reports,

      pagination: {
        page,
        limit,
        total: totalReports || 0,
        totalPages: Math.ceil((totalReports || 0) / limit),
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch school details",
      },
      { status: 500 }
    );
  }
}