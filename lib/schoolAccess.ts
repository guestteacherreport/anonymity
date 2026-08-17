import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export type SchoolAccessStatus = "none" | "pending" | "approved" | "rejected" | "revoked";

export async function getCurrentSession() {
  return getServerSession(authOptions);
}

export async function getSchoolAccessStatus(
  userId: string,
  schoolId: string
): Promise<SchoolAccessStatus> {
  const { data } = await supabase
    .from("school_access_requests")
    .select("status")
    .eq("user_id", userId)
    .eq("school_id", schoolId)
    .maybeSingle();

  // Guest teachers have full access to every school by default. A row only
  // exists once a Super Admin has explicitly acted on that school for that
  // teacher (revoke, or grant/approve after a revoke), or the teacher has
  // requested restored access following a revoke/reject.
  return (data?.status as SchoolAccessStatus) || "approved";
}

export async function hasSchoolReportAccess(
  role: string | null | undefined,
  userId: string | undefined,
  schoolId: string
): Promise<boolean> {
  if (role === "admin") return true;
  if (role === "guest_teacher" && userId) {
    const status = await getSchoolAccessStatus(userId, schoolId);
    return status === "approved";
  }
  return false;
}
