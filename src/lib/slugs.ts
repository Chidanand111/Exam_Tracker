import { prisma } from "@/lib/db";

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/--+/g, "-")
    .trim();
}

export async function resolveRecruitment(identifier: string) {
  if (!identifier) return null;

  try {
    // Try finding by exact slug first
    let recruitment = await prisma.recruitment.findUnique({
      where: { slug: identifier },
      include: {
        organization: true,
        posts: true,
        qualifications: true,
        stages: {
          orderBy: { stageOrder: "asc" },
          include: { schedules: { orderBy: { examDate: "asc" } } },
        },
        family: {
          include: {
            cycles: {
              select: {
                id: true,
                title: true,
                slug: true,
                cycleYear: true,
                cycleName: true,
                lifecycleStage: true,
                isArchived: true,
                vacancies: true,
                appDeadline: true,
              },
              orderBy: { cycleYear: "desc" },
            },
          },
        },
        versions: {
          orderBy: { versionNumber: "desc" },
        },
        conflicts: {
          where: { status: { in: ["CONFLICT_DETECTED", "UNDER_REVIEW"] } },
          orderBy: { createdAt: "desc" },
        },
        changeHistory: {
          orderBy: { detectedAt: "desc" },
        },
        citations: {
          orderBy: { pageNumber: "asc" },
        },
        urlChecks: {
          orderBy: { lastCheckedAt: "desc" },
          take: 3,
        },
      },
    });

    // If not found by slug, fallback to searching by id
    if (!recruitment) {
      recruitment = await prisma.recruitment.findUnique({
        where: { id: identifier },
        include: {
          organization: true,
          posts: true,
          qualifications: true,
          stages: {
            orderBy: { stageOrder: "asc" },
            include: { schedules: { orderBy: { examDate: "asc" } } },
          },
          family: {
            include: {
              cycles: {
                select: {
                  id: true,
                  title: true,
                  slug: true,
                  cycleYear: true,
                  cycleName: true,
                  lifecycleStage: true,
                  isArchived: true,
                  vacancies: true,
                  appDeadline: true,
                },
                orderBy: { cycleYear: "desc" },
              },
            },
          },
          versions: {
            orderBy: { versionNumber: "desc" },
          },
          conflicts: {
            where: { status: { in: ["CONFLICT_DETECTED", "UNDER_REVIEW"] } },
            orderBy: { createdAt: "desc" },
          },
          changeHistory: {
            orderBy: { detectedAt: "desc" },
          },
          citations: {
            orderBy: { pageNumber: "asc" },
          },
          urlChecks: {
            orderBy: { lastCheckedAt: "desc" },
            take: 3,
          },
        },
      });
    }

    return recruitment;
  } catch (error) {
    console.error("Error resolving recruitment by identifier:", identifier, error);
    return null;
  }
}
