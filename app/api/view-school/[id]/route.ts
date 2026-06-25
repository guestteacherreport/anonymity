import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // =========================
    // 1. SCHOOL DETAILS (FAST)
    // =========================
    const { data: school, error: schoolError } = await supabase
      .from("schools")
      .select("*")
      .eq("id", id)
      .single();

    if (schoolError || !school) {
      return NextResponse.json(
        { success: false, message: "School not found" },
        { status: 404 }
      );
    }


    // =========================
    // 3. SAFE STATS
    // =========================
    const safeStats = {


      school_yes: school.school_yes || 0,
      school_no: school.school_no || 0,
      school_maybe: school.school_maybe || 0,

      teacher_yes: school.teacher_yes || 0,
      teacher_no: school.teacher_no || 0,
      teacher_maybe: school.teacher_maybe || 0,
    };


    // =========================
    // 5. RESPONSE
    // =========================
    return NextResponse.json({
      success: true,

      school: {
        ...school,

        return_to_school_yes_percentage:
          safeStats.school_yes + safeStats.school_no + safeStats.school_maybe > 0
            ? Number(
              (
                (safeStats.school_yes * 100) /
                (safeStats.school_yes +
                  safeStats.school_no +
                  safeStats.school_maybe)
              ).toFixed(1)
            )
            : 0,

        return_to_school_no_percentage:
          safeStats.school_yes + safeStats.school_no + safeStats.school_maybe > 0
            ? Number(
              (
                (safeStats.school_no * 100) /
                (safeStats.school_yes +
                  safeStats.school_no +
                  safeStats.school_maybe)
              ).toFixed(1)
            )
            : 0,

        return_to_school_maybe_percentage:
          safeStats.school_yes + safeStats.school_no + safeStats.school_maybe > 0
            ? Number(
              (
                (safeStats.school_maybe * 100) /
                (safeStats.school_yes +
                  safeStats.school_no +
                  safeStats.school_maybe)
              ).toFixed(1)
            )
            : 0,

        return_to_teacher_yes_percentage:
          safeStats.teacher_yes + safeStats.teacher_no + safeStats.teacher_maybe > 0
            ? Number(
              (
                (safeStats.teacher_yes * 100) /
                (safeStats.teacher_yes +
                  safeStats.teacher_no +
                  safeStats.teacher_maybe)
              ).toFixed(1)
            )
            : 0,

        return_to_teacher_no_percentage:
          safeStats.teacher_yes + safeStats.teacher_no + safeStats.teacher_maybe > 0
            ? Number(
              (
                (safeStats.teacher_no * 100) /
                (safeStats.teacher_yes +
                  safeStats.teacher_no +
                  safeStats.teacher_maybe)
              ).toFixed(1)
            )
            : 0,

        return_to_teacher_maybe_percentage:
          safeStats.teacher_yes + safeStats.teacher_no + safeStats.teacher_maybe > 0
            ? Number(
              (
                (safeStats.teacher_maybe * 100) /
                (safeStats.teacher_yes +
                  safeStats.teacher_no +
                  safeStats.teacher_maybe)
              ).toFixed(1)
            )
            : 0,
      },

    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch school details",
      },
      { status: 500 }
    );
  }
}