import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      stageId,
      selectedScheduleId,
      examDate,
      shiftName,
      examTime,
      reportingTime,
      examCenterName,
      centerAddress,
      notes,
    } = await req.json();

    if (!stageId || !examDate || !shiftName || !examTime) {
      return NextResponse.json(
        { error: "stageId, examDate, shiftName, and examTime are required" },
        { status: 400 }
      );
    }

    // Verify application belongs to user
    const application = await prisma.userApplication.findFirst({
      where: { id: params.id, userId: user.id },
      include: { recruitment: true },
    });

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    // Find or create the stageProgress record
    const stageProgress = await prisma.userStageProgress.upsert({
      where: {
        applicationId_stageId: {
          applicationId: application.id,
          stageId,
        },
      },
      update: {
        status: "EXAM_SCHEDULED",
      },
      create: {
        applicationId: application.id,
        stageId,
        status: "EXAM_SCHEDULED",
      },
    });

    // Upsert UserExamSchedule
    const userSchedule = await prisma.userExamSchedule.upsert({
      where: {
        stageProgressId: stageProgress.id,
      },
      update: {
        selectedScheduleId: selectedScheduleId || null,
        examDate: new Date(examDate),
        shiftName,
        examTime,
        reportingTime: reportingTime || null,
        examCenterName: examCenterName || null,
        centerAddress: centerAddress || null,
        notes: notes || null,
      },
      create: {
        stageProgressId: stageProgress.id,
        selectedScheduleId: selectedScheduleId || null,
        examDate: new Date(examDate),
        shiftName,
        examTime,
        reportingTime: reportingTime || null,
        examCenterName: examCenterName || null,
        centerAddress: centerAddress || null,
        notes: notes || null,
      },
    });

    // Auto-create exam reminders (1 day before, and reporting time)
    const targetExamDate = new Date(examDate);
    const dayBefore = new Date(targetExamDate.getTime() - 24 * 60 * 60 * 1000);
    if (dayBefore > new Date()) {
      await prisma.reminder.create({
        data: {
          userId: user.id,
          applicationId: application.id,
          stageId,
          reminderType: "EXAM_DATE",
          title: `Exam Tomorrow: ${application.recruitment.title} (${shiftName})`,
          scheduledFor: dayBefore,
          presetOption: "1_DAY_BEFORE",
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Personal exam schedule saved successfully",
      schedule: userSchedule,
    });
  } catch (error: any) {
    console.error("Save personal schedule error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to save schedule" },
      { status: 500 }
    );
  }
}
