import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(
  req: NextRequest,
{ params }: { params: Promise<{ id: string }> }) 
{
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing school id",
        },
        { status: 400 }
      );
    }

    const body = await req.json();

    console.log("UPDATE REQUEST BODY:", body);
    console.log("SCHOOL ID:", id);

    const {
      name,
      association,
      districtName,
      schoolYear,
      gradeLevels,
      streetAddress,
      city,
      state,
      zip,
    } = body;

    // =========================
    // SAFE CLEANING FUNCTION
    // =========================
    const safe = (value: any) =>
      value === undefined || value === "" ? null : value;

    const updatePayload = {
      school_name: safe(name),
      school_association: safe(association),
      school_district_name: safe(districtName),
      school_year: safe(schoolYear),
      grade_level: safe(gradeLevels),
      street_address: safe(streetAddress),
      city: safe(city),
      state: safe(state),
      zipcode: safe(zip),
      updated_at: new Date().toISOString(),
    };

    console.log("FINAL PAYLOAD:", updatePayload);

    const { error } = await supabase
      .from("schools")
      .update(updatePayload)
      .eq("id", id);

    if (error) {
      console.error("Supabase update error:", error);

      return NextResponse.json(
        {
          success: false,
          message: error.message,
          debug: error,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "School updated successfully",
    });
  } catch (error) {
    console.error("API ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update school",
      },
      { status: 500 }
    );
  }
}