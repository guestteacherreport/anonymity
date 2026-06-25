import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { supabase } from "@/lib/supabase";
import {
  chunkArray,
  parseTeacherFile,
  type TeacherImportRecord,
} from "@/lib/teacher-import";

export const runtime = "nodejs";
export const maxDuration = 300;

const BATCH_SIZE = 200;
const DEFAULT_SCHOOL_ID = "15680";
const DEFAULT_STATUS = 1;

type FileResult = {
  fileName: string;
  parsed: number;
  inserted: number;
  skipped: number;
  failed: number;
  errors: string[];
};

async function filterExisting(
  batch: TeacherImportRecord[]
): Promise<{ toInsert: TeacherImportRecord[]; skipped: number }> {
  if (batch.length === 0) {
    return { toInsert: [], skipped: 0 };
  }

  const schoolId = batch[0].school_id;
  const names = [...new Set(batch.map((t) => t.name))];

  const { data: existing, error } = await supabase
    .from("teachers")
    .select("name")
    .eq("school_id", schoolId)
    .in("name", names);

  if (error || !existing) {
    return { toInsert: batch, skipped: 0 };
  }

  const existingNames = new Set(
    existing.map((t) => t.name.trim().toLowerCase())
  );

  const toInsert = batch.filter(
    (t) => !existingNames.has(t.name.trim().toLowerCase())
  );

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

    const schoolId =
      String(formData.get("school_id") || DEFAULT_SCHOOL_ID).trim() ||
      DEFAULT_SCHOOL_ID;
    const status = Number(formData.get("status") ?? DEFAULT_STATUS);

    if (files.length === 0) {
      return NextResponse.json(
        { error: "Please upload at least one CSV or Excel file" },
        { status: 400 }
      );
    }

    const invalid = files.filter((file) => {
      const lower = file.name.toLowerCase();
      return (
        !lower.endsWith(".csv") &&
        !lower.endsWith(".xlsx") &&
        !lower.endsWith(".xls")
      );
    });

    if (invalid.length > 0) {
      return NextResponse.json(
        { error: "Only .csv, .xlsx, and .xls files are supported" },
        { status: 400 }
      );
    }

    const fileResults: FileResult[] = [];
    let totalParsed = 0;
    let totalInserted = 0;
    let totalSkipped = 0;
    let totalFailed = 0;

    for (const file of files) {
      const buffer = await file.arrayBuffer();
      const teachers = parseTeacherFile(
        buffer,
        file.name,
        schoolId,
        status === 1 ? 1 : 0
      );

      const result: FileResult = {
        fileName: file.name,
        parsed: teachers.length,
        inserted: 0,
        skipped: 0,
        failed: 0,
        errors: [],
      };

      totalParsed += teachers.length;

      for (const batch of chunkArray(teachers, BATCH_SIZE)) {
        const { toInsert, skipped } = await filterExisting(batch);
        result.skipped += skipped;
        totalSkipped += skipped;

        if (toInsert.length === 0) {
          continue;
        }

        const { error } = await supabase.from("teachers").insert(toInsert);

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
      schoolId,
      status: status === 1 ? 1 : 0,
      summary: {
        files: files.length,
        parsed: totalParsed,
        inserted: totalInserted,
        skipped: totalSkipped,
        failed: totalFailed,
      },
      fileResults,
    });
  } catch (error) {
    console.error("Teacher import error:", error);
    return NextResponse.json(
      { error: "Failed to import teachers" },
      { status: 500 }
    );
  }
}
