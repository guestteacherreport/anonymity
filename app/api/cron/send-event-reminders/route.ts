import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { differenceInCalendarDays } from "date-fns";
import { toZonedTime, formatInTimeZone } from "date-fns-tz";
import { sendReminderEmail } from "@/lib/sendReminderEmail";

export async function GET(request: Request) {
  try {
    // --------------------------------------------------
    // Protect cron endpoint
    // --------------------------------------------------
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      console.error("CRON_SECRET is not configured");

      return NextResponse.json(
        { error: "Cron secret not configured" },
        { status: 500 }
      );
    }

    const authHeader = request.headers.get("authorization");

    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const from = process.env.EMAIL_FROM;

    if (!from) {
      console.error("EMAIL_FROM is not configured");

      return NextResponse.json(
        { error: "EMAIL_FROM is not configured" },
        { status: 500 }
      );
    }

    // --------------------------------------------------
    // Fetch events around the current UTC date
    //
    // We intentionally use a wider range because each
    // user may have a different timezone.
    // --------------------------------------------------
    const now = new Date();

    const yesterday = new Date(now);
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);

    const dayAfterTomorrow = new Date(now);
    dayAfterTomorrow.setUTCDate(
      dayAfterTomorrow.getUTCDate() + 2
    );

    const {
      data: events,
      error: eventsError,
    } = await supabase
      .from("calendar_event")
      .select("*")
      .gte("start_date", yesterday.toISOString())
      .lt("start_date", dayAfterTomorrow.toISOString());

    if (eventsError) {
      console.error(
        "Failed to fetch calendar events:",
        eventsError
      );

      return NextResponse.json(
        { error: eventsError.message },
        { status: 500 }
      );
    }

    if (!events || events.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No events found",
      });
    }

    // --------------------------------------------------
    // Group reminders by user
    // --------------------------------------------------
    const reminders: Record<
      string,
      {
        user: {
          email: string;
          full_name: string;
        };
        tomorrow: any[];
        today: any[];
      }
    > = {};

    // --------------------------------------------------
    // Process each event
    // --------------------------------------------------
    for (const event of events) {
      const timezone = event.user_timezone;
console.log("========== EVENT DEBUG ==========");
console.log("Event ID:", event.id);
console.log("Event Start:", event.start_date);
console.log("User Timezone:", timezone);
console.log("Current UTC:", now.toISOString());
console.log(
  "Current Local:",
  formatInTimeZone(now, timezone, "yyyy-MM-dd HH:mm:ss zzz")
);
console.log(
  "Event Local:",
  formatInTimeZone(
    new Date(event.start_date),
    timezone,
    "yyyy-MM-dd HH:mm:ss zzz"
  )
);
console.log(
  "Next Day Sent:",
  event.next_day_reminder_sent
);
console.log(
  "Same Day Sent:",
  event.same_day_reminder_sent
);
console.log("================================");
      if (!timezone) {
        console.warn(
          `No timezone found for event ${event.id}`
        );
        continue;
      }

      try {
        // ------------------------------------------------
        // Current time in user's timezone
        // ------------------------------------------------
        const nowLocal = toZonedTime(
          now,
          timezone
        );

        // ------------------------------------------------
        // Event time in user's timezone
        // ------------------------------------------------
        const eventLocal = toZonedTime(
          new Date(event.start_date),
          timezone
        );

        // ------------------------------------------------
        // Only process when it is 12:00 AM
        // in the user's timezone
        // ------------------------------------------------
        const currentHour = formatInTimeZone(
          now,
          timezone,
          "H"
        );

        // if (currentHour !== "0") {
        //   continue;
        // }

        // ------------------------------------------------
        // Determine whether event is today or tomorrow
        // ------------------------------------------------
        const diff = differenceInCalendarDays(
          eventLocal,
          nowLocal
        );

        if (diff !== 0 && diff !== 1) {
          continue;
        }

        // ------------------------------------------------
        // Get user
        // ------------------------------------------------
        const {
          data: user,
          error: userError,
        } = await supabase
          .from("users")
          .select("email, full_name")
          .eq("id", event.user_id)
          .single();

        if (userError || !user) {
          console.error(
            `User not found for event ${event.id}:`,
            userError
          );
          continue;
        }

        // ------------------------------------------------
        // Initialize user's reminder group
        // ------------------------------------------------
        if (!reminders[event.user_id]) {
          reminders[event.user_id] = {
            user,
            tomorrow: [],
            today: [],
          };
        }

        // ------------------------------------------------
        // Tomorrow reminder
        // ------------------------------------------------
        if (
          diff === 1 &&
          !event.next_day_reminder_sent
        ) {
          reminders[event.user_id].tomorrow.push(event);
        }

        // ------------------------------------------------
        // Same-day reminder
        // ------------------------------------------------
        if (
          diff === 0 &&
          !event.same_day_reminder_sent
        ) {
          reminders[event.user_id].today.push(event);
        }
      } catch (timezoneError) {
        console.error(
          `Timezone processing failed for event ${event.id}:`,
          timezoneError
        );

        continue;
      }
    }

    // --------------------------------------------------
    // Send one email per user
    // --------------------------------------------------
    for (const reminder of Object.values(reminders)) {
      // ------------------------------------------------
      // Tomorrow Reminder
      // ------------------------------------------------
      if (reminder.tomorrow.length > 0) {
        try {
          await sendReminderEmail({
            events: reminder.tomorrow,
            user: reminder.user,
            from,
            reminderType: "tomorrow",
          });

          const { error: updateError } = await supabase
            .from("calendar_event")
            .update({
              next_day_reminder_sent: true,
            })
            .in(
              "id",
              reminder.tomorrow.map(
                (event) => event.id
              )
            );

          if (updateError) {
            throw updateError;
          }

          console.log(
            `Tomorrow reminder sent to ${reminder.user.email}`
          );
        } catch (error) {
          console.error(
            `Failed to send tomorrow reminder to ${reminder.user.email}:`,
            error
          );
        }
      }

      // ------------------------------------------------
      // Same Day Reminder
      // ------------------------------------------------
      if (reminder.today.length > 0) {
        try {
          await sendReminderEmail({
            events: reminder.today,
            user: reminder.user,
            from,
            reminderType: "today",
          });

          const { error: updateError } = await supabase
            .from("calendar_event")
            .update({
              same_day_reminder_sent: true,
            })
            .in(
              "id",
              reminder.today.map(
                (event) => event.id
              )
            );

          if (updateError) {
            throw updateError;
          }

          console.log(
            `Same day reminder sent to ${reminder.user.email}`
          );
        } catch (error) {
          console.error(
            `Failed to send same-day reminder to ${reminder.user.email}:`,
            error
          );
        }
      }
    }

    // --------------------------------------------------
    // Response
    // --------------------------------------------------
    return NextResponse.json({
      success: true,
      message: "Event reminders processed successfully",
    });
  } catch (error: any) {
    console.error(
      "Send event reminders cron error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error?.message ||
          "Failed to process event reminders",
      },
      { status: 500 }
    );
  }
}