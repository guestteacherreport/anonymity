import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { name, status, school_id } = await req.json();

    if (!name || status === undefined || !school_id) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Missing required fields: name, status, school_id",
        },
        {
          status: 400,
        }
      );
    }

    const statusValue =
      status === "Active" ? 1 : 0;

    const { error } = await supabase
      .from("teachers")
      .insert([
        {
          name,
          school_id,
          status: statusValue,
        },
      ]);

    if (error) {
      console.error("Supabase Insert Error:", error);

      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Teacher added successfully",
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("Error adding teacher:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to add teacher",
      },
      {
        status: 500,
      }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const search =
      req.nextUrl.searchParams.get("search") || "";

    const school_id =
      req.nextUrl.searchParams.get("school_id");

    const page = parseInt(
      req.nextUrl.searchParams.get("page") || "1"
    );

    const limit = parseInt(
      req.nextUrl.searchParams.get("limit") || "10"
    );

    const riskFilter =
      req.nextUrl.searchParams.get("risk") || "";

    const statusFilter =
      req.nextUrl.searchParams.get("status") || "";

    const offset = (page - 1) * limit;

    if (!school_id) {
      return NextResponse.json(
        {
          success: false,
          message: "school_id is required",
        },
        {
          status: 400,
        }
      );
    }

    // Fetch teachers
    let teachersQuery = supabase
      .from("teachers")
      .select("*", {
        count: "exact",
      })
      .eq("school_id", school_id)
      .order("id", {
        ascending: false,
      })
      .range(offset, offset + limit - 1);

    // Search filter
    if (search.trim()) {
      teachersQuery = teachersQuery.ilike(
        "name",
        `%${search}%`
      );
    }

    // Status filter
    if (statusFilter && statusFilter !== "All") {
      teachersQuery = teachersQuery.eq(
        "status",
        statusFilter === "Active" ? 1 : 0
      );
    }

    // Risk filter
    if (riskFilter && riskFilter !== "All") {
      teachersQuery = teachersQuery.eq(
        "risk",
        riskFilter
      );
    }

    const {
      data: teachersData,
      error: teachersError,
      count,
    } = await teachersQuery;

    if (teachersError) {
      console.error(teachersError);

      return NextResponse.json(
        {
          success: false,
          message: teachersError.message,
        },
        {
          status: 500,
        }
      );
    }

    // Fetch reports
    // const { data: reportsData } = await supabase
    //   .from("reports")
    //   .select("*")
    //   .eq("status",2)
    //   .eq("school_id", school_id);

    // Merge teachers with reports analytics
    // const teachers = (teachersData || [])
    //   .map((teacher: any) => {
    //     const teacherReports =
    //       (reportsData || []).filter(
    //         (r: any) =>
    //           r.teacher_id === teacher.id
    //       );

    //     const reportsCount =
    //       teacherReports.length;

    //     let avgRating = 0;

    //     if (reportsCount > 0) {
    //       const total = teacherReports.reduce(
    //         (sum: number, r: any) => {
    //           if (r.return_to_teacher === 1)
    //             return sum + 5;

    //           if (r.return_to_teacher === 3)
    //             return sum + 3;

    //           if (r.return_to_teacher === 2)
    //             return sum + 0;

    //           return sum;
    //         },
    //         0
    //       );

    //       avgRating = Number(
    //         (total / reportsCount).toFixed(1)
    //       );
    //     }

    //     // Risk calculation
    //     let risk = "Medium";

    //     const negativeCount =
    //       teacherReports.filter(
    //         (r: any) =>
    //           r.return_to_teacher === 2
    //       ).length;

    //     const positiveCount =
    //       teacherReports.filter(
    //         (r: any) =>
    //           r.return_to_teacher === 1
    //       ).length;

    //     if (reportsCount === 0) {
    //       risk = "N/A";
    //     } else if (
    //       negativeCount >
    //       reportsCount * 0.5
    //     ) {
    //       risk = "High";
    //     } else if (
    //       positiveCount >
    //       reportsCount * 0.6
    //     ) {
    //       risk = "Low";
    //     }

    //     return {
    //       id: teacher.id,

    //       name: teacher.name,

    //       reports: reportsCount,

    //       avgRating,

    //       risk,

    //       status:
    //         teacher.status === 1
    //           ? "Active"
    //           : "Inactive",
    //     };
    //   })
    //   .filter((teacher: any) => {
    //     if (
    //       riskFilter &&
    //       riskFilter !== "All"
    //     ) {
    //       return teacher.risk === riskFilter;
    //     }

    //     return true;
    //   });

    return NextResponse.json({
      success: true,

      teachers: teachersData,

      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil(
          (count || 0) / limit
        ),
      },
    });
  } catch (error) {
    console.error(
      "Error fetching teachers:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch teachers",
      },
      {
        status: 500,
      }
    );
  }
}