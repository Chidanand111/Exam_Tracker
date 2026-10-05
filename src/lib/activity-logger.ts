import { prisma } from "@/lib/db";

export interface RecordActivityParams {
  applicationId: string;
  activityType:
    | "APPLICATION_CREATED"
    | "EXAM_SCHEDULE_ADDED"
    | "ADMIT_CARD_VIEWED"
    | "EXAM_COMPLETED"
    | "RESULT_CHECKED"
    | "NEXT_STAGE_ACTIVATED"
    | "NOT_SELECTED"
    | "FINAL_SELECTED"
    | "NOTES_UPDATED"
    | "CALENDAR_EXPORTED";
  title: string;
  description?: string | null;
  metadata?: any;
}

/**
 * Records an entry into the user's personal application activity feed.
 * Required for Feature 64 (Application Activity History).
 */
export async function recordApplicationActivity(params: RecordActivityParams) {
  try {
    const activity = await prisma.applicationActivity.create({
      data: {
        applicationId: params.applicationId,
        activityType: params.activityType,
        title: params.title,
        description: params.description || null,
        metadata: params.metadata || null,
      },
    });
    return activity;
  } catch (error) {
    console.error("Failed to record application activity:", error);
    return null;
  }
}
