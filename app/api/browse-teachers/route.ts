import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;

    const location =
      searchParams.get("location")?.trim() || "";

    const subjects = searchParams.getAll("subject");

    const ratings = searchParams.getAll("rating");

    const page = Math.max(
      parseInt(searchParams.get("page") || "1", 10),
      1
    );

    const limit = Math.min(
      Math.max(
        parseInt(searchParams.get("limit") || "10", 10),
        1
      ),
      50
    );

    const risk = searchParams.get("risk");

    const state = searchParams.get("state");

    const searchByTeacher = searchParams.get("searchByTeacher");

    const searchBySchool = searchParams.get("searchBySchool");

    const offset = (page - 1) * limit;

    let schoolIds: string[] = [];

    if (searchBySchool) {
      const { data: schools } = await supabase
        .from("schools")
        .select("id")
        .ilike("school_name", `%${searchBySchool}%`);

      schoolIds = schools?.map(s => s.id) || [];
    }

    let query = supabase
      .from("teachers")
      .select(
        `
        *,schools (
      school_name
    )
      `,
        { count: "exact" }
      ).order("name", {
        ascending: true,
      });

    if (searchByTeacher) {
      query = query.ilike(
        "name",
        `%${searchByTeacher}%`
      );
    }

    if (searchBySchool && schoolIds.length === 0) {
      return NextResponse.json({
        success: true,
        schoolIds,
        teachers: [],
        pagination: {
          total: 0,
          page,
          limit,
          totalPages: 0,
        },
      });
    }

    if (searchBySchool && schoolIds.length > 0) {
      query = query.in("school_id", schoolIds);
    }

    if (location) {
      query = query.or(
        `city.ilike.%${location}%`
      );
    }

    if (subjects.length > 0) {
      const subjectFilters = subjects.map(
        (subject) =>
          `subject.ilike.%${subject}%`
      );

      query = query.or(subjectFilters.join(","));
    }

    if (ratings.length > 0) {
      const values = ratings.map((r) =>
        parseFloat(r.replace("+", ""))
      );

      const minRating = Math.min(...values);

      query = query.gt("avg_rating", minRating);
    }

    if (state && state !== "All") {
      query = query.eq("state", state);
    }

    if (risk && risk !== "All") {
      query = query.eq(
        "calculated_risk",
        risk
      );
    }

    query = query
      .order("avg_rating", {
        ascending: false,
      })
      .order("total_reports", {
        ascending: false,
      })
      .order("id", {
        ascending: false,
      });

    query = query.range(
      offset,
      offset + limit - 1
    );

    const {
      data: teachers,
      error,
      count,
    } = await query;

    if (error) {
      console.error(
        "Error fetching teachers:",
        error
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Failed to fetch teachers data",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      teachers: teachers || [],
      pagination: {
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil(
          (count || 0) / limit
        ),
      },
    });
  } catch (error: any) {
    console.error(
      "Unexpected server error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 }
    );
  }
}
