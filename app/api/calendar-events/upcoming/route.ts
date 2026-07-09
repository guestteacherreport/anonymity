import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { supabase } from "@/lib/supabase";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  const now = new Date().toISOString();
  const limit = Number(req.nextUrl.searchParams.get("limit") || 5);
  const offset = Number(req.nextUrl.searchParams.get("offset") || 0);

  const { data, error } = await supabase
    .from("calendar_event")
    .select("*")
    .eq("user_id", session.user.id)
    .gte("start_date", now)
    .order("start_date", { ascending: true })
    .range(offset, offset + limit); // Fetch one extra record

  if (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }

  const hasMore = (data?.length ?? 0) > limit;

  return NextResponse.json({
    success: true,
    events: hasMore ? data!.slice(0, limit) : data,
    hasMore,
    nextOffset: hasMore ? offset + limit : null,
  });
}