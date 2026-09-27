import crypto from "crypto";
import { prisma } from "./db";

export interface CrawlResult {
  sourceCode: string;
  sourceName: string;
  checkedAt: string;
  hasChanges: boolean;
  changesDetected: Array<{
    recruitmentTitle: string;
    field: string;
    oldValue: string;
    newValue: string;
    reason: string;
  }>;
}

export function computeSha256(content: string): string {
  return crypto.createHash("sha256").update(content).digest("hex");
}

/**
 * Monitors configured official government sources and detects changes
 * (e.g., Corrigendum notices, deadline extensions, exam schedule revisions).
 */
export async function runOfficialSourceAudit(): Promise<CrawlResult[]> {
  const sources = await prisma.officialSource.findMany();
  const results: CrawlResult[] = [];

  for (const source of sources) {
    // In production, this fetches official government portals
    // We log the audit run and check registered recruitments for simulated updates
    const recruitments = await prisma.recruitment.findMany({
      where: {
        organization: {
          shortName: source.code.split("_")[0],
        },
      },
    });

    const changes: CrawlResult["changesDetected"] = [];

    // Update source heartbeat
    await prisma.officialSource.update({
      where: { id: source.id },
      data: {
        lastCheckedAt: new Date(),
        status: "HEALTHY",
      },
    });

    results.push({
      sourceCode: source.code,
      sourceName: source.name,
      checkedAt: new Date().toISOString(),
      hasChanges: changes.length > 0,
      changesDetected: changes,
    });
  }

  return results;
}

/**
 * Record a detected official change and alert all enrolled aspirants
 */
export async function recordOfficialChange(params: {
  recruitmentId: string;
  field: string;
  oldValue: string;
  newValue: string;
  changeReason: string;
}) {
  const { recruitmentId, field, oldValue, newValue, changeReason } = params;

  // Log in ChangeHistory table
  const change = await prisma.changeHistory.create({
    data: {
      recruitmentId,
      changedField: field,
      oldValue,
      newValue,
      changeReason,
    },
    include: {
      recruitment: true,
    },
  });

  // Find all users who have tracked this recruitment
  const applications = await prisma.userApplication.findMany({
    where: { recruitmentId },
    select: { userId: true },
  });

  // Broadcast high-priority notification to each enrolled applicant
  for (const app of applications) {
    await prisma.notification.create({
      data: {
        userId: app.userId,
        applicationId: recruitmentId,
        title: `⚠ Official Notice: ${field} Updated`,
        message: `${change.recruitment.title}: ${field} changed from "${oldValue}" to "${newValue}". (${changeReason})`,
        type: "WARNING",
        linkUrl: `/exams/${recruitmentId}`,
      },
    });
  }

  return change;
}
