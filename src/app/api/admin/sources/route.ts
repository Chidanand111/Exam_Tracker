import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { runOfficialSourceAudit } from "@/lib/source-monitor";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin privilege required" }, { status: 403 });
    }

    const sources = await prisma.officialSource.findMany({
      orderBy: { createdAt: "asc" },
      include: {
        documents: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
    });

    const recentChanges = await prisma.changeHistory.findMany({
      orderBy: { detectedAt: "desc" },
      take: 10,
      include: {
        recruitment: true,
      },
    });

    return NextResponse.json({ sources, recentChanges });
  } catch (error) {
    console.error("Admin sources fetch error:", error);
    return NextResponse.json({ error: "Failed to load sources" }, { status: 500 });
  }
}

export async function POST() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin privilege required" }, { status: 403 });
    }

    const crawlResults = await runOfficialSourceAudit();

    return NextResponse.json({
      success: true,
      message: "Source monitoring audit completed successfully.",
      results: crawlResults,
    });
  } catch (error) {
    console.error("Source audit crawl error:", error);
    return NextResponse.json({ error: "Failed to run source audit" }, { status: 500 });
  }
}
