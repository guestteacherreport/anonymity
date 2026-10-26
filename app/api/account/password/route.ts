import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { supabase } from "@/lib/supabase";
import { requireRole } from "@/lib/apiAuth";
import { validatePassword } from "@/lib/password";

// Change password for an account that already has one. Passwordless (social
// or admin-created) accounts use /api/account/password/set-link instead.
export async function POST(req: Request) {
  try {
    const auth = await requireRole(["guest_teacher"]);
    if (auth.response) return auth.response;

    const body = await req.json().catch(() => null);
    const currentPassword = typeof body?.currentPassword === "string" ? body.currentPassword : "";
    const newPassword = typeof body?.newPassword === "string" ? body.newPassword : "";

    if (!currentPassword || currentPassword.length > 128) {
      return NextResponse.json({ error: "Current password is required" }, { status: 400 });
    }

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      return NextResponse.json({ error: passwordError }, { status: 400 });
    }

    const { data: user, error: userError } = await supabase
      .from("users")
      .select("password")
      .eq("id", auth.session.user.id)
      .maybeSingle();

    if (userError || !user) {
      console.error("change password: failed to load user", userError);
      return NextResponse.json({ error: "Unable to change your password. Please try again." }, { status: 500 });
    }

    if (!user.password) {
      return NextResponse.json(
        { error: "Your account doesn't have a password yet. Use Set password instead." },
        { status: 400 }
      );
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
    }

    if (await bcrypt.compare(newPassword, user.password)) {
      return NextResponse.json(
        { error: "New password must be different from your current password" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const { error } = await supabase
      .from("users")
      .update({ password: hashedPassword })
      .eq("id", auth.session.user.id);

    if (error) {
      console.error("change password: update failed", error);
      return NextResponse.json({ error: "Unable to change your password. Please try again." }, { status: 500 });
    }

    return NextResponse.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("change password error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
