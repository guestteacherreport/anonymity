import { Resend } from "resend";

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("Resend is not configured. Set RESEND_API_KEY.");
  }

  return new Resend(apiKey);
}

export async function sendPasswordResetEmail(
  to: string,
  resetUrl: string
): Promise<void> {
  console.log(process.env,"process.env");
  const from = process.env.EMAIL_FROM;
  if (!from) {
    throw new Error("Email sender is not configured. Set EMAIL_FROM.");
  }

  const resend = getResendClient();

  await resend.emails.send({
    from,
    to: [to],
    subject: "Reset your password",
    text: `You requested a password reset. Open this link to choose a new password (expires in 1 hour):\n\n${resetUrl}\n\nIf you did not request this, you can ignore this email.`,
    html: `
      <p>You requested a password reset for your account.</p>
      <p><a href="${resetUrl}">Reset your password</a></p>
      <p>This link expires in 1 hour. If you did not request a reset, you can ignore this email.</p>
    `,
  });
}

export async function sendGuestTeacherReportNotification(
  recipients: string[],
  loginUrl: string
): Promise<void> {
  const from = process.env.EMAIL_FROM;
  if (!from) {
    throw new Error("Email sender is not configured. Set EMAIL_FROM.");
  }

  const resend = getResendClient();

  await Promise.all(
  recipients.map((recipient) =>
    resend.emails.send({
      from,
      to: [recipient],
      subject: "Action Required: New Guest Teacher Report Submitted",
      text: `Hello,

A new guest teacher report has been submitted and is awaiting your review.

Please log in to your account to review the report and take the appropriate action (Approve or Reject).

Login: ${loginUrl}

Thank you,
Guest Teacher Reports Team`,
      html: `
        <p>Hello,</p>

        <p>A new <strong>Guest Teacher Report</strong> has been submitted and is awaiting your review.</p>

        <p>Please log in to your account to review the report and take the appropriate action.</p>

        <p>
          <a href="${loginUrl}" style="display:inline-block;padding:10px 18px;background:#2563eb;color:#ffffff;text-decoration:none;border-radius:4px;">
            Review Report
          </a>
        </p>

        <p>If the button above does not work, copy and paste the following URL into your browser:</p>

        <p><a href="${loginUrl}">${loginUrl}</a></p>

        <p>Thank you,<br><strong>Guest Teacher Reports Team</strong></p>
      `,
    })
  )
);
}

export async function sendContactInquiryNotification(
  recipients: string[],
  inquiry: { fullName: string; email: string; subject: string; message: string }
): Promise<void> {
  const from = process.env.EMAIL_FROM;
  if (!from) {
    throw new Error("Email sender is not configured. Set EMAIL_FROM.");
  }

  const resend = getResendClient();
  await Promise.all(
    recipients.map((recipient) =>
      resend.emails.send({
        from,
        to: [recipient],
        subject: `Contact Us: ${inquiry.subject}`,
        text: `A new contact inquiry was submitted.\n\nFrom: ${inquiry.fullName} <${inquiry.email}>\nSubject: ${inquiry.subject}\n\n${inquiry.message}`,
        html: `<h2>New Contact Us inquiry</h2><p><strong>From:</strong> ${inquiry.fullName} &lt;${inquiry.email}&gt;</p><p><strong>Subject:</strong> ${inquiry.subject}</p><p>${inquiry.message}</p>`,
      })
    )
  );
}
