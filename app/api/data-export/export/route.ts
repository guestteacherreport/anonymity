import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

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
      .select("*");

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

    const { data: reports, error } = await query;

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

    const csvContent = convertToCSV(reports || []);

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

function convertValue(columnName: string, value: any): string {
  if (value === null || value === undefined) {
    return "";
  }

  // Map integer values to readable strings
  const mappings: Record<string, Record<number, string>> = {
    return_to_teacher: {
      1: "Yes",
      2: "No",
      3: "Maybe",
    },
    return_to_school: {
      1: "Yes",
      2: "No",
      3: "Maybe",
    },
    post_as: {
      1: "Anonymous",
      2: "Public",
    },
    status: {
      1: "Pending",
      2: "Approved",
      3: "Rejected",
    },
  };

  // Check if this column has a mapping
  if (mappings[columnName] && typeof value === "number") {
    return mappings[columnName][value] || String(value);
  }

  return String(value);
}

function convertToCSV(data: any[]): string {
  if (data?.length === 0) {
    return "No data available";
  }

  const headers = Object.keys(data[0]);
  const csvHeaders = headers.join(",");

  const csvRows = data.map((row) =>
    headers
      .map((header) => {
        const convertedValue = convertValue(header, row[header]);
        if (convertedValue.includes(",") || convertedValue.includes('"') || convertedValue.includes("\n")) {
          return `"${convertedValue.replace(/"/g, '""')}"`;
        }
        return convertedValue;
      })
      .join(",")
  );

  return [csvHeaders, ...csvRows].join("\n");
}
