import crypto from "crypto";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireRole } from "@/lib/apiAuth";
import { sendEmailChangedNotice } from "@/lib/email";

const MESSAGES: Record<string, { status: number; error: string }> = {
  invalid: {
    status: 400,
    error: "This confirmation link is invalid, has already been used, or was replaced by a newer request.",
  },
  expired: {
    status: 400,
    error: "This confirmation link has expired. Please request a new email change from My Account.",
  },
  email_taken: {
    status: 409,
    error: "This email address is already registered to another account. Please request a change to a different address.",
  },
};

// Confirms an email change. The signed-in user must be the one who asked for
// it: the token is only accepted together with the session's user id, so a
// link opened by someone else (e.g. a mistyped address) cannot take over the
// account. Token consumption, the uniqueness re-check and the users.email
// update happen in one transaction inside confirm_email_change().
export async function POST(req: Request) {
  try {
    const auth = await requireRole(["guest_teacher"]);
    if (auth.response) return auth.response;

    const body = await req.json().catch(() => null);
    const token = typeof body?.token === "string" ? body.token : "";

    if (!token || token.length > 200) {
      return NextResponse.json({ error: MESSAGES.invalid.error }, { status: 400 });
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const { data, error } = await supabase.rpc("confirm_email_change", {
      p_user_id: Number(auth.session.user.id),
      p_token_hash: tokenHash,
    });

    if (error) {
      console.error("confirm email change: rpc failed", error);
      return NextResponse.json({ error: "Unable to confirm your email change. Please try again." }, { status: 500 });
    }

    const result = (Array.isArray(data) ? data[0] : data) as
      | { status: string; old_email: string | null; new_email: string | null }
      | undefined;

    if (!result || result.status !== "confirmed" || !result.new_email) {
      const failure = MESSAGES[result?.status ?? "invalid"] ?? MESSAGES.invalid;
      return NextResponse.json({ error: failure.error }, { status: failure.status });
    }

    if (result.old_email) {
      try {
        await sendEmailChangedNotice(result.old_email, result.new_email);
      } catch (noticeError) {
        // The change itself succeeded; a failed notice must not undo it.
        console.error("confirm email change: failed to notify previous address", noticeError instanceof Error ? noticeError.message : noticeError);
      }
    }

    // Only so the page can word its success message for password vs
    // Google/Facebook accounts. The hash itself is never returned.
    const { data: account, error: accountError } = await supabase
      .from("users")
      .select("password")
      .eq("id", auth.session.user.id)
      .maybeSingle();

    if (accountError) {
      console.error("confirm email change: failed to read sign-in method", accountError);
    }

    return NextResponse.json({
      message: "Your email address has been updated.",
      email: result.new_email,
      hasPassword: account ? !!account.password : null,
    });
  } catch (error) {
    console.error("confirm email change error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
