import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;
    const role = token?.role as string | null | undefined;

    if (
      token &&
      (pathname === "/login" ||
        pathname === "/signup" ||
        pathname === "/forgot-password" ||
        pathname === "/reset-password")
    ) {
      if (role === "admin") {
        return NextResponse.redirect(new URL("/admin/dashboard", req.url));
      }
      return NextResponse.redirect(new URL("/my-reports", req.url));
    }

    if (
      !token &&
      (pathname.startsWith("/admin") ||
        pathname.startsWith("/my-reports") ||
        pathname.startsWith("/submit-report"))
    ) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    if (token && pathname.startsWith("/admin") && role !== "admin") {
      return NextResponse.redirect(new URL("/my-reports", req.url));
    }
  },
  {
    callbacks: {
      authorized: () => true,
    },
  }
);

export const config = {
  matcher: [
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
    "/admin/:path*",
    "/my-reports",
    "/submit-report",
    "/auth-redirect",
  ],
};
