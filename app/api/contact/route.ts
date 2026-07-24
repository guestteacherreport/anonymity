import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { sendContactInquiryNotification } from "@/lib/email";

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;",
  })[character] || character);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const fullName = typeof body.fullName === "string" ? body.fullName.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const subject = typeof body.subject === "string" ? body.subject.trim() : "";
    const message = typeof body.message === "string" ? body.message.trim() : "";
    const captchaToken = typeof body.captchaToken === "string" ? body.captchaToken : "";

    if (!fullName || !email || !subject || !message || !captchaToken) {
      return NextResponse.json({ error: "All fields and CAPTCHA are required." }, { status: 400 });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    const turnstileSecret = process.env.TURNSTILE_SECRET_KEY;
    if (!turnstileSecret) {
      return NextResponse.json({ error: "CAPTCHA is not configured." }, { status: 503 });
    }

    const captchaResponse = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret: turnstileSecret, response: captchaToken }),
    });
    const captchaResult = await captchaResponse.json();

    if (!captchaResult.success) {
      return NextResponse.json({ error: "CAPTCHA verification failed. Please try again." }, { status: 400 });
    }

    const { data: inquiry, error } = await supabase
      .from("contact_inquiries")
      .insert({ full_name: fullName, email, subject, message })
      .select("id")
      .single();

    if (error) {
      console.error("Contact inquiry insert error:", error);
      return NextResponse.json({ error: "Unable to save your message." }, { status: 500 });
    }

    const { data: admins, error: adminsError } = await supabase
      .from("users")
      .select("email")
      .eq("role", "admin");

    if (adminsError) {
      console.error("Contact admin lookup error:", adminsError);
    } else {
      const recipients = admins.map((admin) => admin.email).filter((value): value is string => Boolean(value));
      if (recipients.length > 0) {
        try {
          await sendContactInquiryNotification(recipients, {
            fullName: escapeHtml(fullName),
            email: escapeHtml(email),
            subject: escapeHtml(subject),
            message: escapeHtml(message).replace(/\n/g, "<br />"),
          });
        } catch (notificationError) {
          console.error("Contact notification error:", notificationError);
        }
      }
    }

    return NextResponse.json({ success: true, inquiryId: inquiry.id });
  } catch (error) {
    console.error("Contact submission error:", error);
    return NextResponse.json({ error: "Unable to send your message." }, { status: 500 });
  }
}
