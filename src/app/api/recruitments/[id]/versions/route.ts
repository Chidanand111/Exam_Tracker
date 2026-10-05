import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const versions = await prisma.recruitmentVersion.findMany({
      where: {
        OR: [
          { recruitmentId: params.id },
          { recruitment: { slug: params.id } },
        ],
      },
      orderBy: { versionNumber: "desc" },
    });

    return NextResponse.json({ versions });
  } catch (error: any) {
    console.error("Error fetching versions:", error);
    return NextResponse.json({ error: "Failed to fetch version records" }, { status: 500 });
  }
}
