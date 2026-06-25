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
