import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { ShortlistService } from "@/server/services/shortlist.service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const url = new URL(req.url);
    const stateFilter = url.searchParams.get("state");
    const result = await ShortlistService.getShortlistForUser(user.id, stateFilter);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error fetching shortlist:", error);
    return NextResponse.json(
      { error: "Failed to fetch shortlist", details: error?.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required to shortlist" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const result = await ShortlistService.saveShortlistItem(user.id, body);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error saving shortlist item:", error);
    const status = error?.message?.includes("required") || error?.message?.includes("Invalid") ? 400 : 500;
    return NextResponse.json(
      { error: error?.message || "Failed to save shortlist item" },
      { status }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const url = new URL(req.url);
    const recruitmentId = url.searchParams.get("recruitmentId");
    if (!recruitmentId) {
      return NextResponse.json({ error: "recruitmentId is required" }, { status: 400 });
    }

    const result = await ShortlistService.removeShortlistItem(user.id, recruitmentId);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error removing shortlist item:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to remove shortlist item" },
      { status: 500 }
    );
  }
}
