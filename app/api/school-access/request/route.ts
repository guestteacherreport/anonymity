import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getCurrentSession } from "@/lib/schoolAccess";
import { getAppUrl } from "@/lib/app-url";
import { sendSchoolAccessRequestNotification } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentSession();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "You must be logged in to request access" },
        { status: 401 }
      );
    }

    if (session.user.role !== "guest_teacher") {
      return NextResponse.json(
        { success: false, message: "Only guest teachers can request school access" },
        { status: 403 }
      );
    }

    const { schoolId } = await req.json();

    if (!schoolId) {
      return NextResponse.json(
        { success: false, message: "schoolId is required" },
        { status: 400 }
      );
    }

    const { data: school } = await supabase
      .from("schools")
      .select("id, school_name")
      .eq("id", schoolId)
      .maybeSingle();

    if (!school) {
      return NextResponse.json(
        { success: false, message: "School not found" },
        { status: 404 }
      );
    }

    const { data: existing } = await supabase
      .from("school_access_requests")
      .select("id, status")
      .eq("user_id", session.user.id)
      .eq("school_id", schoolId)
      .maybeSingle();

    if (existing?.status === "pending") {
      return NextResponse.json(
        { success: false, message: "You already have a pending request for this school" },
        { status: 409 }
      );
    }

    // Guest teachers have access to every school by default (no row, or an
    // explicit "approved" row), so there is nothing to request unless a
    // Super Admin has revoked or rejected access for this specific school.
    if (!existing || existing.status === "approved") {
      return NextResponse.json(
        { success: false, message: "You already have access to this school" },
        { status: 409 }
      );
    }

    // Re-request after a revocation/rejection
    const { error } = await supabase
      .from("school_access_requests")
      .update({
        status: "pending",
        requested_at: new Date().toISOString(),
        decided_at: null,
        decided_by: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id);

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    const { data: admins, error: adminsError } = await supabase
      .from("users")
      .select("email")
      .eq("role", "admin");

    if (adminsError) {
      console.error("Unable to look up super admins:", adminsError);
    } else {
      const recipients = admins
        .map((admin) => admin.email)
        .filter((email): email is string => Boolean(email));

      if (recipients.length > 0) {
        try {
          await sendSchoolAccessRequestNotification(recipients, {
            guestTeacherName: session.user.name || session.user.email || "A guest teacher",
            guestTeacherEmail: session.user.email || "",
            schoolName: school.school_name,
            reviewUrl: `${getAppUrl(req)}/admin/users/${session.user.id}/school-access`,
          });
        } catch (notificationError) {
          console.error("Unable to send school access request notification:", notificationError);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "Access request submitted",
      status: "pending",
    });
  } catch (error) {
    console.error("School access request error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to submit access request" },
      { status: 500 }
    );
  }
}
