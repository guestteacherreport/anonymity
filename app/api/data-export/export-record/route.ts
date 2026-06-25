import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
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

    let query = supabase.from("reports").select("*");

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

    const { data: reports, error: reportsError } = await query;

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

    const csvContent = convertToCSV(reports || []);

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

function convertValue(columnName: string, value: any): string {
  if (value === null || value === undefined) {
    return "";
  }

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
      1: "Active",
      2: "Approved",
      3: "Rejected",
    },
  };

  if (mappings[columnName] && typeof value === "number") {
    return mappings[columnName][value] || String(value);
  }

  return String(value);
}

function convertToCSV(data: any[]): string {
  if (data.length === 0) {
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
