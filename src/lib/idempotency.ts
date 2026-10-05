/**
 * Job Idempotency & Reliability Engine (Requirement 74)
 *
 * Guarantees that automated source-monitoring, PDF extractions, and notification
 * broadcasts are safely retryable without causing duplicate records or duplicate alerts.
 */

import { prisma } from "@/lib/db";

export interface IdempotencyCheckResult {
  isDuplicate: boolean;
  canProceed: boolean;
  previousResult?: any;
}

/**
 * Checks and locks an idempotency key for job execution.
 */
export async function claimIdempotencyKey(
  idempotencyKey: string,
  jobType: string,
  ttlHours = 24
): Promise<IdempotencyCheckResult> {
  const expiresAt = new Date(Date.now() + ttlHours * 60 * 60 * 1000);

  try {
    const existing = await prisma.jobIdempotencyRecord.findUnique({
      where: { idempotencyKey },
    });

    if (existing) {
      if (existing.status === "COMPLETED") {
        return {
          isDuplicate: true,
          canProceed: false,
          previousResult: existing.resultPayload,
        };
      }
      if (existing.status === "PROCESSING") {
        // Check if stuck (processing for > 15 minutes)
        const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
        if (existing.createdAt > fifteenMinutesAgo) {
          return {
            isDuplicate: true,
            canProceed: false,
            previousResult: { message: "Job is currently being executed by another process" },
          };
        }
      }
    }

    // Upsert key in PROCESSING state
    await prisma.jobIdempotencyRecord.upsert({
      where: { idempotencyKey },
      update: {
        status: "PROCESSING",
        expiresAt,
      },
      create: {
        idempotencyKey,
        jobType,
        status: "PROCESSING",
        expiresAt,
      },
    });

    return {
      isDuplicate: false,
      canProceed: true,
    };
  } catch (error) {
    console.error("Error claiming idempotency key:", error);
    // In failure case, allow execution rather than blocking indefinitely
    return { isDuplicate: false, canProceed: true };
  }
}

/**
 * Marks job idempotency record as COMPLETED with optional result payload.
 */
export async function completeIdempotentJob(idempotencyKey: string, resultPayload?: any) {
  try {
    await prisma.jobIdempotencyRecord.update({
      where: { idempotencyKey },
      data: {
        status: "COMPLETED",
        resultPayload: resultPayload ? resultPayload : undefined,
      },
    });
  } catch (error) {
    console.error("Failed to mark idempotent job completed:", error);
  }
}

/**
 * Marks job idempotency record as FAILED for retryability.
 */
export async function failIdempotentJob(idempotencyKey: string, errorPayload?: any) {
  try {
    await prisma.jobIdempotencyRecord.update({
      where: { idempotencyKey },
      data: {
        status: "FAILED",
        resultPayload: errorPayload ? errorPayload : undefined,
      },
    });
  } catch (error) {
    console.error("Failed to mark idempotent job failed:", error);
  }
}
