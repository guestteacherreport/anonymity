import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    const search = req.nextUrl.searchParams.get("search") || "";

    let query = supabase
      .from("schools")
      .select("city")
      .not("city", "is", null);

    if (search.trim()) {
      query = query.ilike("city", `%${search}%`);
    }

    const { data: schools, error } = await query.order("city", { ascending: true });

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

    const cities = [
      ...new Set((schools || []).map((s: any) => s.city).filter(Boolean)),
    ] as string[];

    return NextResponse.json({
      success: true,
      cities,
    });
  } catch (error) {
    console.error("Error fetching cities:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch cities",
      },
      { status: 500 }
    );
  }
}
