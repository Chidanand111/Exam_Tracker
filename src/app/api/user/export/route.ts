import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required to export data" },
        { status: 401 }
      );
    }

    const url = new URL(req.url);
    const format = (url.searchParams.get("format") || "json").toLowerCase();

    // Fetch user's own tracking data strictly
    const [applications, vaultRecords, notes, checklists, shortlists, profile] =
      await Promise.all([
        prisma.userApplication.findMany({
          where: { userId: user.id },
          include: {
            recruitment: {
              include: {
                organization: true,
                stages: { orderBy: { stageOrder: "asc" } },
              },
            },
            stageProgress: {
              include: {
                stage: true,
                examSchedule: true,
              },
              orderBy: { stage: { stageOrder: "asc" } },
            },
            reminders: true,
          },
          orderBy: { createdAt: "desc" },
        }),
        prisma.applicationVault.findMany({
          where: { userId: user.id },
          include: {
            recruitment: { select: { title: true, notificationNumber: true } },
          },
        }),
        prisma.recruitmentNote.findMany({
          where: { userId: user.id },
          include: {
            recruitment: { select: { title: true } },
          },
          orderBy: { updatedAt: "desc" },
        }),
        prisma.userChecklistItem.findMany({
          where: { userId: user.id },
          include: {
            recruitment: { select: { title: true } },
          },
        }),
        prisma.recruitmentShortlist.findMany({
          where: { userId: user.id },
          include: {
            recruitment: { select: { title: true } },
          },
        }),
        prisma.candidateProfile.findUnique({
          where: { userId: user.id },
        }),
      ]);

    // Structured portable object
    const exportData = {
      exportMetadata: {
        platform: "BharatExam Tracker",
        exportedAt: new Date().toISOString(),
        candidateName: user.name,
        candidateEmail: user.email,
        totalApplications: applications.length,
        totalVaultRecords: vaultRecords.length,
        totalNotes: notes.length,
        disclaimer:
          "This personal tracking export contains candidate-recorded data. It does not constitute official appointment records.",
      },
      candidateProfile: profile || null,
      applications: applications.map((app) => {
        const vault = vaultRecords.find(
          (v) => v.recruitmentId === app.recruitmentId
        );
        const appNotes = notes.filter(
          (n) => n.recruitmentId === app.recruitmentId
        );

        // Current assigned shift info if any
        const activeProgress =
          app.stageProgress.find(
            (sp) => sp.stage?.stageOrder === app.currentStageOrder
          ) || app.stageProgress[0];
        const shift = activeProgress?.examSchedule;

        return {
          recruitmentTitle: app.recruitment.title,
          organization: app.recruitment.organization.name,
          notificationNumber: app.recruitment.notificationNumber || "N/A",
          appliedDate: app.appliedDate
            ? new Date(app.appliedDate).toLocaleDateString("en-IN")
            : "N/A",
          applicationNumber:
            vault?.applicationNumber || app.registrationNumber || "N/A",
          registrationNumber: vault?.registrationNumber || "N/A",
          rollNumber: vault?.rollNumber || "N/A",
          paymentReference: vault?.paymentReference || "N/A",
          transactionId: vault?.transactionId || "N/A",
          status: app.overallStatus,
          currentStage:
            activeProgress?.stage?.stageName ||
            `Stage ${app.currentStageOrder}`,
          personalExamSchedule: shift
            ? {
                date: new Date(shift.examDate).toLocaleDateString("en-IN"),
                shiftName: shift.shiftName,
                time: shift.examTime,
                reportingTime: shift.reportingTime || "N/A",
                center: shift.examCenterName || "N/A",
                address: shift.centerAddress || "N/A",
              }
            : "No slot assigned yet",
          notes: appNotes.map((n) => ({
            title: n.title,
            content: n.content,
            isPinned: n.isPinned,
            checklist: n.checklist,
            updatedAt: n.updatedAt,
          })),
          importantDates: {
            applicationStartDate: app.recruitment.appStartDate
              ? new Date(app.recruitment.appStartDate).toLocaleDateString(
                  "en-IN"
                )
              : "N/A",
            applicationDeadline: app.recruitment.appDeadline
              ? new Date(app.recruitment.appDeadline).toLocaleDateString("en-IN")
              : "N/A",
          },
        };
      }),
      vaultReferences: vaultRecords,
      shortlistedOpportunities: shortlists,
      checklistProgress: checklists,
    };

    // Format 1: JSON
    if (format === "json") {
      const jsonString = JSON.stringify(exportData, null, 2);
      return new NextResponse(jsonString, {
        status: 200,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Content-Disposition": `attachment; filename="bharat-exam-tracker-export-${new Date().toISOString().slice(0, 10)}.json"`,
        },
      });
    }

    // Format 2: CSV
    if (format === "csv") {
      const csvHeaders = [
        "Recruitment Title",
        "Organization",
        "Notification No",
        "Applied Date",
        "Application No",
        "Registration No",
        "Roll No",
        "Status",
        "Current Stage",
        "Assigned Exam Date",
        "Assigned Shift",
        "Exam Center",
        "Reporting Time",
        "Payment Ref",
        "Notes Summary",
        "Application Deadline",
      ];

      const escapeCSV = (str: any) => {
        if (str === null || str === undefined) return '""';
        const s = String(str).replace(/"/g, '""');
        return `"${s}"`;
      };

      const rows = exportData.applications.map((app) => {
        const shiftObj =
          typeof app.personalExamSchedule === "object"
            ? app.personalExamSchedule
            : null;
        const notesText = app.notes.map((n) => n.content).join(" | ");

        return [
          escapeCSV(app.recruitmentTitle),
          escapeCSV(app.organization),
          escapeCSV(app.notificationNumber),
          escapeCSV(app.appliedDate),
          escapeCSV(app.applicationNumber),
          escapeCSV(app.registrationNumber),
          escapeCSV(app.rollNumber),
          escapeCSV(app.status),
          escapeCSV(app.currentStage),
          escapeCSV(shiftObj?.date || "N/A"),
          escapeCSV(shiftObj?.shiftName || "N/A"),
          escapeCSV(shiftObj?.center || "N/A"),
          escapeCSV(shiftObj?.reportingTime || "N/A"),
          escapeCSV(app.paymentReference),
          escapeCSV(notesText),
          escapeCSV(app.importantDates.applicationDeadline),
        ].join(",");
      });

      const csvContent = [csvHeaders.join(","), ...rows].join("\n");

      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="bharat-exam-tracker-applications-${new Date().toISOString().slice(0, 10)}.csv"`,
        },
      });
    }

    // Format 3: PDF / Printable Document HTML
    if (format === "pdf" || format === "html") {
      return NextResponse.json({
        success: true,
        exportData,
        message: "PDF / Printable summary payload prepared successfully",
      });
    }

    return NextResponse.json(
      { error: "Unsupported export format. Use csv, json, or pdf" },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Export Error:", error);
    return NextResponse.json(
      { error: "Failed to generate personal data export" },
      { status: 500 }
    );
  }
}
