import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
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

    const reports = flattenSchoolInfo(reportsData);

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

type ReportRowWithSchool = Record<string, unknown> & {
  schools?: { city: string | null; state: string | null } | null;
};

// Pulls the embedded schools(city, state) out of each row into flat
// school_city / school_state columns, and drops the nested object (it would
// otherwise serialize as "[object Object]" in the CSV).
function flattenSchoolInfo(rows: ReportRowWithSchool[] | null) {
  return (rows || []).map(({ schools, ...report }) => ({
    ...report,
    school_city: schools?.city ?? null,
    school_state: schools?.state ?? null,
  }));
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
