import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (session?.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { batchId } = await req.json();

    if (!batchId) {
      return NextResponse.json(
        { error: "Batch ID is required" },
        { status: 400 }
      );
    }

    const { data: schoolsToDelete, error: selectError } = await supabase
      .from("schools")
      .select("id")
      .eq("import_batch_id", batchId);

    if (selectError) {
      return NextResponse.json(
        { error: "Failed to fetch schools for deletion" },
        { status: 500 }
      );
    }

    if (!schoolsToDelete || schoolsToDelete.length === 0) {
      return NextResponse.json(
        { error: "No schools found for this batch" },
        { status: 404 }
      );
    }

    const { error: deleteError } = await supabase
      .from("schools")
      .delete()
      .eq("import_batch_id", batchId);

    if (deleteError) {
      return NextResponse.json(
        { error: "Failed to delete schools" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      deleted: schoolsToDelete.length,
      message: `Deleted ${schoolsToDelete.length} schools from this import batch`,
    });
  } catch (error) {
    console.error("School import deletion error:", error);
    return NextResponse.json(
      { error: "Failed to delete schools" },
      { status: 500 }
    );
  }
}
