import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession, getSchoolAccessStatus } from "@/lib/schoolAccess";

export async function GET(req: NextRequest) {
  try {
    const schoolId = req.nextUrl.searchParams.get("schoolId");

    if (!schoolId) {
      return NextResponse.json(
        { success: false, message: "schoolId is required" },
        { status: 400 }
      );
    }

    const session = await getCurrentSession();

    if (!session?.user?.id) {
      return NextResponse.json({
        success: true,
        loggedIn: false,
        isAdmin: false,
        status: "none",
      });
    }

    if (session.user.role === "admin") {
      return NextResponse.json({
        success: true,
        loggedIn: true,
        isAdmin: true,
        status: "approved",
      });
    }

    const status = await getSchoolAccessStatus(session.user.id, schoolId);

    return NextResponse.json({
      success: true,
      loggedIn: true,
      isAdmin: false,
      status,
    });
  } catch (error) {
    console.error("School access status error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch access status" },
      { status: 500 }
    );
  }
}
