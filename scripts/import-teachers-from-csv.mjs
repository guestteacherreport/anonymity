/**
 * Bulk import teachers from a local CSV file.
 *
 * Usage:
 *   node scripts/import-teachers-from-csv.mjs "D:\path\to\teachers.csv"
 *
 * Defaults: school_id=15680, status=1
 */

import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

const SCHOOL_ID = process.env.TEACHER_IMPORT_SCHOOL_ID || "15680";
const STATUS = 1;
const BATCH_SIZE = 200;

function loadEnvLocal() {
  try {
    const envPath = path.join(process.cwd(), ".env.local");
    const content = fs.readFileSync(envPath, "utf8");
    for (const line of content.split("\n")) {
      const match = line.match(/^([^#=]+)=(.*)$/);
      if (!match) continue;
      const key = match[1].trim();
      const value = match[2].trim().replace(/^["']|["']$/g, "");
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    // optional
  }
}

function parseCsv(text) {
  const rows = [];
  let row = [];
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
      if (char === "\r" && next === "\n") i++;
      row.push(cell.trim());
      if (row.some((v) => v)) rows.push(row);
      row = [];
      cell = "";
      continue;
    }

    cell += char;
  }

  row.push(cell.trim());
  if (row.some((v) => v)) rows.push(row);
  return rows;
}

function parseNames(csvPath) {
  const text = fs.readFileSync(csvPath, "utf8");
  const matrix = parseCsv(text);
  if (!matrix.length) return [];

  const headers = matrix[0].map((h) => h.toLowerCase());
  const nameIdx = headers.findIndex((h) =>
    ["name", "teacher", "teacher name", "teacher_name"].includes(h)
  );
  const dataRows = nameIdx >= 0 ? matrix.slice(1) : matrix;
  const col = nameIdx >= 0 ? nameIdx : 0;

  const seen = new Set();
  const names = [];

  for (const row of dataRows) {
    const name = String(row[col] ?? "").trim();
    if (!name) continue;
    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    names.push(name);
  }

  return names;
}

loadEnvLocal();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error("Missing Supabase env vars in .env.local");
  process.exit(1);
}

const csvPath = process.argv[2];
if (!csvPath || !fs.existsSync(csvPath)) {
  console.error(
    'Usage: node scripts/import-teachers-from-csv.mjs "<path-to-teachers.csv>"'
  );
  process.exit(1);
}

const supabase = createClient(url, key);
const names = parseNames(csvPath);

console.log(`Parsed ${names.length} teachers from ${csvPath}`);
console.log(`school_id=${SCHOOL_ID}, status=${STATUS}`);

let inserted = 0;
let skipped = 0;

for (let i = 0; i < names.length; i += BATCH_SIZE) {
  const batchNames = names.slice(i, i + BATCH_SIZE);

  const { data: existing } = await supabase
    .from("teachers")
    .select("name")
    .eq("school_id", SCHOOL_ID)
    .in("name", batchNames);

  const existingSet = new Set(
    (existing || []).map((t) => t.name.trim().toLowerCase())
  );

  const toInsert = batchNames
    .filter((name) => !existingSet.has(name.toLowerCase()))
    .map((name) => ({
      name,
      school_id: SCHOOL_ID,
      status: STATUS,
    }));

  skipped += batchNames.length - toInsert.length;

  if (!toInsert.length) continue;

  const { error } = await supabase.from("teachers").insert(toInsert);
  if (error) {
    console.error("Batch error:", error.message);
  } else {
    inserted += toInsert.length;
    process.stdout.write(".");
  }
}

console.log(`\nDone. Inserted: ${inserted}, Skipped (duplicates): ${skipped}`);
