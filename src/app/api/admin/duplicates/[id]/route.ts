import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { status, reviewNotes } = await req.json();

    const updated = await prisma.duplicateAlert.update({
      where: { id: params.id },
      data: {
        status,
        reviewNotes,
        reviewedAt: new Date(),
        reviewedBy: user.email,
      },
    });

    return NextResponse.json({ success: true, alert: updated });
  } catch (error: any) {
    console.error("Error updating duplicate alert:", error);
    return NextResponse.json({ error: "Failed to update alert" }, { status: 500 });
  }
}
