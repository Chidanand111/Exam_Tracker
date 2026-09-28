import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { executeDeepScan } from "@/lib/deep-scanner";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    // Allow admin or authenticated user to trigger deep scan
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin privilege required" }, { status: 403 });
    }

    const summary = await executeDeepScan();

    return NextResponse.json({
      success: true,
      message: `Deep scan completed: Processed ${summary.totalExamsScanned} verified exams across Central & State governments.`,
      summary,
    });
  } catch (error: any) {
    console.error("Deep scan error:", error);
    return NextResponse.json({ error: error?.message || "Failed to execute deep scan" }, { status: 500 });
  }
}
