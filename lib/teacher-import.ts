import * as XLSX from "xlsx";

export type TeacherImportRecord = {
  name: string;
  school_id: string;
  status: number;
};

const NAME_HEADERS = new Set([
  "name",
  "teacher",
  "teacher name",
  "teacher_name",
  "full name",
  "fullname",
]);

function normalizeHeader(header: string): string {
  return header.trim().toLowerCase().replace(/\s+/g, " ");
}

function parseDelimitedText(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        cell += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (!inQuotes && (char === "," || char === "\t")) {
      row.push(cell.trim());
      cell = "";
      continue;
    }

    if (!inQuotes && (char === "\n" || char === "\r")) {
      if (char === "\r" && next === "\n") {
        i++;
      }
      row.push(cell.trim());
      if (row.some((value) => value.length > 0)) {
        rows.push(row);
      }
      row = [];
      cell = "";
      continue;
    }

    cell += char;
  }

  row.push(cell.trim());
  if (row.some((value) => value.length > 0)) {
    rows.push(row);
  }

  return rows;
}

function rowToName(
  row: Record<string, unknown> | string[],
  nameColumnIndex?: number
): string {
  if (Array.isArray(row)) {
    if (nameColumnIndex !== undefined && nameColumnIndex >= 0) {
      return String(row[nameColumnIndex] ?? "").trim();
    }
    return String(row[0] ?? "").trim();
  }

  for (const [header, value] of Object.entries(row)) {
    const normalized = normalizeHeader(header);
    if (NAME_HEADERS.has(normalized)) {
      return String(value ?? "").trim();
    }
  }

  const firstValue = Object.values(row)[0];
  return String(firstValue ?? "").trim();
}

export function parseTeacherCsv(
  buffer: ArrayBuffer,
  schoolId: string,
  status = 1
): TeacherImportRecord[] {
  const text = new TextDecoder("utf-8").decode(buffer);
  const matrix = parseDelimitedText(text);

  if (matrix.length === 0) {
    return [];
  }

  const seen = new Set<string>();
  const teachers: TeacherImportRecord[] = [];

  const firstRow = matrix[0].map((cell) => normalizeHeader(cell));
  const nameColumnIndex = firstRow.findIndex((cell) =>
    NAME_HEADERS.has(cell)
  );
  const hasHeader = nameColumnIndex >= 0;
  const dataRows = hasHeader ? matrix.slice(1) : matrix;

  for (const row of dataRows) {
    const name = rowToName(row, hasHeader ? nameColumnIndex : 0);
    if (!name) {
      continue;
    }

    const key = name.toLowerCase();
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);

    teachers.push({
      name,
      school_id: schoolId,
      status,
    });
  }

  return teachers;
}

export function parseTeacherSpreadsheet(
  buffer: ArrayBuffer,
  schoolId: string,
  status = 1
): TeacherImportRecord[] {
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    return [];
  }

  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: "",
  });

  const seen = new Set<string>();
  const teachers: TeacherImportRecord[] = [];

  for (const row of rows) {
    const name = rowToName(row);
    if (!name) {
      continue;
    }

    const key = name.toLowerCase();
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);

    teachers.push({
      name,
      school_id: schoolId,
      status,
    });
  }

  return teachers;
}

export function parseTeacherFile(
  buffer: ArrayBuffer,
  fileName: string,
  schoolId: string,
  status = 1
): TeacherImportRecord[] {
  const lower = fileName.toLowerCase();
  if (lower.endsWith(".csv")) {
    return parseTeacherCsv(buffer, schoolId, status);
  }
  if (lower.endsWith(".xlsx") || lower.endsWith(".xls")) {
    return parseTeacherSpreadsheet(buffer, schoolId, status);
  }
  return parseTeacherCsv(buffer, schoolId, status);
}

export function chunkArray<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}
