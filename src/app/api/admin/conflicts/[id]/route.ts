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

    const { status, resolutionNotes, resolvedValue } = await req.json();

    const updated = await prisma.informationConflict.update({
      where: { id: params.id },
      data: {
        status,
        resolutionNotes,
        resolvedValue,
        resolvedAt: new Date(),
        resolvedBy: user.email,
      },
      include: {
        recruitment: true,
      },
    });

    // If all conflicts for this recruitment are resolved, reset state to VERIFIED_OFFICIAL
    const activeRemaining = await prisma.informationConflict.count({
      where: {
        recruitmentId: updated.recruitmentId,
        status: { in: ["CONFLICT_DETECTED", "UNDER_REVIEW"] },
      },
    });

    if (activeRemaining === 0) {
      await prisma.recruitment.update({
        where: { id: updated.recruitmentId },
        data: {
          sourceReliabilityState: "VERIFIED_OFFICIAL",
          sourceReliabilityNote: `Conflict resolved by editorial review on ${new Date().toLocaleDateString("en-IN")}.`,
        },
      });
    }

    return NextResponse.json({ success: true, conflict: updated });
  } catch (error: any) {
    console.error("Error updating information conflict:", error);
    return NextResponse.json({ error: "Failed to resolve conflict" }, { status: 500 });
  }
}
