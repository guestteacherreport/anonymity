import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { buildReportsCsv } from "@/lib/reportsCsv";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (session?.user?.role !== "admin") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const city = req.nextUrl.searchParams.get("city");

    // Embed the school record so city/state in the export always reflect the
    // current schools table (the source of truth), not a denormalized copy.
    let query = supabase.from("reports").select("*, schools(city, state)");

    if (city) {
      query = query.eq("city", city);
    }

    const { data: reportsData, error } = await query;

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

    const csvContent = buildReportsCsv(reportsData, req.nextUrl.searchParams.get("tz"));

    return new Response(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv;charset=utf-8;",
        "Content-Disposition": `attachment; filename="all_reports_${city || "all"}_${new Date().getTime()}.csv"`,
      },
    });
  } catch (error) {
    console.error("Error exporting all reports:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to export reports",
      },
      { status: 500 }
    );
  }
}
