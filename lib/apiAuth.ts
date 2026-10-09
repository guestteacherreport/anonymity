import { NextResponse } from "next/server";
import { getServerSession, type Session } from "next-auth";
import { authOptions } from "@/lib/auth";

// API routes run with the Supabase service-role key (RLS is bypassed) and
// middleware only covers pages, not /api - so every protected route must
// authorize the caller itself. The session role is re-read from the users
// table in the jwt callback on each call, so a demoted admin loses access
// immediately rather than when their token expires.

type AuthResult =
  | { session: Session; response?: never }
  | { session?: never; response: NextResponse };

function unauthorized() {
  return NextResponse.json(
    { success: false, error: "Unauthorized", message: "Login is required" },
    { status: 401 }
  );
}

function forbidden() {
  return NextResponse.json(
    { success: false, error: "Forbidden", message: "You do not have permission to perform this action" },
    { status: 403 }
  );
}

// Any signed-in user. 401 otherwise.
export async function requireSession(): Promise<AuthResult> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return { response: unauthorized() };
  }

  return { session };
}

// Signed-in user whose role is one of `roles`. 401 if not signed in, 403 if
// signed in with any other (or no) role.
export async function requireRole(roles: readonly string[]): Promise<AuthResult> {
  const result = await requireSession();
  if (result.response) return result;

  if (!roles.includes(result.session.user.role ?? "")) {
    return { response: forbidden() };
  }

  return result;
}

export function requireAdmin(): Promise<AuthResult> {
  return requireRole(["admin"]);
}
