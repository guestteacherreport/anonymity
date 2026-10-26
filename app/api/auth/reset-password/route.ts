import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { supabase } from "@/lib/supabase";
import {
  isUnusedPasswordResetToken,
  passwordHashDigest,
  verifyPasswordResetToken,
} from "@/lib/password-reset-token";
import { validatePassword } from "@/lib/password";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const token = typeof body.token === "string" ? body.token : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!token) {
      return NextResponse.json(
        { error: "Reset link is invalid or expired" },
        { status: 400 }
      );
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return NextResponse.json({ error: passwordError }, { status: 400 });
    }

    const verified = verifyPasswordResetToken(token);
    if (!verified) {
      return NextResponse.json(
        { error: "Reset link is invalid or expired" },
        { status: 400 }
      );
    }

    const { data: user, error: userError } = await supabase
      .from("users")
      .select("password")
      .eq("id", verified.userId)
      .maybeSingle();

    if (userError) {
      console.error("reset-password: failed to load user", userError.code ?? userError.message);
      return NextResponse.json(
        { error: "Unable to reset password. Please try again." },
        { status: 500 }
      );
    }

    // The one hash value both the token check and the swap below rely on.
    const currentHash: string | null = user ? user.password ?? null : null;

    // Already used (the password changed since the link was issued) or the
    // account is gone.
    if (!user || !isUnusedPasswordResetToken(verified, currentHash)) {
      return NextResponse.json(
        { error: "Reset link is invalid or expired" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Compare-and-swap in one UPDATE: only succeeds while the password is
    // still the one checked above, so of two concurrent requests with the
    // same token exactly one changes it. Arguments travel in the request
    // body, never in a logged URL.
    const { data: changed, error } = await supabase.rpc("reset_password_if_unchanged", {
      p_user_id: Number(verified.userId),
      p_expected_password_sha256: passwordHashDigest(currentHash),
      p_new_password_hash: hashedPassword,
    });

    if (error) {
      console.error("reset-password update error:", error.code ?? "", error.message);
      return NextResponse.json(
        { error: "Unable to reset password. Please try again." },
        { status: 500 }
      );
    }

    if (changed !== true) {
      return NextResponse.json(
        { error: "Reset link is invalid or expired" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: "Password updated successfully. You can log in now.",
    });
  } catch (error) {
    console.error("reset-password error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
