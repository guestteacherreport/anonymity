import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { events } = await req.json();

    if (!Array.isArray(events) || events.length === 0) {
      return NextResponse.json(
        { success: false, message: "No events provided" },
        { status: 400 }
      );
    }

    // Validate required fields
    for (const event of events) {
      if (
        !event.title ||
        !event.start ||
        !event.end ||
        !event.school ||
        !event.schoolAddress
      ) {
        return NextResponse.json(
          { success: false, message: "Missing required fields" },
          { status: 400 }
        );
      }
    }

    // Convert payload to DB format
    const eventsToInsert = events.map((event) => ({
      title: event.title,
      start_date: event.start,
      end_date: event.end,
      school_name: event.school,
      school_address: event.schoolAddress,
      school_phone: event.schoolPhone || null,
      school_email: event.schoolEmail || null,
      school_id: event.schoolId || null,
      teacher_name: event.teacherName || null,
      teacher_id: event.teacherId || null,
      teacher_phone: event.teacherPhone || null,
      teacher_email: event.teacherEmail || null,
      notes: event.notes || null,
      color: event.color,
      bg_color: event.bgColor,
      reminders: event.reminders ?? 0,
      user_timezone:Intl.DateTimeFormat().resolvedOptions().timeZone,
      user_id: event.user_id,
      created_at: new Date().toISOString(),
    }));

    const { data, error } = await supabase
      .from("calendar_event")
      .insert(eventsToInsert)
      .select();

    if (error) {
      console.error("Supabase Error:", error);

      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json({
      success: true,
      events: data,
    });
  } catch (error) {
    console.error("Error saving calendar events:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to save events",
      },
      {
        status: 500,
      }
    );
  }
}