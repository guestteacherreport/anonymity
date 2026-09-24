// Builds the admin Data Export CSV from rows of the `reports` table (with the
// embedded `schools(city, state)` record). Shared by the export, export-all
// and export-record routes so all three downloads have the same layout.

type ReportRow = Record<string, unknown> & {
  schools?: { city: string | null; state: string | null } | null;
};

type Column = {
  header: string;
  value: (row: ReportRow, timeZone: string) => string;
};

const YES_NO_MAYBE: Record<number, string> = { 1: "Yes", 2: "No", 3: "Maybe" };
const POST_AS: Record<number, string> = { 1: "Anonymous", 2: "Public" };
const STATUS: Record<number, string> = { 1: "Pending", 2: "Approved", 3: "Rejected" };

function text(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) return value.map(text).filter(Boolean).join("; ");
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function mapped(map: Record<number, string>) {
  return (value: unknown) => {
    if (value === null || value === undefined || value === "") return "";
    return map[Number(value)] ?? String(value);
  };
}

// "2026-09-15" (a date column) -> "09-15-2026", without going through Date so
// the day can't shift with the server's timezone.
function formatDateOnly(value: unknown): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(text(value));
  return match ? `${match[2]}-${match[3]}-${match[1]}` : text(value);
}

// Timestamps -> "09-17-2026 03:45 PM" in the admin's timezone.
function formatTimestamp(value: unknown, timeZone: string): string {
  if (!value) return "";
  const date = new Date(String(value));
  if (isNaN(date.getTime())) return text(value);
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
      .formatToParts(date)
      .map((p) => [p.type, p.value])
  );
  return `${parts.month}-${parts.day}-${parts.year} ${parts.hour}:${parts.minute} ${parts.dayPeriod}`;
}

const RATING_KEYS = [
  "classroom_behavior",
  "lesson_preparedness",
  "staff_friendliness",
  "school_cleanliness",
  "support_level",
];

function averageRating(row: ReportRow): string {
  const ratings = RATING_KEYS.map((k) => Number(row[k])).filter((n) => n > 0);
  if (ratings.length === 0) return "";
  return (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1);
}

const field = (key: string) => (row: ReportRow) => text(row[key]);

