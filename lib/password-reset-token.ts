import crypto from "crypto";

const RESET_TOKEN_EXPIRY_MS = 60 * 60 * 1000;

function getSecret(): string {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error("NEXTAUTH_SECRET is not configured");
  }
  return secret;
}

function sign(payload: string): string {
  return crypto.createHmac("sha256", getSecret()).update(payload).digest("base64url");
}

export function createPasswordResetToken(userId: string): string {
  const expires = Date.now() + RESET_TOKEN_EXPIRY_MS;
  const payload = JSON.stringify({ userId, expires });
  const signature = sign(payload);
  return Buffer.from(JSON.stringify({ payload, signature })).toString("base64url");
}

export function verifyPasswordResetToken(
  token: string
): { userId: string } | null {
  try {
    const parsed = JSON.parse(
      Buffer.from(token, "base64url").toString("utf8")
    ) as { payload: string; signature: string };

    if (!parsed.payload || !parsed.signature) {
      return null;
    }

    const expected = sign(parsed.payload);
    const sigBuf = Buffer.from(parsed.signature);
    const expBuf = Buffer.from(expected);
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return null;
    }

    const { userId, expires } = JSON.parse(parsed.payload) as {
      userId: string;
      expires: number;
    };

    if (!userId || typeof expires !== "number" || Date.now() > expires) {
      return null;
    }

    return { userId };
  } catch {
    return null;
  }
}
