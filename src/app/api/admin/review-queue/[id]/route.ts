import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { logAdminAction } from "@/lib/audit-logger";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const body = await req.json();
    const { action, resolutionNotes, overrideValue } = body;

    if (!["APPROVED", "REJECTED", "RESOLVED"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action. Must be APPROVED, REJECTED, or RESOLVED" },
        { status: 400 }
      );
    }

    if (!resolutionNotes || resolutionNotes.trim().length < 5) {
      return NextResponse.json(
        { error: "Resolution justification/notes are required for administrative audit trail" },
        { status: 400 }
      );
    }

    const item = await prisma.reviewQueueItem.findUnique({
      where: { id },
      include: { recruitment: true },
    });

    if (!item) {
      return NextResponse.json(
        { error: "Review queue item not found" },
        { status: 404 }
      );
    }

    const previousValue = {
      status: item.status,
      currentValue: item.currentValue,
      proposedValue: item.proposedValue,
    };

    // If approving and item has a target field on recruitment, apply the update
    const acceptedVal = overrideValue !== undefined ? overrideValue : item.proposedValue;

    if (action === "APPROVED" && item.recruitmentId && item.fieldName && acceptedVal !== null) {
      try {
        const updateData: any = {};
        // Cast types according to field
        if (item.fieldName === "vacancies") {
          updateData.vacancies = parseInt(acceptedVal, 10) || undefined;
        } else if (item.fieldName === "applicationFee") {
          updateData.applicationFee = parseFloat(acceptedVal) || undefined;
        } else if (item.fieldName === "appDeadline") {
          updateData.appDeadline = new Date(acceptedVal);
        } else if (item.fieldName === "appStartDate") {
          updateData.appStartDate = new Date(acceptedVal);
        } else if (["officialApplyUrl", "officialNotificationUrl", "admitCardUrl", "resultUrl", "payScale"].includes(item.fieldName)) {
          updateData[item.fieldName] = acceptedVal;
        }

        if (Object.keys(updateData).length > 0) {
          await prisma.recruitment.update({
            where: { id: item.recruitmentId },
            data: updateData,
          });
        }
      } catch (err) {
        console.error("Failed to propagate approved review field to recruitment:", err);
      }
    }

    const finalStatus =
      action === "APPROVED"
        ? "APPROVED_FIELD"
        : action === "REJECTED"
        ? "REJECTED_FIELD"
        : "MANUALLY_OVERRIDDEN";

    const updated = await prisma.reviewQueueItem.update({
      where: { id },
      data: {
        status: finalStatus,
        reviewerEmail: user.email,
        resolutionNotes,
        reviewedAt: new Date(),
      },
    });

    // Write immutable audit log
    await logAdminAction({
      adminEmail: user.email,
      action: `REVIEW_ITEM_${action}`,
      entityType: "ReviewQueueItem",
      entityId: id,
      entityTitle: item.fieldName || "Review Field",
      previousValue,
      newValue: {
        status: finalStatus,
        acceptedValue: acceptedVal,
        resolutionNotes,
      },
      reason: resolutionNotes,
    });

    return NextResponse.json({ item: updated });
  } catch (error: any) {
    console.error("Error updating review queue item:", error);
    return NextResponse.json(
      { error: "Failed to update review queue item" },
      { status: 500 }
    );
  }
}
