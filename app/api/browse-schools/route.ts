import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    // =========================
    // QUERY PARAMS
    // =========================
    const searchParams = req.nextUrl.searchParams;


    const location =
      searchParams.get("location")?.trim() || "";

    const grades = searchParams.getAll("grade");

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

    let teacherSchoolIds: string[] = [];

    if (searchByTeacher) {
      const { data: teachers } = await supabase
        .from("teachers")
        .select("school_id")
        .ilike("name", `%${searchByTeacher}%`);

      teacherSchoolIds = teachers?.map(t => t.school_id) || [];
    }
    // =========================
    // BASE QUERY
    // =========================
    let query = supabase
      .from("schools")
      .select(
        `
        id,
        school_name,
        city,
        state,
        zipcode,
        avg_rating,
        total_reports,
        calculated_risk,
        return_to_school_percentage,
        sentiment,
        created_at,
        grade_level,
        ai_summary
      `,
        { count: "exact" }
      );

    // =========================
    // SEARCH
    // =========================
    if (searchBySchool) {
      query = query.ilike(
        "school_name",
        `%${searchBySchool}%`
      );
    }

    if(searchByTeacher && teacherSchoolIds.length == 0){
      return NextResponse.json({
          success: true,
          teacherSchoolIds,
          schools: [],
          pagination: {
            total: 0,
            page,
            limit,
            totalPages: 0,
          },
        });
    }

    if (searchByTeacher && teacherSchoolIds.length > 0) {
      query = query.in("id", teacherSchoolIds);
    }

    // =========================
    // LOCATION FILTER
    // =========================
    if (location) {
      query = query.or(
        `city.ilike.%${location}%,zipcode.ilike.%${location}%`
      );
    }

    // =========================
    // GRADE FILTER
    // =========================
    if (grades.length > 0) {
      const gradeFilters = grades.map(
        (grade) =>
          `grade_level.cs.${JSON.stringify([grade])}`
      );

      query = query.or(gradeFilters.join(","));
    }

    // =========================
    // RATING FILTER
    // =========================
    if (ratings.length > 0) {
      const values = ratings.map((r) =>
        parseFloat(r.replace("+", ""))
      );

      const minRating = Math.min(...values);

      query = query.gte("avg_rating", minRating);
    }

    // =========================
    // STATE FILTER
    // =========================
    if (state && state !== "All") {
      query = query.eq("state", state);
    }

    // =========================
    // RISK FILTER
    // =========================
    if (risk && risk !== "All") {
      query = query.eq(
        "calculated_risk",
        risk
      );
    }

    // =========================
    // SORTING
    // =========================
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

    // =========================
    // PAGINATION
    // =========================
    query = query.range(
      offset,
      offset + limit - 1
    );

    // =========================
    // EXECUTE
    // =========================
    const {
      data: schools,
      error,
      count,
    } = await query;

    // =========================
    // ERROR HANDLING
    // =========================
    if (error) {
      console.error(
        "Error fetching schools:",
        error
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Failed to fetch schools data",
        },
        { status: 500 }
      );
    }

    // =========================
    // RESPONSE
    // =========================
    return NextResponse.json({
      success: true,
      schools: schools || [],
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