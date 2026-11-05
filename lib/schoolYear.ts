// School years run August -> July, labelled "2026-2027".

export const SCHOOL_YEAR_OPTION_COUNT = 5;
export const SCHOOL_YEAR_FIRST_START = 2000;
export const SCHOOL_YEAR_FUTURE_YEARS = 20;

// Every school year an admin can pick from the "Other year" dropdown:
// 2000-2001 through 20 years past the current school year, newest first.
export function getAllSchoolYearChoices(now: Date = new Date()): string[] {
  const currentStart = Number(getCurrentSchoolYear(now).slice(0, 4));
  const years: string[] = [];
  for (let start = currentStart + SCHOOL_YEAR_FUTURE_YEARS; start >= SCHOOL_YEAR_FIRST_START; start--) {
    years.push(`${start}-${start + 1}`);
  }
  return years;
}

export function getCurrentSchoolYear(now: Date = new Date()): string {
  const startYear = now.getMonth() >= 7 ? now.getFullYear() : now.getFullYear() - 1;
  return `${startYear}-${startYear + 1}`;
}

// Selectable years for admin school forms: the current school year and the
// following ones, so the list rolls forward on its own each August and past
// years drop off.
export function getSchoolYearOptions(
  now: Date = new Date(),
  count: number = SCHOOL_YEAR_OPTION_COUNT
): string[] {
  const startYear = Number(getCurrentSchoolYear(now).slice(0, 4));
  return Array.from({ length: count }, (_, i) => `${startYear + i}-${startYear + i + 1}`);
}
