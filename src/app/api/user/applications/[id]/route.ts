import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

// DELETE /api/user/applications/[id]
// Deletes a specific application and associated reminders/progress
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const applicationId = params.id;
    if (!applicationId) {
      return NextResponse.json(
        { error: "Application ID is required" },
        { status: 400 }
      );
    }

    const application = await prisma.userApplication.findUnique({
      where: { id: applicationId },
    });

    if (!application || application.userId !== user.id) {
      return NextResponse.json(
        { error: "Application not found or unauthorized" },
        { status: 404 }
      );
    }

    // Delete application (cascades stage progress, shifts, reminders)
    await prisma.userApplication.delete({
      where: { id: applicationId },
    });

    return NextResponse.json({
      success: true,
      message: "Application removed from tracking successfully",
    });
  } catch (error: any) {
    console.error("Application Delete Error:", error);
    return NextResponse.json(
      { error: "Failed to delete application" },
      { status: 500 }
    );
  }
}
