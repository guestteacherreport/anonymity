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

    const recordId = req.nextUrl.searchParams.get("record_id");

    if (!recordId) {
      return NextResponse.json(
        {
          success: false,
          message: "record_id is required",
        },
        { status: 400 }
      );
    }

    const { data: record, error } = await supabase
      .from("exported_reports")
      .select("*")
      .eq("id", recordId)
      .single();

    if (error || !record) {
      console.error("Supabase Error:", error);
      return NextResponse.json(
        {
          success: false,
          message: "Record not found",
        },
        { status: 404 }
      );
    }

    // Embed the school record so city/state in the export always reflect the
    // current schools table (the source of truth), not a denormalized copy.
    let query = supabase.from("reports").select("*, schools(city, state)");

      if (record.school_id) {
        query = query.eq("school_id", record.school_id);
      }

      if (record.teacher_id?.length) {
        query = query.in("teacher_id", record.teacher_id);
      }

      if (record.start_date) {
        query = query.gte("created_at", record.start_date);
      }

      if (record.end_date) {
        query = query.lte("created_at", record.end_date);
      }

    const { data: reportsData, error: reportsError } = await query;

    if (reportsError) {
      console.error("Supabase Error:", reportsError);
      return NextResponse.json(
        {
          success: false,
          message: reportsError.message,
        },
        { status: 500 }
      );
    }

    const csvContent = buildReportsCsv(reportsData, req.nextUrl.searchParams.get("tz"));

    return new Response(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv;charset=utf-8;",
        "Content-Disposition": `attachment; filename="report_${recordId}_${new Date().getTime()}.csv"`,
      },
    });
  } catch (error) {
    console.error("Error exporting record:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to export record",
      },
      { status: 500 }
    );
  }
}
