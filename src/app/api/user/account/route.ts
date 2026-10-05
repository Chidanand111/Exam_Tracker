import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser, AUTH_COOKIE_NAME } from "@/lib/auth";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

// GET /api/user/account
// Provides a breakdown of what data exists and would be purged upon deletion
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const [applicationsCount, vaultCount, notesCount, checklistsCount, shortlistsCount, profile] =
      await Promise.all([
        prisma.userApplication.count({ where: { userId: user.id } }),
        prisma.applicationVault.count({ where: { userId: user.id } }),
        prisma.recruitmentNote.count({ where: { userId: user.id } }),
        prisma.userChecklistItem.count({ where: { userId: user.id } }),
        prisma.recruitmentShortlist.count({ where: { userId: user.id } }),
        prisma.candidateProfile.findUnique({ where: { userId: user.id } }),
      ]);

    return NextResponse.json({
      success: true,
      accountSummary: {
        userId: user.id,
        email: user.email,
        name: user.name,
        trackedApplications: applicationsCount,
        vaultDocumentCredentials: vaultCount,
        privateNotes: notesCount,
        customChecklists: checklistsCount,
        shortlistedOpportunities: shortlistsCount,
        hasProfile: Boolean(profile),
      },
      deletionDisclosure: {
        scope: "Permanent Deletion",
        warning:
          "Account deletion is irreversible. The following data will be permanently erased immediately:",
        items: [
          "All tracked exam applications, progression history, and shift assignments",
          "All private application numbers, registration numbers, and vault records",
          "All personal preparation checklists and custom tasks",
          "All private recruitment notes, to-dos, and pinned reminders",
          "Candidate profile details, qualifications, and saved searches",
          "All custom notification and reminder configurations",
        ],
      },
    });
  } catch (error: any) {
    console.error("Account Summary Error:", error);
    return NextResponse.json(
      { error: "Failed to load account deletion summary" },
      { status: 500 }
    );
  }
}

// DELETE /api/user/account
// Permanently deletes the user's account and cascades all associated data
export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const reason = body?.reason || "User requested account deletion";

    // Count entities for audit record before purge
    const [appCount, vaultCount, notesCount] = await Promise.all([
      prisma.userApplication.count({ where: { userId: user.id } }),
      prisma.applicationVault.count({ where: { userId: user.id } }),
      prisma.recruitmentNote.count({ where: { userId: user.id } }),
    ]);

    // Record deletion request audit log
    await prisma.accountDeletionRequest.create({
      data: {
        userId: user.id,
        userEmail: user.email,
        reason,
        status: "COMPLETED",
        completedAt: new Date(),
        purgedEntities: {
          applications: appCount,
          vaultRecords: vaultCount,
          notes: notesCount,
        },
      },
    });

    // Delete user (cascade handles all related child rows via Prisma relation constraints)
    await prisma.user.delete({
      where: { id: user.id },
    });

    // Clear session cookie
    const response = NextResponse.json({
      success: true,
      message:
        "Your account and all associated personal data have been permanently deleted.",
      purgedData: {
        applications: appCount,
        vaultRecords: vaultCount,
        notes: notesCount,
      },
    });

    response.cookies.delete(AUTH_COOKIE_NAME);

    return response;
  } catch (error: any) {
    console.error("Account Deletion Error:", error);
    return NextResponse.json(
      { error: "Failed to delete account" },
      { status: 500 }
    );
  }
}
