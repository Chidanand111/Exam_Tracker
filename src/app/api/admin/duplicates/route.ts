import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { runDuplicateScan } from "@/lib/duplicate-detector";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const alerts = await prisma.duplicateAlert.findMany({
      orderBy: [{ status: "asc" }, { similarityScore: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ alerts });
  } catch (error: any) {
    console.error("Error fetching duplicate alerts:", error);
    return NextResponse.json({ error: "Failed to fetch duplicate alerts" }, { status: 500 });
  }
}

export async function POST() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const scanResult = await runDuplicateScan();
    return NextResponse.json({ success: true, scanResult });
  } catch (error: any) {
    console.error("Error running duplicate scan:", error);
    return NextResponse.json({ error: "Failed to run duplicate scan" }, { status: 500 });
  }
}
