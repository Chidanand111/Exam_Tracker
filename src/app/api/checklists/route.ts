import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const recruitmentId = url.searchParams.get("recruitmentId");

    if (!recruitmentId) {
      // Global checklist template items
      const templates = await prisma.recruitmentChecklistItem.findMany({
        where: { recruitmentId: null },
        orderBy: { itemOrder: "asc" },
      });
      return NextResponse.json({ success: true, templates });
    }

    // 1. Fetch recruitment checklist items (recruitment specific OR universal templates)
    const officialItems = await prisma.recruitmentChecklistItem.findMany({
      where: {
        OR: [{ recruitmentId }, { recruitmentId: null }],
      },
      orderBy: { itemOrder: "asc" },
    });

    // De-duplicate if recruitment has its own version of a title
    const seenTitles = new Set<string>();
    const deduplicatedOfficial = officialItems.filter((item) => {
      const key = item.title.toLowerCase().trim();
      if (seenTitles.has(key)) return false;
      seenTitles.add(key);
      return true;
    });

    // 2. Fetch user's completion progress and custom personal items
    const user = await getCurrentUser();
    let userProgressMap: Record<string, { isCompleted: boolean; completedAt?: string | null; notes?: string | null; id: string }> = {};
    let personalItems: any[] = [];

    if (user) {
      const userRecords = await prisma.userChecklistItem.findMany({
        where: {
          userId: user.id,
          recruitmentId,
        },
      });

      for (const record of userRecords) {
        if (record.isCustom) {
          personalItems.push({
            id: record.id,
            title: record.title,
            stageCategory: record.stageCategory,
            isCompleted: record.isCompleted,
            completedAt: record.completedAt?.toISOString() || null,
            notes: record.notes,
            isCustom: true,
          });
        } else if (record.templateItemId) {
          userProgressMap[record.templateItemId] = {
            id: record.id,
            isCompleted: record.isCompleted,
            completedAt: record.completedAt?.toISOString() || null,
            notes: record.notes,
          };
        } else {
          // Fallback matching by title
          userProgressMap[record.title.toLowerCase().trim()] = {
            id: record.id,
            isCompleted: record.isCompleted,
            completedAt: record.completedAt?.toISOString() || null,
            notes: record.notes,
          };
        }
      }
    }

    // Combine into unified checklist list
    const combinedItems = deduplicatedOfficial.map((item) => {
      const progress = userProgressMap[item.id] || userProgressMap[item.title.toLowerCase().trim()];
      return {
        id: item.id,
        userChecklistId: progress?.id || null,
        title: item.title,
        description: item.description,
        stageCategory: item.stageCategory,
        itemOrder: item.itemOrder,
        isRequired: item.isRequired,
        isDefault: item.isDefault,
        isCustom: false,
        isCompleted: progress ? progress.isCompleted : false,
        completedAt: progress ? progress.completedAt : null,
        notes: progress?.notes || null,
      };
    });

    // Append personal items added by candidate
    for (const p of personalItems) {
      combinedItems.push({
        id: p.id,
        userChecklistId: p.id,
        title: p.title,
        description: "Personal candidate preparation item",
        stageCategory: p.stageCategory,
        itemOrder: 99,
        isRequired: false,
        isDefault: false,
        isCustom: true,
        isCompleted: p.isCompleted,
        completedAt: p.completedAt,
        notes: p.notes,
      });
    }

    const totalCount = combinedItems.length;
    const completedCount = combinedItems.filter((i) => i.isCompleted).length;

    return NextResponse.json({
      success: true,
      recruitmentId,
      items: combinedItems,
      summary: {
        total: totalCount,
        completed: completedCount,
        pending: totalCount - completedCount,
        percent: totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0,
      },
    });
  } catch (error: any) {
    console.error("Error fetching checklist items:", error);
    return NextResponse.json(
      { error: "Failed to fetch checklist items", details: error?.message },
      { status: 500 }
    );
  }
}

