import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    const search =
      req.nextUrl.searchParams.get("search") || "";

    let query = supabase
      .from("schools")
      .select("*")
      .order("created_at", {
        ascending: false,
      })
      .limit(10);

    // Search by school name
    if (search.trim()) {
      query = query.ilike(
        "school_name",
        `%${search}%`
      );
    }

    const { data, error } = await query;

    if (error) {
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

    return NextResponse.json({
      success: true,
      schools: data,
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