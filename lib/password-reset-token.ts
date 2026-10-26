import crypto from "crypto";

const RESET_TOKEN_EXPIRY_MS = 60 * 60 * 1000;

// Password-reset / set-password links are single-use: each token carries a
// keyed fingerprint of the account's password hash (or of "no password") at
// the time it was issued. A successful reset changes that hash, so the same
// token no longer matches. The reset itself goes through
// reset_password_if_unchanged() (see supabase/migrations), which re-checks the
// hash and writes the new one in a single UPDATE, so two concurrent requests
// with the same token cannot both succeed.
//
// The HMAC is keyed by purpose so this token can never be accepted as an
// email-change approval token (lib/email-change-approval.ts), and vice versa.
const PURPOSE = "password-reset:v2";

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

// Keyed, so the token reveals nothing about the hash it was issued against.
function passwordFingerprint(passwordHash: string | null): string {
  return crypto
    .createHmac("sha256", getSecret())
    .update(`password-fingerprint\n${passwordHash ?? ""}`)
    .digest("base64url");
}

// What reset_password_if_unchanged() compares against inside the database:
// sha256 of the current hash ("" when the account has no password).
export function passwordHashDigest(passwordHash: string | null): string {
  return crypto.createHash("sha256").update(passwordHash ?? "", "utf8").digest("hex");
}

export function createPasswordResetToken(userId: string, currentPasswordHash: string | null): string {
  const expires = Date.now() + RESET_TOKEN_EXPIRY_MS;
  const payload = JSON.stringify({ p: PURPOSE, userId, expires, pfp: passwordFingerprint(currentPasswordHash) });
  const signature = sign(payload);
  return Buffer.from(JSON.stringify({ payload, signature })).toString("base64url");
}

// Checks signature, purpose and expiry only. The caller must still confirm,
// with isUnusedPasswordResetToken(), that the password has not changed since
// the token was issued.
export function verifyPasswordResetToken(
  token: string
): { userId: string; passwordFingerprint: string } | null {
  try {
    const parsed = JSON.parse(
      Buffer.from(token, "base64url").toString("utf8")
    ) as { payload?: unknown; signature?: unknown };

    if (typeof parsed.payload !== "string" || typeof parsed.signature !== "string") {
      return null;
    }

    const expected = sign(parsed.payload);
    const sigBuf = Buffer.from(parsed.signature);
    const expBuf = Buffer.from(expected);
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return null;
    }

    const { p, userId, expires, pfp } = JSON.parse(parsed.payload) as Record<string, unknown>;

    if (
      p !== PURPOSE ||
      typeof userId !== "string" ||
      !userId ||
      typeof expires !== "number" ||
      Date.now() > expires ||
      typeof pfp !== "string"
    ) {
      return null;
    }

    return { userId, passwordFingerprint: pfp };
  } catch {
    return null;
  }
}

// True while the account's password is still the one the token was issued
// against, i.e. the token has not been used (and no other password change
// has happened since).
export function isUnusedPasswordResetToken(
  verified: { passwordFingerprint: string },
  currentPasswordHash: string | null
): boolean {
  const a = Buffer.from(verified.passwordFingerprint);
  const b = Buffer.from(passwordFingerprint(currentPasswordHash));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
