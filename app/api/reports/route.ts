import { supabase } from "@/lib/supabase";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const page = parseInt(
      searchParams.get("page") || "1",
      10
    );

    const limit = parseInt(
      searchParams.get("limit") || "10",
      10
    );

    const search =
      searchParams.get("search") || "";

    const sentiment =
      searchParams.get("sentiment") || "All";

    const status =
      searchParams.get("status") || "All";

    const offset = (page - 1) * limit;

    // Base query
    let query = supabase
      .from("reports")
      .select("*", {
        count: "exact",
      })
      .order("created_at", {
        ascending: false,
      })
      .range(offset, offset + limit - 1);

    // Search filter
    if (search.trim()) {
      query = query.or(
        [
          `school_name.ilike.%${search}%`,
          `teacher_name.ilike.%${search}%`,
          `your_name.ilike.%${search}%`,
        ].join(",")
      );
    }

    // Sentiment filter
    if (sentiment !== "All") {
      query = query.eq(
        "AI_sentiment",
        sentiment
      );
    }

    // Status filter
    if (status !== "All") {
      let statusValue = 1;

      if (status === "Approved")
        statusValue = 2;

      if (status === "Rejected")
        statusValue = 3;

      query = query.eq(
        "status",
        statusValue
      );
    }

    const {
      data,
      error,
      count,
    } = await query;

    if (error) {
      console.error(
        "Supabase Fetch Error:",
        error
      );

      return Response.json(
        {
          error: error.message,
        },
        {
          status: 500,
        }
      );
    }

    const reports = (data || []).map(
      (row: any) => ({
        ...row,

        // JSONB already parsed by Supabase
        tags: Array.isArray(row.tags)
          ? row.tags
          : [],
      })
    );

    return Response.json({
      data: reports,

      total: count || 0,

      page,

      limit,

      totalPages: Math.ceil(
        (count || 0) / limit
      ),
    });
  } catch (error) {
    console.error(
      "Fetch reports error:",
      error
    );

    return Response.json(
      {
        error: "Failed to fetch reports",
      },
      {
        status: 500,
      }
    );
  }
}