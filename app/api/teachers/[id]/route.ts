import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";


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

    if (!name || !status) {
      return NextResponse.json(
        {
          success: false,
          message: "Name and status are required",
        },
        { status: 400 }
      );
    }


    const { error } = await supabase
      .from("teachers")
      .update({
        name,
        status: status,
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