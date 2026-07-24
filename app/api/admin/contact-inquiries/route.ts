import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  return session?.user?.role === "admin";
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("contact_inquiries")
    .select("id, full_name, email, subject, message, status, created_at, updated_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Contact inquiries fetch error:", error);
    return NextResponse.json({ error: "Unable to load inquiries." }, { status: 500 });
  }

  return NextResponse.json({ inquiries: data || [] });
}

export async function PATCH(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const id = Number(body.id);
  const status = body.status;

  if (!Number.isInteger(id) || !["new", "read", "resolved"].includes(status)) {
    return NextResponse.json({ error: "Invalid inquiry update." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("contact_inquiries")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("id, status")
    .single();

  if (error) {
    console.error("Contact inquiry update error:", error);
    return NextResponse.json({ error: "Unable to update inquiry." }, { status: 500 });
  }

  return NextResponse.json({ inquiry: data });
}
