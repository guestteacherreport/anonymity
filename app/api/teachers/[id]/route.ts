import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { parseTeacherStatus } from "@/lib/function";


// =========================
// DELETE TEACHER
// =========================
export async function DELETE(
  req: NextRequest,
{ params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Teacher ID is required" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("teachers")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Supabase delete error:", error);

      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Teacher deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting teacher:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete teacher",
      },
      { status: 500 }
    );
  }
}


// =========================
// UPDATE TEACHER
// =========================
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Teacher ID is required" },
        { status: 400 }
      );
    }

    const body = await req.json();

    const { name, status } = body;

    if (!name || status === undefined || status === null || status === "") {
      return NextResponse.json(
        {
          success: false,
          message: "Name and status are required",
        },
        { status: 400 }
      );
    }

    const statusValue = parseTeacherStatus(status);

    if (statusValue === null) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid status: expected Active or Inactive",
        },
        { status: 400 }
      );
    }

    // Only location fields the caller actually sent are touched. One sent
    // blank falls back to the teacher's school (mirroring create), so the
    // teacher stays findable by /api/browse-teachers location filtering.
    const locationUpdate: Record<string, string | null> = {};
    const locationKeys = ["city", "state", "zipcode"] as const;
    const sentKeys = locationKeys.filter((key) => key in body);

    if (sentKeys.length > 0) {
      for (const key of sentKeys) {
        const value = body[key];
        locationUpdate[key] = typeof value === "string" ? value.trim() : "";
      }

      if (sentKeys.some((key) => !locationUpdate[key])) {
        const { data: teacherRow } = await supabase
          .from("teachers")
          .select("schools(city, state, zipcode)")
          .eq("id", id)
          .maybeSingle();

        const school = (teacherRow as any)?.schools;

        for (const key of sentKeys) {
          if (!locationUpdate[key]) {
            locationUpdate[key] = school?.[key] || null;
          }
        }
      }
    }

    const { error } = await supabase
      .from("teachers")
      .update({
        name,
        status: statusValue,
        ...locationUpdate,
        updated_at: new Date().toISOString(), // optional but recommended
      })
      .eq("id", id);

    if (error) {
      console.error("Supabase update error:", error);

      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Teacher updated successfully",
    });
  } catch (error) {
    console.error("Error updating teacher:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update teacher",
      },
      { status: 500 }
    );
  }
}