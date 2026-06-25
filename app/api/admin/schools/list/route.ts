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
    const search = searchParams.get("search") || "";
    const limit = parseInt(searchParams.get("limit") || "100");

    let query = supabase
      .from("schools")
      .select("id, school_name, city, state, zipcode, street_address, created_at, imported_at, import_batch_id")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (search) {
      query = query.ilike("school_name", `%${search}%`);
    }

    const { data: schools, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch schools" },
        { status: 500 }
      );
    }

    return NextResponse.json({ schools: schools || [] });
  } catch (error) {
    console.error("Fetch schools error:", error);
    return NextResponse.json(
      { error: "Failed to fetch schools" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (session?.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { schoolIds } = await req.json();

    if (!schoolIds || !Array.isArray(schoolIds) || schoolIds.length === 0) {
      return NextResponse.json(
        { error: "No schools selected" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("schools")
      .delete()
      .in("id", schoolIds);

    if (error) {
      return NextResponse.json(
        { error: "Failed to delete schools" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      deleted: schoolIds.length,
      message: `Deleted ${schoolIds.length} school(s) successfully`,
    });
  } catch (error) {
    console.error("Delete schools error:", error);
    return NextResponse.json(
      { error: "Failed to delete schools" },
      { status: 500 }
    );
  }
}
