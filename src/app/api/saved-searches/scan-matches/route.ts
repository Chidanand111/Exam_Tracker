import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const savedSearches = await prisma.savedSearch.findMany({
      where: {
        userId: user.id,
        notifyNewMatches: true,
      },
    });

    if (savedSearches.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No active saved searches configured for notifications",
        newNotificationsCount: 0,
      });
    }

    let notificationsCreated = 0;
    const matchSummaries = [];

    for (const search of savedSearches) {
      let filters: any = {};
      try {
        filters = search.filtersJson ? JSON.parse(search.filtersJson) : {};
      } catch {
        filters = {};
      }

      const whereClause: any = { status: "ACTIVE" };

      if (search.searchQuery && search.searchQuery.trim()) {
        whereClause.OR = [
          { title: { contains: search.searchQuery.trim(), mode: "insensitive" } },
          { shortDescription: { contains: search.searchQuery.trim(), mode: "insensitive" } },
        ];
      }

      if (filters.fresherOnly) {
        whereClause.fresherEligible = true;
      }
      if (filters.salaryMin) {
        whereClause.inHandSalaryMax = { gte: Number(filters.salaryMin) };
      }
      if (filters.qualification && filters.qualification !== "ALL") {
        whereClause.qualifications = {
          some: { qualificationCode: filters.qualification },
        };
      }

      // Check current matches
      const currentMatchedCount = await prisma.recruitment.count({
        where: whereClause,
      });

      // If new matches found since last recorded count
      if (currentMatchedCount > search.lastMatchedCount) {
        const diff = currentMatchedCount - search.lastMatchedCount;
        const msg = `${diff} new recruitment opportunit${diff === 1 ? "y" : "ies"} match your saved search: '${search.name}'.`;

        // Check if an unread notification with identical message already exists
        const existingNotif = await prisma.notification.findFirst({
          where: {
            userId: user.id,
            message: msg,
            isRead: false,
          },
        });

        if (!existingNotif) {
          await prisma.notification.create({
            data: {
              userId: user.id,
              title: `New Match Alert: ${search.name}`,
              message: msg,
              type: "ALERT",
              linkUrl: `/discover?search=${encodeURIComponent(search.searchQuery || "")}&fresher=${filters.fresherOnly ? "true" : "false"}`,
            },
          });
          notificationsCreated++;
        }

        matchSummaries.push({
          searchName: search.name,
          newMatches: diff,
          totalMatches: currentMatchedCount,
        });

        // Update lastMatchedCount
        await prisma.savedSearch.update({
          where: { id: search.id },
          data: {
            lastMatchedCount: currentMatchedCount,
            lastCheckedAt: new Date(),
          },
        });
      } else {
        // Just touch lastCheckedAt
        await prisma.savedSearch.update({
          where: { id: search.id },
          data: { lastCheckedAt: new Date() },
        });
      }
    }

    return NextResponse.json({
      success: true,
      newNotificationsCount: notificationsCreated,
      matchSummaries,
      message:
        notificationsCreated > 0
          ? `Discovered ${notificationsCreated} new matching opportunity alerts.`
          : "Saved searches are up to date. No new matches found since last check.",
    });
  } catch (error: any) {
    console.error("Error scanning saved search matches:", error);
    return NextResponse.json(
      { error: "Failed to scan new matches", details: error?.message },
      { status: 500 }
    );
  }
}
