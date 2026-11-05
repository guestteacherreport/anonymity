import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { parseTeacherStatus } from "@/lib/function";
import { requireAdmin } from "@/lib/apiAuth";
import { BULK_TEACHER_LIMIT, parseTeacherNames, planBulkTeachers } from "@/lib/teacherBulk";

const PAGE_SIZE = 1000;

// Adds several teachers to one school in a single save. Names already on the
// school's roster (case/spacing-insensitive) and repeats within the list are
// skipped, so this never creates a duplicate teacher at the same school.
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin();
    if (auth.response) return auth.response;

    const { id } = await params;
    const schoolId = Number(id);

    if (!Number.isInteger(schoolId) || schoolId <= 0) {
      return NextResponse.json({ success: false, message: "Invalid school id" }, { status: 400 });
    }

    const body = await req.json().catch(() => null);
    const names = parseTeacherNames(body?.names);

    if (names.length === 0) {
      return NextResponse.json(
        { success: false, message: "Enter at least one teacher name" },
        { status: 400 }
      );
    }

    if (names.length > BULK_TEACHER_LIMIT) {
      return NextResponse.json(
        { success: false, message: `You can add up to ${BULK_TEACHER_LIMIT} teachers at a time` },
        { status: 400 }
      );
    }

    const statusValue = parseTeacherStatus(body?.status);

    if (statusValue === null) {
      return NextResponse.json(
        { success: false, message: "Invalid status: expected Active or Inactive" },
        { status: 400 }
      );
    }

    const { data: school, error: schoolError } = await supabase
      .from("schools")
      .select("id, city, state, zipcode")
      .eq("id", schoolId)
      .maybeSingle();

    if (schoolError) {
      console.error("Bulk teacher school lookup error:", schoolError);
      return NextResponse.json({ success: false, message: schoolError.message }, { status: 500 });
    }

    if (!school) {
      return NextResponse.json({ success: false, message: "School not found" }, { status: 404 });
    }

    // Whole roster, paged, so the duplicate check doesn't depend on exact
    // spelling/case matching in the query.
    const existingNames: string[] = [];
    for (let from = 0; ; from += PAGE_SIZE) {
      const { data, error } = await supabase
        .from("teachers")
        .select("name")
        .eq("school_id", schoolId)
        .order("id", { ascending: true })
        .range(from, from + PAGE_SIZE - 1);

      if (error) {
        console.error("Bulk teacher roster lookup error:", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
      }

      existingNames.push(...(data || []).map((t) => t.name || ""));
      if (!data || data.length < PAGE_SIZE) break;
    }

    const plan = planBulkTeachers(names, existingNames);

    // Same fallback as the single "Add New" form: blank location fields use
    // the school's location.
    const text = (value: unknown) => (typeof value === "string" ? value.trim() : "");
    const city = text(body?.city) || school.city || null;
    const state = text(body?.state) || school.state || null;
    const zipcode = text(body?.zipcode) || school.zipcode || null;

    let added: { id: number; name: string }[] = [];

    if (plan.toAdd.length > 0) {
      const { data, error } = await supabase
        .from("teachers")
        .insert(
          plan.toAdd.map((name) => ({
            name,
            school_id: schoolId,
            status: statusValue,
            city,
            state,
            zipcode,
          }))
        )
        .select("id, name");

      if (error) {
        console.error("Bulk teacher insert error:", error);
        return NextResponse.json(
          { success: false, message: "Failed to add teachers. No teachers were added." },
          { status: 500 }
        );
      }

      added = data || [];
    }

    return NextResponse.json(
      {
        success: true,
        added,
        skipped: {
          alreadyAtSchool: plan.alreadyAtSchool,
          duplicatesInList: plan.duplicatesInList,
          tooLong: plan.tooLong,
        },
      },
      { status: added.length > 0 ? 201 : 200 }
    );
  } catch (error) {
    console.error("Error adding teachers in bulk:", error);
    return NextResponse.json({ success: false, message: "Failed to add teachers" }, { status: 500 });
  }
}
