import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const recruitment = await prisma.recruitment.findUnique({
      where: { id: params.id },
      include: {
        organization: true,
        posts: true,
        qualifications: true,
        stages: {
          orderBy: { stageOrder: "asc" },
          include: {
            schedules: true,
          },
        },
        changeHistory: {
          orderBy: { detectedAt: "desc" },
        },
      },
    });

    if (!recruitment) {
      return NextResponse.json({ error: "Recruitment not found" }, { status: 404 });
    }

    return NextResponse.json({ recruitment });
  } catch (error) {
    console.error("Recruitment detail error:", error);
    return NextResponse.json({ error: "Failed to fetch recruitment details" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const { DELETE: adminDelete } = await import("@/app/api/admin/recruitments/[id]/route");
  return adminDelete(req, { params });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const { PATCH: adminPatch } = await import("@/app/api/admin/recruitments/[id]/route");
  return adminPatch(req, { params });
}

