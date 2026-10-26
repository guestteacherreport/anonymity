import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { getSafeConfirmEmailCallback } from "@/lib/safe-callback";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;
    const role = token?.role as string | null | undefined;

    // /reset-password is deliberately not in this list: a signed-in user who
    // asked for a "Set password" link from My Account must be able to use it.
    if (
      token &&
      (pathname === "/login" ||
        pathname === "/signup" ||
        pathname === "/forgot-password")
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
        pathname.startsWith("/submit-report") ||
        pathname.startsWith("/calendar") ||
        pathname.startsWith("/account"))
    ) {
      // An emailed confirm/approve link opened while signed out: come back to
      // it after login instead of losing it.
      const loginUrl = new URL("/login", req.url);
      const callback = getSafeConfirmEmailCallback(pathname + req.nextUrl.search);
      if (callback) {
        loginUrl.searchParams.set("callbackUrl", callback);
      }
      return NextResponse.redirect(loginUrl);
    }

    if (token && pathname.startsWith("/account") && role !== "guest_teacher") {
      return NextResponse.redirect(
        new URL(role === "admin" ? "/admin/dashboard" : "/", req.url)
      );
    }

    if (token && pathname.startsWith("/admin") && role !== "admin") {
      return NextResponse.redirect(new URL("/my-reports", req.url));
    }

    if (token && pathname.startsWith("/calendar") && role !== "guest_teacher") {
      return NextResponse.redirect(new URL("/", req.url));
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
    "/calendar",
    "/account/:path*",
  ],
};
