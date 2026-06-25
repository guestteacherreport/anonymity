import { getServerSession } from "next-auth";
import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const VALID_ROLES = ["admin", "guest_teacher"] as const;

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { role } = await req.json();

    if (!role || !VALID_ROLES.includes(role)) {
      return NextResponse.json(
        { error: "A valid role is required" },
        { status: 400 }
      );
    }

    const { data: existingUser, error: fetchError } = await supabase
      .from("users")
      .select("role")
      .eq("email", session.user.email)
      .single();

    if (fetchError || !existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (existingUser.role) {
      return NextResponse.json(
        { error: "Role has already been set" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("users")
      .update({ role })
      .eq("email", session.user.email);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { message: "Role updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating role:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
