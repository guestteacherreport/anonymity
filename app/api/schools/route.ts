import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    const search =
      req.nextUrl.searchParams.get("search") || "";

    const page = parseInt(
      req.nextUrl.searchParams.get("page") || "1"
    );

    const limit = parseInt(
      req.nextUrl.searchParams.get("limit") || "10"
    );

    const risk =
      req.nextUrl.searchParams.get("risk");

    const state =
      req.nextUrl.searchParams.get("state");

    const offset = (page - 1) * limit;

    // =========================
    // BASE QUERY (VIEW)
    // =========================
    let query = supabase
      .from("schools") // IMPORTANT CHANGE
      .select("*", { count: "exact" });

    // =========================
    // SEARCH FILTER
    // =========================


    if (search.trim()) {
      const safeSearch = search
        .trim()
        .replace(/,/g, "");

      query = query.or(
        [
          `school_name.ilike.%${safeSearch}%`,
          `city.ilike.%${safeSearch}%`,
          `state.ilike.%${safeSearch}%`,
        ].join(",")
      );
    }

    // =========================
    // STATE FILTER
    // =========================
    if (state && state !== "All") {
      query = query.eq("state", state);
    }

    // =========================
    // RISK FILTER (NOW WORKS)
    // =========================
    if (risk && risk !== "All") {
      query = query.eq("calculated_risk", risk);
    }

    // =========================
    // SORT + PAGINATION
    // =========================
    query = query
      .order("created_at", { ascending: false })
      .order("id", { ascending: false }) // stability
      .range(offset, offset + limit - 1);

    const { data: schools, error, count } = await query;

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

    // =========================
    // STATES LIST (still from base table)
    // =========================
    // const { data: statesData } = await supabase
    //   .from("schools")
    //   .select("state");

    // const states = [
    //   ...new Set(
    //     (statesData || [])
    //       .map((s: any) => s.state)
    //       .filter(Boolean)
    //   ),
    // ].sort();

    return NextResponse.json({
      success: true,
      schools, // now includes analytics fields
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
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