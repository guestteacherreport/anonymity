import { incrementSchoolAnalytics } from "@/lib/incrementSchoolAnalytics";
import { supabase } from "@/lib/supabase";
import { updateTeacherAnalytics } from "@/lib/updateTeacherAnalytics";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get report details first
    const { data: report, error: reportError } =
      await supabase
        .from("reports")
        .select("*")
        .eq("id", id)
        .single();

    if (reportError || !report) {
      return Response.json(
        {
          error: "Report not found",
        },
        { status: 404 }
      );
    }

    // Prevent double approval
    if (report.status === 2) {
      return Response.json({
        success: true,
        message: "Report already approved",
      });
    }

    // Approve report
    const { error: updateError } =
      await supabase
        .from("reports")
        .update({
          status: 2,
        })
        .eq("id", id);

    if (updateError) {
      return Response.json(
        {
          error: updateError.message,
        },
        { status: 500 }
      );
    }

    // Month from report created date
    const reportMonth = new Date(
      report.created_at
    );

    const month = reportMonth
    .toISOString()
    .slice(0, 7) + "-01";

    // Check monthly row
    const {
      data: monthlyStats,
      error: monthlyError,
    } = await supabase
      .from("school_monthly_stats")
      .select("*")
      .eq("school_id", report.school_id)
      .eq("month", month)
      .maybeSingle();

    if (monthlyError) {
      throw monthlyError;
    }

    const payload = {
      school_id: report.school_id,
      month,

      total_reports:
        (monthlyStats?.total_reports || 0) + 1,

      school_yes:
        (monthlyStats?.school_yes || 0) +
        (report.return_to_school === 1
          ? 1
          : 0),

      school_no:
        (monthlyStats?.school_no || 0) +
        (report.return_to_school === 2
          ? 1
          : 0),

      school_maybe:
        (monthlyStats?.school_maybe || 0) +
        (report.return_to_school === 3
          ? 1
          : 0),

      teacher_yes:
        (monthlyStats?.teacher_yes || 0) +
        (report.return_to_teacher === 1
          ? 1
          : 0),

      teacher_no:
        (monthlyStats?.teacher_no || 0) +
        (report.return_to_teacher === 2
          ? 1
          : 0),

      teacher_maybe:
        (monthlyStats?.teacher_maybe || 0) +
        (report.return_to_teacher === 3
          ? 1
          : 0),
    };

    const { error: upsertError } =
      await supabase
        .from("school_monthly_stats")
        .upsert(payload, {
          onConflict: "school_id,month",
        });

    if (upsertError) {
      throw upsertError;
    }

    // Update analytics
    await incrementSchoolAnalytics(
      report
    );

    if (report.teacher_id) {
      await updateTeacherAnalytics(
        report
      );
    }

    return Response.json({
      success: true,
      message: "Report approved",
    });
  } catch (error: any) {
    console.error(
      "Approve report error:",
      error
    );

    return Response.json(
      {
        error:
          error.message ||
          "Failed to approve report",
      },
      {
        status: 500,
      }
    );
  }
}