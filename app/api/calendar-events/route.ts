import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { supabase } from "@/lib/supabase";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const MAX_ASSIGNMENT_DAYS = 6;

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

    if (events.length > MAX_ASSIGNMENT_DAYS) {
      return NextResponse.json(
        {
          success: false,
          message: `A multi-day assignment can include at most ${MAX_ASSIGNMENT_DAYS} days`,
        },
        { status: 400 }
      );
    }

    // Validate required fields, plus the multi-day date/time rules. `date`
    // is the plain "YYYY-MM-DD" the user picked for that day (as opposed to
    // `start`/`end`, which are full ISO timestamps) - it's what lets the
    // chronological-order check below stay correct regardless of server
    // timezone. Any day of the week, including Sunday, is a valid pick.
    const dateStrings: string[] = [];

    for (const event of events) {
      if (
        !event.title ||
        !event.start ||
        !event.end ||
        !event.date ||
        !event.school ||
        !event.schoolAddress
      ) {
        return NextResponse.json(
          { success: false, message: "Missing required fields" },
          { status: 400 }
        );
      }

      const startMs = new Date(event.start).getTime();
      const endMs = new Date(event.end).getTime();

      if (Number.isNaN(startMs) || Number.isNaN(endMs)) {
        return NextResponse.json(
          { success: false, message: "Invalid start or end time" },
          { status: 400 }
        );
      }

      if (endMs <= startMs) {
        return NextResponse.json(
          { success: false, message: "End time must be after start time" },
          { status: 400 }
        );
      }

      dateStrings.push(event.date);
    }

    // Each day's date (as submitted) must be strictly later than the one
    // before it - this both rejects duplicates and stops a client from
    // bypassing the UI's chronological-order restriction by posting the
    // days out of sequence.
    for (let i = 1; i < dateStrings.length; i++) {
      if (dateStrings[i] <= dateStrings[i - 1]) {
        return NextResponse.json(
          {
            success: false,
            message: "Assignment days must be selected in chronological order, with no duplicate dates",
          },
          { status: 400 }
        );
      }
    }

    // Generated server-side (never trusted from the client) so the grouping
    // relationship used by Calendar/Upcoming Jobs can't be spoofed. A
    // single-day submission stays a standalone event with no group.
    const assignmentId = events.length > 1 ? randomUUID() : null;

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
      user_timezone:event.user_timezone,
      user_id: event.user_id,
      assignment_id: assignmentId,
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