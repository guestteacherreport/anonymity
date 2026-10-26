import crypto from "crypto";

// Accounts without a password (Google/Facebook) cannot re-enter a password
// before changing their email, so they approve the change from their CURRENT
// mailbox instead. The approval link carries this signed, short-lived token,
// bound to the user, their current email and the requested new email.
//
// The HMAC is keyed per purpose so a token can never be accepted as a
// password-reset token (lib/password-reset-token.ts) or vice versa, and the
// payload uses different field names for the same reason.

const APPROVAL_EXPIRY_MS = 60 * 60 * 1000;
const PURPOSE = "email-change-approval:v1";

function getSecret(): string {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error("NEXTAUTH_SECRET is not configured");
  }
  return secret;
}

function sign(payload: string): string {
  return crypto.createHmac("sha256", getSecret()).update(`${PURPOSE}\n${payload}`).digest("base64url");
}

function fingerprint(email: string): string {
  return crypto.createHash("sha256").update(email.trim().toLowerCase()).digest("hex");
}

export function createEmailChangeApprovalToken(userId: string, currentEmail: string, newEmail: string): string {
  const payload = JSON.stringify({
    p: PURPOSE,
    uid: userId,
    cur: fingerprint(currentEmail),
    to: newEmail,
    exp: Date.now() + APPROVAL_EXPIRY_MS,
  });
  return Buffer.from(JSON.stringify({ payload, signature: sign(payload) })).toString("base64url");
}

// Returns the approved new email, or null if the token is malformed, forged,
// expired, for another user, or was issued while the account had a different
// email (so approvals die with the address they were sent to).
export function verifyEmailChangeApprovalToken(
  token: string,
  userId: string,
  currentEmail: string
): { newEmail: string } | null {
  try {
    const parsed = JSON.parse(Buffer.from(token, "base64url").toString("utf8")) as {
      payload?: unknown;
      signature?: unknown;
    };
    if (typeof parsed.payload !== "string" || typeof parsed.signature !== "string") {
      return null;
    }

    const sigBuf = Buffer.from(parsed.signature);
    const expBuf = Buffer.from(sign(parsed.payload));
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return null;
    }

    const { p, uid, cur, to, exp } = JSON.parse(parsed.payload) as Record<string, unknown>;
    if (
      p !== PURPOSE ||
      typeof uid !== "string" ||
      typeof cur !== "string" ||
      typeof to !== "string" ||
      typeof exp !== "number" ||
      Date.now() > exp ||
      uid !== String(userId) ||
      cur !== fingerprint(currentEmail)
    ) {
      return null;
    }

    return { newEmail: to };
  } catch {
    return null;
  }
}
