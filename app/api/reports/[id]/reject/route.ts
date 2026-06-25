import { supabase } from "@/lib/supabase";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params
    const { id } = await params;

    // Update report status to Rejected (3)
    const { error } = await supabase
      .from("reports")
      .update({
        status: 3,
      })
      .eq("id", id);

    if (error) {
      console.error(
        "Supabase Update Error:",
        error
      );

      return Response.json(
        {
          error: error.message,
        },
        {
          status: 500,
        }
      );
    }

    return Response.json({
      success: true,
      message: "Report rejected",
    });
  } catch (error) {
    console.error(
      "Reject report error:",
      error
    );

    return Response.json(
      {
        error: "Failed to reject report",
      },
      {
        status: 500,
      }
    );
  }
}