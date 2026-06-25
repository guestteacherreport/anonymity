import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { supabase } from "@/lib/supabase";
import { verifyPasswordResetToken } from "@/lib/password-reset-token";
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

    const hashedPassword = await bcrypt.hash(password, 10);

    const { error } = await supabase
      .from("users")
      .update({ password: hashedPassword })
      .eq("id", verified.userId);

    if (error) {
      console.error("reset-password update error:", error);
      return NextResponse.json(
        { error: "Unable to reset password. Please try again." },
        { status: 500 }
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
