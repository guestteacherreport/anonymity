import crypto from "crypto";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireRole } from "@/lib/apiAuth";
import { escapeLike, validateEmail } from "@/lib/account";
import { sendEmailChangeApproval, sendEmailChangeConfirmation } from "@/lib/email";
import { createEmailChangeApprovalToken, verifyEmailChangeApprovalToken } from "@/lib/email-change-approval";
import { getAppUrl } from "@/lib/app-url";

const EMAIL_CHANGE_EXPIRY_MS = 60 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

// Starts an email change: stores a hashed one-time token for the session's
// user and mails the link to the NEW address. users.email is not touched until
// /api/account/email/confirm succeeds.
//
// The caller must first prove it is the account owner, not just someone with
// the session:
// - accounts with a password send `currentPassword`, checked with bcrypt
//   before anything else is looked up or written;
// - passwordless (Google/Facebook) accounts first get an approval link at
//   their CURRENT address; opening it posts back `approvalToken`, and only
//   then is the confirmation sent to the new address.
export async function POST(req: Request) {
  try {
    const auth = await requireRole(["guest_teacher"]);
    if (auth.response) return auth.response;

    const userId = auth.session.user.id;
    const body = await req.json().catch(() => null);
    const currentPassword = typeof body?.currentPassword === "string" ? body.currentPassword : "";
    const approvalToken = typeof body?.approvalToken === "string" ? body.approvalToken : "";

    const { data: user, error: userError } = await supabase
      .from("users")
      .select("email, password")
      .eq("id", userId)
      .maybeSingle();

    if (userError || !user) {
      console.error("email change: failed to load user", userError);
      return NextResponse.json({ error: "Unable to process your request" }, { status: 500 });
    }

    let newEmail: string;

    if (user.password) {
      newEmail = typeof body?.email === "string" ? body.email.trim() : "";
      const emailError = validateEmail(newEmail);
      if (emailError) {
        return NextResponse.json({ error: emailError }, { status: 400 });
      }
      if (!currentPassword || currentPassword.length > 128) {
        return NextResponse.json({ error: "Current password is required" }, { status: 400 });
      }
      if (!(await bcrypt.compare(currentPassword, user.password))) {
        return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
      }
    } else if (approvalToken) {
      const approved =
        approvalToken.length <= 2048 && user.email
          ? verifyEmailChangeApprovalToken(approvalToken, String(userId), user.email)
          : null;
      if (!approved) {
        return NextResponse.json(
          { error: "This approval link is invalid or has expired. Please request the email change again from My Account." },
          { status: 400 }
        );
      }
      newEmail = approved.newEmail;
    } else {
      newEmail = typeof body?.email === "string" ? body.email.trim() : "";
      const emailError = validateEmail(newEmail);
      if (emailError) {
        return NextResponse.json({ error: emailError }, { status: 400 });
      }
    }

    if (user.email?.toLowerCase() === newEmail.toLowerCase()) {
      return NextResponse.json({ error: "This is already your email address" }, { status: 400 });
    }

    const { data: taken, error: takenError } = await supabase
      .from("users")
      .select("id")
      .ilike("email", escapeLike(newEmail))
      .neq("id", userId)
      .limit(1);

    if (takenError) {
      console.error("email change: uniqueness check failed", takenError);
      return NextResponse.json({ error: "Unable to process your request" }, { status: 500 });
    }

    if (taken && taken.length > 0) {
      return NextResponse.json(
        { error: "This email address is already registered. Please use a different email address." },
        { status: 409 }
      );
    }

    // Passwordless account, first step: ask the current mailbox to approve.
    if (!user.password && !approvalToken) {
      if (!user.email) {
        console.error("email change: passwordless account has no current email", userId);
        return NextResponse.json({ error: "Unable to process your request" }, { status: 500 });
      }

      const token = createEmailChangeApprovalToken(String(userId), user.email, newEmail);
      const approveUrl = `${getAppUrl(req)}/account/confirm-email?approve=${encodeURIComponent(token)}`;

      try {
        await sendEmailChangeApproval(user.email, newEmail, approveUrl);
      } catch (sendError) {
        console.error("email change: failed to send approval email", sendError instanceof Error ? sendError.message : sendError);
        return NextResponse.json(
          { error: "We couldn't send the approval email. Please try again later." },
          { status: 502 }
        );
      }

      return NextResponse.json({
        message: `To keep your account secure, we sent an approval link to ${user.email}. Open it while signed in to continue.`,
        approvalSentTo: user.email,
      });
    }

    const { data: existing, error: existingError } = await supabase
      .from("email_change_requests")
      .select("created_at")
      .eq("user_id", userId)
      .maybeSingle();

    if (existingError) {
      console.error("email change: failed to read pending request", existingError);
      return NextResponse.json({ error: "Email change is not available right now" }, { status: 500 });
    }

    if (existing && Date.now() - new Date(existing.created_at).getTime() < RESEND_COOLDOWN_MS) {
      return NextResponse.json(
        { error: "Please wait a minute before requesting another confirmation email" },
        { status: 429 }
      );
    }

    const token = crypto.randomBytes(32).toString("base64url");
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + EMAIL_CHANGE_EXPIRY_MS).toISOString();

    // One row per user: this replaces (and so invalidates) any earlier link.
    const { error: saveError } = await supabase
      .from("email_change_requests")
      .upsert(
        {
          user_id: userId,
          new_email: newEmail,
          token_hash: tokenHash,
          expires_at: expiresAt,
          created_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );

    if (saveError) {
      console.error("email change: failed to save request", saveError);
      return NextResponse.json({ error: "Email change is not available right now" }, { status: 500 });
    }

    const confirmUrl = `${getAppUrl(req)}/account/confirm-email?token=${encodeURIComponent(token)}`;

    try {
      await sendEmailChangeConfirmation(newEmail, confirmUrl);
    } catch (sendError) {
      console.error("email change: failed to send confirmation email", sendError instanceof Error ? sendError.message : sendError);
      // Don't leave a pending change behind for a link nobody received.
      await supabase
        .from("email_change_requests")
        .delete()
        .eq("user_id", userId)
        .eq("token_hash", tokenHash);
      return NextResponse.json(
        { error: "We couldn't send the confirmation email. Please check the address and try again later." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      message: `We sent a confirmation link to ${newEmail}. Your current email stays active until you confirm.`,
      pendingEmail: { email: newEmail, expiresAt },
    });
  } catch (error) {
    console.error("email change error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
