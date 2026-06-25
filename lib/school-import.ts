import * as XLSX from "xlsx";

export type SchoolImportRecord = {
  school_name: string;
  street_address: string;
  city: string;
  state: string;
  zipcode: string;
  school_association: string;
  school_district_name: string | null;
  school_year: string;
  grade_level: string[];
  phone: string;
};

const HEADER_MAP = {
  "school name": "school_name",
  schoolname: "school_name",
  name: "school_name",

  "street address": "street_address",
  address: "street_address",
  street: "street_address",

  city: "city",
  state: "state",

  zip: "zipcode",
  zipcode: "zipcode",
  "zip code": "zipcode",
  postalcode: "zipcode",
  "postal code": "zipcode",

  district: "school_district_name",
  "school district": "school_district_name",

  grade: "grade_level",
  grades: "grade_level",
  "grade level": "grade_level",

  phone: "phone",
  telephone: "phone",
} as const;

type MappedField = (typeof HEADER_MAP)[keyof typeof HEADER_MAP];

function normalizeHeader(header: string): string {
  return header
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

export function getCurrentSchoolYear(): string {
  const now = new Date();
  const startYear =
    now.getMonth() >= 7
      ? now.getFullYear()
      : now.getFullYear() - 1;

  return `${startYear}-${startYear + 1}`;
}

export function inferAssociationFromFilename(
  filename: string
): string {
  const lower = filename.toLowerCase();

  if (
    lower.includes("charter") &&
    lower.includes("private")
  ) {
    return "Public, Charter & Private";
  }

  if (lower.includes("private")) {
    return "Private";
  }

  if (lower.includes("charter")) {
    return "Charter";
  }

  return "Public";
}

function getCell(
  row: Record<string, unknown>,
  field: MappedField
): string {
  for (const [header, value] of Object.entries(row)) {
    const mapped =
      HEADER_MAP[
        normalizeHeader(header) as keyof typeof HEADER_MAP
      ];

    if (mapped === field) {
      return String(value ?? "").trim();
    }
  }

  return "";
}

function mapRow(
  row: Record<string, unknown>,
  association: string,
  schoolYear: string
): SchoolImportRecord | null {
  const school_name = getCell(row, "school_name").trim();

  if (!school_name) {
    return null;
  }

  const city = getCell(row, "city").trim();

  // if (!city) {
  //   return null;
  // }

  const zipcode = getCell(row, "zipcode")
    .replace(/\.0$/, "")
    .trim();

  const district =
    getCell(row, "school_district_name").trim();

  const gradeRaw =
    getCell(row, "grade_level").trim();

  const grade_level = gradeRaw
    ? gradeRaw
        .split(",")
        .map((g) => g.trim())
        .filter(Boolean)
    : [];

  return {
    school_name,
    street_address: getCell(row, "street_address"),
    city : city ?? "",
    state: getCell(row, "state"),
    zipcode,
    school_association: "School District",
    school_district_name: district || null,
    school_year: schoolYear,
    grade_level,
    phone: getCell(row, "phone"),
  };
}

export function parseSchoolExcel(
  buffer: ArrayBuffer,
  filename: string
): SchoolImportRecord[] {
  const workbook = XLSX.read(buffer, {
    type: "array",
  });

  const sheetName = workbook.SheetNames[0];

  if (!sheetName) {
    return [];
  }

  const sheet = workbook.Sheets[sheetName];

  const rows =
    XLSX.utils.sheet_to_json<Record<string, unknown>>(
      sheet,
      {
        defval: "",
      }
    );

  if (rows.length > 0) {
    console.log(
      "Excel Headers:",
      Object.keys(rows[0])
    );
  }

  const association =
    inferAssociationFromFilename(filename);

  const schoolYear = getCurrentSchoolYear();

  const seen = new Set<string>();

  const schools: SchoolImportRecord[] = [];

  for (const row of rows) {
    const school = mapRow(
      row,
      association,
      schoolYear
    );

    if (!school) {
      continue;
    }

    const key =
      `${school.school_name}|${school.state}|${school.zipcode}|${school.street_address}`
        .toLowerCase()
        .trim();

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);

    schools.push(school);
  }

  console.log(
    `${filename}: Parsed ${schools.length} schools`
  );

  return schools;
}

export function chunkArray<T>(
  items: T[],
  size: number
): T[][] {
  const chunks: T[][] = [];

  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }

  return chunks;
}