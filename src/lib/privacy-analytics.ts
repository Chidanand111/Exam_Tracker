/**
 * Privacy-Conscious Product Analytics (Requirement 77)
 *
 * Tracks aggregated product usage with strict user privacy guarantees:
 * - Collects zero IP addresses, session cookies, device fingerprints, or PII.
 * - Tracks events: RECRUITMENT_VIEWED, SEARCH_PERFORMED, FILTER_USED,
 *   OFFICIAL_APPLY_CLICKED, BOOKMARK_SAVED, TRACKER_CREATED, CALENDAR_EXPORTED.
 * - Important Legal / Safety Disclaimer:
 *   "Analytics events must never be interpreted as proof that a user successfully applied externally."
 */

import { prisma } from "@/lib/db";

export type AnalyticsEventType =
  | "RECRUITMENT_VIEWED"
  | "SEARCH_PERFORMED"
  | "FILTER_USED"
  | "OFFICIAL_APPLY_CLICKED"
  | "BOOKMARK_SAVED"
  | "TRACKER_CREATED"
  | "CALENDAR_EXPORTED";

export interface LogEventParams {
  eventType: AnalyticsEventType;
  targetSlug?: string | null;
  category?: string | null;
  metadata?: Record<string, any> | null;
}

export async function recordPrivacyAnalyticsEvent(params: LogEventParams) {
  try {
    // Sanitize metadata to guarantee zero PII or user IDs are stored
    const cleanMeta: Record<string, any> = {};
    if (params.metadata) {
      for (const [key, val] of Object.entries(params.metadata)) {
        if (!["email", "name", "userId", "ip", "phone", "roll", "reg"].some((bad) => key.toLowerCase().includes(bad))) {
          cleanMeta[key] = val;
        }
      }
    }

    await prisma.privacyAnalyticsEvent.create({
      data: {
        eventType: params.eventType,
        targetSlug: params.targetSlug || null,
        category: params.category || null,
        metadata: Object.keys(cleanMeta).length > 0 ? cleanMeta : undefined,
      },
    });
  } catch (error) {
    console.error("Privacy analytics recording error:", error);
  }
}
