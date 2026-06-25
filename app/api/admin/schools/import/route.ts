import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { supabase } from "@/lib/supabase";
import {
  chunkArray,
  parseSchoolExcel,
  type SchoolImportRecord,
} from "@/lib/school-import";

export const runtime = "nodejs";
export const maxDuration = 300;

const BATCH_SIZE = 200;

type FileResult = {
  fileName: string;
  parsed: number;
  inserted: number;
  skipped: number;
  failed: number;
  errors: string[];
};

function generateBatchId(): string {
  return `import_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

async function filterExisting(
  batch: SchoolImportRecord[]
): Promise<{ toInsert: SchoolImportRecord[]; skipped: number }> {
  const names = [...new Set(batch.map((s) => s.school_name))];
  if (names.length === 0) {
    return { toInsert: [], skipped: 0 };
  }

  const { data: existing, error } = await supabase
    .from("schools")
    .select("school_name, state, zipcode, street_address")
    .in("school_name", names);

  if (error || !existing) {
    return { toInsert: batch, skipped: 0 };
  }

  const existingKeys = new Set(
    existing.map(
      (s) =>
        `${s.school_name}|${s.state}|${s.zipcode}|${s.street_address}`.toLowerCase()
    )
  );

  const toInsert = batch.filter((s) => {
    const key = `${s.school_name}|${s.state}|${s.zipcode}|${s.street_address}`.toLowerCase();
    return !existingKeys.has(key);
  });

  return {
    toInsert,
    skipped: batch.length - toInsert.length,
  };
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (session?.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const files = formData
      .getAll("files")
      .filter((entry): entry is File => entry instanceof File);

    if (files.length === 0) {
      return NextResponse.json(
        { error: "Please upload at least one .xlsx file" },
        { status: 400 }
      );
    }

    const invalid = files.filter(
      (f) => !f.name.toLowerCase().endsWith(".xlsx")
    );
    if (invalid.length > 0) {
      return NextResponse.json(
        { error: "Only .xlsx files are supported" },
        { status: 400 }
      );
    }

    const batchId = generateBatchId();
    const fileResults: FileResult[] = [];
    let totalParsed = 0;
    let totalInserted = 0;
    let totalSkipped = 0;
    let totalFailed = 0;

    for (const file of files) {
      const buffer = await file.arrayBuffer();
      const schools = parseSchoolExcel(buffer, file.name);
      const result: FileResult = {
        fileName: file.name,
        parsed: schools.length,
        inserted: 0,
        skipped: 0,
        failed: 0,
        errors: [],
      };

      totalParsed += schools.length;

      const batches = chunkArray(schools, BATCH_SIZE);

      for (const batch of batches) {
        const { toInsert, skipped } = await filterExisting(batch);
        result.skipped += skipped;
        totalSkipped += skipped;

        if (toInsert.length === 0) {
          continue;
        }

        const schoolsWithBatchId = toInsert.map((school) => ({
          ...school
        }));

        const { error } = await supabase
          .from("schools")
          .insert(schoolsWithBatchId);

        if (error) {
          result.failed += toInsert.length;
          totalFailed += toInsert.length;
          if (result.errors.length < 5) {
            result.errors.push(error.message);
          }
          continue;
        }

        result.inserted += toInsert.length;
        totalInserted += toInsert.length;
      }

      fileResults.push(result);
    }

    return NextResponse.json({
      success: totalInserted > 0 || totalSkipped > 0,
      summary: {
        files: files.length,
        parsed: totalParsed,
        inserted: totalInserted,
        skipped: totalSkipped,
        failed: totalFailed,
      },
      fileResults,
      batchId: totalInserted > 0 ? batchId : null,
    });
  } catch (error) {
    console.error("School import error:", error);
    return NextResponse.json(
      { error: "Failed to import schools" },
      { status: 500 }
    );
  }
}
