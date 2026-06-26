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

    const { data: teacher, error: teacherError } = await supabase
      .from("teachers")
      .select("*, schools(school_name)")
      .eq("id", id)
      .single();

    if (teacherError || !teacher) {
      return NextResponse.json(
        { success: false, message: "Teacher not found" },
        { status: 404 }
      );
    }

    const { data: reportsData, count: totalReports, error: reportsError } =
      await supabase
        .from("reports")
        .select("*", { count: "exact" })
        .eq("teacher_id", id)
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

    const [
      { count: yesCount },
      { count: noCount },
      { count: maybeCount },
    ] = await Promise.all([
      supabase
        .from("reports")
        .select("*", { count: "exact", head: true })
        .eq("teacher_id", id)
        .eq("status", 2)
        .eq("return_to_teacher", 1),

      supabase
        .from("reports")
        .select("*", { count: "exact", head: true })
        .eq("teacher_id", id)
        .eq("status", 2)
        .eq("return_to_teacher", 2),

      supabase
        .from("reports")
        .select("*", { count: "exact", head: true })
        .eq("teacher_id", id)
        .eq("status", 2)
        .eq("return_to_teacher", 3),
    ]);


    return NextResponse.json({
      success: true,
      teacher: {
        ...teacher,
        total_reviews: totalReports || 0,
        return_to_teacher_yes_percentage:
          teacher.teacher_yes + teacher.teacher_no + teacher.teacher_maybe > 0
            ? Number(
              (
                (teacher.teacher_yes * 100) /
                (teacher.teacher_yes +
                  teacher.teacher_no +
                  teacher.teacher_maybe)
              ).toFixed(1)
            )
            : 0,

        return_to_teacher_no_percentage:
          teacher.teacher_yes + teacher.teacher_no + teacher.teacher_maybe > 0
            ? Number(
              (
                (teacher.teacher_no * 100) /
                (teacher.teacher_yes +
                  teacher.teacher_no +
                  teacher.teacher_maybe)
              ).toFixed(1)
            )
            : 0,

        return_to_teacher_maybe_percentage:
          teacher.teacher_yes + teacher.teacher_no + teacher.teacher_maybe > 0
            ? Number(
              (
                (teacher.teacher_maybe * 100) /
                (teacher.teacher_yes +
                  teacher.teacher_no +
                  teacher.teacher_maybe)
              ).toFixed(1)
            )
            : 0,
        positive_reports: yesCount || 0,
        negative_reports: noCount || 0,
        neutral_reports: maybeCount || 0,
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
        message: "Failed to fetch teacher details",
      },
      { status: 500 }
    );
  }
}
