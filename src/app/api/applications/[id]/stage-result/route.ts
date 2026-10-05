import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { advanceStageOutcome } from "@/lib/stage-engine";
import { recordApplicationActivity } from "@/lib/activity-logger";

export const dynamic = "force-dynamic";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { stageId, outcome, userNotes } = await req.json();

    if (!stageId || !outcome) {
      return NextResponse.json({ error: "stageId and outcome are required" }, { status: 400 });
    }

    const result = await advanceStageOutcome({
      userId: user.id,
      applicationId: params.id,
      stageId,
      outcome,
      userNotes,
    });

    // Record Activity (Requirement 64)
    const activityTitle =
      outcome === "SELECTED_FOR_NEXT"
        ? "User marked 'Selected for next stage'"
        : outcome === "FINAL_SELECTED"
        ? "User marked 'Final Selected'"
        : outcome === "NOT_SELECTED"
        ? "User marked 'Not Selected'"
        : "Result checked";

    const activityType =
      outcome === "SELECTED_FOR_NEXT"
        ? "NEXT_STAGE_ACTIVATED"
        : outcome === "NOT_SELECTED"
        ? "NOT_SELECTED"
        : "RESULT_CHECKED";

    await recordApplicationActivity({
      applicationId: params.id,
      activityType: activityType as any,
      title: activityTitle,
      description: userNotes || `Outcome set to ${outcome.replace(/_/g, " ")}`,
      metadata: { stageId, outcome },
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Stage outcome error:", error);
    return NextResponse.json({ error: error?.message || "Failed to update outcome" }, { status: 500 });
  }
}
