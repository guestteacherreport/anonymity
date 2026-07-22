import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { differenceInCalendarDays } from "date-fns";
import { toZonedTime, formatInTimeZone } from "date-fns-tz";
import { sendReminderEmail } from "@/lib/sendReminderEmail";

export async function GET() {
  const from: any = process.env.EMAIL_FROM;
  const { data: events, error } = await supabase
    .from("calendar_event")
    .select("*")
    .gte("start_date", new Date().toISOString());

  if (error) {
    return NextResponse.json(error, { status: 500 });
  }

  for (const event of events) {

    const timezone = event.timezone;

    // Current time in event timezone
    const nowLocal = toZonedTime(new Date(), timezone);

    // Event time in event timezone
    const eventLocal = toZonedTime(
      new Date(event.start_date),
      timezone 
    );

    // Current hour in user's timezone
    const currentHour = formatInTimeZone(
      new Date(),
      timezone,
      "H"
    );

    // Cron runs every hour.
    // Only continue if local hour is 00.
    if (currentHour !== "0") {
      continue;
    }

    const diff = differenceInCalendarDays(
      eventLocal,
      nowLocal
    );

    const { data: user, error: userError } = await supabase
      .from("users")
      .select("email, name")
      .eq("id", event.user_id)
      .single();

    if (userError || !user) {
      console.error("User not found:", userError);
      continue;
    }

    // Tomorrow Reminder
    if (
      diff === 1 &&
      !event.next_day_reminder_sent
    ) {

      // Send email here
      console.log("Tomorrow Reminder", event.id);
      try {
        await sendReminderEmail({
          event,
          user,
          from,
          reminderType: "tomorrow",
        });

        await supabase
          .from("calendar_event")
          .update({
            next_day_reminder_sent: true,
          })
          .eq("id", event.id);

      } catch (err) {
        console.error(err);
      }
    }

    // Same Day Reminder
    if (
      diff === 0 &&
      !event.same_day_reminder_sent
    ) {

      // Send email here
      try {
        await sendReminderEmail({
          event,
          user,
          from,
          reminderType: "today",
        });

        console.log("Same Day Reminder", event.id);

        await supabase
          .from("calendar_event")
          .update({
            same_day_reminder_sent: true,
          })
          .eq("id", event.id);
      } catch (err) {
        console.error(err);
      }
    }
  }

  return NextResponse.json({
    success: true,
  });
}