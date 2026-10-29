// Run with: node --experimental-strip-types --test tests/feedback-only.test.mjs
//
// Pure checks for the "Feedback only" (no Job ID) submissions. Nothing here
// touches the database, email or network. Database-level behaviour (check
// constraint, trigger, daily limit under concurrency, RLS) is covered by
// supabase/tests/feedback_only_reports.sql, which must be run against a
// non-production database.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  classifySubmission,
  FEEDBACK_ONLY_DAILY_LIMIT,
  FEEDBACK_ONLY_LIMIT_MESSAGE,
  isFeedbackOnly,
  startOfUtcDay,
} from "../lib/feedbackOnly.ts";
import { buildReportsCsv } from "../lib/reportsCsv.ts";
import { buildFeedbackOnlyNotificationEmail } from "../lib/email.ts";

// Line endings normalised: the working tree may be CRLF (core.autocrlf).
const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8").replace(/\r\n/g, "\n");

// ── Submission classification (auth + Job ID rules) ─────────────────────────

test("guest teacher with the checkbox and no Job ID -> feedback only", () => {
  assert.deepEqual(classifySubmission({ feedbackOnly: true, jobId: "" }, "guest_teacher"), {
    ok: true,
    feedbackOnly: true,
    jobId: null,
  });
  assert.deepEqual(classifySubmission({ feedbackOnly: true }, "guest_teacher"), {
    ok: true,
    feedbackOnly: true,
    jobId: null,
  });
  assert.equal(classifySubmission({ feedbackOnly: true, jobId: "   " }, "guest_teacher").ok, true);
});

test("non-guest-teacher roles cannot submit feedback only", () => {
  for (const role of ["admin", null, undefined, "", "GUEST_TEACHER", "guest_teacher "]) {
    const result = classifySubmission({ feedbackOnly: true, jobId: "" }, role);
    assert.equal(result.ok, false, `role ${JSON.stringify(role)}`);
    assert.equal(result.status, 403);
  }
});

test("feedback only with a Job ID is rejected (can't claim a Job ID)", () => {
  const result = classifySubmission({ feedbackOnly: true, jobId: "JOB-1" }, "guest_teacher");
  assert.equal(result.ok, false);
  assert.equal(result.status, 400);
  assert.equal(result.field, "jobId");
});

test("without the checkbox the Job ID is still required", () => {
  for (const body of [{}, { jobId: "" }, { jobId: "  " }, { jobId: null }, { jobId: 123 }, { feedbackOnly: false }]) {
    const result = classifySubmission(body, "guest_teacher");
    assert.equal(result.ok, false, JSON.stringify(body));
    assert.equal(result.status, 400);
    assert.equal(result.message, "Job ID is required");
    assert.equal(result.field, "jobId");
  }
});

test("only a real boolean true selects feedback only - tampered values fall back to the normal flow", () => {
  for (const flag of ["true", 1, "1", "yes", {}, [true]]) {
    const result = classifySubmission({ feedbackOnly: flag, jobId: "" }, "guest_teacher");
    assert.equal(result.ok, false, `flag ${JSON.stringify(flag)}`);
    assert.equal(result.message, "Job ID is required");
  }
  // ...and with a Job ID it is a normal report, never feedback only.
  assert.deepEqual(classifySubmission({ feedbackOnly: "true", jobId: "JOB-9" }, "guest_teacher"), {
    ok: true,
    feedbackOnly: false,
    jobId: "JOB-9",
  });
});

test("normal Job ID report still works for every signed-in role, trimmed as before", () => {
  for (const role of ["guest_teacher", "admin", null]) {
    assert.deepEqual(classifySubmission({ jobId: "  JOB-42 " }, role), {
      ok: true,
      feedbackOnly: false,
      jobId: "JOB-42",
    });
  }
});

test("isFeedbackOnly only trusts a stored boolean true", () => {
  assert.equal(isFeedbackOnly({ feedback_only: true }), true);
  for (const value of [false, null, undefined, "true", 1]) {
    assert.equal(isFeedbackOnly({ feedback_only: value }), false);
  }
  assert.equal(isFeedbackOnly(null), false);
});

// ── Daily limit ─────────────────────────────────────────────────────────────

