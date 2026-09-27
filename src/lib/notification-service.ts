import { prisma } from "./db";
import { NotificationType, ReminderType, ReminderPreset } from "@/types";

export interface CreateReminderInput {
  userId: string;
  applicationId?: string;
  stageId?: string;
  reminderType: ReminderType;
  title: string;
  scheduledFor: Date;
  presetOption?: ReminderPreset;
  channel?: "IN_APP" | "EMAIL" | "PUSH" | "TELEGRAM";
}

/**
 * Creates a scheduled reminder with preset or custom trigger time
 */
export async function createReminder(input: CreateReminderInput) {
  return prisma.reminder.create({
    data: {
      userId: input.userId,
      applicationId: input.applicationId,
      stageId: input.stageId,
      reminderType: input.reminderType,
      title: input.title,
      scheduledFor: input.scheduledFor,
      presetOption: input.presetOption || "CUSTOM",
      channel: input.channel || "IN_APP",
    },
  });
}

/**
 * Helper to calculate target reminder date based on preset
 */
export function calculatePresetDate(
  targetDate: Date,
  preset: ReminderPreset,
  customOffsetHours = 0
): Date {
  const d = new Date(targetDate);
  if (preset === "7_DAYS_BEFORE") {
    d.setDate(d.getDate() - 7);
  } else if (preset === "3_DAYS_BEFORE") {
    d.setDate(d.getDate() - 3);
  } else if (preset === "1_DAY_BEFORE") {
    d.setDate(d.getDate() - 1);
  } else if (customOffsetHours > 0) {
    d.setHours(d.getHours() - customOffsetHours);
  }
  return d;
}

/**
 * Dispatches an in-app notification to a user
 */
export async function dispatchNotification(params: {
  userId: string;
  applicationId?: string;
  title: string;
  message: string;
  type?: NotificationType;
  linkUrl?: string;
}) {
  return prisma.notification.create({
    data: {
      userId: params.userId,
      applicationId: params.applicationId,
      title: params.title,
      message: params.message,
      type: params.type || "INFO",
      linkUrl: params.linkUrl || "/my-exams",
    },
  });
}

/**
 * Background / Cron worker to evaluate due reminders and create notifications
 */
export async function processDueReminders() {
  const now = new Date();
  const dueReminders = await prisma.reminder.findMany({
    where: {
      scheduledFor: { lte: now },
      isTriggered: false,
    },
  });

  const processed = [];

  for (const reminder of dueReminders) {
    // 1. In-app notification
    await dispatchNotification({
      userId: reminder.userId,
      applicationId: reminder.applicationId || undefined,
      title: `🔔 Reminder: ${reminder.title}`,
      message: `Your reminder scheduled for ${reminder.scheduledFor.toLocaleDateString()} has triggered.`,
      type: "ALERT",
      linkUrl: reminder.applicationId ? `/my-exams` : undefined,
    });

    // 2. Mark reminder as triggered
    await prisma.reminder.update({
      where: { id: reminder.id },
      data: { isTriggered: true },
    });

    // 3. Extensible hooks for Telegram / Email / Push
    if (reminder.channel === "TELEGRAM" && process.env.TELEGRAM_BOT_TOKEN) {
      // Integration hook ready
    }

    processed.push(reminder.id);
  }

  return processed;
}
