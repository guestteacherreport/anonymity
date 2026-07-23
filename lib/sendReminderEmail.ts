import { Resend } from "resend";

type ReminderType = "today" | "tomorrow";

function escapeHtml(value: unknown) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[character];
  });
}

function getResendClient() {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
        throw new Error("Resend is not configured. Set RESEND_API_KEY.");
    }

    return new Resend(apiKey);
}


export async function sendReminderEmail({
  events,
  user,
  from,
  reminderType,
}: {
  events: any[];
  user: any;
  from: string;
  reminderType: ReminderType;
}) {
  const resend = getResendClient();

  const isTomorrow = reminderType === "tomorrow";

  const subject = isTomorrow
    ? "Reminder: Tomorrow's Guest Teaching Assignments"
    : "Reminder: Today's Guest Teaching Assignments";

  const heading = isTomorrow
    ? "Tomorrow's Guest Teaching Assignments"
    : "Today's Guest Teaching Assignments";

  const intro = isTomorrow
    ? "This is a reminder that you have the following guest teaching assignment(s) tomorrow."
    : "This is a reminder that you have the following guest teaching assignment(s) today.";

  const closing = isTomorrow
    ? "Please make sure you're prepared and arrive on time."
    : "Please make sure to arrive on time and have a great day!";

  // Plain text version
  const textAssignments = events
    .map((event, index) => {
      const eventDate = new Date(event.start_date).toLocaleDateString(
        "en-US",
        {
          timeZone: event.user_timezone,
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        }
      );

      const startTime = new Date(event.start_date).toLocaleTimeString(
        "en-US",
        {
          timeZone: event.user_timezone,
          hour: "numeric",
          minute: "2-digit",
        }
      );

      const endTime = new Date(event.end_date).toLocaleTimeString(
        "en-US",
        {
          timeZone: event.user_timezone,
          hour: "numeric",
          minute: "2-digit",
        }
      );

      return `
Assignment ${index + 1}
-----------------------
School : ${event.school_name}
Teacher: ${event.teacher_name || "N/A"}
Date   : ${eventDate}
Time   : ${startTime} - ${endTime}
`;
    })
    .join("\n");

  const assignmentCards = events
    .map((event) => {
      const eventDate = new Date(event.start_date).toLocaleDateString(
        "en-US",
        {
          timeZone: event.user_timezone,
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        }
      );

      const startTime = new Date(event.start_date).toLocaleTimeString(
        "en-US",
        {
          timeZone: event.user_timezone,
          hour: "numeric",
          minute: "2-digit",
        }
      );

      const endTime = new Date(event.end_date).toLocaleTimeString(
        "en-US",
        {
          timeZone: event.user_timezone,
          hour: "numeric",
          minute: "2-digit",
        }
      );

      return `
        <section class="assignment-card">
          <h3 class="assignment-school">${escapeHtml(event.school_name)}</h3>
          <dl class="assignment-details">
            <div class="assignment-detail">
              <dt class="assignment-label">Teacher</dt>
              <dd class="assignment-value">${escapeHtml(event.teacher_name || "N/A")}</dd>
            </div>
            <div class="assignment-detail">
              <dt class="assignment-label">Date</dt>
              <dd class="assignment-value">${escapeHtml(eventDate)}</dd>
            </div>
            <div class="assignment-detail">
              <dt class="assignment-label">Time</dt>
              <dd class="assignment-value">${escapeHtml(`${startTime} - ${endTime}`)}</dd>
            </div>
          </dl>
        </section>
      `;
    })
    .join("");

  await resend.emails.send({
    from,
    to: user.email,
    subject,

    text: `
Hello ${user.full_name || ""},

${intro}

${textAssignments}

${closing}

Thank you!
`,

    html: `
      <!doctype html>
      <html lang="en">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            .email-page { margin: 0; padding: 40px 16px; background: #f3f4f7; color: #121212; font-family: Arial, sans-serif; }
            .email-shell { max-width: 600px; margin: 0 auto; overflow: hidden; background: #fff; border: 1px solid #ddd; border-radius: 12px; }
            .email-header { padding: 32px; background: #121212; border-bottom: 4px solid #0171F9; }
            .brand-logo { display: block; width: 76px; height: 76px; margin: 0 0 24px; object-fit: contain; }
            .email-eyebrow { margin: 0 0 8px; color: #aeb9c8; font-size: 12px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; }
            .email-title { margin: 0; color: #fff; font-size: 26px; font-weight: 700; line-height: 1.3; }
            .email-content { padding: 32px; }
            .email-copy { margin: 0 0 16px; color: #333; font-size: 16px; line-height: 1.6; }
            .assignment-list { margin: 28px 0; }
            .assignment-card { margin: 0 0 14px; padding: 20px; background: #fff; border: 1px solid #dfe3e8; border-left: 4px solid #0171F9; border-radius: 8px; box-shadow: 0 2px 8px rgba(18, 18, 18, 0.06); }
            .assignment-card:last-child { margin-bottom: 0; }
            .assignment-school { margin: 0 0 18px; color: #121212; font-size: 18px; line-height: 1.4; }
            .assignment-details { margin: 0; }
            .assignment-detail { margin: 0 0 14px; }
            .assignment-detail:last-child { margin-bottom: 0; }
            .assignment-label { margin: 0 0 4px; color: #6b7280; font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; }
            .assignment-value { margin: 0; color: #121212; font-size: 16px; line-height: 1.4; }
            .email-closing { margin-top: 28px; }
            .email-signoff { margin-bottom: 0; }
            .email-footer { padding: 20px 32px; background: #f8f9fb; border-top: 1px solid #edf0f3; color: #6b7280; font-size: 12px; line-height: 1.5; }
            .email-footer-copy { margin: 0; }
            @media screen and (max-width: 600px) {
              .email-page { padding: 0; }
              .email-shell { border: 0; }
              .email-header, .email-content { padding: 24px 20px; }
              .email-footer { padding: 20px; }
              .brand-logo { width: 64px; height: 64px; }
            }
          </style>
        </head>
        <body class="email-page">
          <main class="email-shell">
            <header class="email-header">
              <img class="brand-logo" src="https://anonymity-tau.vercel.app/logo.png" width="76" height="76" alt="Anonymity logo">
              <p class="email-eyebrow">Guest teaching reminder</p>
              <h2 class="email-title">${escapeHtml(heading)}</h2>
            </header>
            <div class="email-content">
              <p class="email-copy">Hello ${escapeHtml(user.full_name || "")},</p>
              <p class="email-copy">${escapeHtml(intro)}</p>
              <div class="assignment-list">
                ${assignmentCards}
              </div>
              <p class="email-copy email-closing">${escapeHtml(closing)}</p>
              <p class="email-copy email-signoff">Thank you!</p>
            </div>
            <footer class="email-footer">
              <p class="email-footer-copy">Please keep this reminder for your teaching schedule.</p>
            </footer>
          </main>
        </body>
      </html>
    `,
  });
}
