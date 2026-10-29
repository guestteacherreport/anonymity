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

export async function sendEmailChangeConfirmation(
  to: string,
  confirmUrl: string
): Promise<void> {
  const from = process.env.EMAIL_FROM;
  if (!from) {
    throw new Error("Email sender is not configured. Set EMAIL_FROM.");
  }

  const resend = getResendClient();

  const result = await resend.emails.send({
    from,
    to: [to],
    subject: "Confirm your new email address",
    text: `You asked to change the email address on your account to this address.\n\nSign in to your account, then open this link to confirm the change (expires in 1 hour):\n\n${confirmUrl}\n\nUntil you confirm, your current email address stays active. If you did not request this, you can ignore this email.`,
    html: `
      <p>You asked to change the email address on your account to this address.</p>
      <p>Sign in to your account, then open this link to confirm the change:</p>
      <p><a href="${confirmUrl}">Confirm new email address</a></p>
      <p>This link expires in 1 hour. Until you confirm, your current email address stays active. If you did not request this, you can ignore this email.</p>
    `,
  });

  assertSent(result, "email change confirmation");
}

// Sent to the CURRENT address of an account without a password, so the
// mailbox owner approves an email change before it is requested.
export async function sendEmailChangeApproval(
  to: string,
  newEmail: string,
  approveUrl: string
): Promise<void> {
  const from = process.env.EMAIL_FROM;
  if (!from) {
    throw new Error("Email sender is not configured. Set EMAIL_FROM.");
  }

  const resend = getResendClient();

  const result = await resend.emails.send({
    from,
    to: [to],
    subject: "Approve your email address change",
    text: `Someone signed in to your account asked to change its email address to ${newEmail}.\n\nIf this was you, sign in to your account, then open this link to approve it (expires in 1 hour):\n\n${approveUrl}\n\nWe will then send a confirmation link to the new address. If you did not request this, ignore this email - your email address will not change.`,
    html: `
      <p>Someone signed in to your account asked to change its email address to <strong>${escapeHtml(newEmail)}</strong>.</p>
      <p>If this was you, sign in to your account, then open this link to approve it:</p>
      <p><a href="${approveUrl}">Approve email change</a></p>
      <p>This link expires in 1 hour. We will then send a confirmation link to the new address. If you did not request this, ignore this email - your email address will not change.</p>
    `,
  });

  assertSent(result, "email change approval");
}

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return "***";
  return `${local.slice(0, 1)}***@${domain}`;
}

export async function sendEmailChangedNotice(
  to: string,
  newEmail: string
): Promise<void> {
  const from = process.env.EMAIL_FROM;
  if (!from) {
    throw new Error("Email sender is not configured. Set EMAIL_FROM.");
  }

  const resend = getResendClient();
  const masked = maskEmail(newEmail);

  const result = await resend.emails.send({
    from,
    to: [to],
    subject: "Your account email address was changed",
    text: `The email address on your account was changed to ${masked}. This address will no longer be used to sign in or receive account emails.\n\nIf you did not make this change, please contact us immediately.`,
    html: `
      <p>The email address on your account was changed to <strong>${escapeHtml(masked)}</strong>.</p>
      <p>This address will no longer be used to sign in or receive account emails.</p>
      <p>If you did not make this change, please contact us immediately.</p>
    `,
  });

  assertSent(result, "email changed notice");
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

// Content of the admin email for a feedback-only submission (no Job ID).
// Like the normal report notification it carries no report content, only a
// link to the admin Reports page.
export function buildFeedbackOnlyNotificationEmail(reviewUrl: string) {
  return {
    subject: "Feedback only — not for publication: New private Guest Teacher feedback",
    text: `Hello,

A Guest Teacher has submitted private feedback without a Job ID.

FEEDBACK ONLY — NOT FOR PUBLICATION
This submission is for admin review only. It cannot be approved or published and does not appear on any public teacher or school page.

Review it here: ${reviewUrl}

Thank you,
Guest Teacher Reports Team`,
    html: `
        <p>Hello,</p>

        <p>A Guest Teacher has submitted <strong>private feedback</strong> without a Job ID.</p>

        <p style="padding:10px 14px;background:#FFF7ED;border:1px solid #FDBA74;border-radius:4px;color:#9A3412;">
          <strong>Feedback only — not for publication.</strong><br>
          This submission is for admin review only. It cannot be approved or published and does not appear on any public teacher or school page.
        </p>

        <p>
          <a href="${escapeHtml(reviewUrl)}" style="display:inline-block;padding:10px 18px;background:#2563eb;color:#ffffff;text-decoration:none;border-radius:4px;">
            Review Feedback
          </a>
        </p>

        <p>If the button above does not work, copy and paste the following URL into your browser:</p>

        <p><a href="${escapeHtml(reviewUrl)}">${escapeHtml(reviewUrl)}</a></p>

        <p>Thank you,<br><strong>Guest Teacher Reports Team</strong></p>
      `,
  };
}

export async function sendFeedbackOnlyNotification(
  recipients: string[],
  reviewUrl: string
): Promise<void> {
  const from = process.env.EMAIL_FROM;
  if (!from) {
    throw new Error("Email sender is not configured. Set EMAIL_FROM.");
  }

  const resend = getResendClient();
  const email = buildFeedbackOnlyNotificationEmail(reviewUrl);

  const results = await Promise.all(
    recipients.map((recipient) =>
      resend.emails.send({ from, to: [recipient], ...email })
    )
  );

  results.forEach((result) => assertSent(result, "feedback-only notification"));
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
