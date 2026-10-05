import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action");
    const entityType = searchParams.get("entityType");
    const adminEmail = searchParams.get("adminEmail");
    const search = searchParams.get("search");

    const where: any = {};
    if (action && action !== "ALL") where.action = action;
    if (entityType && entityType !== "ALL") where.entityType = entityType;
    if (adminEmail && adminEmail !== "ALL") where.adminEmail = adminEmail;
    if (search) {
      where.OR = [
        { reason: { contains: search, mode: "insensitive" } },
        { entityId: { contains: search, mode: "insensitive" } },
        { action: { contains: search, mode: "insensitive" } },
        { adminEmail: { contains: search, mode: "insensitive" } },
      ];
    }

    const logs = await prisma.adminAuditLog.findMany({
      where,
      orderBy: { timestamp: "desc" },
      take: 100,
    });

    return NextResponse.json({ logs });
  } catch (error: any) {
    console.error("Error fetching audit logs:", error);
    return NextResponse.json(
      { error: "Failed to fetch audit logs" },
      { status: 500 }
    );
  }
}
