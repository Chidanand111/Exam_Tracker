import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET /api/notes?recruitmentId=...
// Fetches private candidate notes for a specific recruitment or all user notes
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required to access private notes" },
        { status: 401 }
      );
    }

    const url = new URL(req.url);
    const recruitmentId = url.searchParams.get("recruitmentId");

    const whereClause: any = { userId: user.id };
    if (recruitmentId) {
      whereClause.recruitmentId = recruitmentId;
    }

    const notes = await prisma.recruitmentNote.findMany({
      where: whereClause,
      include: {
        recruitment: {
          select: {
            id: true,
            title: true,
            organization: { select: { shortName: true } },
          },
        },
      },
      orderBy: [{ isPinned: "desc" }, { updatedAt: "desc" }],
    });

    return NextResponse.json({
      success: true,
      notes,
      totalCount: notes.length,
      privacyDisclosure:
        "Strictly Confidential: These private workspace notes are visible only to your logged-in account and will never be shared publicly or with recruitment boards.",
    });
  } catch (error: any) {
    console.error("Notes GET Error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve private notes" },
      { status: 500 }
    );
  }
}

// POST /api/notes
// Creates a new private note
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { recruitmentId, title, content, isPinned, checklist } = body;

    if (!recruitmentId || !content?.trim()) {
      return NextResponse.json(
        { error: "Recruitment ID and note content are required" },
        { status: 400 }
      );
    }

    const note = await prisma.recruitmentNote.create({
      data: {
        userId: user.id,
        recruitmentId,
        title: title?.trim() || null,
        content: content.trim(),
        isPinned: Boolean(isPinned),
        checklist: Array.isArray(checklist) ? checklist : undefined,
      },
    });

    return NextResponse.json({
      success: true,
      note,
      message: "Private note saved securely",
    });
  } catch (error: any) {
    console.error("Notes POST Error:", error);
    return NextResponse.json(
      { error: "Failed to save note" },
      { status: 500 }
    );
  }
}

// PATCH /api/notes
// Updates existing note (content, title, isPinned, checklist)
export async function PATCH(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { id, title, content, isPinned, checklist } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Note ID is required" },
        { status: 400 }
      );
    }

    // Verify ownership
    const existing = await prisma.recruitmentNote.findUnique({
      where: { id },
    });

    if (!existing || existing.userId !== user.id) {
      return NextResponse.json(
        { error: "Note not found or unauthorized" },
        { status: 404 }
      );
    }

    const updateData: any = {};
    if (title !== undefined) updateData.title = title ? title.trim() : null;
    if (content !== undefined) updateData.content = content.trim();
    if (isPinned !== undefined) updateData.isPinned = Boolean(isPinned);
    if (checklist !== undefined)
      updateData.checklist = Array.isArray(checklist) ? checklist : undefined;

    const updatedNote = await prisma.recruitmentNote.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      note: updatedNote,
      message: "Note updated successfully",
    });
  } catch (error: any) {
    console.error("Notes PATCH Error:", error);
    return NextResponse.json(
      { error: "Failed to update note" },
      { status: 500 }
    );
  }
}

// DELETE /api/notes?id=...
// Deletes a private note
export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Note ID is required" },
        { status: 400 }
      );
    }

    // Verify ownership
    const existing = await prisma.recruitmentNote.findUnique({
      where: { id },
    });

    if (!existing || existing.userId !== user.id) {
      return NextResponse.json(
        { error: "Note not found or unauthorized" },
        { status: 404 }
      );
    }

    await prisma.recruitmentNote.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Note deleted securely",
    });
  } catch (error: any) {
    console.error("Notes DELETE Error:", error);
    return NextResponse.json(
      { error: "Failed to delete note" },
      { status: 500 }
    );
  }
}
