import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    const city = req.nextUrl.searchParams.get("city");
    const search = req.nextUrl.searchParams.get("search") || "";

    let query = supabase
      .from("schools")
      .select("id, school_name");

    // City filter is optional - if provided, filter by city; otherwise, get all schools
    if (city) {
      query = query.eq("city", city);
    }

    if (search.trim()) {
      query = query.ilike("school_name", `%${search}%`);
    }

    const { data: schools, error } = await query.order("school_name", { ascending: true });

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
      schools: (schools || []).map((s: any) => ({
        id: s.id,
        name: s.school_name,
      })),
    });
  } catch (error) {
    console.error("Error fetching schools:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch schools",
      },
      { status: 500 }
    );
  }
}
