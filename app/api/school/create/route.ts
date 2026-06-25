import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

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

    

    const { error } = await supabase
      .from("schools")
      .insert([
        {
          school_name: name,
          school_association: association,
          school_district_name: districtName,
          school_year: schoolYear,

          // JSONB field
          grade_level: gradeLevels || [],

          street_address: streetAddress,
          city,
          state,
          zipcode: zip,
        },
      ]);

    if (error) {
      console.error(
        "Supabase Insert Error:",
        error
      );

      return Response.json(
        {
          success: false,
          message: error.message,
        },
        {
          status: 500,
        }
      );
    }

    return Response.json({
      success: true,
      message: "School created successfully",
    });

  } catch (error) {
    console.error(
      "Create school error:",
      error
    );

    return Response.json(
      {
        success: false,
        message: "Failed to create school",
      },
      {
        status: 500,
      }
    );
  }
}