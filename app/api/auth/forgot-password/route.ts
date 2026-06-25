import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { createPasswordResetToken } from "@/lib/password-reset-token";
import { sendPasswordResetEmail } from "@/lib/email";
import { getAppUrl } from "@/lib/app-url";

const GENERIC_MESSAGE =
  "If an account with that email exists, we sent a password reset link.";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = typeof body.email === "string" ? body.email.trim() : "";

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    const { data: users } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .limit(1);

    const user = users?.[0];

    if (user) {
      const token = createPasswordResetToken(String(user.id));
      const resetUrl = `${getAppUrl(req)}/reset-password?token=${encodeURIComponent(token)}`;
     
      await sendPasswordResetEmail(email, resetUrl);
      return NextResponse.json({ message: GENERIC_MESSAGE, resetUrl: resetUrl });
     
    }

    return NextResponse.json({ message: GENERIC_MESSAGE });
  } catch (error) {
    console.error("forgot-password error:", error);
    return NextResponse.json(
      { error: "Unable to send reset email. Please try again later." },
      { status: 500 }
    );
  }
}
