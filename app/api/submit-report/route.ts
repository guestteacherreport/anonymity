import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { analyzeReport } from "@/lib/analyze-report";
import { sendFeedbackOnlyNotification, sendGuestTeacherReportNotification } from "@/lib/email";
import { getAppUrl } from "@/lib/app-url";
import { requireSession } from "@/lib/apiAuth";
import {
  classifySubmission,
  FEEDBACK_ONLY_DAILY_LIMIT,
  FEEDBACK_ONLY_LIMIT_MESSAGE,
  startOfUtcDay,
} from "@/lib/feedbackOnly";

export async function POST(req: Request) {
  try {
    const auth = await requireSession();
    if (auth.response) return auth.response;

    // The report owner always comes from the verified session - any user_id
    // in the request body is ignored so a report can't be filed as someone
    // else.
    const user_id = Number(auth.session.user.id);

    const body = await req.json();

    const {
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

    // Normal Job ID report, or private feedback-only submission ("I don't
    // have a Job ID"). Feedback-only requires the guest_teacher role and an
    // empty Job ID; anything else keeps the Job ID required.
    const kind = classifySubmission({ feedbackOnly: body.feedbackOnly, jobId }, auth.session.user.role);

    if (!kind.ok) {
      return NextResponse.json(
        { error: kind.error, message: kind.message, ...(kind.field ? { field: kind.field } : {}) },
        { status: kind.status }
      );
    }

    const feedbackOnly = kind.feedbackOnly;
    const trimmedJobId = kind.jobId;

    if (feedbackOnly) {
      // Daily limit for feedback-only submissions (normal reports are not
      // counted). The database trigger re-checks this under a lock, so this
      // is only for a clean error in the common case.
      const { count: todayCount, error: countError } = await supabase
        .from("reports")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user_id)
        .eq("feedback_only", true)
        .gte("created_at", startOfUtcDay().toISOString());

      if (countError) {
        return NextResponse.json({ error: countError.message }, { status: 500 });
      }

      if ((todayCount ?? 0) >= FEEDBACK_ONLY_DAILY_LIMIT) {
        return NextResponse.json(
          { error: "Daily feedback limit reached", message: FEEDBACK_ONLY_LIMIT_MESSAGE },
          { status: 429 }
        );
      }
    }

    // Fast-path duplicate check. The unique index on reports.job_id is the
    // authoritative guard against a race between two concurrent requests
    // for the same Job ID - this check just gives a clean error for the
    // common case without waiting on that race.
    const { data: existingReport, error: existingReportError } = trimmedJobId
      ? await supabase
          .from("reports")
          .select("id")
          .eq("job_id", trimmedJobId)
          .maybeSingle()
      : { data: null, error: null };

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

    // Feedback-only submissions are never published, so they have no
    // publishing preference.
    const shouldDelayPublishing = !feedbackOnly && (publishImmediately == 0);
    const delayDays = shouldDelayPublishing ? Number(publishDelayDays) : 0;

    if (shouldDelayPublishing && (!Number.isInteger(delayDays) || delayDays < 1)) {
      return NextResponse.json({ error: "A valid publishing delay is required" }, { status: 400 });
    }

    // Resolve the teacher: use the selected teacherId if one came from the
    // dropdown, otherwise treat teacherName as a custom entry - reuse a
    // matching teacher at this school if one already exists (case-insensitive),
    // or create a new teacher record for it.
    let resolvedTeacherId = teacherId || null;
    const trimmedTeacherName = typeof teacherName === "string" ? teacherName.trim() : "";

    if (!resolvedTeacherId && trimmedTeacherName && schoolId) {
      const escapedTeacherName = trimmedTeacherName.replace(/[%_\\]/g, (match) => `\\${match}`);

      const { data: existingTeacher, error: existingTeacherError } = await supabase
        .from("teachers")
        .select("id")
        .eq("school_id", schoolId)
        .ilike("name", escapedTeacherName)
        .maybeSingle();

      if (existingTeacherError) {
        return NextResponse.json({ error: existingTeacherError.message }, { status: 500 });
      }

      if (existingTeacher) {
        resolvedTeacherId = existingTeacher.id;
      } else if (!feedbackOnly) {
        // Private feedback must never create a (public) teacher profile - it
        // keeps the typed name in teacher_name only.
        const { data: newTeacher, error: newTeacherError } = await supabase
          .from("teachers")
          .insert({ name: trimmedTeacherName, school_id: schoolId, status: 1 })
          .select("id")
          .single();

        if (newTeacherError) {
          return NextResponse.json({ error: newTeacherError.message }, { status: 500 });
        }

        resolvedTeacherId = newTeacher.id;
      }
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
          feedback_only: feedbackOnly,
          city,
          school_name: schoolName,

          school_id: schoolId || null,

          teacher_id: resolvedTeacherId,

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
          publish: feedbackOnly ? 0 : publishImmediately,
          publish_delay_days: delayDays,
          created_at: createdDate,
          scheduled_publish_at: feedbackOnly ? null : scheduledPublishAt.toISOString(),
        },
      ])
      .select();

    if (error) {
      console.error("Supabase Error:", error);

      // 23505 = unique_violation. Catches the race where two requests for
      // the same Job ID pass the pre-check above at the same time - the
      // database's unique index on reports.job_id is the final guard.
      // GTF01 = feedback-only daily limit, raised by the reports trigger
      // when concurrent requests race past the count above.
      if (error.code === "GTF01") {
        return NextResponse.json(
          { error: "Daily feedback limit reached", message: FEEDBACK_ONLY_LIMIT_MESSAGE },
          { status: 429 }
        );
      }

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
            // Feedback-only gets its own "not for publication" email instead
            // of the normal awaiting-approval notification.
            if (feedbackOnly) {
              await sendFeedbackOnlyNotification(
                recipients,
                `${getAppUrl(req)}/admin/reports?type=feedback`
              );
            } else {
              await sendGuestTeacherReportNotification(
                recipients,
                `${getAppUrl(req)}/admin/reports`
              );
            }
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
