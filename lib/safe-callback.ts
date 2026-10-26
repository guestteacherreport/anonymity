// Where to send a user after login when they were signed out while opening an
// emailed My Account link. Only the email-change confirm/approve page is
// allowed, as a same-site relative path with only its own query parameters,
// so this can never be used as an open redirect.

export const CONFIRM_EMAIL_PATH = "/account/confirm-email";

const ALLOWED_PARAMS = new Set(["token", "approve"]);
const MAX_LENGTH = 4096;
const BASE = "http://callback.invalid";

// Returns the normalised path + query when `value` is a link to the confirm
// page, otherwise null. Rejects absolute and protocol-relative URLs,
// backslashes, whitespace/control characters, fragments, other paths and
// any unexpected query parameter.
export function getSafeConfirmEmailCallback(value: string | null | undefined): string | null {
  if (typeof value !== "string" || !value || value.length > MAX_LENGTH) return null;
  if (!value.startsWith("/") || value.startsWith("//")) return null;
  if (/[\\\s\u0000-\u001F\u007F]/.test(value)) return null;

  let url: URL;
  try {
    url = new URL(value, BASE);
  } catch {
    return null;
  }

  if (url.origin !== BASE || url.pathname !== CONFIRM_EMAIL_PATH || url.hash) return null;

  const keys = Array.from(url.searchParams.keys());
  if (keys.length === 0 || keys.some((key) => !ALLOWED_PARAMS.has(key))) return null;

  return `${url.pathname}${url.search}`;
}
