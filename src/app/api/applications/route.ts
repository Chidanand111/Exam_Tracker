import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { initializeUserApplication } from "@/lib/stage-engine";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const applications = await prisma.userApplication.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
      include: {
        recruitment: {
          include: {
            organization: true,
            stages: {
              orderBy: { stageOrder: "asc" },
              include: {
                schedules: true,
              },
            },
          },
        },
        stageProgress: {
          include: {
            stage: {
              include: {
                schedules: true,
              },
            },
            examSchedule: true,
          },
        },
        reminders: {
          orderBy: { scheduledFor: "asc" },
        },
        activities: {
          orderBy: { timestamp: "desc" },
        },
      },
    });

    return NextResponse.json({ applications });
  } catch (error) {
    console.error("Fetch applications error:", error);
    return NextResponse.json({ error: "Failed to load applications" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Please log in to track this recruitment" }, { status: 401 });
    }

    const body = await req.json();
    const { recruitmentId, registrationNumber, rollNumber, notes } = body;

    if (!recruitmentId) {
      return NextResponse.json({ error: "recruitmentId is required" }, { status: 400 });
    }

    const result = await initializeUserApplication({
      userId: user.id,
      recruitmentId,
      registrationNumber,
      rollNumber,
      notes,
    });

    // Record Activity (Requirement 64)
    await prisma.applicationActivity.create({
      data: {
        applicationId: result.application.id,
        activityType: "APPLICATION_CREATED",
        title: "Application added",
        description: registrationNumber
          ? `Recorded registration number: ${registrationNumber}`
          : "Marked as applied and added to personal tracker",
      },
    }).catch((err) => console.error("Activity log error:", err));

    return NextResponse.json({
      success: true,
      message: "Recruitment successfully added to your tracker!",
      application: result.application,
    });
  } catch (error: any) {
    console.error("Track application error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to mark as applied" },
      { status: 500 }
    );
  }
}
