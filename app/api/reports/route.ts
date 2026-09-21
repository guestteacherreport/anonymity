import { supabase } from "@/lib/supabase";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    // This route attaches submitter_name/submitter_email below - the real
    // identity behind an Anonymous report - so it must never be reachable
    // by an unauthenticated caller or a guest_teacher, even though the
    // admin UI that calls it is already page-gated. The check has to live
    // here, not just in middleware/page routing, since this is a raw API
    // route.
    const session = await getServerSession(authOptions);

    if (session?.user?.role !== "admin") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

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

    const userIds = Array.from(
      new Set(
        (data || [])
          .map((row: any) => row.user_id)
          .filter((id: unknown) => id !== null && id !== undefined)
      )
    );

    let submittersById = new Map<number, { full_name: string | null; email: string | null }>();

    if (userIds.length > 0) {
      const { data: submitters } = await supabase
        .from("users")
        .select("id, full_name, email")
        .in("id", userIds);

      submittersById = new Map(
        (submitters || []).map((u: any) => [u.id, { full_name: u.full_name, email: u.email }])
      );
    }

    const reports = (data || []).map(
      (row: any) => ({
        ...row,

        // JSONB already parsed by Supabase
        tags: Array.isArray(row.tags)
          ? row.tags
          : [],

        // Internal-only: resolves the submitting account even when post_as
        // is Anonymous and your_name is redacted, so admins can still trace
        // an anonymous report back to its submitter. Never expose this on
        // guest-facing endpoints/pages.
        submitter_name: submittersById.get(row.user_id)?.full_name ?? null,
        submitter_email: submittersById.get(row.user_id)?.email ?? null,
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