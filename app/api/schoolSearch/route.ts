import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// No-search browsing (e.g. a fresh dropdown before the user types) only
// needs a handful of recent schools. An active search can match many more
// same-named schools (e.g. 40+ for "Bradley"), so it gets a larger page -
// still bounded, with `page`/`limit` available for loading further pages
// instead of ever pulling the whole schools table at once.
const DEFAULT_LIMIT = 10;
const SEARCH_LIMIT = 50;
const MAX_LIMIT = 100;

export async function GET(req: NextRequest) {
  try {
    const search = req.nextUrl.searchParams.get("search") || "";
    const state = req.nextUrl.searchParams.get("state") || "";
    const isSearching = Boolean(search.trim());

    const page = Math.max(1, parseInt(req.nextUrl.searchParams.get("page") || "1", 10) || 1);
    const requestedLimit = parseInt(req.nextUrl.searchParams.get("limit") || "", 10);
    const limit = Math.min(
      MAX_LIMIT,
      requestedLimit > 0 ? requestedLimit : isSearching ? SEARCH_LIMIT : DEFAULT_LIMIT
    );
    const offset = (page - 1) * limit;

    let query = supabase
      .from("schools")
      .select("*", { count: "exact" });

    // Search by school name
    if (isSearching) {
      query = query
        .ilike("school_name", `%${search.trim()}%`)
        .order("school_name", { ascending: true });
    } else {
      query = query.order("created_at", { ascending: false });
    }

    // Optional state filter to narrow down large result sets (e.g. many
    // similarly-named schools across different states).
    if (state.trim() && state.trim() !== "All") {
      query = query.eq("state", state.trim());
    }

    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      // A page requested past the last available record (e.g. a stray
      // double "Load more" click) isn't a real failure - just no more rows.
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
        {
          status: 500,
        }
      );
    }

    const total = count || 0;

    return NextResponse.json({
      success: true,
      schools: data,
      total,
      page,
      limit,
      hasMore: total > offset + (data?.length || 0),
    });
  } catch (error) {
    console.error(
      "Error fetching schools:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch schools",
      },
      {
        status: 500,
      }
    );
  }
}
