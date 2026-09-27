import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.toLowerCase().trim();
    const qualification = searchParams.get("qualification");
    const fresherOnly = searchParams.get("fresher") === "true";
    const experienceRequired = searchParams.get("experience") === "true";
    const ageMax = searchParams.get("ageMax") ? parseInt(searchParams.get("ageMax")!) : null;
    const salaryMin = searchParams.get("salaryMin") ? parseInt(searchParams.get("salaryMin")!) : null;
    const category = searchParams.get("category");
    const status = searchParams.get("status");
    const sortBy = searchParams.get("sort") || "newest";

    // Build Prisma query filter
    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { shortDescription: { contains: search } },
        { organization: { name: { contains: search } } },
        { organization: { shortName: { contains: search } } },
        { posts: { some: { postName: { contains: search } } } },
      ];
    }

    if (fresherOnly) {
      where.fresherEligible = true;
    }

    if (experienceRequired) {
      where.fresherEligible = false;
    }

    if (ageMax !== null) {
      where.minAge = { lte: ageMax };
    }

    if (salaryMin !== null) {
      where.OR = [
        { inHandSalaryMin: { gte: salaryMin } },
        { inHandSalaryMax: { gte: salaryMin } },
      ];
    }

    if (category && category !== "ALL") {
      where.organization = {
        category: category,
      };
    }

    if (status && status !== "ALL") {
      where.status = status;
    }

    if (qualification && qualification !== "ALL") {
      where.qualifications = {
        some: {
          qualificationCode: { in: [qualification, "ANY_GRADUATE"] },
        },
      };
    }

    // Determine ordering
    let orderBy: any = { createdAt: "desc" };
    if (sortBy === "closing_soon") {
      orderBy = { appDeadline: "asc" };
    } else if (sortBy === "vacancies") {
      orderBy = { vacancies: "desc" };
    } else if (sortBy === "salary") {
      orderBy = { inHandSalaryMin: "desc" };
    }

    const recruitments = await prisma.recruitment.findMany({
      where,
      orderBy,
      include: {
        organization: true,
        posts: true,
        qualifications: true,
        stages: {
          orderBy: { stageOrder: "asc" },
          include: {
            schedules: true,
          },
        },
        changeHistory: {
          orderBy: { detectedAt: "desc" },
          take: 3,
        },
      },
    });

    return NextResponse.json({ recruitments });
  } catch (error) {
    console.error("Recruitment fetch error:", error);
    return NextResponse.json({ error: "Failed to load recruitments" }, { status: 500 });
  }
}
