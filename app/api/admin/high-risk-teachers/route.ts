import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const search = searchParams.get("search") || "";

  const offset = (page - 1) * limit;
  try {
    let query = supabase
      .from("teachers")
      .select(`
          id,
          name,
          school_id,
          total_reports,
          high_risk_reports,
          high_risk_percentage,
          schools(school_name),
          ai_summary
        `, { count: "exact" })
      .gt("high_risk_reports", 0)
      .order("high_risk_percentage", { ascending: false })
      .range(offset, offset + limit - 1);



    if (search.trim()) {
      query = query.ilike(
        "name",
        `%${search}%`
      );
    }

    const { data, error, count } = await query;

    if (error) {
      console.error("Error fetching teachers:", error);
      return NextResponse.json(
        { error: "Failed to fetch teachers" },
        { status: 500 }
      );
    }
    const teachers = (data || [])
      .map((teacher: any) => {


        return {
          id: teacher.id,
          name: teacher.name,
          school_id: teacher.school_id,
          school_name: teacher.schools?.school_name || "Unknown School",
          total_reports: teacher.total_reports,
          high_risk_reports: teacher.high_risk_reports || 0,
          highRiskPercentage: teacher.high_risk_percentage,
          ai_summary: teacher.ai_summary || ""
        };
      })
      .filter((teacher: any) => teacher.highRiskPercentage > 0)
      .sort((a, b) => b.highRiskPercentage - a.highRiskPercentage)
      .slice(0, 2);

    return NextResponse.json({
      data: teachers,
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    });
  } catch (error) {
    console.error("Error fetching high-risk teachers:", error);
    return NextResponse.json(
      { error: "Failed to fetch high-risk teachers" },
      { status: 500 }
    );
  }
}
