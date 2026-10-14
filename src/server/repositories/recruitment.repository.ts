import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";

export interface RecruitmentFilterParams {
  search?: string;
  qualification?: string;
  fresherOnly?: boolean;
  experienceRequired?: boolean;
  ageMax?: number | null;
  salaryMin?: number | null;
  category?: string;
  stateLocation?: string;
  status?: string;
  sortBy?: "newest" | "closing_soon" | "vacancies" | "salary";
  includeArchived?: boolean;
  lifecycleStage?: string;
}

export class RecruitmentRepository {
  static async findFilteredRecruitments(params: RecruitmentFilterParams) {
    const {
      search,
      qualification,
      fresherOnly,
      experienceRequired,
      ageMax,
      salaryMin,
      category,
      stateLocation,
      status,
      sortBy = "newest",
      includeArchived = false,
      lifecycleStage,
    } = params;

    const andConditions: Prisma.RecruitmentWhereInput[] = [];
    const where: Prisma.RecruitmentWhereInput = {};

    // Archival Lifecycle Filter
    if (!includeArchived) {
      where.isArchived = false;
    }
    if (lifecycleStage && lifecycleStage !== "ALL") {
      where.lifecycleStage = lifecycleStage;
    }

    // Search Query (Case-insensitive)
    if (search && search.trim().length > 0) {
      const q = search.trim();
      andConditions.push({
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { shortDescription: { contains: q, mode: "insensitive" } },
          { fullDescription: { contains: q, mode: "insensitive" } },
          { organization: { name: { contains: q, mode: "insensitive" } } },
          { organization: { shortName: { contains: q, mode: "insensitive" } } },
          { posts: { some: { postName: { contains: q, mode: "insensitive" } } } },
          { posts: { some: { department: { contains: q, mode: "insensitive" } } } },
          { qualifications: { some: { qualificationCode: { contains: q, mode: "insensitive" } } } },
        ],
      });
    }

    // Fresher Eligibility
    if (fresherOnly) {
      where.fresherEligible = true;
    } else if (experienceRequired) {
      where.fresherEligible = false;
    }

    // Age Filter
    if (ageMax !== null && ageMax !== undefined && ageMax > 0 && ageMax < 45) {
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

    // Salary Minimum
    if (salaryMin !== null && salaryMin !== undefined && salaryMin > 0) {
      andConditions.push({
        OR: [
          { inHandSalaryMin: { gte: salaryMin } },
          { inHandSalaryMax: { gte: salaryMin } },
        ],
      });
    }

    // Sector / Category Filter
    if (category && category !== "ALL") {
      if (category === "DEFENCE") {
        where.organization = {
          OR: [{ category: "DEFENCE" }, { shortName: "ISRO" }, { shortName: "DRDO" }],
        };
      } else {
        where.organization = {
          category,
        };
      }
    }

    // Location Filter
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

    // Status Filter
    if (status && status !== "ALL") {
      where.status = status;
    }

    // Qualification Filter
    if (qualification && qualification !== "ALL") {
      where.qualifications = {
        some: {
          qualificationCode: { in: [qualification, "ANY_GRADUATE"] },
        },
      };
    }

    if (andConditions.length > 0) {
      where.AND = andConditions;
    }

    // Sort order
    let orderBy: Prisma.RecruitmentOrderByWithRelationInput = { createdAt: "desc" };
    if (sortBy === "closing_soon") {
      orderBy = { appDeadline: "asc" };
    } else if (sortBy === "vacancies") {
      orderBy = { vacancies: "desc" };
    } else if (sortBy === "salary") {
      orderBy = { inHandSalaryMin: "desc" };
    }

    return prisma.recruitment.findMany({
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
        family: {
          select: { id: true, name: true, slug: true, shortCode: true },
        },
        conflicts: {
          where: { status: { in: ["CONFLICT_DETECTED", "UNDER_REVIEW"] } },
          select: { id: true, fieldName: true, fieldLabel: true, status: true },
        },
      },
    });
  }

  static async findById(id: string) {
    return prisma.recruitment.findUnique({
      where: { id },
      include: {
        organization: true,
        posts: true,
        qualifications: true,
        stages: {
          orderBy: { stageOrder: "asc" },
          include: { schedules: true },
        },
      },
    });
  }
}
