import { Resend } from "resend";

type ReminderType = "today" | "tomorrow";

function getResendClient() {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
        throw new Error("Resend is not configured. Set RESEND_API_KEY.");
    }

    return new Resend(apiKey);
}

export async function sendReminderEmail({
    event,
    user,
    from,
    reminderType,
}: {
    event: any;
    user: any;
    from: string;
    reminderType: ReminderType;
}) {
    const resend = getResendClient();

    const eventDate = new Date(event.start_date).toLocaleDateString("en-US", {
        timeZone: event.timezone,
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    const startTime = new Date(event.start_date).toLocaleTimeString("en-US", {
        timeZone: event.timezone,
        hour: "numeric",
        minute: "2-digit",
    });

    const endTime = new Date(event.end_date).toLocaleTimeString("en-US", {
        timeZone: event.timezone,
        hour: "numeric",
        minute: "2-digit",
    });

    const isTomorrow = reminderType === "tomorrow";

    const subject = isTomorrow
        ? "Reminder: Tomorrow's Guest Teaching Assignment"
        : "Reminder: Today's Guest Teaching Assignment";

    const heading = isTomorrow
        ? "Tomorrow's Guest Teaching Assignment"
        : "Today's Guest Teaching Assignment";

    const intro = isTomorrow
        ? "This is a reminder that you have a guest teaching assignment tomorrow."
        : "This is a reminder that you have a guest teaching assignment today.";

    const closing = isTomorrow
        ? "Please make sure you're prepared and arrive on time."
        : "Please make sure to arrive on time and have a great day!";

    await resend.emails.send({
        from,
        to: user.email,
        subject,
        text: `
Hello ${user.name || ""},

${intro}

School: ${event.school_name}
Teacher: ${event.teacher_name || "N/A"}
Date: ${eventDate}
Time: ${startTime} - ${endTime}

${closing}

Thank you!
`,
        html: `
      <h2>${heading}</h2>

      <p>Hello ${user.name || ""},</p>

      <p>${intro}</p>

      <table cellpadding="6" cellspacing="0" style="border-collapse: collapse;">
        <tr>
          <td><strong>School:</strong></td>
          <td>${event.school_name}</td>
        </tr>
        <tr>
          <td><strong>Teacher:</strong></td>
          <td>${event.teacher_name || "N/A"}</td>
        </tr>
        <tr>
          <td><strong>Date:</strong></td>
          <td>${eventDate}</td>
        </tr>
        <tr>
          <td><strong>Time:</strong></td>
          <td>${startTime} - ${endTime}</td>
        </tr>
      </table>

      <p>${closing}</p>

      <p>Thank you!</p>
    `,
    });
}