import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { analyzeReport } from "@/lib/analyze-report";
import { sendGuestTeacherReportNotification } from "@/lib/email";
import { getAppUrl } from "@/lib/app-url";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      user_id,
      schoolName,
      schoolId,
      teacherId,
      teacherName,
      date,
      gradeLevel,
      ratings,
      feedback,
      selectedTags,
      returnToSchool,
      returnToTeacher,
      schoolComment,
      teacherComment,
      postAs,
      yourName,
      schoolAssociation,
      sentiments,
      city,
      publishImmediately,
      publishDelayDays,
      jobId,
    } = body;

    const trimmedJobId = typeof jobId === "string" ? jobId.trim() : "";

    if (!trimmedJobId) {
      return NextResponse.json(
        { error: "Job ID is required", message: "Job ID is required", field: "jobId" },
        { status: 400 }
      );
    }

    // Fast-path duplicate check. The unique index on reports.job_id is the
    // authoritative guard against a race between two concurrent requests
    // for the same Job ID - this check just gives a clean error for the
    // common case without waiting on that race.
    const { data: existingReport, error: existingReportError } = await supabase
      .from("reports")
      .select("id")
      .eq("job_id", trimmedJobId)
      .maybeSingle();

    if (existingReportError) {
      return NextResponse.json(
        { error: existingReportError.message },
        { status: 500 }
      );
    }

    if (existingReport) {
      return NextResponse.json(
        {
          error: "Job ID already used",
          message: "A report has already been submitted for this Job ID.",
          field: "jobId",
        },
        { status: 409 }
      );
    }

    const shouldDelayPublishing = (publishImmediately == 0);
    const delayDays = shouldDelayPublishing ? Number(publishDelayDays) : 0;

    if (shouldDelayPublishing && (!Number.isInteger(delayDays) || delayDays < 1)) {
      return NextResponse.json({ error: "A valid publishing delay is required" }, { status: 400 });
    }

    const aiReportAnalysis = await analyzeReport({
      ratings,
      feedback,
      selectedTags,
      returnToSchool,
      returnToTeacher,
      schoolComment,
      teacherComment
    });

    const createdDate = new Date().toISOString();

    const scheduledPublishAt = new Date(createdDate);
    scheduledPublishAt.setUTCDate(
      scheduledPublishAt.getUTCDate() + delayDays
    );

    // Insert into Supabase
    const { data, error } = await supabase
      .from("reports")
      .insert([
        {
          user_id: user_id,
          job_id: trimmedJobId,
          city,
          school_name: schoolName,

          school_id: schoolId || null,

          teacher_id: teacherId || null,

          teacher_name: teacherName,

          date_of_assignment: date,

          grade_level: gradeLevel,

          classroom_behavior:
            ratings?.classroomBehavior ?? null,

          lesson_preparedness:
            ratings?.lessonPreparedness ?? null,

          staff_friendliness:
            ratings?.staffFriendliness ?? null,

          school_cleanliness:
            ratings?.schoolCleanliness ?? null,

          support_level:
            ratings?.supportLevel ?? null,

          feedback,

          // JSONB column
          tags: selectedTags || [],

          // 1 = Yes
          // 2 = No
          // 3 = Maybe/Not Sure
          return_to_school:
            returnToSchool === "yes"
              ? 1
              : returnToSchool === "no"
                ? 2
                : 3,

          return_to_teacher:
            returnToTeacher === "yes"
              ? 1
              : returnToTeacher === "no"
                ? 2
                : 3,

          school_comment: schoolComment,

          teacher_comment: teacherComment,

          // 1 = Anonymous
          // 2 = Public
          post_as:
            postAs === "anonymous"
              ? 1
              : 2,

          your_name:
            postAs !== "anonymous"
              ? yourName
              : "anonymous",

          school_association: schoolAssociation,

          sentiments,
          AI_sentiment: aiReportAnalysis.sentiment,

          AI_riskLevel: aiReportAnalysis.risk_level,

          AI_teacherStrength:
            aiReportAnalysis.teacher_strengths,

          AI_teacherIssues:
            aiReportAnalysis.teacher_issues,

          AI_schoolStrength:
            aiReportAnalysis.school_strengths,

          AI_schoolIssues:
            aiReportAnalysis.school_issues,
          publish: publishImmediately,
          publish_delay_days: delayDays,
          created_at: createdDate,
          scheduled_publish_at: scheduledPublishAt.toISOString(),
        },
      ])
      .select();

    if (error) {
      console.error("Supabase Error:", error);

      // 23505 = unique_violation. Catches the race where two requests for
      // the same Job ID pass the pre-check above at the same time - the
      // database's unique index on reports.job_id is the final guard.
      if (error.code === "23505") {
        return NextResponse.json(
          {
            error: "Job ID already used",
            message: "A report has already been submitted for this Job ID.",
            field: "jobId",
          },
          { status: 409 }
        );
      }

      return NextResponse.json(
        {
          error: error.message,
        },
        {
          status: 500,
        }
      );
    }
  

      const { data: admins, error: adminsError } = await supabase
        .from("users")
        .select("email")
        .eq("role", "admin");

      if (adminsError) {
        console.error("Unable to look up super admins:", adminsError);
      } else {
        const recipients = admins
          .map((admin) => admin.email)
          .filter((email): email is string => Boolean(email));

        if (recipients.length > 0) {
          try {
            await sendGuestTeacherReportNotification(
              recipients,
              `${getAppUrl(req)}/admin/reports`
            );
          } catch (notificationError) {
            console.error("Unable to send report notification:", notificationError);
          }
        }
      }
   

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Server Error:", error);

    return NextResponse.json(
      {
        error: "Insert failed",
      },
      {
        status: 500,
      }
    );
  }
}