// Columns in the order they appear in the spreadsheet, grouped as:
// report info -> assignment -> ratings -> written feedback -> publishing ->
// AI analysis -> internal IDs.
const COLUMNS: (Column & { keys: string[] })[] = [
  { header: "Report ID", keys: ["id"], value: field("id") },
  { header: "Submitted On", keys: ["created_at"], value: (r, tz) => formatTimestamp(r.created_at, tz) },
  { header: "Status", keys: ["status"], value: (r) => mapped(STATUS)(r.status) },
  { header: "Posted As", keys: ["post_as"], value: (r) => mapped(POST_AS)(r.post_as) },
  { header: "Reporter Name", keys: ["your_name"], value: field("your_name") },

  { header: "Job ID", keys: ["job_id"], value: field("job_id") },
  { header: "Date of Assignment", keys: ["date_of_assignment"], value: (r) => formatDateOnly(r.date_of_assignment) },
  { header: "School Name", keys: ["school_name"], value: field("school_name") },
  // City/state come from the schools table (source of truth), falling back to
  // the copy stored on the report.
  { header: "City", keys: ["city"], value: (r) => text(r.schools?.city ?? r.city) },
  { header: "State", keys: [], value: (r) => text(r.schools?.state) },
  { header: "School Association", keys: ["school_association"], value: field("school_association") },
  { header: "Teacher Name", keys: ["teacher_name"], value: field("teacher_name") },
  { header: "Grade Level", keys: ["grade_level"], value: field("grade_level") },

  { header: "Classroom Behavior (1-5)", keys: ["classroom_behavior"], value: field("classroom_behavior") },
  { header: "Lesson Preparedness (1-5)", keys: ["lesson_preparedness"], value: field("lesson_preparedness") },
  { header: "Staff Friendliness (1-5)", keys: ["staff_friendliness"], value: field("staff_friendliness") },
  { header: "School Cleanliness (1-5)", keys: ["school_cleanliness"], value: field("school_cleanliness") },
  { header: "Support Level (1-5)", keys: ["support_level"], value: field("support_level") },
  { header: "Average Rating", keys: [], value: averageRating },

  { header: "Tags", keys: ["tags"], value: field("tags") },
  { header: "Feedback", keys: ["feedback"], value: field("feedback") },
  { header: "Would Return to School", keys: ["return_to_school"], value: (r) => mapped(YES_NO_MAYBE)(r.return_to_school) },
  { header: "School Comment", keys: ["school_comment"], value: field("school_comment") },
  { header: "Would Return to Teacher", keys: ["return_to_teacher"], value: (r) => mapped(YES_NO_MAYBE)(r.return_to_teacher) },
  { header: "Teacher Comment", keys: ["teacher_comment"], value: field("teacher_comment") },

  { header: "Publish Immediately", keys: ["publish"], value: (r) => (r.publish === null || r.publish === undefined ? "" : Number(r.publish) === 1 ? "Yes" : "No") },
  { header: "Publish Delay (days)", keys: ["publish_delay_days"], value: field("publish_delay_days") },
  { header: "Scheduled Publish Date", keys: ["scheduled_publish_at"], value: (r, tz) => formatTimestamp(r.scheduled_publish_at, tz) },

  { header: "Sentiments", keys: ["sentiments"], value: field("sentiments") },
  { header: "AI Sentiment", keys: ["AI_sentiment"], value: field("AI_sentiment") },
  { header: "AI Risk Level", keys: ["AI_riskLevel"], value: field("AI_riskLevel") },
  { header: "AI Teacher Strengths", keys: ["AI_teacherStrength"], value: field("AI_teacherStrength") },
  { header: "AI Teacher Issues", keys: ["AI_teacherIssues"], value: field("AI_teacherIssues") },
  { header: "AI School Strengths", keys: ["AI_schoolStrength"], value: field("AI_schoolStrength") },
  { header: "AI School Issues", keys: ["AI_schoolIssues"], value: field("AI_schoolIssues") },

  { header: "School ID", keys: ["school_id"], value: field("school_id") },
  { header: "Teacher ID", keys: ["teacher_id"], value: field("teacher_id") },
  { header: "User ID", keys: ["user_id"], value: field("user_id") },
];

const KNOWN_KEYS = new Set(["schools", ...COLUMNS.flatMap((c) => c.keys)]);

// "some_column" / "someColumn" -> "Some Column", for columns added to the
// table later that don't have a label above yet.
function titleCase(key: string): string {
  return key
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function escapeCsv(value: string): string {
  return /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

function resolveTimeZone(timeZone: string | null | undefined): string {
  try {
    if (timeZone) {
      new Intl.DateTimeFormat("en-US", { timeZone });
      return timeZone;
    }
  } catch {
    // Unknown timezone name - fall through to UTC.
  }
  return "UTC";
}

export function buildReportsCsv(rows: ReportRow[] | null, timeZone?: string | null): string {
  const data = [...(rows || [])];
  if (data.length === 0) {
    return "No data available";
  }

  const tz = resolveTimeZone(timeZone);

  // Newest reports first.
  data.sort((a, b) => String(b.created_at ?? "").localeCompare(String(a.created_at ?? "")));

  // Keep any columns not listed above so nothing is silently dropped.
  const extraKeys = Array.from(new Set(data.flatMap((row) => Object.keys(row)))).filter(
    (key) => !KNOWN_KEYS.has(key)
  );
  const columns: Column[] = [
    ...COLUMNS,
    ...extraKeys.map((key) => ({ header: titleCase(key), value: field(key) })),
  ];

  const lines = [
    columns.map((c) => escapeCsv(c.header)).join(","),
    ...data.map((row) => columns.map((c) => escapeCsv(c.value(row, tz))).join(",")),
  ];

  // BOM so Excel opens the file as UTF-8 (keeps dashes, apostrophes and
  // accented names intact).
  return "﻿" + lines.join("\r\n");
}
