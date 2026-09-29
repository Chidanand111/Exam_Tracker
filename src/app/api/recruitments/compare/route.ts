import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const idsParam = url.searchParams.get("ids");

    if (!idsParam) {
      return NextResponse.json(
        { error: "Query parameter 'ids' is required (comma-separated recruitment IDs)" },
        { status: 400 }
      );
    }

    const ids = idsParam
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    if (ids.length < 2) {
      return NextResponse.json(
        { error: "At least 2 recruitment IDs are required for side-by-side comparison" },
        { status: 400 }
      );
    }

    if (ids.length > 5) {
      return NextResponse.json(
        { error: "Maximum 5 recruitments can be compared at a time" },
        { status: 400 }
      );
    }

    const recruitments = await prisma.recruitment.findMany({
      where: { id: { in: ids } },
      include: {
        organization: true,
        qualifications: true,
        posts: true,
        stages: {
          include: { schedules: true },
          orderBy: { stageOrder: "asc" },
        },
        ruleSets: {
          where: { isActive: true },
          take: 1,
        },
      },
    });

    if (recruitments.length === 0) {
      return NextResponse.json(
        { error: "No recruitments found matching provided IDs" },
        { status: 404 }
      );
    }

    // Build structured comparison attribute matrix
    const attributes = [
      // 1. Core Profile & Status
      {
        key: "organization",
        label: "Recruiting Organization",
        category: "OVERVIEW",
        values: Object.fromEntries(
          recruitments.map((r) => [r.id, `${r.organization.name} (${r.organization.shortName})`])
        ),
      },
      {
        key: "status",
        label: "Recruitment Status",
        category: "OVERVIEW",
        values: Object.fromEntries(recruitments.map((r) => [r.id, r.status])),
      },
      {
        key: "vacancies",
        label: "Total Vacancies",
        category: "OVERVIEW",
        values: Object.fromEntries(
          recruitments.map((r) => [
            r.id,
            r.vacancies ? `${r.vacancies.toLocaleString("en-IN")} Posts` : "Not Announced",
          ])
        ),
      },

      // 2. Qualifications & Eligibility
      {
        key: "qualification",
        label: "Minimum Educational Qualification",
        category: "ELIGIBILITY",
        values: Object.fromEntries(
          recruitments.map((r) => [
            r.id,
            r.qualifications.length > 0
              ? r.qualifications.map((q) => q.qualificationCode).join(", ")
              : "Degree / Graduation",
          ])
        ),
      },
      {
        key: "ageRequirement",
        label: "Age Requirement (General / Unreserved)",
        category: "ELIGIBILITY",
        values: Object.fromEntries(
          recruitments.map((r) => [
            r.id,
            `${r.minAge ? `${r.minAge} yrs` : "18 yrs"} – ${r.maxAge ? `${r.maxAge} yrs` : "No Upper Limit"}`,
          ])
        ),
      },
      {
        key: "ageRelaxation",
        label: "Age Relaxations (OBC / SC / ST / PwD)",
        category: "ELIGIBILITY",
        values: Object.fromEntries(
          recruitments.map((r) => [
            r.id,
            r.ageRelaxationDetails || "+3 yrs OBC, +5 yrs SC/ST, +10 yrs PwD",
          ])
        ),
      },
      {
        key: "experience",
        label: "Experience Requirement",
        category: "ELIGIBILITY",
        values: Object.fromEntries(
          recruitments.map((r) => [
            r.id,
            r.fresherEligible
              ? "✓ Freshers Eligible (0 Years Experience)"
              : r.experienceReq || "Prior Experience Required",
          ])
        ),
      },

      // 3. Compensation & Pay Scale
      {
        key: "inHandSalary",
        label: "Approx. Monthly In-Hand Salary",
        category: "COMPENSATION",
        values: Object.fromEntries(
          recruitments.map((r) => [
            r.id,
            r.inHandSalaryMin && r.inHandSalaryMax
              ? `₹${r.inHandSalaryMin.toLocaleString("en-IN")} – ₹${r.inHandSalaryMax.toLocaleString("en-IN")}`
              : "As per Govt Pay Rules",
          ])
        ),
      },
      {
        key: "payScale",
        label: "Pay Band / Level",
        category: "COMPENSATION",
        values: Object.fromEntries(
          recruitments.map((r) => [r.id, r.payScale || "Central / State Pay Scale"])
        ),
      },
      {
        key: "applicationFee",
        label: "Application Fee (General vs Exempted)",
        category: "COMPENSATION",
        values: Object.fromEntries(
          recruitments.map((r) => [
            r.id,
            `Gen/OBC: ₹${r.appFeeGeneral ?? 100} | Reserved/Women: ₹${r.appFeeReserved ?? 0}`,
          ])
        ),
      },

      // 4. Deadlines & Schedule
      {
        key: "appDeadline",
        label: "Application Deadline",
        category: "DATES",
        values: Object.fromEntries(
          recruitments.map((r) => [
            r.id,
            r.appDeadline
              ? new Date(r.appDeadline).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
              : "Closing Soon",
          ])
        ),
      },
      {
        key: "examDate",
        label: "Tentative Exam Date / Schedule",
        category: "DATES",
        values: Object.fromEntries(
          recruitments.map((r) => {
            const firstSchedule = r.stages?.[0]?.schedules?.[0];
            return [
              r.id,
              firstSchedule
                ? new Date(firstSchedule.examDate).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                : "To Be Announced",
            ];
          })
        ),
      },
      {
        key: "location",
        label: "Posting / Domicile Location",
        category: "DATES",
        values: Object.fromEntries(
          recruitments.map((r) => [r.id, r.stateLocation || "All India"])
        ),
      },

      // 5. Selection Process
      {
        key: "selectionStages",
        label: "Selection Process Stages",
        category: "PROCESS",
        values: Object.fromEntries(
          recruitments.map((r) => [
            r.id,
            r.stages.length > 0
              ? r.stages.map((s) => s.stageName).join(" → ")
              : r.selectionProcessSummary || "Written Test → Document Verification",
          ])
        ),
      },
      {
        key: "officialNoticeUrl",
        label: "Official Notification Notice",
        category: "PROCESS",
        values: Object.fromEntries(
          recruitments.map((r) => [r.id, r.officialNotificationUrl])
        ),
      },
      {
        key: "officialApplyUrl",
        label: "Official Application Portal Link",
        category: "PROCESS",
        values: Object.fromEntries(recruitments.map((r) => [r.id, r.officialApplyUrl])),
      },
    ];

    return NextResponse.json({
      success: true,
      recruitments,
      attributes,
      disclaimer:
        "Comparative Workspace Note: Side-by-side analysis presents factual recruitment attributes to help candidates understand differences. BharatExam Tracker does not produce overall winners or ranking scores.",
    });
  } catch (error: any) {
    console.error("Error generating comparison:", error);
    return NextResponse.json(
      { error: "Failed to compare recruitments", details: error?.message },
      { status: 500 }
    );
  }
}
