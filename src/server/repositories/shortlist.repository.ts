import { prisma } from "@/lib/db";
import { ShortlistLifecycleState } from "@/types";

export class ShortlistRepository {
  static async getUserShortlist(userId: string, stateFilter?: string | null) {
    const whereClause: any = { userId };
    if (stateFilter) {
      whereClause.lifecycleState = stateFilter.toUpperCase();
    }

    return prisma.recruitmentShortlist.findMany({
      where: whereClause,
      include: {
        recruitment: {
          include: {
            organization: true,
            qualifications: true,
            posts: true,
            stages: {
              include: { schedules: true },
              orderBy: { stageOrder: "asc" },
            },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });
  }

  static async getShortlistCounts(userId: string) {
    return prisma.recruitmentShortlist.groupBy({
      by: ["lifecycleState"],
      where: { userId },
      _count: { id: true },
    });
  }

  static async upsertShortlistItem(data: {
    userId: string;
    recruitmentId: string;
    lifecycleState: ShortlistLifecycleState;
    priority?: string;
    personalNotes?: string | null;
    targetPrepDays?: number | null;
  }) {
    return prisma.recruitmentShortlist.upsert({
      where: {
        userId_recruitmentId: {
          userId: data.userId,
          recruitmentId: data.recruitmentId,
        },
      },
      create: {
        userId: data.userId,
        recruitmentId: data.recruitmentId,
        lifecycleState: data.lifecycleState,
        priority: data.priority || "MEDIUM",
        personalNotes: data.personalNotes || null,
        targetPrepDays: data.targetPrepDays ?? null,
      },
      update: {
        lifecycleState: data.lifecycleState,
        priority: data.priority || undefined,
        personalNotes: data.personalNotes !== undefined ? data.personalNotes : undefined,
        targetPrepDays: data.targetPrepDays !== undefined ? data.targetPrepDays : undefined,
      },
      include: {
        recruitment: {
          include: { organization: true },
        },
      },
    });
  }

  static async deleteShortlistItem(userId: string, recruitmentId: string) {
    return prisma.recruitmentShortlist.deleteMany({
      where: {
        userId,
        recruitmentId,
      },
    });
  }
}
