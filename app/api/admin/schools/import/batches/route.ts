import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { supabase } from "@/lib/supabase";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (session?.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const batchId = searchParams.get("batchId");

    if (batchId) {
      const { data: schools, error } = await supabase
        .from("schools")
        .select("*")
        .eq("import_batch_id", batchId)
        .order("created_at", { ascending: false });

      if (error) {
        return NextResponse.json(
          { error: "Failed to fetch schools" },
          { status: 500 }
        );
      }

      return NextResponse.json({ schools: schools || [] });
    }

    const { data: batches, error } = await supabase.rpc(
      "get_import_batches"
    );

    if (error) {
      const { data: fallbackBatches } = await supabase
        .from("schools")
        .select("import_batch_id, imported_at, COUNT(*) as count")
        .not("import_batch_id", "is", null)
        // .group_by("import_batch_id, imported_at")
        .order("imported_at", { ascending: false });

      if (!fallbackBatches) {
        return NextResponse.json({ batches: [] });
      }

      const formattedBatches = fallbackBatches.map((batch: any) => ({
        batch_id: batch.import_batch_id,
        imported_at: batch.imported_at,
        school_count: batch.count || 0,
      }));

      return NextResponse.json({ batches: formattedBatches });
    }

    return NextResponse.json({ batches: batches || [] });
  } catch (error) {
    console.error("Fetch batches error:", error);
    return NextResponse.json(
      { error: "Failed to fetch import batches" },
      { status: 500 }
    );
  }
}
