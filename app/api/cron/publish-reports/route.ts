import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { publishReport } from "@/lib/publishReport";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
    try {
        // --------------------------------------------------
        // Protect cron endpoint
        // --------------------------------------------------

        const cronSecret = process.env.CRON_SECRET;

        if (!cronSecret) {
        console.error("CRON_SECRET is not configured");

        return NextResponse.json(
            { error: "Cron secret not configured" },
            { status: 500 }
        );
        }

        const authHeader = request.headers.get("authorization");

        if (authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
            }

        const now = new Date("2026-10-01T00:00:00Z");

        // --------------------------------------------------
        // Find approved reports that are ready to publish
        // --------------------------------------------------
        const {
            data: reports,
            error: reportsError,
        } = await supabase
            .from("reports")
            .select("*")
            .eq("status", 2)
            .is("published_at", null)
            .not("scheduled_publish_at", "is", null)
            .lte("scheduled_publish_at", now.toISOString());

        if (reportsError) {
            console.error(
                "Failed to fetch scheduled reports:",
                reportsError
            );

            return NextResponse.json(
                {
                    error: reportsError.message,
                },
                { status: 500 }
            );
        }

        if (!reports || reports.length === 0) {
            return NextResponse.json({
                success: true,
                message: "No reports are ready to publish",
                published: 0,
            });
        }

        let publishedCount = 0;
        let failedCount = 0;

        // --------------------------------------------------
        // Publish each report
        // --------------------------------------------------
        for (const report of reports) {
            try {
                const publishedAt = now.toISOString();

                // ----------------------------------------------
                // Month from report published date
                // ----------------------------------------------

                const month =
                    publishedAt.slice(0, 7) + "-01";

                await publishReport(report, month);

                // ----------------------------------------------
                // Mark report as published
                // ----------------------------------------------

                const { error: updateError } = await supabase
                    .from("reports")
                    .update({
                        published_at: publishedAt,
                        publish:1
                    })
                    .eq("id", report.id)
                    .is("published_at", null);

                    if (updateError) {
                        throw updateError;
                    }
                publishedCount++;

            } catch (error) {
                failedCount++;

                console.error(
                    `Failed to publish report ${report.id}:`,
                    error
                );
            }
        }

        // --------------------------------------------------
        // Response
        // --------------------------------------------------
        return NextResponse.json({
            success: true,
            message: "Scheduled report publishing completed",
            published: publishedCount,
            failed: failedCount,
            total: reports.length,
        });
    } catch (error: any) {
        console.error(
            "Publish reports cron error:",
            error
        );

        return NextResponse.json(
            {
                error:
                    error?.message ||
                    "Failed to publish scheduled reports",
            },
            { status: 500 }
        );
    }
}