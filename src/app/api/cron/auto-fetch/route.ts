import { NextResponse } from "next/server";
import { executeAutoFetch } from "@/lib/auto-fetcher";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // Allow sufficient time for network requests

/**
 * Scheduled Cron Ingestion Endpoint
 * Configured in vercel.json:
 * schedule: "0 6,18 * * *" (Twice daily at 06:00 UTC and 18:00 UTC / 11:30 AM & 11:30 PM IST)
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const force = searchParams.get("force") === "true";

    // Optional Vercel CRON_SECRET check
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    const isVercelCron = req.headers.get("x-vercel-cron") === "1";

    if (cronSecret && authHeader !== `Bearer ${cronSecret}` && !isVercelCron) {
      // If secret is set but invalid and not native Vercel Cron header, reject unauthorized
      const adminToken = searchParams.get("key");
      if (adminToken !== cronSecret) {
        return NextResponse.json({ error: "Unauthorized cron invocation" }, { status: 401 });
      }
    }

    console.log("[CronAutoFetch] Initiating scheduled crawl across all government portals & education feeds...");
    const result = await executeAutoFetch({
      triggerType: "SCHEDULED_CRON",
      force,
    });

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      cronSchedule: "Twice daily (06:00 & 18:00 UTC)",
      result,
    });
  } catch (error: any) {
    console.error("[CronAutoFetch] Cron execution error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to execute auto-fetch",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  return GET(req);
}
