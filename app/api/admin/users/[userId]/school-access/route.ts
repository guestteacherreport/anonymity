import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getCurrentSession } from "@/lib/schoolAccess";
import { getAppUrl } from "@/lib/app-url";
import { sendSchoolAccessStatusEmail } from "@/lib/email";

const ACTION_TO_STATUS: Record<string, string> = {
  grant: "approved",
  approve: "approved",
  reject: "rejected",
  revoke: "revoked",
};

const VALID_STATUSES = ["approved", "pending", "rejected", "revoked"] as const;
type Status = (typeof VALID_STATUSES)[number];
const NON_DEFAULT_STATUSES: Status[] = ["pending", "rejected", "revoked"];

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await getCurrentSession();

    if (session?.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId } = await params;

    const { data: targetUser, error: userError } = await supabase
      .from("users")
      .select("id, full_name, email, role")
      .eq("id", userId)
      .single();

    if (userError || !targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";

    const selectedStatuses = Array.from(
      new Set(
        searchParams
          .getAll("status")
          .filter((s): s is Status => (VALID_STATUSES as readonly string[]).includes(s))
      )
    );

    const offset = (page - 1) * limit;

    // Guest teachers have full access by default, so "approved" schools are
    // everything except those with an explicit pending/rejected/revoked row.
    // Filtering by a subset of statuses therefore needs this user's explicit
    // access rows (a small, per-teacher set) to translate into a school id
    // filter - it can't be expressed as a plain column filter on `schools`.
    const isFilteringByStatus =
      selectedStatuses.length > 0 && selectedStatuses.length < VALID_STATUSES.length;

    let includeSchoolIds: number[] | null = null;
    let excludeSchoolIds: number[] | null = null;

    if (isFilteringByStatus) {
      const { data: nonDefaultRows, error: nonDefaultError } = await supabase
        .from("school_access_requests")
        .select("school_id, status")
        .eq("user_id", userId)
        .in("status", NON_DEFAULT_STATUSES);

      if (nonDefaultError) {
        return NextResponse.json({ error: nonDefaultError.message }, { status: 500 });
      }

      const idsByStatus: Record<string, number[]> = { pending: [], rejected: [], revoked: [] };
      for (const row of nonDefaultRows || []) {
        idsByStatus[row.status]?.push(row.school_id);
      }

      if (selectedStatuses.includes("approved")) {
        excludeSchoolIds = NON_DEFAULT_STATUSES.filter((s) => !selectedStatuses.includes(s)).flatMap(
          (s) => idsByStatus[s]
        );
      } else {
        includeSchoolIds = Array.from(
          new Set(selectedStatuses.flatMap((s) => idsByStatus[s] || []))
        );
      }
    }

    if (includeSchoolIds && includeSchoolIds.length === 0) {
      // No school has any of the selected statuses for this teacher.
      return NextResponse.json({
        user: targetUser,
        schools: [],
        pagination: { total: 0, page, limit, totalPages: 0 },
      });
    }

    let schoolsQuery = supabase
      .from("schools")
      .select("id, school_name, city, state", { count: "exact" })
      .order("school_name", { ascending: true });

    if (search.trim()) {
      schoolsQuery = schoolsQuery.ilike("school_name", `%${search.trim()}%`);
    }

    if (includeSchoolIds) {
      schoolsQuery = schoolsQuery.in("id", includeSchoolIds);
    }

    if (excludeSchoolIds && excludeSchoolIds.length > 0) {
      schoolsQuery = schoolsQuery.not("id", "in", `(${excludeSchoolIds.join(",")})`);
    }

    const {
      data: schools,
      error: schoolsError,
      count,
    } = await schoolsQuery.range(offset, offset + limit - 1);

    if (schoolsError) {
      return NextResponse.json({ error: schoolsError.message }, { status: 500 });
    }

    const schoolIds = (schools || []).map((s) => s.id);

    let accessMap: Record<string, { status: string; decided_at: string | null; requested_at: string }> = {};

    if (schoolIds.length > 0) {
      const { data: accessRows, error: accessError } = await supabase
        .from("school_access_requests")
        .select("school_id, status, decided_at, requested_at")
        .eq("user_id", userId)
        .in("school_id", schoolIds);

      if (accessError) {
        return NextResponse.json({ error: accessError.message }, { status: 500 });
      }

      accessMap = Object.fromEntries(
        (accessRows || []).map((row) => [row.school_id, row])
      );
    }

    const schoolsWithAccess = (schools || []).map((school) => ({
      ...school,
      // Guest teachers have full access by default; a row only exists once
      // a Super Admin has acted on this specific school for this teacher.
      access: accessMap[school.id]
        ? {
            status: accessMap[school.id].status,
            decidedAt: accessMap[school.id].decided_at,
            requestedAt: accessMap[school.id].requested_at,
          }
        : { status: "approved", decidedAt: null, requestedAt: null },
    }));

    const totalPages = count ? Math.ceil(count / limit) : 0;

    return NextResponse.json({
      user: targetUser,
      schools: schoolsWithAccess,
      pagination: {
        total: count || 0,
        page,
        limit,
        totalPages,
      },
    });
  } catch (error) {
    console.error("School access list error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await getCurrentSession();

    if (session?.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId } = await params;
    const body = await req.json();
    const { schoolId, action } = body;

    if (!schoolId) {
      return NextResponse.json({ error: "schoolId is required" }, { status: 400 });
    }

    const newStatus = ACTION_TO_STATUS[action];

    if (!newStatus) {
      return NextResponse.json(
        { error: "Invalid action. Must be grant, approve, reject, or revoke." },
        { status: 400 }
      );
    }

    const { data: targetUser, error: userError } = await supabase
      .from("users")
      .select("id, role, full_name, email")
      .eq("id", userId)
      .single();

    if (userError || !targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (targetUser.role !== "guest_teacher") {
      return NextResponse.json(
        { error: "School access can only be managed for guest teachers" },
        { status: 400 }
      );
    }

    const { data: existing } = await supabase
      .from("school_access_requests")
      .select("id")
      .eq("user_id", userId)
      .eq("school_id", schoolId)
      .maybeSingle();

    const now = new Date().toISOString();

    if (existing) {
      const { error } = await supabase
        .from("school_access_requests")
        .update({
          status: newStatus,
          decided_at: now,
          decided_by: session.user.id,
          updated_at: now,
        })
        .eq("id", existing.id);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    } else {
      const { error } = await supabase.from("school_access_requests").insert({
        user_id: userId,
        school_id: schoolId,
        status: newStatus,
        requested_at: now,
        decided_at: now,
        decided_by: session.user.id,
      });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    if (targetUser.email) {
      try {
        const { data: school } = await supabase
          .from("schools")
          .select("school_name")
          .eq("id", schoolId)
          .maybeSingle();

        await sendSchoolAccessStatusEmail(targetUser.email, {
          guestTeacherName: targetUser.full_name || targetUser.email,
          schoolName: school?.school_name || "the requested school",
          status: newStatus as "approved" | "rejected" | "revoked",
          actionUrl: `${getAppUrl(req)}/school/${schoolId}`,
        });
      } catch (notificationError) {
        console.error("Unable to send school access status notification:", notificationError);
      }
    }

    return NextResponse.json({ success: true, status: newStatus });
  } catch (error) {
    console.error("School access update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