test("daily limit is 5 per UTC calendar day", () => {
  assert.equal(FEEDBACK_ONLY_DAILY_LIMIT, 5);
  assert.equal(startOfUtcDay(new Date("2026-10-28T23:59:59.999Z")).toISOString(), "2026-10-28T00:00:00.000Z");
  assert.equal(startOfUtcDay(new Date("2026-10-29T00:00:00.000Z")).toISOString(), "2026-10-29T00:00:00.000Z");
  assert.match(FEEDBACK_ONLY_LIMIT_MESSAGE, /limit of 5/);
  assert.match(FEEDBACK_ONLY_LIMIT_MESSAGE, /Job ID are not affected/);
});

test("submit route enforces the limit server-side, only for feedback only", () => {
  const route = read("app/api/submit-report/route.ts");
  const limitBlock = route.slice(route.indexOf("if (feedbackOnly) {"), route.indexOf("// Fast-path duplicate check"));
  assert.match(limitBlock, /\.eq\("user_id", user_id\)/, "counts the session user, not a body value");
  assert.match(limitBlock, /\.eq\("feedback_only", true\)/, "counts only feedback-only rows");
  assert.match(limitBlock, />= FEEDBACK_ONLY_DAILY_LIMIT/);
  assert.match(limitBlock, /status: 429/);
  // The trigger's race-time error is mapped to the same message.
  assert.match(route, /error\.code === "GTF01"/);
});

// ── Submit route wiring ─────────────────────────────────────────────────────

test("submit route: role/Job ID decision comes from the session, not the body", () => {
  const route = read("app/api/submit-report/route.ts");
  assert.match(route, /classifySubmission\(\{ feedbackOnly: body\.feedbackOnly, jobId \}, auth\.session\.user\.role\)/);
  assert.match(route, /const user_id = Number\(auth\.session\.user\.id\)/);
  assert.match(route, /requireSession\(\)/, "signed-out callers still get 401 first");
});

