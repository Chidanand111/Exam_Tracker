import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { parseOfficialNotificationText } from "@/lib/ai-extractor";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin privilege required" }, { status: 403 });
    }

    const { rawText, sourceUrl } = await req.json();

    if (!rawText || !sourceUrl) {
      return NextResponse.json({ error: "rawText and sourceUrl are required" }, { status: 400 });
    }

    const structured = parseOfficialNotificationText(rawText, sourceUrl);

    return NextResponse.json({
      success: true,
      extracted: structured,
    });
  } catch (error: any) {
    console.error("AI extraction error:", error);
    return NextResponse.json({ error: error?.message || "Failed to extract structured data" }, { status: 500 });
  }
}
