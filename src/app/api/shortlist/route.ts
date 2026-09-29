import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const url = new URL(req.url);
    const stateFilter = url.searchParams.get("state"); // "BOOKMARKED" | "INTERESTED" | "APPLIED" | "COMPLETED"

    const whereClause: any = { userId: user.id };
    if (stateFilter) {
      whereClause.lifecycleState = stateFilter.toUpperCase();
    }

    const items = await prisma.recruitmentShortlist.findMany({
      where: whereClause,
      include: {
        recruitment: {
          include: {
            organization: true,
            qualifications: true,
            posts: true,
            stages: {
              include: { schedules: true },
              orderBy: { stageOrder: "asc" },
            },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    // Count by state for tabs
    const counts = await prisma.recruitmentShortlist.groupBy({
      by: ["lifecycleState"],
      where: { userId: user.id },
      _count: { id: true },
    });

    const countsMap: Record<string, number> = {
      ALL: items.length,
      BOOKMARKED: 0,
      INTERESTED: 0,
      APPLIED: 0,
      COMPLETED: 0,
    };

    let total = 0;
    for (const c of counts) {
      countsMap[c.lifecycleState] = c._count.id;
      total += c._count.id;
    }
    countsMap.ALL = total;

    return NextResponse.json({
      success: true,
      items,
      counts: countsMap,
    });
  } catch (error: any) {
    console.error("Error fetching shortlist:", error);
    return NextResponse.json(
      { error: "Failed to fetch shortlist", details: error?.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required to shortlist" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      recruitmentId,
      lifecycleState = "BOOKMARKED", // "BOOKMARKED", "INTERESTED", "APPLIED", "COMPLETED"
      priority = "MEDIUM",
      personalNotes,
      targetPrepDays,
    } = body;

    if (!recruitmentId) {
      return NextResponse.json(
        { error: "recruitmentId is required" },
        { status: 400 }
      );
    }

    const validStates = ["BOOKMARKED", "INTERESTED", "APPLIED", "COMPLETED"];
    if (!validStates.includes(lifecycleState)) {
      return NextResponse.json(
        { error: `Invalid lifecycleState. Allowed: ${validStates.join(", ")}` },
        { status: 400 }
      );
    }

    const shortlistRecord = await prisma.recruitmentShortlist.upsert({
      where: {
        userId_recruitmentId: {
          userId: user.id,
          recruitmentId,
        },
      },
      create: {
        userId: user.id,
        recruitmentId,
        lifecycleState,
        priority,
        personalNotes: personalNotes || null,
        targetPrepDays: targetPrepDays ? Number(targetPrepDays) : null,
      },
      update: {
        lifecycleState,
        priority: priority || undefined,
        personalNotes: personalNotes !== undefined ? personalNotes : undefined,
        targetPrepDays: targetPrepDays !== undefined ? Number(targetPrepDays) : undefined,
      },
      include: {
        recruitment: {
          include: { organization: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      item: shortlistRecord,
      message: `Recruitment marked as ${lifecycleState}`,
    });
  } catch (error: any) {
    console.error("Error saving shortlist item:", error);
    return NextResponse.json(
      { error: "Failed to save shortlist item", details: error?.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const url = new URL(req.url);
    const recruitmentId = url.searchParams.get("recruitmentId");

    if (!recruitmentId) {
      return NextResponse.json({ error: "recruitmentId is required" }, { status: 400 });
    }

    await prisma.recruitmentShortlist.deleteMany({
      where: {
        userId: user.id,
        recruitmentId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Recruitment removed from shortlist",
    });
  } catch (error: any) {
    console.error("Error removing shortlist item:", error);
    return NextResponse.json(
      { error: "Failed to remove shortlist item", details: error?.message },
      { status: 500 }
    );
  }
}
