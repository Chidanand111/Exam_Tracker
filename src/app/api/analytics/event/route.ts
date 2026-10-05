import { NextResponse } from "next/server";
import { recordPrivacyAnalyticsEvent, AnalyticsEventType } from "@/lib/privacy-analytics";
import { checkRateLimit, getClientIp } from "@/lib/rate-limiter";

export const dynamic = "force-dynamic";

const VALID_EVENT_TYPES: Set<string> = new Set([
  "RECRUITMENT_VIEWED",
  "SEARCH_PERFORMED",
  "FILTER_USED",
  "OFFICIAL_APPLY_CLICKED",
  "BOOKMARK_SAVED",
  "TRACKER_CREATED",
  "CALENDAR_EXPORTED",
]);

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const rateCheck = checkRateLimit(ip, "PUBLIC_API");
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "Too many analytics requests" },
        { status: 429, headers: { "Retry-After": String(rateCheck.resetInSeconds) } }
      );
    }

    const body = await req.json();
    const { eventType, targetSlug, category, metadata } = body;

    if (!eventType || !VALID_EVENT_TYPES.has(eventType)) {
      return NextResponse.json({ error: "Invalid eventType" }, { status: 400 });
    }

    await recordPrivacyAnalyticsEvent({
      eventType: eventType as AnalyticsEventType,
      targetSlug,
      category,
      metadata,
    });

    return NextResponse.json({ recorded: true });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to record event" }, { status: 500 });
  }
}
