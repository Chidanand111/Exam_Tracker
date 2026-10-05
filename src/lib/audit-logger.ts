import { prisma } from "@/lib/db";

export interface CreateAuditLogParams {
  adminEmail: string;
  action: string;
  entityType: string;
  entityId: string;
  entityTitle?: string | null;
  previousValue?: any;
  newValue?: any;
  justification?: string | null;
  reason?: string | null;
  ipAddress?: string | null;
}

/**
 * Creates an immutable audit log entry for administrative modifications.
 * Required for Feature 59 (Audit Logging).
 */
export async function logAdminAction(params: CreateAuditLogParams) {
  try {
    const log = await prisma.adminAuditLog.create({
      data: {
        adminEmail: params.adminEmail,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        entityTitle: params.entityTitle || null,
        previousValue: params.previousValue ? (typeof params.previousValue === "string" ? params.previousValue : JSON.stringify(params.previousValue)) : null,
        newValue: params.newValue ? (typeof params.newValue === "string" ? params.newValue : JSON.stringify(params.newValue)) : null,
        reason: params.reason || params.justification || "Administrative action",
        ipAddress: params.ipAddress || null,
      },
    });
    return log;
  } catch (error) {
    console.error("Failed to write immutable admin audit log:", error);
    return null;
  }
}
