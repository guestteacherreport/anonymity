import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import NextAuth, { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {

  const session = await getServerSession(authOptions);
  try {
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const pageUpcoming = searchParams.get("pageUpcoming");

    const offset = (page - 1) * limit;

    let query = supabase
      .from("calendar_event")
      .select("*", { count: "exact" })
      .eq("user_id", session.user.id)
      .order("start_date", { ascending: true });

    if (pageUpcoming === "true") {
      const now = new Date().toISOString();
      query = query.gte("start_date", now);
    }

    const { data, error, count } = await query.range(offset, offset + limit - 1);

    if (error) {
      console.error("Supabase Error:", error);
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    const events = (data || []).map((event: any) => ({
      id: event.id,
      title: event.title,
      start: new Date(event.start_date),
      end: new Date(event.end_date),
      school: event.school_name,
      color: event.color,
      bgColor: event.bg_color,
      reminders: event.reminders || 0,
    }));

    return NextResponse.json({
      success: true,
      events,
      total: count || 0,
      page,
      limit,
    });
  } catch (error) {
    console.error("Error fetching calendar events:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch events" },
      { status: 500 }
    );
  }
}
