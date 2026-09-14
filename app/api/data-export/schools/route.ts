import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// A city-scoped browse (or a name search) can still match many schools, so
// results are paged instead of ever returning the whole `schools` table
// (130k+ rows) in one response - the caller loads further pages on demand.
const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;

export async function GET(req: NextRequest) {
  try {
    const city = req.nextUrl.searchParams.get("city");
    const search = req.nextUrl.searchParams.get("search") || "";

    const page = Math.max(1, parseInt(req.nextUrl.searchParams.get("page") || "1", 10) || 1);
    const requestedLimit = parseInt(req.nextUrl.searchParams.get("limit") || "", 10);
    const limit = Math.min(MAX_LIMIT, requestedLimit > 0 ? requestedLimit : DEFAULT_LIMIT);
    const offset = (page - 1) * limit;

    let query = supabase
      .from("schools")
      .select("id, school_name, city, state", { count: "exact" });

    // City filter is optional - if provided, filter by city; otherwise, get all schools
    if (city) {
      query = query.eq("city", city);
    }

    if (search.trim()) {
      query = query.ilike("school_name", `%${search.trim()}%`);
    }

    query = query.order("school_name", { ascending: true }).range(offset, offset + limit - 1);

    const { data: schools, error, count } = await query;

    if (error) {
      // A page requested past the last available record isn't a real
      // failure - just no more rows to load.
      if (error.code === "PGRST103") {
        return NextResponse.json({
          success: true,
          schools: [],
          total: count || 0,
          page,
          limit,
          hasMore: false,
        });
      }

      console.error("Supabase Error:", error);
      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        { status: 500 }
      );
    }

    const total = count || 0;

    return NextResponse.json({
      success: true,
      schools: (schools || []).map((s: any) => ({
        id: s.id,
        name: s.school_name,
        city: s.city,
        state: s.state,
      })),
      total,
      page,
      limit,
      hasMore: total > offset + (schools?.length || 0),
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
