import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug;
    const bulletin = await prisma.careerBulletin.findUnique({
      where: { slug },
    });

    if (!bulletin) {
      return NextResponse.json(
        { error: "Bulletin not found" },
        { status: 404 }
      );
    }

    // Get related bulletins
    const related = await prisma.careerBulletin.findMany({
      where: {
        id: { not: bulletin.id },
        OR: [
          { category: bulletin.category },
          { isFeatured: true },
        ],
      },
      take: 3,
      orderBy: { publishedAt: "desc" },
    });

    return NextResponse.json({
      bulletin,
      related,
    });
  } catch (err: any) {
    console.error("Error fetching bulletin by slug:", err);
    return NextResponse.json(
      { error: "Failed to load bulletin", details: err?.message },
      { status: 500 }
    );
  }
}
