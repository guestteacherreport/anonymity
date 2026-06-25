import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { full_name, email, password } = body;

    // Validation
    if (!full_name || !email || !password) {
      return NextResponse.json(
        {
          error: "Missing required fields",
        },
        {
          status: 400,
        }
      );
    }

    // Check existing user
    const { data: existingUsers } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .limit(1);

    if (existingUsers && existingUsers.length > 0) {
      return NextResponse.json(
        {
          error:
            "Email address already exists! Please try another email address.",
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
      .select();

    if (error) {
      console.log(error);

      return NextResponse.json(
        {
          error: error.message,
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