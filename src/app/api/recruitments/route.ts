import { NextRequest, NextResponse } from "next/server";
import { RecruitmentService } from "@/server/services/recruitment.service";
import { withErrorHandler } from "@/server/utils/api-handler";

export const dynamic = "force-dynamic";

export const GET = withErrorHandler(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const result = await RecruitmentService.getRecruitmentsFromParams(searchParams);
  return NextResponse.json(result);
});

export async function POST(req: Request) {
  const { POST: adminCreateRecruitment } = await import("@/app/api/admin/recruitments/route");
  return adminCreateRecruitment(req);
}
