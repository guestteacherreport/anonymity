import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }
    const { id } = await params;
    const eventId = parseInt(id, 10);

    const { data, error } = await supabase
      .from("calendar_event")
      .select("*")
      .eq("id", eventId)
      .eq("user_id", session.user.id)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { success: false, message: "Event not found" },
        { status: 404 }
      );
    }

    const { data: adjacentEvents, error: adjacentEventsError } = await supabase
      .from("calendar_event")
      .select("id, start_date")
      .eq("user_id", session.user.id)
      .order("start_date", { ascending: true })
      .order("id", { ascending: true });

    if (adjacentEventsError) {
      console.error("Supabase Error:", adjacentEventsError);
      return NextResponse.json(
        { success: false, message: adjacentEventsError.message },
        { status: 500 }
      );
    }

    const selectedEventIndex = adjacentEvents.findIndex((event) => event.id === eventId);
    const previousEvent = adjacentEvents[selectedEventIndex - 1];
    const nextEvent = adjacentEvents[selectedEventIndex + 1];

    return NextResponse.json({
      success: true,
      event: data,
      previousEventExist: Boolean(previousEvent),
      previousEventId: previousEvent?.id ?? null,
      nextEventExist: Boolean(nextEvent),
      nextEventId: nextEvent?.id ?? null,
    });
  } catch (error) {
    console.error("Error fetching event:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch event" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest, { params }:  { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const eventId = parseInt(id, 10);
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
      user_timezone
    } = body;

    // Reminder emails are keyed off start_date, so a reschedule must reset
    // the "sent" flags - otherwise a reminder already sent for the old date
    // silently blocks the reminder for the new date forever.
    const { data: existingEvent, error: existingEventError } = await supabase
      .from("calendar_event")
      .select("start_date")
      .eq("id", eventId)
      .eq("user_id", session.user.id)
      .maybeSingle();

    if (existingEventError || !existingEvent) {
      return NextResponse.json(
        { success: false, message: "Event not found" },
        { status: 404 }
      );
    }

    const startDateChanged =
      new Date(existingEvent.start_date).getTime() !== new Date(start_date).getTime();

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
        user_timezone,
        notes: notes || null,
        ...(startDateChanged && {
          next_day_reminder_sent: false,
          same_day_reminder_sent: false,
        }),
      })
      .eq("id", eventId)
      .eq("user_id", session.user.id)
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

export async function DELETE(
  req: NextRequest,
  { params }:  { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const eventId = parseInt(id, 10);

    const { error } = await supabase
      .from("calendar_event")
      .delete()
      .eq("id", eventId)
      .eq("user_id", session.user.id);

    if (error) {
      console.error("Supabase Error:", error);
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Event deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting event:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete event" },
      { status: 500 }
    );
  }
}
