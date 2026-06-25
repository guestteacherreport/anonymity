/**
 * Bulk import schools from local .xlsx folder (one-time / dev use).
 *
 * Usage:
 *   node scripts/import-schools-from-folder.mjs "D:\project-doc\anonymity-schools"
 *
 * Requires .env.local with NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
 * (or NEXT_PUBLIC_SUPABASE_ANON_KEY if RLS allows inserts).
 */

import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import * as XLSX from "xlsx";
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
    // .env.local optional if vars already set
  }
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

const supabase = createClient(url, key);
const folder = process.argv[2];

if (!folder || !fs.existsSync(folder)) {
  console.error('Usage: node scripts/import-schools-from-folder.mjs "<folder-path>"');
  process.exit(1);
}

function getCurrentSchoolYear() {
  const now = new Date();
  const startYear = now.getMonth() >= 7 ? now.getFullYear() : now.getFullYear() - 1;
  return `${startYear}-${startYear + 1}`;
}

function inferAssociation(filename) {
  const lower = filename.toLowerCase();
  if (lower.includes("char") && lower.includes("private")) {
    return "Public, Charter & Private";
  }
  if (lower.includes("private")) return "Private";
  if (lower.includes("charter")) return "Charter";
  return "Public";
}

function parseFile(filePath) {
  const wb = XLSX.readFile(filePath);
  const sheet = wb.Sheets[wb.SheetNames[0]];

  const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });
  const association = inferAssociation(path.basename(filePath));
  const schoolYear = getCurrentSchoolYear();
  const seen = new Set();

  return rows
    .map((row) => {
      const name = String(row["School Name"] ?? "").trim();
      const zip = String(row["Zip"] ?? "").replace(/\.0$/, "");
      const gradeLevel = String(row["Grade"] ?? "").trim();

      const record = {
        school_name: name,
        street_address: String(row["Street Address"] ?? "").trim(),
        city: String(row["City"] ?? "").trim(),
        state: String(row["State"] ?? "").trim(),
        zipcode: zip,
        school_association: "School District",
        school_district_name:String(row["District"] ?? "").trim(),
        school_year: schoolYear,
        grade_level: gradeLevel
    ? gradeLevel.split(", ").map((g) => g.trim())
    : [],
        phone: String(row["Phone"] ?? "").trim()
      };
      const key = `${record.school_name}|${record.state}|${record.zipcode}|${record.street_address}`.toLowerCase();
      if (seen.has(key)) return null;
      seen.add(key);
      return record;
    })
    .filter(Boolean);
}

const files = fs
  .readdirSync(folder)
  .filter((f) => f.endsWith(".xlsx") && !f.startsWith("~"));

let totalInserted = 0;
let totalSkipped = 0;

for (const file of files) {
  const schools = parseFile(path.join(folder, file));
  console.log(`\n${file}: ${schools.length} rows`);

  for (let i = 0; i < schools.length; i += 200) {
    const batch = schools.slice(i, i + 200);
    const { error } = await supabase.from("schools").insert(batch);
    if (error) {
      // console.error("  Batch error:", error.message);
      console.error("Batch error:", JSON.stringify(error, null, 2));
console.log("Sample row:", batch[0]);
    } else {
      totalInserted += batch.length;
      process.stdout.write(".");
    }
  }
}

console.log(`\n\nDone. Inserted ~${totalInserted} rows across ${files.length} files.`);
