import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const page = parseInt(req.nextUrl.searchParams.get("page") || "1");
    const limit = parseInt(req.nextUrl.searchParams.get("limit") || "10");

    const status =
      req.nextUrl.searchParams.get("status") || "All";

    const offset = (page - 1) * limit;

    let reportsQuery = supabase
      .from("reports")
      .select("*", { count: "exact" })
      .eq("status", 2)
      .eq("teacher_id", id);

    if (
      status === "Positive" 
    ) {
      reportsQuery = reportsQuery.eq("return_to_teacher", 1);
    }
    else if (
      status === "Neutral" 
    ) {
      reportsQuery = reportsQuery.eq("return_to_teacher", 3);
    }
    else if (
      status === "Negative" 
    ) {
      reportsQuery = reportsQuery.eq("return_to_teacher", 2);
    }

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

    const reports = (reportsData || []).map((row: any) => ({
      ...row,
      tags: row.tags || [],
    }));

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
