import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { logAdminAction } from "@/lib/audit-logger";

export const dynamic = "force-dynamic";

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAdmin();
    const { id } = params;

    const existing = await prisma.recruitment.findUnique({
      where: { id },
      select: { id: true, title: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Recruitment not found" }, { status: 404 });
    }

    await prisma.recruitment.delete({
      where: { id },
    });

    await logAdminAction({
      adminEmail: user.email,
      action: "DELETE_RECRUITMENT",
      entityType: "Recruitment",
      entityId: id,
      entityTitle: existing.title,
      reason: `Administrator permanently deleted recruitment '${existing.title}'.`,
    });

    return NextResponse.json({ success: true, message: `Exam '${existing.title}' deleted successfully.` });
  } catch (error: any) {
    if (error.status === 401 || error.status === 403) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Admin delete recruitment error:", error);
    return NextResponse.json({ error: "Failed to delete recruitment" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAdmin();
    const { id } = params;
    const body = await req.json();

    const existing = await prisma.recruitment.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Recruitment not found" }, { status: 404 });
    }

    const updated = await prisma.recruitment.update({
      where: { id },
      data: {
        ...body,
        updatedAt: new Date(),
        lastOfficialVerifiedAt: new Date(),
      },
    });

    await logAdminAction({
      adminEmail: user.email,
      action: "UPDATE_RECRUITMENT",
      entityType: "Recruitment",
      entityId: id,
      entityTitle: existing.title,
      previousValue: existing,
      newValue: updated,
      reason: `Administrator updated recruitment fields for '${existing.title}'.`,
    });

    return NextResponse.json({ success: true, recruitment: updated });
  } catch (error: any) {
    if (error.status === 401 || error.status === 403) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Admin patch recruitment error:", error);
    return NextResponse.json({ error: "Failed to update recruitment" }, { status: 500 });
  }
}
