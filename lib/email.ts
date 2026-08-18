import { Resend } from "resend";

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

// The Resend SDK resolves normally (does not throw) on API-level failures
// such as an invalid recipient - it returns { data: null, error }. Callers
// that don't check `error` will treat a failed send as successful, which is
// especially dangerous anywhere a "sent" flag gets persisted afterwards.
function assertSent(
  result: { data: unknown; error: { message?: string } | null },
  context: string
) {
  if (result.error) {
    throw new Error(
      `Failed to send email (${context}): ${result.error.message || JSON.stringify(result.error)}`
    );
  }
}

export async function sendPasswordResetEmail(
  to: string,
  resetUrl: string
): Promise<void> {
  const from = process.env.EMAIL_FROM;
  if (!from) {
    throw new Error("Email sender is not configured. Set EMAIL_FROM.");
  }

  const resend = getResendClient();

  const result = await resend.emails.send({
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

  assertSent(result, "password reset");
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

  const results = await Promise.all(
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

  results.forEach((result) => assertSent(result, "guest teacher report notification"));
}

export async function sendSchoolAccessRequestNotification(
  recipients: string[],
  details: { guestTeacherName: string; guestTeacherEmail: string; schoolName: string; reviewUrl: string }
): Promise<void> {
  const from = process.env.EMAIL_FROM;
  if (!from) {
    throw new Error("Email sender is not configured. Set EMAIL_FROM.");
  }

  const { guestTeacherName, guestTeacherEmail, schoolName, reviewUrl } = details;
  const resend = getResendClient();

  const results = await Promise.all(
    recipients.map((recipient) =>
      resend.emails.send({
        from,
        to: [recipient],
        subject: `Action Required: School Access Request from ${guestTeacherName}`,
        text: `Hello,

Guest Teacher ${guestTeacherName} (${guestTeacherEmail}) has requested access to the detailed reports for "${schoolName}".

Please log in to review and approve or reject this request.

Review: ${reviewUrl}

Thank you,
Guest Teacher Reports Team`,
        html: `
          <p>Hello,</p>
          <p>Guest Teacher <strong>${escapeHtml(guestTeacherName)}</strong> (${escapeHtml(guestTeacherEmail)}) has requested access to the detailed reports for <strong>${escapeHtml(schoolName)}</strong>.</p>
          <p>Please log in to review and approve or reject this request.</p>
          <p>
            <a href="${reviewUrl}" style="display:inline-block;padding:10px 18px;background:#2563eb;color:#ffffff;text-decoration:none;border-radius:4px;">
              Review Request
            </a>
          </p>
          <p>If the button above does not work, copy and paste the following URL into your browser:</p>
          <p><a href="${reviewUrl}">${reviewUrl}</a></p>
          <p>Thank you,<br><strong>Guest Teacher Reports Team</strong></p>
        `,
      })
    )
  );

  results.forEach((result) => assertSent(result, "school access request notification"));
}

export async function sendSchoolAccessStatusEmail(
  to: string,
  details: {
    guestTeacherName: string;
    schoolName: string;
    status: "approved" | "rejected" | "revoked";
    actionUrl: string;
  }
): Promise<void> {
  const from = process.env.EMAIL_FROM;
  if (!from) {
    throw new Error("Email sender is not configured. Set EMAIL_FROM.");
  }

  const { guestTeacherName, schoolName, status, actionUrl } = details;
  const resend = getResendClient();

  const copyByStatus: Record<
    "approved" | "rejected" | "revoked",
    { subject: string; message: string; buttonLabel: string; color: string }
  > = {
    approved: {
      subject: `Access Granted: ${schoolName}`,
      message: `You have been granted access to the detailed reports for "${schoolName}". You can now view the reports.`,
      buttonLabel: "View School Reports",
      color: "#16a34a",
    },
    rejected: {
      subject: `Access Request Rejected: ${schoolName}`,
      message: `Your request for access to the detailed reports for "${schoolName}" has been rejected. You may request access again if needed.`,
      buttonLabel: "View School",
      color: "#2563eb",
    },
    revoked: {
      subject: `Access Revoked: ${schoolName}`,
      message: `Your access to the detailed reports for "${schoolName}" has been revoked by a Super Admin. You may request access again if needed.`,
      buttonLabel: "View School",
      color: "#dc2626",
    },
  };

  const { subject, message, buttonLabel, color } = copyByStatus[status];

  const result = await resend.emails.send({
    from,
    to: [to],
    subject,
    text: `Hello ${guestTeacherName},

${message}

${buttonLabel}: ${actionUrl}

Thank you,
Guest Teacher Reports Team`,
    html: `
      <p>Hello ${escapeHtml(guestTeacherName)},</p>
      <p>${escapeHtml(message)}</p>
      <p>
        <a href="${actionUrl}" style="display:inline-block;padding:10px 18px;background:${color};color:#ffffff;text-decoration:none;border-radius:4px;">
          ${buttonLabel}
        </a>
      </p>
      <p>If the button above does not work, copy and paste the following URL into your browser:</p>
      <p><a href="${actionUrl}">${actionUrl}</a></p>
      <p>Thank you,<br><strong>Guest Teacher Reports Team</strong></p>
    `,
  });

  assertSent(result, "school access status email");
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
  const results = await Promise.all(
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

  results.forEach((result) => assertSent(result, "contact inquiry notification"));
}
