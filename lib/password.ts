// Any non-alphanumeric character counts as "special" (previously only
// @$!%*?& were accepted, which rejected common choices like # . _ -).
// Capped at 16 characters (also keeps input well under bcrypt's 72-byte limit).
export const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d\s])\S{8,16}$/;

export function validatePassword(password: string): string | null {
  if (!PASSWORD_REGEX.test(password)) {
    return "Password must be 8-16 characters with no spaces, and include an uppercase letter, a lowercase letter, a number and a special character (e.g. ! @ # $ % . _)";
  }
  return null;
}
