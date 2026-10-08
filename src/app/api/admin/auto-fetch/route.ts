import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { executeAutoFetch, getAutoFetchStatus } from "@/lib/auto-fetcher";
import { logAdminAction } from "@/lib/audit-logger";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin privilege required" }, { status: 403 });
    }

    const status = await getAutoFetchStatus();
    return NextResponse.json(status);
  } catch (error: any) {
    console.error("Admin auto-fetch status error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to load auto-fetch status" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin privilege required" }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const force = Boolean(body.force ?? true);

    const result = await executeAutoFetch({
      triggerType: "ADMIN_MANUAL",
      force,
    });

    await logAdminAction({
      adminEmail: user.email,
      action: "AUTO_FETCH_MANUAL_TRIGGER",
      entityType: "AutoFetchCrawler",
      entityId: result.runId,
      entityTitle: "All Monitored Sources Sync",
      newValue: JSON.stringify({
        itemsFound: result.itemsFound,
        newRecruitments: result.newRecruitments,
        newBulletins: result.newBulletins,
        durationMs: result.durationMs,
      }),
      reason: "Manual on-demand trigger of automated multi-source feed crawler",
    });

    return NextResponse.json({
      success: true,
      message: result.summaryMessage,
      result,
    });
  } catch (error: any) {
    console.error("Admin manual auto-fetch error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to run on-demand auto-fetch" },
      { status: 500 }
    );
  }
}
