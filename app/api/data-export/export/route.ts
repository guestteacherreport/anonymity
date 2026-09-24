import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { buildReportsCsv } from "@/lib/reportsCsv";

export async function GET(req: NextRequest) {
  try {
    const schoolId = req.nextUrl.searchParams.get("school_id");
    const schoolName = req.nextUrl.searchParams.get("school");
    const teacherIds = req.nextUrl.searchParams.getAll("teacher_ids");
    const city = req.nextUrl.searchParams.get("city");
    const startDate = req.nextUrl.searchParams.get("start_date");
    const endDate = req.nextUrl.searchParams.get("end_date");

    // All fields are now optional - if empty, export all data for that filter level
    const startDateTime = startDate ? `${startDate}T00:00:00.000Z` : "1970-01-01T00:00:00.000Z";
    const endDateTime = endDate ? `${endDate}T23:59:59.999Z` : "2099-12-31T23:59:59.999Z";

    let query = supabase
      .from("reports")
      // Embed the school record so city/state in the export always reflect
      // the current schools table (the source of truth), not just the
      // denormalized copy captured on the report at submission time.
      .select("*, schools(city, state)");

    // Apply filters only if they are provided
    if (city) {
      query = query.eq("city", city);
    }
    if (schoolId) {
      query = query.eq("school_id", schoolId);
    }
    if (teacherIds.length > 0) {
      query = query.in("teacher_id", teacherIds);
    }

    query = query.gte("created_at", startDateTime).lte("created_at", endDateTime);

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

    // Insert export record
    const { error: insertError } = await supabase
      .from("exported_reports")
      .insert([
        {
          city,
          school_name: schoolName,
          school_id: schoolId,
          teacher_id: teacherIds,
          start_date: startDate,
          end_date: endDate,
        },
      ]);

    if (insertError) {
      console.error("Error inserting export record:", insertError);
      return NextResponse.json(
        {
          success: false,
          message: "Failed to log export",
        },
        { status: 500 }
      );
    }

    const csvContent = buildReportsCsv(reportsData, req.nextUrl.searchParams.get("tz"));

    return new Response(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv;charset=utf-8;",
        "Content-Disposition": `attachment; filename="reports_${schoolId}_${new Date().getTime()}.csv"`,
      },
    });
  } catch (error) {
    console.error("Error exporting reports:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to export reports",
      },
      { status: 500 }
    );
  }
}
