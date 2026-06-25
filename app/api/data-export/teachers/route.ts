import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    const school_id = req.nextUrl.searchParams.get("school_id");
    const search = req.nextUrl.searchParams.get("search") || "";

    let query = supabase
      .from("teachers")
      .select("id, name");

    // school_id filter is optional - if provided, filter by school; otherwise, get all teachers
    if (school_id) {
      query = query.eq("school_id", school_id);
    }

    if (search.trim()) {
      query = query.ilike("name", `%${search}%`);
    }

    const { data: teachers, error } = await query.order("name", { ascending: true });

    if (error) {
      console.error("Supabase Error:", error);
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
      teachers: (teachers || []).map((t: any) => ({
        id: t.id,
        name: t.name,
      })),
    });
  } catch (error) {
    console.error("Error fetching teachers:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch teachers",
      },
      { status: 500 }
    );
  }
}
