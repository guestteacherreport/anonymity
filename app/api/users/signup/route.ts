import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { supabase } from "@/lib/supabase";
import { escapeLike, isDuplicateEmailError } from "@/lib/account";
import { validatePassword } from "@/lib/password";

const DUPLICATE_EMAIL_ERROR = "Email address already exists! Please try another email address.";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { full_name, email, password } = body;

    // Validation
    if (!full_name || !email || !password || typeof email !== "string") {
      return NextResponse.json(
        {
          error: "Missing required fields",
        },
        {
          status: 400,
        }
      );
    }

    const passwordError = typeof password === "string" ? validatePassword(password) : "Invalid password";
    if (passwordError) {
      return NextResponse.json({ error: passwordError }, { status: 400 });
    }

    // Check existing user (case-insensitive, matching the lower(email) unique
    // index). This is only a fast path for a friendly message: concurrent
    // signups can both pass it, and the index then rejects all but one.
    const { data: existingUsers } = await supabase
      .from("users")
      .select("id")
      .ilike("email", escapeLike(email))
      .limit(1);

    if (existingUsers && existingUsers.length > 0) {
      return NextResponse.json(
        {
          error: DUPLICATE_EMAIL_ERROR,
        },
        {
          status: 400,
        }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const { data, error } = await supabase
      .from("users")
      .insert([
        {
          full_name,
          email,
          password: hashedPassword,
          role: "guest_teacher",
        },
      ])
      // Never return the password hash or other internal columns.
      .select("id, full_name, email, role");

    if (error) {
      if (isDuplicateEmailError(error)) {
        return NextResponse.json(
          {
            error: DUPLICATE_EMAIL_ERROR,
          },
          {
            status: 400,
          }
        );
      }

      console.log(error);

      return NextResponse.json(
        {
          error: "Sign up failed, please try once again!",
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json({
      success: true,
      user: data,
    });
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      {
        error: "Internal server error",
      },
      {
        status: 500,
      }
    );
  }
}