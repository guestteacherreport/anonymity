// "Feedback only" submissions: private feedback a signed-in Guest Teacher
// sends from the Submit Report form when they don't have a Job ID. They are
// stored in the reports table with feedback_only = true and must never be
// approved, published or counted anywhere public. The database enforces the
// same rules (supabase/migrations/20261028000000_feedback_only_reports.sql);
// this module is the application-side half and has no imports so it can be
// unit tested directly (tests/feedback-only.test.mjs).

export const FEEDBACK_ONLY_DAILY_LIMIT = 5;

export const FEEDBACK_ONLY_LABEL = "Feedback only";

// Shown in place of Pending/Approved/Rejected: feedback only never goes
// through approval.
export const FEEDBACK_ONLY_STATUS_LABEL = "Private";

// Daily limit window: the UTC calendar day, matching the rest of the
// server-side date handling (scheduled_publish_at, cron publish months). The
// database trigger uses the same window.
export function startOfUtcDay(now: Date = new Date()): Date {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

export const FEEDBACK_ONLY_LIMIT_MESSAGE =
  `You have reached the limit of ${FEEDBACK_ONLY_DAILY_LIMIT} private feedback submissions for today. ` +
  "Please try again tomorrow (the limit resets at midnight UTC). Reports with a Job ID are not affected.";

export type SubmissionKind =
  | { ok: true; feedbackOnly: false; jobId: string }
  | { ok: true; feedbackOnly: true; jobId: null }
  | { ok: false; status: number; error: string; message: string; field?: string };

// Decides whether a Submit Report request is a normal Job ID report or a
// feedback-only submission, from the request body and the session role.
// Only an explicit boolean `feedbackOnly: true` selects feedback-only, so a
// missing/garbled flag falls back to the normal flow, where the Job ID stays
// required exactly as before.
export function classifySubmission(
  body: { feedbackOnly?: unknown; jobId?: unknown },
  role: string | null | undefined
): SubmissionKind {
  const trimmedJobId = typeof body.jobId === "string" ? body.jobId.trim() : "";

  if (body.feedbackOnly === true) {
    if (role !== "guest_teacher") {
      return {
        ok: false,
        status: 403,
        error: "Forbidden",
        message: "Only signed-in Guest Teachers can submit feedback without a Job ID.",
      };
    }

    // A feedback-only submission never carries a Job ID - otherwise it could
    // claim a Job ID that a real report needs later.
    if (trimmedJobId) {
      return {
        ok: false,
        status: 400,
        error: "Job ID not allowed",
        message: "Leave the Job ID empty when submitting feedback without a Job ID.",
        field: "jobId",
      };
    }

    return { ok: true, feedbackOnly: true, jobId: null };
  }

  if (!trimmedJobId) {
    return {
      ok: false,
      status: 400,
      error: "Job ID is required",
      message: "Job ID is required",
      field: "jobId",
    };
  }

  return { ok: true, feedbackOnly: false, jobId: trimmedJobId };
}

export function isFeedbackOnly(report: { feedback_only?: unknown } | null | undefined): boolean {
  return report?.feedback_only === true;
}
