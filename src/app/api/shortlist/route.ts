import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { ShortlistService } from "@/server/services/shortlist.service";
import { withErrorHandler, UnauthorizedError, ValidationError } from "@/server/utils/api-handler";

export const dynamic = "force-dynamic";

export const GET = withErrorHandler(async (req: NextRequest) => {
  const user = await getCurrentUser();
  if (!user) {
    throw new UnauthorizedError();
  }

  const url = new URL(req.url);
  const stateFilter = url.searchParams.get("state");
  const result = await ShortlistService.getShortlistForUser(user.id, stateFilter);

  return NextResponse.json(result);
});

export const POST = withErrorHandler(async (req: NextRequest) => {
  const user = await getCurrentUser();
  if (!user) {
    throw new UnauthorizedError("Authentication required to shortlist");
  }

  const body = await req.json();
  const result = await ShortlistService.saveShortlistItem(user.id, body);

  return NextResponse.json(result);
});

export const DELETE = withErrorHandler(async (req: NextRequest) => {
  const user = await getCurrentUser();
  if (!user) {
    throw new UnauthorizedError();
  }

  const url = new URL(req.url);
  const recruitmentId = url.searchParams.get("recruitmentId");
  if (!recruitmentId) {
    throw new ValidationError("recruitmentId is required");
  }

  const result = await ShortlistService.removeShortlistItem(user.id, recruitmentId);
  return NextResponse.json(result);
});
