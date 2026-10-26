import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireRole } from "@/lib/apiAuth";
import { createPasswordResetToken } from "@/lib/password-reset-token";
import { sendPasswordResetEmail } from "@/lib/email";
import { getAppUrl } from "@/lib/app-url";

// "Set password" for accounts without one (Google/Facebook or admin-created).
// Reuses the Forgot Password token and /reset-password page, sending the link
// to the account's current email so setting a password also proves mailbox
// ownership. The social login itself is unaffected: it matches by provider
// identity, not by password.
export async function POST(req: Request) {
  try {
    const auth = await requireRole(["guest_teacher"]);
    if (auth.response) return auth.response;

    const { data: user, error } = await supabase
      .from("users")
      .select("id, email, password")
      .eq("id", auth.session.user.id)
      .maybeSingle();

    if (error || !user || !user.email) {
      console.error("set password link: failed to load user", error);
      return NextResponse.json({ error: "Unable to send the link. Please try again." }, { status: 500 });
    }

    if (user.password) {
      return NextResponse.json(
        { error: "Your account already has a password. Use Change password instead." },
        { status: 400 }
      );
    }

    // Issued for "no password yet"; it stops working once a password is set.
    const token = createPasswordResetToken(String(user.id), null);
    const resetUrl = `${getAppUrl(req)}/reset-password?token=${encodeURIComponent(token)}`;

    try {
      await sendPasswordResetEmail(user.email, resetUrl);
    } catch (sendError) {
      console.error("set password link: failed to send email", sendError instanceof Error ? sendError.message : sendError);
      return NextResponse.json(
        { error: "We couldn't send the email. Please try again later." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      message: `We sent a link to ${user.email} to set your password. It expires in 1 hour.`,
    });
  } catch (error) {
    console.error("set password link error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
