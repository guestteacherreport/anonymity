import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { differenceInCalendarDays } from "date-fns";
import { toZonedTime, formatInTimeZone } from "date-fns-tz";
import { sendReminderEmail } from "@/lib/sendReminderEmail";

export async function GET() {
  const from: any = process.env.EMAIL_FROM;
const startOfToday = new Date();
startOfToday.setUTCHours(0, 0, 0, 0);
  const { data: events, error } = await supabase
    .from("calendar_event")
    .select("*")
    .gte("start_date", startOfToday.toISOString());
    
  if (error) {
    return NextResponse.json(error, { status: 500 });
  }

  const reminders: Record<
    string,
    {
      user: any;
      tomorrow: any[];
      today: any[];
    }
  > = {};

  for (const event of events) {
    const timezone = event.user_timezone;

    if (!timezone) continue;

    // Current time in user's timezone
    const nowLocal = toZonedTime(new Date(), timezone);

    // Event time in user's timezone
    const eventLocal = toZonedTime(
      new Date(event.start_date),
      timezone
    );

    // Only run at 12 AM user local time
    const currentHour = formatInTimeZone(
      new Date(),
      timezone,
      "H"
    );

    if (currentHour !== "0") {
      continue;
    }

    const diff = differenceInCalendarDays(
      eventLocal,
      nowLocal
    );

    const { data: user, error: userError } = await supabase
      .from("users")
      .select("email, full_name")
      .eq("id", event.user_id)
      .single();

    if (userError || !user) {
      console.error("User not found:", userError);
      continue;
    }

    if (!reminders[event.user_id]) {
      reminders[event.user_id] = {
        user,
        tomorrow: [],
        today: [],
      };
    }

    if (
      diff === 1 &&
      !event.next_day_reminder_sent
    ) {
      reminders[event.user_id].tomorrow.push(event);
    }

    if (
      diff === 0 &&
      !event.same_day_reminder_sent
    ) {
      
      reminders[event.user_id].today.push(event);
    }
  }

  // Send one email per user
  for (const reminder of Object.values(reminders)) {

    // Tomorrow Reminder
    if (reminder.tomorrow.length > 0) {
      try {
        await sendReminderEmail({
          events: reminder.tomorrow,
          user: reminder.user,
          from,
          reminderType: "tomorrow",
        });

        await supabase
          .from("calendar_event")
          .update({
            next_day_reminder_sent: true,
          })
          .in(
            "id",
            reminder.tomorrow.map((e) => e.id)
          );

        console.log(
          `Tomorrow reminder sent to ${reminder.user.email}`
        );

      } catch (err) {
        console.error(err);
      }
    }

    // Same Day Reminder
    if (reminder.today.length > 0) {
      
      try {

        await sendReminderEmail({
          events: reminder.today,
          user: reminder.user,
          from,
          reminderType: "today",
        });

        await supabase
          .from("calendar_event")
          .update({
            same_day_reminder_sent: true,
          })
          .in(
            "id",
            reminder.today.map((e) => e.id)
          );

        console.log(
          `Same day reminder sent to ${reminder.user.email}`
        );

      } catch (err) {
        console.error(err);
      }
    }
  }

  return NextResponse.json({
    success: true,
  });
}