test("submit route: feedback only is stored flagged, unpublishable, and never creates a teacher", () => {
  const route = read("app/api/submit-report/route.ts");
  assert.match(route, /feedback_only: feedbackOnly,/);
  assert.match(route, /job_id: trimmedJobId,/);
  assert.match(route, /scheduled_publish_at: feedbackOnly \? null :/);
  assert.match(route, /publish: feedbackOnly \? 0 :/);
  assert.match(route, /} else if \(!feedbackOnly\) \{\s*\/\/[^\n]*\n[^\n]*\n\s*const \{ data: newTeacher/);
});

test("submit route: feedback only sends the separate email, normal reports keep the original one", () => {
  const route = read("app/api/submit-report/route.ts");
  const mail = route.slice(route.indexOf("if (feedbackOnly) {\n              await sendFeedbackOnlyNotification"));
  assert.ok(mail.length > 0, "feedback-only email branch exists");
  assert.match(mail, /sendFeedbackOnlyNotification\([\s\S]*?\} else \{\s*await sendGuestTeacherReportNotification\(\s*recipients,\s*`\$\{getAppUrl\(req\)\}\/admin\/reports`/);
  // Email failures are still logged, never fail the submission.
  assert.match(route, /catch \(notificationError\) \{\s*console\.error\("Unable to send report notification:"/);
});

// ── Approve / publish ───────────────────────────────────────────────────────

test("approve route refuses feedback only before any update", () => {
  const route = read("app/api/reports/[id]/approve/route.ts");
  const guard = route.indexOf("if (isFeedbackOnly(report))");
  assert.ok(guard > 0);
  assert.ok(guard < route.indexOf(".update("), "guard runs before the status update");
  assert.match(route.slice(guard, guard + 300), /status: 409/);
  assert.match(route, /\.eq\("id", id\)\s*\.eq\("feedback_only", false\)/);
});

test("publishReport refuses feedback only before touching any stats", () => {
  const lib = read("lib/publishReport.ts");
  const guard = lib.indexOf("if (isFeedbackOnly(report))");
  assert.ok(guard > 0);
  assert.ok(guard < lib.indexOf("school_monthly_stats"));
  assert.ok(guard < lib.indexOf("incrementSchoolAnalytics(report)"));
});

test("cron publisher never selects or marks feedback only", () => {
  const cron = read("app/api/cron/publish-reports/route.ts");
  assert.equal(cron.match(/\.eq\("feedback_only", false\)/g)?.length, 2);
});

// ── Public pages, counts, ratings and summaries ─────────────────────────────

const PUBLIC_REPORT_QUERIES = [
  // [file, number of reports queries that must exclude feedback only]
  ["app/api/view-teacher/[id]/route.ts", 4], // total + yes/no/maybe counts
  ["app/api/view-teacher/[id]/reports/route.ts", 1],
  ["app/api/view-school/[id]/reports/route.ts", 1],
  ["app/api/schools/[id]/route.ts", 1],
  ["app/page.tsx", 2], // home page recent reports + total count
  ["lib/updateTeacherAnalytics.ts", 1], // teacher AI summary input
  ["lib/incrementSchoolAnalytics.ts", 1], // school AI summary input
  ["app/api/admin/dashboard-stats/route.ts", 9],
];

for (const [file, expected] of PUBLIC_REPORT_QUERIES) {
  test(`${file} excludes feedback only from every reports query`, () => {
    const source = read(file);
    const reportQueries = source.match(/\.from\("reports"\)/g)?.length ?? 0;
    const exclusions = source.match(/\.eq\("feedback_only", false\)/g)?.length ?? 0;
    assert.equal(reportQueries, expected, "reports query count changed - re-audit this file");
    assert.equal(exclusions, expected);
  });
}

// ── Admin Reports ───────────────────────────────────────────────────────────

test("admin reports API filters by type", () => {
  const route = read("app/api/reports/route.ts");
  assert.match(route, /if \(type === "feedback"\) \{\s*query = query\.eq\("feedback_only", true\);\s*\} else if \(type === "report"\) \{\s*query = query\.eq\("feedback_only", false\);/);
  // still admin only
  assert.match(route, /session\?\.user\?\.role !== "admin"/);
});

test("admin UI labels feedback only, offers the filter and hides Approve/Reject for it", () => {
  const page = read("app/(protected)/admin/(other pages)/reports/page.tsx");
  assert.match(page, /<option value="feedback">Type: Feedback only<\/option>/);
  assert.match(page, /type: typeFilter/);
  assert.match(page, /\{FEEDBACK_ONLY_LABEL\}/);
  assert.match(page, /report\.status === 1 && !report\.feedback_only &&/);

  const panel = read("app/components/ViewReport.tsx");
  assert.match(panel, /\{FEEDBACK_ONLY_LABEL\} · Not for publication/);
  assert.match(panel, /selectedReport\.status == 1 && !selectedReport\.feedback_only &&/);
});

test("admin UI shows Private, not Pending/Approved/Rejected, as the status of feedback only", () => {
  const page = read("app/(protected)/admin/(other pages)/reports/page.tsx");
  assert.match(page, /\{report\.feedback_only \? FEEDBACK_ONLY_STATUS_LABEL : report\.status == 1 \? "Pending"/);
  const panel = read("app/components/ViewReport.tsx");
  assert.match(panel, /\{selectedReport\.feedback_only \? \(\s*<span[^>]*>\s*\{FEEDBACK_ONLY_STATUS_LABEL\}/);
});

test("admin dashboard recent reports labels feedback only and hides Approve/Reject for it", () => {
  const page = read("app/(protected)/admin/(other pages)/dashboard/page.tsx");
  assert.match(page, /report\.feedback_only && \(\s*<span[^>]*>\s*\{FEEDBACK_ONLY_LABEL\}/);
  assert.match(page, /\{report\.feedback_only \? FEEDBACK_ONLY_STATUS_LABEL : report\.status == 1 \? "Pending"/);
  assert.match(page, /report\.status === 1 && !report\.feedback_only &&/);
  assert.doesNotMatch(page, /\{report\.status === 1 && \(/);
});

test("admin Status filter only matches normal reports", () => {
  const route = read("app/api/reports/route.ts");
  assert.match(route, /query = query\.eq\(\s*"status",\s*statusValue\s*\)\.eq\("feedback_only", false\);/);
});

// ── My Reports ──────────────────────────────────────────────────────────────

test("My Reports shows Private feedback and stays scoped to the session user", () => {
  const page = read("app/my-reports/page.tsx");
  assert.match(page, /report\.feedback_only \? \(\s*<PrivateFeedbackBadge \/>/);
  assert.match(page, />\s*Private feedback\s*</);
  const api = read("app/api/reports/search/route.ts");
  assert.match(api, /const userid = session\.user\.id;/);
  assert.match(api, /\.eq\("user_id", userid\)/);
});

// ── CSV ─────────────────────────────────────────────────────────────────────

const baseRow = {
  id: 1,
  created_at: "2026-10-28T10:00:00Z",
  status: 1,
  post_as: 1,
  your_name: "anonymous",
  school_name: "Lincoln High",
  teacher_name: "Ms. Smith",
  feedback: "ok",
  schools: { city: "Austin", state: "TX" },
};

function parseCsv(csv) {
  const [header, ...rows] = csv.replace(/^﻿/, "").split("\r\n");
  const cols = header.split(",");
  return rows.map((row) => Object.fromEntries(row.split(",").map((v, i) => [cols[i], v])));
}

test("CSV labels feedback only and normal reports, with no stray column", () => {
  const csv = buildReportsCsv(
    [
      { ...baseRow, id: 1, job_id: "JOB-1", feedback_only: false, status: 2 },
      { ...baseRow, id: 2, job_id: null, feedback_only: true, created_at: "2026-10-28T11:00:00Z" },
    ],
    "UTC"
  );
  const header = csv.replace(/^﻿/, "").split("\r\n")[0];
  assert.ok(header.split(",").includes("Report Type"));
  assert.ok(!header.includes("Feedback Only"), "feedback_only must not also appear as an auto column");

  const rows = parseCsv(csv);
  const byId = Object.fromEntries(rows.map((r) => [r["Report ID"], r]));
  assert.equal(byId["2"]["Report Type"], "Feedback only");
  assert.equal(byId["2"]["Status"], "Private");
  assert.equal(byId["2"]["Job ID"], "");
  assert.equal(byId["1"]["Report Type"], "Report");
  assert.equal(byId["1"]["Job ID"], "JOB-1");
  assert.equal(byId["1"]["Status"], "Approved");
});

test("CSV for normal reports keeps its existing columns in order", () => {
  const csv = buildReportsCsv([{ ...baseRow, job_id: "JOB-1", feedback_only: false }], "UTC");
  const header = csv.replace(/^﻿/, "").split("\r\n")[0].split(",");
  assert.deepEqual(header.slice(0, 7), ["Report ID", "Submitted On", "Status", "Report Type", "Posted As", "Reporter Name", "Job ID"]);
  assert.equal(header.at(-1), "User ID");
  assert.equal(buildReportsCsv([], "UTC"), "No data available");
});

// ── Email ───────────────────────────────────────────────────────────────────

test("feedback-only email says it is private / not for publication", () => {
  const email = buildFeedbackOnlyNotificationEmail("https://example.test/admin/reports?type=feedback");
  assert.match(email.subject, /^Feedback only — not for publication/);
  assert.match(email.text, /FEEDBACK ONLY — NOT FOR PUBLICATION/);
  assert.match(email.html, /Feedback only — not for publication\./);
  assert.match(email.html, /href="https:\/\/example\.test\/admin\/reports\?type=feedback"/);
  assert.doesNotMatch(email.subject, /Action Required: New Guest Teacher Report Submitted/);
});

test("feedback-only email escapes the link", () => {
  const email = buildFeedbackOnlyNotificationEmail('https://x.test/"><script>');
  assert.doesNotMatch(email.html, /<script>/);
});

test("normal report email is unchanged", () => {
  const lib = read("lib/email.ts");
  assert.match(lib, /subject: "Action Required: New Guest Teacher Report Submitted"/);
});

// ── Database migration ──────────────────────────────────────────────────────

test("migration makes the database the final guard", () => {
  const sql = read("supabase/migrations/20261028000000_feedback_only_reports.sql");
  assert.match(sql, /add column if not exists feedback_only boolean not null default false/);
  for (const clause of [
    "job_id is null",
    "user_id is not null",
    "status is distinct from 2",
    "published_at is null",
    "scheduled_publish_at is null",
    "approval_date is null",
  ]) {
    assert.ok(sql.includes(clause), clause);
  }
  assert.match(sql, /new\.feedback_only is distinct from old\.feedback_only/);
  assert.match(sql, /v_role is distinct from 'guest_teacher'/);
  assert.match(sql, /v_today_count >= 5/);
  assert.match(sql, /pg_advisory_xact_lock/);
  assert.match(sql, /new\.created_at := now\(\)/);
  assert.match(sql, /as restrictive[\s\S]*to anon, authenticated[\s\S]*using \(feedback_only = false\)/);
});

// ── Submit form ─────────────────────────────────────────────────────────────

test("submit form: checkbox only for Guest Teachers, Job ID optional only when checked", () => {
  const page = read("app/submit-report/page.tsx");
  assert.match(page, /if \(!state\.feedbackOnly && !state\.jobId\.trim\(\)\) \{\s*errors\.jobId = "Job ID is required";/);
  assert.match(page, /\{isGuestTeacher && \(\s*<label[^>]*>\s*<input\s+type="checkbox"\s+id="feedbackOnly"/);
  assert.match(page, /I don&apos;t have a Job ID/);
  assert.match(page, /feedbackOnly: false,/);
});
