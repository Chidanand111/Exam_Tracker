import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateIcsContent } from "@/lib/calendar";
import { formatDateIndian, formatTimeIST } from "@/lib/date-locale";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const applicationId = searchParams.get("applicationId");
    const recruitmentId = searchParams.get("recruitmentId");
    const eventType = searchParams.get("type") || "exam"; // "exam" | "deadline"

    let eventTitle = "Government Exam Milestone";
    let eventDescription = "Official Government Recruitment Event";
    let eventLocation = "Exam Center (See official admit card)";
    let startDate = new Date();
    let endDate = new Date(Date.now() + 2 * 60 * 60 * 1000);
    let eventUrl = "https://exam-tracker-blue.vercel.app";

    if (applicationId) {
      const application = await prisma.userApplication.findUnique({
        where: { id: applicationId },
        include: {
          recruitment: {
            include: { organization: true },
          },
          stageProgress: {
            include: {
              stage: true,
              examSchedule: true,
            },
          },
        },
      });

      if (!application) {
        return NextResponse.json({ error: "Application not found" }, { status: 404 });
      }

      eventUrl = `https://exam-tracker-blue.vercel.app/recruitments/${application.recruitment.slug || application.recruitment.id}`;

      // Check if user has personal schedule
      const activeStage = application.stageProgress.find((p) => p.examSchedule);

      if (eventType === "exam" && activeStage?.examSchedule) {
        const sch = activeStage.examSchedule;
        startDate = new Date(sch.examDate);
        endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);

        eventTitle = `EXAM: ${application.recruitment.title} (${sch.shiftName})`;
        eventDescription = `Official Government Exam for ${application.recruitment.organization.name}.\nShift: ${sch.shiftName}\nExam Time: ${sch.examTime}\nReporting Time: ${sch.reportingTime || "N/A"}\nCenter: ${sch.examCenterName || "As specified on Admit Card"}\nAddress: ${sch.centerAddress || ""}\n\nTracked via BharatExam Tracker`;
        eventLocation = sch.centerAddress || sch.examCenterName || "Center listed on Admit Card";
      } else {
        // Fallback to application deadline
        if (application.recruitment.appDeadline) {
          startDate = new Date(application.recruitment.appDeadline);
          endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
        }
        eventTitle = `DEADLINE: ${application.recruitment.title} - Application Closing`;
        eventDescription = `Last date to submit official application on ${application.recruitment.organization.name} portal.\nDeadline: ${formatDateIndian(startDate)}\nApply at: ${application.recruitment.officialApplyUrl}`;
      }

      // Record Activity (Requirement 64)
      await prisma.applicationActivity.create({
        data: {
          applicationId: application.id,
          activityType: "CALENDAR_EXPORTED",
          title: "Calendar exported",
          description: `Generated iCalendar (.ics) milestone for ${eventTitle}`,
        },
      }).catch(() => {});
    } else if (recruitmentId) {
      const recruitment = await prisma.recruitment.findUnique({
        where: { id: recruitmentId },
        include: { organization: true },
      });

      if (!recruitment) {
        return NextResponse.json({ error: "Recruitment not found" }, { status: 404 });
      }

      eventUrl = `https://exam-tracker-blue.vercel.app/recruitments/${recruitment.slug || recruitment.id}`;

      if (eventType === "deadline" && recruitment.appDeadline) {
        startDate = new Date(recruitment.appDeadline);
        endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
        eventTitle = `DEADLINE: ${recruitment.title}`;
        eventDescription = `Application closing date for ${recruitment.organization.name}.\nTotal Vacancies: ${recruitment.vacancies || "Listed"}\nApply at: ${recruitment.officialApplyUrl}`;
      } else {
        startDate = recruitment.appDeadline ? new Date(recruitment.appDeadline) : new Date();
        endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);
        eventTitle = `${recruitment.title} Milestone`;
        eventDescription = `Important recruitment date for ${recruitment.organization.name}.`;
      }
    }

    // Log privacy-conscious event (Requirement 77)
    await prisma.privacyAnalyticsEvent.create({
      data: {
        eventType: "CALENDAR_EXPORTED",
        targetSlug: recruitmentId || applicationId,
      },
    }).catch(() => {});

    const icsContent = generateIcsContent({
      title: eventTitle,
      description: eventDescription,
      location: eventLocation,
      startDate,
      endDate,
      url: eventUrl,
      alarmMinutesBefore: 120,
    });

    const filename = `bharatexam-${eventType}-${Date.now()}.ics`;

    return new Response(icsContent, {
      status: 200,
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-cache",
      },
    });
  } catch (error: any) {
    console.error("Calendar export error:", error);
    return NextResponse.json(
      { error: "Failed to generate calendar file" },
      { status: 500 }
    );
  }
}
