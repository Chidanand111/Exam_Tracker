import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { advanceStageOutcome } from "@/lib/stage-engine";

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

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Stage outcome error:", error);
    return NextResponse.json({ error: error?.message || "Failed to update outcome" }, { status: 500 });
  }
}
