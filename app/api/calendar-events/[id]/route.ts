import { NextRequest, NextResponse } from "next/server";
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getServerSession } from "next-auth";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const eventId = parseInt(params.id, 10);

    const { data, error } = await supabase
      .from("calendar_event")
      .select("*")
      .eq("id", eventId)
      .eq("user_email", session.user.email)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { success: false, message: "Event not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      event: data,
    });
  } catch (error) {
    console.error("Error fetching event:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch event" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const eventId = parseInt(params.id, 10);
    const body = await req.json();

    const {
      title,
      start_date,
      end_date,
      school_name,
      school_address,
      school_phone,
      school_email,
      teacher_name,
      teacher_phone,
      teacher_email,
      notes,
    } = body;

    const { data, error } = await supabase
      .from("calendar_event")
      .update({
        title,
        start_date,
        end_date,
        school_name,
        school_address,
        school_phone: school_phone || null,
        school_email: school_email || null,
        teacher_name: teacher_name || null,
        teacher_phone: teacher_phone || null,
        teacher_email: teacher_email || null,
        notes: notes || null,
      })
      .eq("id", eventId)
      .eq("user_email", session.user.email)
      .select()
      .single();

    if (error) {
      console.error("Supabase Error:", error);
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      event: data,
    });
  } catch (error) {
    console.error("Error updating event:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update event" },
      { status: 500 }
    );
  }
}
