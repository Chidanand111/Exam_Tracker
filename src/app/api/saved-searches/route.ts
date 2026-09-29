import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required to view saved searches" },
        { status: 401 }
      );
    }

    const savedSearches = await prisma.savedSearch.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
    });

    const parsedSearches = savedSearches.map((s) => ({
      ...s,
      filters: s.filtersJson ? JSON.parse(s.filtersJson) : {},
    }));

    return NextResponse.json({
      success: true,
      savedSearches: parsedSearches,
    });
  } catch (error: any) {
    console.error("Error fetching saved searches:", error);
    return NextResponse.json(
      { error: "Failed to fetch saved searches", details: error?.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required to save search" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      name,
      searchQuery,
      filters = {},
      sortPreference = "newest",
      notifyNewMatches = true,
    } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Name is required for saved search" },
        { status: 400 }
      );
    }

    // Count how many recruitments currently match this search configuration
    let whereConditions: any = { status: "ACTIVE" };
    if (searchQuery && searchQuery.trim()) {
      whereConditions.OR = [
        { title: { contains: searchQuery.trim(), mode: "insensitive" } },
        { shortDescription: { contains: searchQuery.trim(), mode: "insensitive" } },
      ];
    }
    if (filters.fresherOnly) {
      whereConditions.fresherEligible = true;
    }
    if (filters.salaryMin) {
      whereConditions.inHandSalaryMax = { gte: Number(filters.salaryMin) };
    }

    const matchedCount = await prisma.recruitment.count({
      where: whereConditions,
    });

    const created = await prisma.savedSearch.create({
      data: {
        userId: user.id,
        name: name.trim(),
        searchQuery: searchQuery?.trim() || null,
        filtersJson: JSON.stringify(filters),
        sortPreference: sortPreference || "newest",
        notifyNewMatches: Boolean(notifyNewMatches),
        lastMatchedCount: matchedCount,
        lastCheckedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      savedSearch: {
        ...created,
        filters: JSON.parse(created.filtersJson),
      },
      message: `Saved search '${created.name}' created with ${matchedCount} matching opportunities`,
    });
  } catch (error: any) {
    console.error("Error creating saved search:", error);
    return NextResponse.json(
      { error: "Failed to create saved search", details: error?.message },
      { status: 500 }
    );
  }
}

// Rename or update saved search
export async function PATCH(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = await req.json();
    const { id, name, notifyNewMatches, filters, sortPreference } = body;

    if (!id) {
      return NextResponse.json({ error: "Search ID is required" }, { status: 400 });
    }

    const existing = await prisma.savedSearch.findUnique({
      where: { id },
    });

    if (!existing || existing.userId !== user.id) {
      return NextResponse.json({ error: "Saved search not found or unauthorized" }, { status: 404 });
    }

    const updateData: any = {};
    if (name && name.trim()) updateData.name = name.trim();
    if (notifyNewMatches !== undefined) updateData.notifyNewMatches = Boolean(notifyNewMatches);
    if (filters) updateData.filtersJson = JSON.stringify(filters);
    if (sortPreference) updateData.sortPreference = sortPreference;

    const updated = await prisma.savedSearch.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      savedSearch: {
        ...updated,
        filters: JSON.parse(updated.filtersJson),
      },
      message: "Saved search updated successfully",
    });
  } catch (error: any) {
    console.error("Error updating saved search:", error);
    return NextResponse.json(
      { error: "Failed to update saved search", details: error?.message },
      { status: 500 }
    );
  }
}

// Delete saved search
export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Search ID is required" }, { status: 400 });
    }

    const existing = await prisma.savedSearch.findUnique({
      where: { id },
    });

    if (!existing || existing.userId !== user.id) {
      return NextResponse.json({ error: "Saved search not found or unauthorized" }, { status: 404 });
    }

    await prisma.savedSearch.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Saved search removed",
    });
  } catch (error: any) {
    console.error("Error deleting saved search:", error);
    return NextResponse.json(
      { error: "Failed to delete saved search", details: error?.message },
      { status: 500 }
    );
  }
}
