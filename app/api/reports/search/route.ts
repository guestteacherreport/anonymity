
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          error: "Login is required",
        },
        {
          status: 401,
        }
      );
    }

    const { searchParams } = new URL(req.url);

    // This is "my submitted reports" - always the caller's own id from the
    // session, never the client-supplied query param, so one user can't
    // page through another user's report history (including their real
    // your_name) by passing a different userid.
    const userid = session.user.id;
    const searchQuery = searchParams.get("search") || "";

    const page = parseInt(
      searchParams.get("page") || "1",
      10
    );

    const limit = parseInt(
      searchParams.get("limit") || "10",
      10
    );

    const offset = (page - 1) * limit;

    // =========================
    // FETCH REPORTS
    // =========================

    let query = supabase
      .from("reports")
      .select(
        `
        *,
        schools (
          id,
          school_name,
          city,
          state
        )
      `,
        {
          count: "exact",
        }
      )
      .eq("user_id", userid);

    // Add search filters if search query provided
    if (searchQuery.trim()) {
      query = query.or(
        `school_name.ilike.%${searchQuery}%,feedback.ilike.%${searchQuery}%`
      );
    }

    const {
      data,
      error,
      count,
    } = await query
      .order("created_at", {
        ascending: false,
      })
      .range(offset, offset + limit - 1);

    if (error) {
      return NextResponse.json(
        {
          error: error.message,
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json({
      success: true,

      data: data || [],

      total: count || 0,

      page,

      limit,

      totalPages: Math.ceil(
        (count || 0) / limit
      ),
    });
  } catch (error) {
    console.error("Server Error:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch reports",
      },
      {
        status: 500,
      }
    );
  }
}
