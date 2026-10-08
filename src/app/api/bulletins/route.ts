import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim();
    const category = searchParams.get("category");
    const featured = searchParams.get("featured");

    const where: any = {};
    const andConditions: any[] = [];

    if (category && category !== "ALL") {
      where.category = category;
    }

    if (featured === "true") {
      where.isFeatured = true;
    }

    if (search && search.length > 0) {
      andConditions.push({
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { summary: { contains: search, mode: "insensitive" } },
          { content: { contains: search, mode: "insensitive" } },
          { tags: { contains: search, mode: "insensitive" } },
          { benefits: { contains: search, mode: "insensitive" } },
          { targetAudience: { contains: search, mode: "insensitive" } },
        ],
      });
    }

    if (andConditions.length > 0) {
      where.AND = andConditions;
    }

    const bulletins = await prisma.careerBulletin.findMany({
      where,
      orderBy: [
        { isFeatured: "desc" },
        { publishedAt: "desc" },
      ],
    });

    // Compute category counts
    const counts = await prisma.careerBulletin.groupBy({
      by: ["category"],
      _count: { id: true },
    });

    const categoryCounts: Record<string, number> = {
      ALL: bulletins.length,
    };
    counts.forEach((c) => {
      categoryCounts[c.category] = c._count.id;
    });

    return NextResponse.json({
      bulletins,
      total: bulletins.length,
      categoryCounts,
    });
  } catch (err: any) {
    console.error("Error fetching career bulletins:", err);
    return NextResponse.json(
      { error: "Failed to load bulletins", details: err?.message },
      { status: 500 }
    );
  }
}
