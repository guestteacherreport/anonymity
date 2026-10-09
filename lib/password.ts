// Any non-alphanumeric character counts as "special" (previously only
// @$!%*?& were accepted, which rejected common choices like # . _ -).
// Capped at 64 to stay well under bcrypt's 72-byte input limit.
export const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d\s])\S{8,64}$/;

export function validatePassword(password: string): string | null {
  if (!PASSWORD_REGEX.test(password)) {
    return "Password must be 8-64 characters with no spaces, and include an uppercase letter, a lowercase letter, a number and a special character (e.g. ! @ # $ % . _)";
  }
  return null;
}
