import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getCurrentSession, hasSchoolReportAccess } from "@/lib/schoolAccess";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // =========================
    // ACCESS CONTROL
    // =========================
    const session = await getCurrentSession();
    const role = session?.user?.role;
    const userId = session?.user?.id;

    const allowed = await hasSchoolReportAccess(role, userId, id);

    if (!allowed) {
      return NextResponse.json(
        {
          success: false,
          code: "ACCESS_REQUIRED",
          message: session
            ? "You do not have approved access to this school's detailed reports."
            : "You must be logged in with approved access to view detailed reports.",
        },
        { status: 403 }
      );
    }

    // =========================
    // QUERY PARAMS
    // =========================
    const page = parseInt(req.nextUrl.searchParams.get("page") || "1");
    const limit = parseInt(req.nextUrl.searchParams.get("limit") || "10");

    const status =
      req.nextUrl.searchParams.get("status") || "All";

    const offset = (page - 1) * limit;
    const now = new Date().toISOString();

    // =========================
    // BASE QUERY
    // =========================
    let reportsQuery = supabase
      .from("reports")
      .select("*", { count: "exact" })
      .eq("status", 2)
      .not("published_at", "is", null)
      .eq("school_id", id);
      
    // =========================
    // SENTIMENT FILTER
    // =========================
    if (
      status === "Positive" ||
      status === "Neutral" ||
      status === "Negative"
    ) {
      reportsQuery = reportsQuery.eq("AI_sentiment", status);
    }

    // =========================
    // FETCH REPORTS
    // =========================
    const {
      data: reportsData,
      count: totalReports,
      error: reportsError,
    } = await reportsQuery
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (reportsError) {
      return NextResponse.json(
        {
          success: false,
          message: reportsError.message,
        },
        { status: 500 }
      );
    }

    // =========================
    // FORMAT REPORTS
    // =========================
    const reports = (reportsData || []).map((row: any) => ({
      ...row,
      tags: row.tags || [],
    }));

    // =========================
    // RESPONSE
    // =========================
    return NextResponse.json({
      success: true,

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
        message: "Failed to fetch reports",
      },
      { status: 500 }
    );
  }
}
