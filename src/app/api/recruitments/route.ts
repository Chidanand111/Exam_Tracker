import { NextResponse } from "next/server";
import { RecruitmentService } from "@/server/services/recruitment.service";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const result = await RecruitmentService.getRecruitmentsFromParams(searchParams);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Recruitment fetch error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to load recruitments" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const { POST: adminCreateRecruitment } = await import("@/app/api/admin/recruitments/route");
  return adminCreateRecruitment(req);
}
