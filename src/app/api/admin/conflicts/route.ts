import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const conflicts = await prisma.informationConflict.findMany({
      include: {
        recruitment: {
          select: {
            id: true,
            title: true,
            slug: true,
            organization: { select: { shortName: true } },
          },
        },
      },
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ conflicts });
  } catch (error: any) {
    console.error("Error fetching information conflicts:", error);
    return NextResponse.json({ error: "Failed to fetch conflicts" }, { status: 500 });
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
      fieldName,
      fieldLabel,
      source1Name,
      source1Url,
      source1Value,
      source2Name,
      source2Url,
      source2Value,
      resolutionNotes,
    } = body;

    const conflict = await prisma.informationConflict.create({
      data: {
        recruitmentId,
        fieldName,
        fieldLabel,
        source1Name,
        source1Url,
        source1Value,
        source2Name,
        source2Url,
        source2Value,
        resolutionNotes,
        status: "CONFLICT_DETECTED",
      },
    });

    // Also update recruitment sourceReliabilityState
    await prisma.recruitment.update({
      where: { id: recruitmentId },
      data: {
        sourceReliabilityState: "CONFLICTING_INFORMATION",
      },
    });

    return NextResponse.json({ success: true, conflict });
  } catch (error: any) {
    console.error("Error creating information conflict:", error);
    return NextResponse.json({ error: "Failed to record conflict" }, { status: 500 });
  }
}