// User toggling an item or creating a personal checklist item
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required to update checklist" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      recruitmentId,
      templateItemId,
      title,
      stageCategory = "BEFORE_APPLYING",
      isCompleted,
      notes,
      isCustom = false,
    } = body;

    if (!recruitmentId) {
      return NextResponse.json(
        { error: "recruitmentId is required" },
        { status: 400 }
      );
    }

    // A. Adding a custom personal checklist item
    if (isCustom) {
      if (!title || !title.trim()) {
        return NextResponse.json(
          { error: "Title is required for custom checklist item" },
          { status: 400 }
        );
      }

      const personalItem = await prisma.userChecklistItem.create({
        data: {
          userId: user.id,
          recruitmentId,
          title: title.trim(),
          stageCategory,
          isCompleted: Boolean(isCompleted),
          completedAt: isCompleted ? new Date() : null,
          notes: notes || null,
          isCustom: true,
        },
      });

      return NextResponse.json({
        success: true,
        item: personalItem,
        message: "Personal preparation item added",
      });
    }

    // B. Toggling/updating an existing or template item
    if (templateItemId) {
      const existing = await prisma.userChecklistItem.findFirst({
        where: {
          userId: user.id,
          recruitmentId,
          templateItemId,
        },
      });

      if (existing) {
        const updated = await prisma.userChecklistItem.update({
          where: { id: existing.id },
          data: {
            isCompleted: Boolean(isCompleted),
            completedAt: isCompleted ? new Date() : null,
            notes: notes !== undefined ? notes : existing.notes,
          },
        });
        return NextResponse.json({ success: true, item: updated });
      } else {
        // Find template item to copy title
        const template = await prisma.recruitmentChecklistItem.findUnique({
          where: { id: templateItemId },
        });

        const created = await prisma.userChecklistItem.create({
          data: {
            userId: user.id,
            recruitmentId,
            templateItemId,
            title: template?.title || title || "Checklist Item",
            stageCategory: template?.stageCategory || stageCategory,
            isCompleted: Boolean(isCompleted),
            completedAt: isCompleted ? new Date() : null,
            notes: notes || null,
            isCustom: false,
          },
        });
        return NextResponse.json({ success: true, item: created });
      }
    }

    return NextResponse.json(
      { error: "Either templateItemId or isCustom: true with title is required" },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Error updating checklist item:", error);
    return NextResponse.json(
      { error: "Failed to update checklist item", details: error?.message },
      { status: 500 }
    );
  }
}

// Admin configuring or adding official checklist items
export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Admin access required to configure official checklist items" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      id,
      recruitmentId,
      title,
      description,
      stageCategory = "BEFORE_APPLYING",
      itemOrder = 0,
      isRequired = true,
    } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    if (id) {
      // Update existing
      const updated = await prisma.recruitmentChecklistItem.update({
        where: { id },
        data: {
          title: title.trim(),
          description: description || null,
          stageCategory,
          itemOrder: Number(itemOrder),
          isRequired: Boolean(isRequired),
        },
      });
      return NextResponse.json({ success: true, item: updated });
    }

    // Create new official item
    const created = await prisma.recruitmentChecklistItem.create({
      data: {
        recruitmentId: recruitmentId || null,
        title: title.trim(),
        description: description || null,
        stageCategory,
        itemOrder: Number(itemOrder),
        isRequired: Boolean(isRequired),
        isDefault: false,
      },
    });

    return NextResponse.json({ success: true, item: created });
  } catch (error: any) {
    console.error("Error configuring checklist item:", error);
    return NextResponse.json(
      { error: "Failed to configure checklist item", details: error?.message },
      { status: 500 }
    );
  }
}

// Delete user personal custom checklist item
export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Item ID required" }, { status: 400 });
    }

    // Verify ownership
    const item = await prisma.userChecklistItem.findUnique({
      where: { id },
    });

    if (!item || item.userId !== user.id) {
      return NextResponse.json({ error: "Item not found or unauthorized" }, { status: 404 });
    }

    await prisma.userChecklistItem.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Checklist item removed" });
  } catch (error: any) {
    console.error("Error deleting checklist item:", error);
    return NextResponse.json(
      { error: "Failed to delete checklist item", details: error?.message },
      { status: 500 }
    );
  }
}
