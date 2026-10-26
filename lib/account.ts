// Shared (client + server) validation for the My Account page.

export const DISPLAY_NAME_MAX_LENGTH = 100;
export const EMAIL_MAX_LENGTH = 254;

// Same pattern the existing signup/admin/forgot-password routes use.
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const CONTROL_CHARS = /[\u0000-\u001F\u007F-\u009F]/;

export function validateDisplayName(name: string): string | null {
  const trimmed = name.trim();
  if (!trimmed) {
    return "Name is required";
  }
  if (trimmed.length > DISPLAY_NAME_MAX_LENGTH) {
    return `Name must be ${DISPLAY_NAME_MAX_LENGTH} characters or fewer`;
  }
  if (CONTROL_CHARS.test(trimmed)) {
    return "Name contains invalid characters";
  }
  return null;
}

export function validateEmail(email: string): string | null {
  const trimmed = email.trim();
  if (!trimmed) {
    return "Email address is required";
  }
  if (trimmed.length > EMAIL_MAX_LENGTH || !EMAIL_REGEX.test(trimmed)) {
    return "Please enter a valid email address";
  }
  return null;
}

// Escapes LIKE wildcards so .ilike() stays an exact, case-insensitive match.
export function escapeLike(value: string): string {
  return value.replace(/[%_\\]/g, "\\$&");
}

// True for a Postgres unique violation (23505) on an email index, e.g.
// users_email_lower_unique_idx. That index is the real guarantee against two
// accounts sharing an address when concurrent requests both pass the
// application's pre-insert check. Other unique violations (such as the
// primary key) are not reported as a duplicate email.
export function isDuplicateEmailError(
  error: { code?: string; message?: string; details?: string } | null | undefined
): boolean {
  if (!error || error.code !== "23505") return false;
  return /email/i.test(`${error.message ?? ""} ${error.details ?? ""}`);
}
