import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    const city = req.nextUrl.searchParams.get("city");

    let query = supabase.from("reports").select("*");

    if (city) {
      query = query.eq("city", city);
    }

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

    const csvContent = convertToCSV(reports || []);

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
