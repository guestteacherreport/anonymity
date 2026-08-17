import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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

    // General info only - counts, not report content. Detailed report
    // content is only served (and access-controlled) via the separate
    // /reports endpoint, mirroring the school detail page.
    const { count: totalReports, error: reportsError } = await supabase
      .from("reports")
      .select("*", { count: "exact", head: true })
      .eq("teacher_id", id)
      .eq("status", 2)
      .not("published_at", "is", null);

    if (reportsError) {
      return NextResponse.json(
        { success: false, message: reportsError.message },
        { status: 500 }
      );
    }

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
        .not("published_at", "is", null)
        .eq("return_to_teacher", 1),

      supabase
        .from("reports")
        .select("*", { count: "exact", head: true })
        .eq("teacher_id", id)
        .eq("status", 2)
        .not("published_at", "is", null)
        .eq("return_to_teacher", 2),

      supabase
        .from("reports")
        .select("*", { count: "exact", head: true })
        .eq("teacher_id", id)
        .eq("status", 2)
        .not("published_at", "is", null)
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
