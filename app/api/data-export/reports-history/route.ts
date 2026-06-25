import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    const page = parseInt(req.nextUrl.searchParams.get("page") || "1");
    const city = req.nextUrl.searchParams.get("city");
    const limit = parseInt(req.nextUrl.searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;
    let query;

    if(city){
      query = supabase
      .from("exported_reports")
      .select("*", { count: "exact" })
      .eq("city", city)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);
    }else{
      query = supabase
      .from("exported_reports")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);
    }
    

    const { data: reports, error, count } = await query;

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
      reports: reports || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching exported reports:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch exported reports",
      },
      { status: 500 }
    );
  }
}
