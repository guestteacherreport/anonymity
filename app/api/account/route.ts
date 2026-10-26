import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireRole } from "@/lib/apiAuth";
import { validateDisplayName } from "@/lib/account";

// My Account is for guest teachers only. The account is always the session's
// user - no id is ever read from the request.

export async function GET() {
  try {
    const auth = await requireRole(["guest_teacher"]);
    if (auth.response) return auth.response;

    const userId = auth.session.user.id;

    const { data: user, error } = await supabase
      .from("users")
      .select("full_name, email, password")
      .eq("id", userId)
      .maybeSingle();

    if (error || !user) {
      console.error("account GET: failed to load user", error);
      return NextResponse.json({ error: "Unable to load your account" }, { status: 500 });
    }

    const { data: pending, error: pendingError } = await supabase
      .from("email_change_requests")
      .select("new_email, expires_at")
      .eq("user_id", userId)
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();

    if (pendingError) {
      console.error("account GET: failed to load pending email change", pendingError);
    }

    return NextResponse.json({
      full_name: user.full_name ?? "",
      email: user.email,
      hasPassword: !!user.password,
      pendingEmail: pending ? { email: pending.new_email, expiresAt: pending.expires_at } : null,
    });
  } catch (error) {
    console.error("account GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const auth = await requireRole(["guest_teacher"]);
    if (auth.response) return auth.response;

    const body = await req.json().catch(() => null);
    const fullName = typeof body?.full_name === "string" ? body.full_name : "";

    const nameError = validateDisplayName(fullName);
    if (nameError) {
      return NextResponse.json({ error: nameError }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("users")
      .update({ full_name: fullName.trim() })
      .eq("id", auth.session.user.id)
      .select("full_name")
      .maybeSingle();

    if (error || !data) {
      console.error("account PATCH: failed to update name", error);
      return NextResponse.json({ error: "Unable to update your name. Please try again." }, { status: 500 });
    }

    return NextResponse.json({ message: "Name updated successfully", full_name: data.full_name });
  } catch (error) {
    console.error("account PATCH error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
