import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

const APP_START_TIME = Date.now();

export async function GET() {
  const correlationId = crypto.randomUUID().substring(0, 8);
  const startPing = Date.now();

  try {
    // 1. Ping PostgreSQL via Prisma
    await prisma.$queryRaw`SELECT 1`;
    const dbLatencyMs = Date.now() - startPing;

    // 2. Fetch key health counters
    const [
      activeRecruitments,
      pendingReviews,
      recentConflicts,
      totalUsers,
    ] = await Promise.all([
      prisma.recruitment.count({ where: { isArchived: false } }),
      prisma.reviewQueueItem.count({ where: { status: "PENDING_REVIEW" } }),
      prisma.informationConflict.count({ where: { status: "CONFLICT_DETECTED" } }),
      prisma.user.count(),
    ]);

    const uptimeSeconds = Math.floor((Date.now() - APP_START_TIME) / 1000);

    const observabilityData = {
      status: "HEALTHY",
      environment: process.env.NODE_ENV || "production",
      timestamp: new Date().toISOString(),
      uptimeSeconds,
      database: {
        engine: "PostgreSQL (Neon Serverless)",
        status: "CONNECTED",
        latencyMs: dbLatencyMs,
      },
      metrics: {
        activeRecruitments,
        pendingReviews,
        activeConflicts: recentConflicts,
        registeredUsers: totalUsers,
      },
      system: {
        nodeVersion: process.version,
        memoryUsageMb: Math.round(process.memoryUsage().heapUsed / (1024 * 1024)),
      },
    };

    logger.info("Observability health check performed", {
      correlationId,
      dbLatencyMs,
      status: "HEALTHY",
    });

    return NextResponse.json(observabilityData);
  } catch (error: any) {
    logger.error("Observability health check failed", error, { correlationId });

    return NextResponse.json(
      {
        status: "DEGRADED",
        error: "Database connectivity degraded or failed",
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
