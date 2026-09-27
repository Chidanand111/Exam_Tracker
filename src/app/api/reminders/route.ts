import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createReminder } from "@/lib/notification-service";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const reminders = await prisma.reminder.findMany({
      where: { userId: user.id },
      orderBy: { scheduledFor: "asc" },
      include: {
        application: {
          include: {
            recruitment: true,
          },
        },
      },
    });

    return NextResponse.json({ reminders });
  } catch (error) {
    console.error("Fetch reminders error:", error);
    return NextResponse.json({ error: "Failed to load reminders" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { applicationId, stageId, reminderType, title, scheduledFor, presetOption, channel } = body;

    if (!title || !scheduledFor) {
      return NextResponse.json({ error: "Title and scheduledFor are required" }, { status: 400 });
    }

    const reminder = await createReminder({
      userId: user.id,
      applicationId,
      stageId,
      reminderType: reminderType || "CUSTOM",
      title,
      scheduledFor: new Date(scheduledFor),
      presetOption: presetOption || "CUSTOM",
      channel: channel || "IN_APP",
    });

    return NextResponse.json({ success: true, reminder });
  } catch (error: any) {
    console.error("Create reminder error:", error);
    return NextResponse.json({ error: error?.message || "Failed to create reminder" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Reminder ID required" }, { status: 400 });
    }

    await prisma.reminder.deleteMany({
      where: { id, userId: user.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete reminder" }, { status: 500 });
  }
}
