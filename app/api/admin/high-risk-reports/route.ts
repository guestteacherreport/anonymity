import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const search = searchParams.get("search") || "";

    const offset = (page - 1) * limit;

    let query = supabase
      .from("reports")
      .select("*", { count: "exact" })
      .eq("risk_level", "High")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (search.trim()) {
      query = query.or(
        [
          `school_name.ilike.%${search}%`,
          `teacher_name.ilike.%${search}%`,
          `your_name.ilike.%${search}%`,
        ].join(",")
      );
    }

    const { data, error, count } = await query;

    if (error) {
      console.error("Supabase Fetch Error:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    const reports = (data || []).map((row: any) => ({
      ...row,
      tags: Array.isArray(row.tags) ? row.tags : [],
    }));

    return NextResponse.json({
      data: reports,
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    });
  } catch (error) {
    console.error("Fetch high-risk reports error:", error);
    return NextResponse.json(
      { error: "Failed to fetch high-risk reports" },
      { status: 500 }
    );
  }
}
