import { supabase } from "@/lib/supabase";
import { incrementSchoolAnalytics } from "@/lib/incrementSchoolAnalytics";
import { updateTeacherAnalytics } from "@/lib/updateTeacherAnalytics";

export async function publishReport(report: any, month: any) {
 
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
      (report.return_to_school === 1 ? 1 : 0),

    school_no:
      (monthlyStats?.school_no || 0) +
      (report.return_to_school === 2 ? 1 : 0),

    school_maybe:
      (monthlyStats?.school_maybe || 0) +
      (report.return_to_school === 3 ? 1 : 0),

    teacher_yes:
      (monthlyStats?.teacher_yes || 0) +
      (report.return_to_teacher === 1 ? 1 : 0),

    teacher_no:
      (monthlyStats?.teacher_no || 0) +
      (report.return_to_teacher === 2 ? 1 : 0),

    teacher_maybe:
      (monthlyStats?.teacher_maybe || 0) +
      (report.return_to_teacher === 3 ? 1 : 0),
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

  await incrementSchoolAnalytics(report);

  if (report.teacher_id) {
    await updateTeacherAnalytics(report);
  }
}