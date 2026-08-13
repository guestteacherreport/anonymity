import { incrementSchoolAnalytics } from "@/lib/incrementSchoolAnalytics";
import { publishReport } from "@/lib/publishReport";
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

    const publishDelayDays = report.publish_delay_days ?? 0;

    const approvalDate = new Date();
    const createdDate = new Date(report.created_at);

    const scheduledPublishAt = new Date(createdDate);
    scheduledPublishAt.setUTCDate(
      scheduledPublishAt.getUTCDate() + publishDelayDays
    );

    const shouldPublishImmediately =
      scheduledPublishAt <= approvalDate;

    // Approve report 
    const { error: updateError } =
      await supabase
        .from("reports")
        .update({
          status: 2,
          approval_date: approvalDate.toISOString(),
          ...(shouldPublishImmediately
            ? {
              published_at: approvalDate.toISOString(),
            }
            : {}),
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

    // --------------------------------------------------
    // ONLY RUN PUBLISH ACTIONS FOR INSTANT PUBLISH
    // --------------------------------------------------
    if (shouldPublishImmediately) {
      
      const month = approvalDate.toISOString().slice(0, 7) + "-01";

      await publishReport(report, month);

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
