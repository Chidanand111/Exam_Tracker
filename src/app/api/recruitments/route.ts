import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim();
    const qualification = searchParams.get("qualification");
    const fresherOnly = searchParams.get("fresher") === "true";
    const experienceRequired = searchParams.get("experience") === "true";
    const ageMax = searchParams.get("ageMax") ? parseInt(searchParams.get("ageMax")!) : null;
    const salaryMin = searchParams.get("salaryMin") ? parseInt(searchParams.get("salaryMin")!) : null;
    const category = searchParams.get("category");
    const stateLocation = searchParams.get("stateLocation");
    const status = searchParams.get("status");
    const sortBy = searchParams.get("sort") || "newest";

    const andConditions: any[] = [];
    const where: any = {};

    // 1. Search Query: Case-insensitive across title, description, org name, and posts
    if (search && search.length > 0) {
      andConditions.push({
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { shortDescription: { contains: search, mode: "insensitive" } },
          { fullDescription: { contains: search, mode: "insensitive" } },
          { organization: { name: { contains: search, mode: "insensitive" } } },
          { organization: { shortName: { contains: search, mode: "insensitive" } } },
          { posts: { some: { postName: { contains: search, mode: "insensitive" } } } },
          { posts: { some: { department: { contains: search, mode: "insensitive" } } } },
          { qualifications: { some: { qualificationCode: { contains: search, mode: "insensitive" } } } },
        ],
      });
    }

    // 2. Fresher Eligibility
    if (fresherOnly) {
      where.fresherEligible = true;
    } else if (experienceRequired) {
      where.fresherEligible = false;
    }

    // 3. User Age Eligibility (user of age ageMax should be eligible within minAge and maxAge)
    if (ageMax !== null && ageMax > 0 && ageMax < 45) {
      andConditions.push({
        AND: [
          {
            OR: [{ minAge: { lte: ageMax } }, { minAge: null }],
          },
          {
            OR: [{ maxAge: { gte: ageMax } }, { maxAge: null }],
          },
        ],
      });
    }

    // 4. In-Hand Salary Minimum
    if (salaryMin !== null && salaryMin > 0) {
      andConditions.push({
        OR: [
          { inHandSalaryMin: { gte: salaryMin } },
          { inHandSalaryMax: { gte: salaryMin } },
        ],
      });
    }

    // 5. Category Filter
    if (category && category !== "ALL") {
      if (category === "DEFENCE") {
        where.organization = {
          OR: [{ category: "DEFENCE" }, { shortName: "ISRO" }, { shortName: "DRDO" }],
        };
      } else if (category === "STATE_PSC") {
        where.organization = {
          category: "STATE_PSC",
        };
      } else if (category === "REGULATORY") {
        where.organization = {
          category: "REGULATORY",
        };
      } else if (category === "PSU") {
        where.organization = {
          category: "PSU",
        };
      } else {
        where.organization = {
          category: category,
        };
      }
    }

    // 6. State / Location Filter
    if (stateLocation && stateLocation !== "ALL") {
      if (stateLocation === "All India") {
        andConditions.push({
          OR: [
            { stateLocation: "All India" },
            { stateLocation: { startsWith: "All India" } },
          ],
        });
      } else {
        andConditions.push({
          stateLocation: { contains: stateLocation, mode: "insensitive" },
        });
      }
    }

    // 6. Status Filter
    if (status && status !== "ALL") {
      where.status = status;
    }

    // 7. Qualification Filter
    if (qualification && qualification !== "ALL") {
      where.qualifications = {
        some: {
          qualificationCode: { in: [qualification, "ANY_GRADUATE"] },
        },
      };
    }

    // Combine AND conditions
    if (andConditions.length > 0) {
      where.AND = andConditions;
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
  } catch (error: any) {
    console.error("Recruitment fetch error:", error);
    return NextResponse.json({ error: error?.message || "Failed to load recruitments" }, { status: 500 });
  }
}
