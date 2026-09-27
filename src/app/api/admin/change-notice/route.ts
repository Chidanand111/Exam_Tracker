import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { recordOfficialChange } from "@/lib/source-monitor";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin privilege required" }, { status: 403 });
    }

    const { recruitmentId, field, oldValue, newValue, changeReason, updateRecruitment } = await req.json();

    if (!recruitmentId || !field || !oldValue || !newValue) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Update recruitment table if requested
    if (updateRecruitment) {
      const dataUpdate: any = {};
      if (field === "appDeadline") dataUpdate.appDeadline = new Date(newValue);
      if (field === "vacancies") dataUpdate.vacancies = parseInt(newValue);
      if (field === "status") dataUpdate.status = newValue;

      if (Object.keys(dataUpdate).length > 0) {
        await prisma.recruitment.update({
          where: { id: recruitmentId },
          data: dataUpdate,
        });
      }
    }

    const change = await recordOfficialChange({
      recruitmentId,
      field,
      oldValue,
      newValue,
      changeReason: changeReason || "Official Corrigendum Notice",
    });

    return NextResponse.json({ success: true, change });
  } catch (error: any) {
    console.error("Change notice error:", error);
    return NextResponse.json({ error: error?.message || "Failed to record change" }, { status: 500 });
  }
}
