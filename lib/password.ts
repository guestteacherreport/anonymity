export const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,16}$/;

export function validatePassword(password: string): string | null {
  if (!PASSWORD_REGEX.test(password)) {
    return "Password must be 8-16 chars, include uppercase, lowercase, number & special character";
  }
  return null;
}
