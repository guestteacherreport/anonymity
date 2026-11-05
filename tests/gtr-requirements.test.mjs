// Run with: node --experimental-strip-types --test tests/gtr-requirements.test.mjs
//
// Pure checks for: About GTR label, MM-DD-YYYY assignment date, rolling
// school-year options and bulk teacher add rules. Nothing here touches the
// database, email or network.
import { test } from "node:test";
import assert from "node:assert/strict";
import { formatDateOnlyMDY, parseDateOnly, toDateOnly } from "../lib/dateOnly.ts";
import { getAllSchoolYearChoices, getCurrentSchoolYear, getSchoolYearOptions } from "../lib/schoolYear.ts";
import { parseTeacherNames, planBulkTeachers, teacherNameKey } from "../lib/teacherBulk.ts";
import { contentPageDefaults, mergeContentPage } from "../lib/content-page-schema.ts";

// ── About GTR ───────────────────────────────────────────────────────────────

test("about hero label defaults to About GTR", () => {
  assert.equal(contentPageDefaults.about.heroEyebrow, "About GTR");
  assert.equal(mergeContentPage("about", null).heroEyebrow, "About GTR");
});

test("a saved page still holding the old 'About Us' default shows About GTR", () => {
  assert.equal(mergeContentPage("about", { heroEyebrow: "About Us" }).heroEyebrow, "About GTR");
});

test("an admin's own custom hero label is kept", () => {
  assert.equal(mergeContentPage("about", { heroEyebrow: "Who we are" }).heroEyebrow, "Who we are");
});

test("home page labels are unaffected", () => {
  assert.equal(mergeContentPage("home", { heroEyebrow: "About Us" }).heroEyebrow, "About Us");
});

// ── Assignment date (MM-DD-YYYY, no timezone shift) ─────────────────────────

test("stored YYYY-MM-DD is shown as MM-DD-YYYY", () => {
  assert.equal(formatDateOnlyMDY("2026-10-05"), "10-05-2026");
  assert.equal(formatDateOnlyMDY("2026-01-01T00:00:00+00:00"), "01-01-2026");
  assert.equal(formatDateOnlyMDY(""), "");
  assert.equal(formatDateOnlyMDY(null), "");
});

test("picker round-trip keeps the same calendar day", () => {
  for (const value of ["2026-01-01", "2026-03-08", "2026-11-01", "2026-12-31", "2024-02-29"]) {
    assert.equal(toDateOnly(parseDateOnly(value)), value);
  }
});

test("parseDateOnly is local midnight, not UTC", () => {
  const d = parseDateOnly("2026-10-05");
  assert.equal(d.getFullYear(), 2026);
  assert.equal(d.getMonth(), 9);
  assert.equal(d.getDate(), 5);
  assert.equal(parseDateOnly("not a date"), null);
  assert.equal(parseDateOnly(""), null);
});

// ── School year options ─────────────────────────────────────────────────────

test("school year switches in August", () => {
  assert.equal(getCurrentSchoolYear(new Date(2026, 6, 31)), "2025-2026");
  assert.equal(getCurrentSchoolYear(new Date(2026, 7, 1)), "2026-2027");
});

test("options start at the current school year and run forward", () => {
  const options = getSchoolYearOptions(new Date(2026, 10, 3));
  assert.deepEqual(options, ["2026-2027", "2027-2028", "2028-2029", "2029-2030", "2030-2031"]);
  for (const past of ["2021-2022", "2022-2023", "2023-2024", "2024-2025", "2025-2026"]) {
    assert.ok(!options.includes(past), `${past} should not be offered`);
  }
});

test("options roll forward each year without a code change", () => {
  assert.equal(getSchoolYearOptions(new Date(2027, 8, 1))[0], "2027-2028");
  assert.equal(getSchoolYearOptions(new Date(2031, 0, 15))[0], "2030-2031");
});

test("'Other year' dropdown covers any past or future year", () => {
  const all = getAllSchoolYearChoices(new Date(2026, 10, 5));
  assert.equal(all[0], "2046-2047");
  assert.equal(all[all.length - 1], "2000-2001");
  for (const year of ["2021-2022", "2025-2026", "2026-2027", "2035-2036"]) {
    assert.ok(all.includes(year), `${year} should be selectable`);
  }
});

// ── Bulk teacher add ────────────────────────────────────────────────────────

test("names are one per line, trimmed, blanks dropped, commas kept", () => {
  assert.deepEqual(parseTeacherNames("  Jane  Smith \r\n\nSmith, John\n   \n"), ["Jane Smith", "Smith, John"]);
  assert.deepEqual(parseTeacherNames(["A", 3, " B "]), ["A", "B"]);
  assert.deepEqual(parseTeacherNames(undefined), []);
});

test("duplicates within the list and on the roster are skipped", () => {
  const plan = planBulkTeachers(
    ["Jane Smith", "jane  smith", "John Doe", "Existing Teacher", "New One"],
    ["EXISTING teacher", "Someone Else"]
  );
  assert.deepEqual(plan.toAdd, ["Jane Smith", "John Doe", "New One"]);
  assert.deepEqual(plan.duplicatesInList, ["jane  smith"]);
  assert.deepEqual(plan.alreadyAtSchool, ["Existing Teacher"]);
  assert.deepEqual(plan.tooLong, []);
});

test("overlong names are rejected", () => {
  const long = "x".repeat(256);
  assert.deepEqual(planBulkTeachers([long, "Ok"], []).tooLong, [long]);
});

test("name key ignores case and spacing", () => {
  assert.equal(teacherNameKey("  Mary   Ann  LEE "), "mary ann lee");
});
