import { supabase } from "@/lib/supabase";
import { ObjectType } from "./types";
import { openai } from "./openai";

export async function incrementSchoolAnalytics(
    report: ObjectType
) {
    const { data: school, error } =
        await supabase
            .from("schools")
            .select("*")
            .eq("id", report.school_id)
            .single();

    if (error || !school) {
        throw new Error(
            "School not found"
        );
    }

    const currentTotal =
        school.total_reports || 0;
    const newTotal = currentTotal + 1;

    // =========================
    // REPORT RATING
    // =========================

    const reportRating =
        (
            Number(report.classroom_behavior || 0) +
            Number(report.lesson_preparedness || 0) +
            Number(report.staff_friendliness || 0) +
            Number(report.school_cleanliness || 0) +
            Number(report.support_level || 0)
        ) / 5;

    const avgRating =
        currentTotal === 0
            ? reportRating
            : (
                school.avg_rating *
                currentTotal +
                reportRating
            ) / newTotal;

    // =========================
    // RETURN TO SCHOOL %
    // =========================

    const currentReturnScore =
        (school.return_to_school_percentage || 0) *
        currentTotal;

    const newReturnScore =
        report.return_to_school === 1
            ? 100
            : report.return_to_school === 3
                ? 50
                : 0;


    const returnToSchoolPercentage =
        (currentReturnScore +
            newReturnScore) /
        newTotal;

    // =========================
    // SCHOOL SENTIMENT
    // =========================

    let sentiment;

    if (avgRating >= 4) {
        sentiment = "Positive";
    } else if (avgRating >= 3) {
        sentiment = "Neutral";
    } else if (avgRating < 3) {
        sentiment = "Negative";
    }

    // =========================
    // SCHOOL RISK
    // =========================

    let calculatedRisk;
    if (avgRating >= 4) {
        calculatedRisk = "Low";
    } else if (avgRating >= 3) {
        calculatedRisk = "Medium";
    } else if (avgRating < 3) {
        calculatedRisk = "High";
    }



    const schoolUpdatePayload = {
        total_reports: newTotal,
        total_reviews: (school.total_reviews || 0) + 1,

        avg_rating: Number(avgRating.toFixed(2)),

        return_to_school_percentage:
            Number(returnToSchoolPercentage.toFixed(2)),

        school_yes:
            (school.school_yes || 0) +
            (report.return_to_school === 1 ? 1 : 0),

        school_no:
            (school.school_no || 0) +
            (report.return_to_school === 2 ? 1 : 0),

        school_maybe:
            (school.school_maybe || 0) +
            (report.return_to_school === 3 ? 1 : 0),

        teacher_yes:
            (school.teacher_yes || 0) +
            (report.return_to_teacher === 1 ? 1 : 0),

        teacher_no:
            (school.teacher_no || 0) +
            (report.return_to_teacher === 2 ? 1 : 0),

        teacher_maybe:
            (school.teacher_maybe || 0) +
            (report.return_to_teacher === 3 ? 1 : 0),

        positive_reports:
            (school.positive_reports || 0) +
            (report.AI_sentiment === "Positive" ? 1 : 0),

        neutral_reports:
            (school.neutral_reports || 0) +
            (report.AI_sentiment === "Neutral" ? 1 : 0),

        negative_reports:
            (school.negative_reports || 0) +
            (report.AI_sentiment === "Negative" ? 1 : 0),

        high_risk_reports:
            (school.high_risk_reports || 0) +
            (report.AI_riskLevel === "High" ? 1 : 0),

        sentiment,
        calculated_risk: calculatedRisk,
    };

    let aiSummary: string | null = null;
    // Generate summary on first report and then every 5 reports
    if (
        newTotal === 1 ||
        newTotal % 5 === 0
    ) {
        try {
            const { data: recentReports } =
                await supabase
                    .from("reports")
                    .select("feedback, school_comment, AI_schoolStrength, AI_schoolIssues")
                    .eq("school_id", report.school_id)
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
                            r.school_comment,
                            ...(r.AI_schoolStrength || []),
                            ...(r.AI_schoolIssues || []),
                        ]
                            .filter(Boolean)
                            .join("\n")
                    )
                    .filter(Boolean)
                    .join("\n\n") || "";
            if (feedbackText) {
                const response =
                    await openai.responses.create({
                        model: "gpt-5-mini",

                        input: `Generate an updated school feedback using the existing feedback and the latest guest teacher feedback.

                        Existing Feedback:
${school.ai_summary || "No existing feedback"}
        
        Latest Feedback:
        ${feedbackText}
        
        Rules:
        - Write exactly 1 sentence.
        - If Existing Feedback is "No existing feedback", generate the feedback using only the latest feedback.
        - Do not mention the existence or absence of a previous feedback.
        - Do not reference "existing feedback", "previous feedback", or "latest feedback" in the output.        
        - Maximum 20 words.
        - Highlight strengths first.
        - Do not mention individual incidents unless they appear repeatedly.
        - Do not mention report guest teacher, counts, ratings, percentages, risk levels, or statistics.
        - Avoid robotic wording
        - No bullet points, no semicolon
        - No quotes
        
        Return JSON only:
        
        {
          "summary": ""
        }
        `,
                    });


                try {
                    const result = JSON.parse(
                        response.output_text
                    );

                    aiSummary =
                        result.summary || null;
                } catch {
                    aiSummary =
                        response.output_text
                            ?.replace(
                                /```json|```/g,
                                ""
                            )
                            .trim() || null;
                }


            }
        } catch (error) {
            console.error(
                "School summary generation failed:",
                error
            );
        }

        const updatePayload = {
            ...schoolUpdatePayload,
            ...(aiSummary && {
                ai_summary: aiSummary,
            }),
        };

        const { error: updateError } =
            await supabase
                .from("schools")
                .update(updatePayload)
                .eq("id", report.school_id);

        if (updateError) {
            throw new Error(
                updateError.message
            );
        }
    } else {
        const { error: updateError } =
            await supabase
                .from("schools")
                .update({
                    ...schoolUpdatePayload
                })
                .eq("id", report.school_id);

        if (updateError) {
            throw new Error(
                updateError.message
            );
        }

    }


}