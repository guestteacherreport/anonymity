import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getServerSession } from "next-auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();

    const {
      title,
      start,
      end,
      school,
      schoolAddress,
      schoolPhone,
      schoolEmail,
      schoolId,
      teacherName,
      teacherId,
      teacherPhone,
      teacherEmail,
      notes,
      color,
      bgColor,
      borderColor,
      reminders,
    } = body;

    if (!title || !start || !end || !school || !schoolAddress) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("calendar_event")
      .insert([
        {
          title,
          start_date: start,
          end_date: end,
          school_name: school,
          school_address: schoolAddress,
          school_phone: schoolPhone || null,
          school_email: schoolEmail || null,
          school_id: schoolId || null,
          teacher_name: teacherName || null,
          teacher_id: teacherId || null,
          teacher_phone: teacherPhone || null,
          teacher_email: teacherEmail || null,
          notes: notes || null,
          color,
          bg_color: bgColor,
          reminders,
          created_at: new Date().toISOString(),
        },
      ])
      .select();

    if (error) {
      console.error("Supabase Error:", error);
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      event: data?.[0],
    });
  } catch (error) {
    console.error("Error saving calendar event:", error);
    return NextResponse.json(
      { success: false, message: "Failed to save event" },
      { status: 500 }
    );
  }
}
