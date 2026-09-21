import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { formatInTimeZone } from "date-fns-tz";
import { supabase } from "@/lib/supabase";
import { authOptions } from "@/lib/auth";

// Grouping is a display-only concern here - the underlying calendar_event
// rows (and Calendar's rendering of them) are never touched. Rows are
// fetched in one ascending-by-date window and then folded into "jobs",
// where a job is either a single standalone row or a run of consecutive
// rows (in date order) that share the same local start time. This is
// intentionally independent of assignment_id / how or when the rows were
// created - two events created in separate submissions still join the
// same job as long as nothing with a different start time falls between
// them in the sorted list. A different start time is what breaks a run;
// a date gap on its own does not.
const MAX_UPCOMING_ROWS = 1000;

type CalendarEventRow = {
  id: number;
  start_date: string;
  end_date: string;
  user_timezone: string | null;
  [key: string]: unknown;
};

function localStartTimeKey(startDate: string, timezone: string | null) {
  try {
    return formatInTimeZone(new Date(startDate), timezone || "UTC", "HH:mm");
  } catch {
    return new Date(startDate).toISOString().slice(11, 16);
  }
}

function groupIntoJobs(rows: CalendarEventRow[]) {
  const groups: CalendarEventRow[][] = [];
  let current: CalendarEventRow[] = [];
  let currentGroupKey: string | null = null;

  for (const row of rows) {
    const groupKey = localStartTimeKey(row.start_date, row.user_timezone);

    if (current.length && groupKey === currentGroupKey) {
      current.push(row);
    } else {
      if (current.length) groups.push(current);
      current = [row];
      currentGroupKey = groupKey;
    }
  }
  if (current.length) groups.push(current);

  return groups;
}

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
    .order("id", { ascending: true })
    .range(0, MAX_UPCOMING_ROWS - 1);

  if (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }

  const jobGroups = groupIntoJobs(data ?? []);
  const page = jobGroups.slice(offset, offset + limit + 1); // Fetch one extra job
  const hasMore = page.length > limit;
  const pageGroups = hasMore ? page.slice(0, limit) : page;

  const events = pageGroups.map((members) => {
    if (members.length === 1) return members[0];

    const first = members[0];
    return {
      grouped: true,
      // first.id is stable and unique per group (the group always starts
      // at the same row across a re-fetch, since membership only depends
      // on start_date order and start time) - just needs to be a unique
      // React/dedup key for the frontend, not a semantic grouping id.
      groupKey: `${first.id}::${localStartTimeKey(first.start_date, first.user_timezone)}`,
      title: first.title,
      school_name: first.school_name,
      color: first.color,
      bg_color: first.bg_color,
      members,
    };
  });

  return NextResponse.json({
    success: true,
    events,
    hasMore,
    nextOffset: hasMore ? offset + limit : null,
  });
}
