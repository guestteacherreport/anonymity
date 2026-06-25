
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // =========================
    // QUERY PARAMS
    // =========================
    const page = parseInt(req.nextUrl.searchParams.get("page") || "1");
    const limit = parseInt(req.nextUrl.searchParams.get("limit") || "10");

    const status =
      req.nextUrl.searchParams.get("status") || "All";

    const offset = (page - 1) * limit;

    // =========================
    // BASE QUERY
    // =========================
    let reportsQuery = supabase
      .from("reports")
      .select("*", { count: "exact" })
      .eq("status", 2)
      .eq("school_id", id);
      
    // =========================
    // SENTIMENT FILTER
    // =========================
    if (
      status === "Positive" ||
      status === "Neutral" ||
      status === "Negative"
    ) {
      reportsQuery = reportsQuery.eq("AI_sentiment", status);
    }

    // =========================
    // FETCH REPORTS
    // =========================
    const {
      data: reportsData,
      count: totalReports,
      error: reportsError,
    } = await reportsQuery
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (reportsError) {
      return NextResponse.json(
        {
          success: false,
          message: reportsError.message,
        },
        { status: 500 }
      );
    }

    // =========================
    // FORMAT REPORTS
    // =========================
    const reports = (reportsData || []).map((row: any) => ({
      ...row,
      tags: row.tags || [],
    }));

    // =========================
    // RESPONSE
    // =========================
    return NextResponse.json({
      success: true,

      reports,

      pagination: {
        page,
        limit,
        total: totalReports || 0,
        totalPages: Math.ceil((totalReports || 0) / limit),
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch reports",
      },
      { status: 500 }
    );
  }
}