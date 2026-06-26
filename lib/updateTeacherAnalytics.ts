import { supabase } from "@/lib/supabase";
import { openai } from "@/lib/openai";
import { ObjectType } from "./types";

export async function updateTeacherAnalytics(
  report: ObjectType
) {
  if (!report.teacher_id) return;

  const teacherId = report.teacher_id;
  let risk = "N/A";

  const { data: analytics } = await supabase
    .from("teachers")
    .select("total_reports,high_risk_reports,avg_rating,ai_summary,return_to_teacher_percentage,teacher_yes,teacher_no,teacher_maybe")
    .eq("id", teacherId)
    .maybeSingle();

  const currentReports = analytics?.total_reports || 0;
  const currentAvg = analytics?.avg_rating || 0;

  const totalReports = currentReports + 1;


  let highRiskReports =
    (analytics?.high_risk_reports || 0) +
    (report.return_to_teacher === 2 ? 1 : 0);


  // Convert return_to_teacher to rating
  const newRating =
    report.return_to_teacher === 1
      ? 5 // Yes
      : report.return_to_teacher === 3
        ? 3 // Maybe
        : 0; // No

  const avgRating = Number(
    (
      (currentAvg * currentReports + newRating) /
      totalReports
    ).toFixed(2)
  );


  if (avgRating >= 4) {
    risk = "Low";
  } else if (avgRating >= 3) {
    risk = "Medium";
  } else {
    risk = "High";
  }

  // =========================
  // RETURN TO TEACHER %
  // =========================

  const currentReturnScore =
    (analytics?.return_to_teacher_percentage || 0) *
    currentReports;

  const newReturnScore =
    report.return_to_teacher === 1
      ? 100
      : report.return_to_teacher === 3
        ? 50
        : 0;


  const returnToTeacherPercentage =
    (currentReturnScore +
      newReturnScore) /
    totalReports;

  // Generate summary on first report and every 5 reports thereafter

  if (
    totalReports === 1 ||
    totalReports % 5 === 0
  ) {
    try {

      const { data: recentReports, error: reportsError } =
        await supabase
          .from("reports")
          .select(
            "feedback, teacher_comment, AI_teacherIssues, AI_teacherStrength"
          )
          .eq("teacher_id", teacherId)
          .eq("status", 2)
          .order("created_at", {
            ascending: false,
          })
          .limit(5);



      const feedbackText =
        recentReports
          ?.map((r) =>
            [
              r.feedback,
              r.teacher_comment,
              ...(r.AI_teacherIssues || []),
              ...(r.AI_teacherStrength || []),
            ]
              .filter(Boolean)
              .join("\n")
          )
          .filter(Boolean)
          .join("\n\n") || "";

      if (!feedbackText.trim()) {
        return;
      }

      const response =
        await openai.responses.create({
          model: "gpt-5-mini",

          input: `
Generate a concise administrator-facing teacher risk summary.

Statistics:
Total Reports: ${totalReports}
High Risk Reports: ${highRiskReports}
Existing Feedback: ${analytics?.ai_summary || "No existing summary"}

Feedback:
${feedbackText}

Instructions:
- Write 1-2 sentences.
- If Existing Summary is "No existing summary", generate the summary using only the latest feedback.
- Focus on recurring concerns and patterns.
- Mention classroom management, student behavior, professionalism, preparation, or safety concerns when applicable.
- Include overall trend information using the report statistics.
- Use simple and professional language.
- Do not mention individual incidents.
- If concerns appear across multiple reports, describe them as recurring or repeated.
- Maximum 40 words.

Return JSON only:

{
  "summary": ""
}
`
        });

      const result = JSON.parse(
        response.output_text
      );

      await supabase
        .from("teachers")
        .update({
          ai_summary: result.summary || null,
          total_reports: totalReports,
          high_risk_reports: highRiskReports,
          high_risk_percentage:
            (highRiskReports / totalReports) * 100,
          avg_rating: avgRating,
          risk,
          return_to_teacher_percentage: returnToTeacherPercentage,
          teacher_yes:
            (analytics?.teacher_yes || 0) +
            (report.return_to_teacher === 1 ? 1 : 0),

          teacher_no:
            (analytics?.teacher_no || 0) +
            (report.return_to_teacher === 2 ? 1 : 0),

          teacher_maybe:
            (analytics?.teacher_maybe || 0) +
            (report.return_to_teacher === 3 ? 1 : 0),
        })
        .eq("id", teacherId)

      console.log(
        `Teacher summary updated for ${teacherId}`
      );
    } catch (error) {
      console.error(
        "Teacher summary generation failed:",
        error
      );
    }
  } else {
    await supabase
      .from("teachers")
      .update({
        total_reports: totalReports,
        high_risk_reports: highRiskReports,
        high_risk_percentage:
          (highRiskReports / totalReports) * 100,
        avg_rating: avgRating,
        risk,
        return_to_teacher_percentage: returnToTeacherPercentage,
        teacher_yes:
          (analytics?.teacher_yes || 0) +
          (report.return_to_teacher === 1 ? 1 : 0),

        teacher_no:
          (analytics?.teacher_no || 0) +
          (report.return_to_teacher === 2 ? 1 : 0),

        teacher_maybe:
          (analytics?.teacher_maybe || 0) +
          (report.return_to_teacher === 3 ? 1 : 0),
      })
      .eq("id", teacherId);
  }
}