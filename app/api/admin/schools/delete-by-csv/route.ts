import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { supabase } from "@/lib/supabase";
import { chunkArray, parseSchoolExcel } from "@/lib/school-import";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (session?.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file");
    const action = formData.get("action") || "preview";

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "Please upload a file" },
        { status: 400 }
      );
    }

    const isExcel = file.name.toLowerCase().endsWith(".xlsx");
    const isCsv = file.name.toLowerCase().endsWith(".csv");

    if (!isExcel && !isCsv) {
      return NextResponse.json(
        { error: "Only .xlsx and .csv files are supported" },
        { status: 400 }
      );
    }

    const buffer = await file.arrayBuffer();
    
    let schools = [];
    
    if (isExcel) {
      schools = parseSchoolExcel(buffer, file.name);
    } else if (isCsv) {
      const text = new TextDecoder().decode(buffer);
      const lines = text.split("\n").filter((line) => line.trim());
      
      if (lines.length < 2) {
        return NextResponse.json(
          { error: "CSV file is empty or has no data rows" },
          { status: 400 }
        );
      }

      const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
      
      const nameIndex = headers.findIndex((h) =>
        ["School Name"].includes(h)
      );
      const streetIndex = headers.findIndex((h) =>
        ["Street Address", "address", "street"].includes(h)
      );
      const cityIndex = headers.findIndex((h) => h === "city");
      const stateIndex = headers.findIndex((h) => h === "state");
      const zipIndex = headers.findIndex((h) =>
        ["Zip", "zipcode", "zip code"].includes(h)
      );

      if (nameIndex === -1 || stateIndex === -1 || zipIndex === -1) {
        return NextResponse.json(
          { error: "CSV must have columns: School Name, State, Zip (and optionally Street Address, City)" },
          { status: 400 }
        );
      }

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(",").map((v) => v.trim());
        
        const school_name = values[nameIndex] || "";
        const state = values[stateIndex] || "";
        const zipcode = (values[zipIndex] || "").replace(/\.0$/, "");
        const street_address = streetIndex !== -1 ? values[streetIndex] || "" : "";

        if (school_name && state && zipcode) {
          schools.push({
            school_name,
            street_address,
            city: cityIndex !== -1 ? values[cityIndex] || "" : "",
            state,
            zipcode,
            school_association: "",
            school_district_name: null,
            school_year: "",
            grade_level: [],
          });
        }
      }
    }

    if (schools.length === 0) {
      return NextResponse.json(
        { error: "No valid schools found in file" },
        { status: 400 }
      );
    }

    const schoolNames = [...new Set(schools.map((s) => s.school_name))];
    
    const chunks = chunkArray(schoolNames, 100);

let dbSchools: any[] = [];

for (const chunk of chunks) {
  const { data, error } = await supabase
    .from("schools")
    .select("id, school_name, state, zipcode, street_address, city")
    .in("school_name", chunk);

  if (error) {
    console.error(error);
    continue;
  }

  dbSchools.push(...(data || []));
}

    const matchingIds: string[] = [];
    const matchingSchools = [];

    for (const dbSchool of dbSchools) {
      for (const csvSchool of schools) {
        const dbKey = `${dbSchool.school_name}|${dbSchool.state}|${dbSchool.zipcode}|${dbSchool.street_address}`.toLowerCase();
        const csvKey = `${csvSchool.school_name}|${csvSchool.state}|${csvSchool.zipcode}|${csvSchool.street_address}`.toLowerCase();

        if (dbKey === csvKey) {
          matchingIds.push(dbSchool.id);
          matchingSchools.push({
            id: dbSchool.id,
            school_name: dbSchool.school_name,
            city: dbSchool.city,
            state: dbSchool.state,
            zipcode: dbSchool.zipcode,
          });
          break;
        }
      }
    }

    if (action === "preview") {
      return NextResponse.json({
        schools: matchingSchools,
        matchedCount: matchingSchools.length,
        totalInFile: schools.length,
      });
    }

    if (action === "delete") {
      if (matchingIds.length === 0) {
        return NextResponse.json(
          { error: "No schools matched for deletion" },
          { status: 400 }
        );
      }

      const { error } = await supabase
        .from("schools")
        .delete()
        .in("id", matchingIds);

      if (error) {
        return NextResponse.json(
          { error: "Failed to delete schools" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        deleted: matchingIds.length,
        message: `Deleted ${matchingIds.length} school(s) that matched the CSV file`,
      });
    }

    return NextResponse.json(
      { error: "Invalid action" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Delete by CSV error:", error);
    return NextResponse.json(
      { error: "Failed to process file" },
      { status: 500 }
    );
  }
}
