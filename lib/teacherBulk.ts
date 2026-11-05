// Shared rules for adding several teachers to one school in a single save
// (Admin > Schools > school > Teachers > "Add Multiple").

export const BULK_TEACHER_LIMIT = 200;
export const TEACHER_NAME_MAX_LENGTH = 255;

// Case- and spacing-insensitive key used to spot duplicate teacher names.
export function teacherNameKey(name: string): string {
  return name.trim().replace(/\s+/g, " ").toLowerCase();
}

// One name per line. Commas are kept as part of the name ("Smith, John").
export function parseTeacherNames(input: unknown): string[] {
  const lines = Array.isArray(input)
    ? input.filter((v): v is string => typeof v === "string")
    : typeof input === "string"
      ? input.split(/\r?\n/)
      : [];
  return lines.map((line) => line.trim().replace(/\s+/g, " ")).filter(Boolean);
}

export type BulkTeacherPlan = {
  toAdd: string[];
  duplicatesInList: string[];
  alreadyAtSchool: string[];
  tooLong: string[];
};

// Splits submitted names into the ones to insert and the ones skipped.
// The first spelling of a repeated name is the one kept.
export function planBulkTeachers(names: string[], existingNames: Iterable<string>): BulkTeacherPlan {
  const existing = new Set(Array.from(existingNames, teacherNameKey));
  const seen = new Set<string>();
  const plan: BulkTeacherPlan = { toAdd: [], duplicatesInList: [], alreadyAtSchool: [], tooLong: [] };

  for (const name of names) {
    const key = teacherNameKey(name);
    if (name.length > TEACHER_NAME_MAX_LENGTH) {
      plan.tooLong.push(name);
    } else if (seen.has(key)) {
      plan.duplicatesInList.push(name);
    } else if (existing.has(key)) {
      plan.alreadyAtSchool.push(name);
    } else {
      plan.toAdd.push(name);
    }
    seen.add(key);
  }

  return plan;
}
