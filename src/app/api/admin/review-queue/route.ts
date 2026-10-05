import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { logAdminAction } from "@/lib/audit-logger";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const severity = searchParams.get("severity");
    const itemType = searchParams.get("itemType");

    const where: any = {};
    if (status && status !== "ALL") {
      if (status === "PENDING") {
        where.status = "PENDING_REVIEW";
      } else if (status === "APPROVED") {
        where.status = "APPROVED_FIELD";
      } else if (status === "REJECTED") {
        where.status = "REJECTED_FIELD";
      } else {
        where.status = status;
      }
    }
    if (severity && severity !== "ALL") where.severity = severity;
    if (itemType && itemType !== "ALL") where.itemType = itemType;

    const items = await prisma.reviewQueueItem.findMany({
      where,
      include: {
        recruitment: {
          select: {
            id: true,
            title: true,
            slug: true,
            organization: { select: { name: true, shortName: true } },
          },
        },
      },
      orderBy: [{ severity: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ items });
  } catch (error: any) {
    console.error("Error fetching review queue:", error);
    return NextResponse.json(
      { error: "Failed to fetch review queue items" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      recruitmentId,
      itemType,
      fieldName,
      fieldLabel,
      severity,
      currentValue,
      proposedValue,
      description,
      notes,
    } = body;

    const item = await prisma.reviewQueueItem.create({
      data: {
        recruitmentId,
        itemType,
        fieldName: fieldName || fieldLabel,
        severity: severity || "MEDIUM",
        currentValue,
        proposedValue,
        description: description || notes || `Review item for ${fieldName || "recruitment field"}`,
        status: "PENDING_REVIEW",
      },
    });

    await logAdminAction({
      adminEmail: user.email,
      action: "CREATE_REVIEW_ITEM",
      entityType: "ReviewQueueItem",
      entityId: item.id,
      entityTitle: fieldName || "Review Item",
      newValue: item,
      reason: notes || description || "Submitted uncertain field for human review",
    });

    return NextResponse.json({ item });
  } catch (error: any) {
    console.error("Error creating review queue item:", error);
    return NextResponse.json(
      { error: "Failed to create review queue item" },
      { status: 500 }
    );
  }
}
