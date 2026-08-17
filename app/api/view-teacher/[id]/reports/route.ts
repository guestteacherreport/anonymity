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
    // Teacher reports are a subset of their school's reports, so access is
    // governed by the same school-level grant used on the school detail page.
    const { data: teacher, error: teacherError } = await supabase
      .from("teachers")
      .select("school_id")
      .eq("id", id)
      .maybeSingle();

    if (teacherError || !teacher) {
      return NextResponse.json(
        { success: false, message: "Teacher not found" },
        { status: 404 }
      );
    }

    const session = await getCurrentSession();
    const role = session?.user?.role;
    const userId = session?.user?.id;

    const allowed = await hasSchoolReportAccess(role, userId, String(teacher.school_id));

    if (!allowed) {
      return NextResponse.json(
        {
          success: false,
          code: "ACCESS_REQUIRED",
          message: session
            ? "You do not have approved access to this teacher's school reports."
            : "You must be logged in with approved access to view detailed reports.",
        },
        { status: 403 }
      );
    }

    const page = parseInt(req.nextUrl.searchParams.get("page") || "1");
    const limit = parseInt(req.nextUrl.searchParams.get("limit") || "10");

    const status =
      req.nextUrl.searchParams.get("status") || "All";

    const offset = (page - 1) * limit;

    let reportsQuery = supabase
      .from("reports")
      .select("*", { count: "exact" })
      .eq("status", 2)
      .not("published_at", "is", null)

      .eq("teacher_id", id);

    if (
      status === "Positive"
    ) {
      reportsQuery = reportsQuery.eq("return_to_teacher", 1);
    }
    else if (
      status === "Neutral"
    ) {
      reportsQuery = reportsQuery.eq("return_to_teacher", 3);
    }
    else if (
      status === "Negative"
    ) {
      reportsQuery = reportsQuery.eq("return_to_teacher", 2);
    }

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

    const reports = (reportsData || []).map((row: any) => ({
      ...row,
      tags: row.tags || [],
    }));

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
