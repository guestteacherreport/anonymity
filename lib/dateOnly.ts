// Helpers for calendar dates stored as "YYYY-MM-DD" (e.g. reports.date_of_assignment).
// These never go through `new Date("YYYY-MM-DD")`, which parses as UTC
// midnight and shows the previous day in US timezones.

const ISO_DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})/;

// "2026-10-05" -> "10-05-2026". Anything unparseable is returned unchanged.
export function formatDateOnlyMDY(value: string | null | undefined): string {
  if (!value) return "";
  const match = ISO_DATE_ONLY.exec(value);
  return match ? `${match[2]}-${match[3]}-${match[1]}` : value;
}

// "2026-10-05" -> local Date at midnight (for date pickers), or null.
export function parseDateOnly(value: string | null | undefined): Date | null {
  const match = ISO_DATE_ONLY.exec(value || "");
  if (!match) return null;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return isNaN(date.getTime()) ? null : date;
}

// Local Date -> "YYYY-MM-DD" using the local calendar day (not UTC).
export function toDateOnly(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
