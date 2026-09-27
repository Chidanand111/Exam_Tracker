import { prisma } from "./db";
import { UserStageOutcome } from "@/types";

export interface StageProgressionResult {
  success: boolean;
  message: string;
  nextStageUnlocked: boolean;
  nextStageName?: string;
  isFinalSelected?: boolean;
  isUnsuccessful?: boolean;
}

/**
 * Initialize tracking for a recruitment when user clicks "I've Applied"
 * Dynamically binds Stage 1 (lowest stageOrder) as active.
 */
export async function initializeUserApplication(params: {
  userId: string;
  recruitmentId: string;
  registrationNumber?: string;
  rollNumber?: string;
  notes?: string;
}) {
  const { userId, recruitmentId, registrationNumber, rollNumber, notes } = params;

  // Verify recruitment and its dynamic stages ordered by stageOrder ASC
  const recruitment = await prisma.recruitment.findUnique({
    where: { id: recruitmentId },
    include: {
      stages: {
        orderBy: { stageOrder: "asc" },
      },
      organization: true,
    },
  });

  if (!recruitment || recruitment.stages.length === 0) {
    throw new Error("Recruitment or stages not found");
  }

  const firstStage = recruitment.stages[0];

  // Determine initial status based on official stage status
  let initialStageStatus = "PENDING";
  if (firstStage.admitCardStatus === "RELEASED") {
    initialStageStatus = "ADMIT_CARD_AVAILABLE";
  }

  // Create UserApplication record
  const application = await prisma.userApplication.upsert({
    where: {
      userId_recruitmentId: {
        userId,
        recruitmentId,
      },
    },
    update: {
      registrationNumber: registrationNumber || undefined,
      rollNumber: rollNumber || undefined,
      notes: notes || undefined,
      overallStatus: "APPLIED",
    },
    create: {
      userId,
      recruitmentId,
      registrationNumber,
      rollNumber,
      notes,
      currentStageOrder: firstStage.stageOrder,
      overallStatus: "APPLIED",
    },
  });

  // Create progress record for Stage 1
  const stageProgress = await prisma.userStageProgress.upsert({
    where: {
      applicationId_stageId: {
        applicationId: application.id,
        stageId: firstStage.id,
      },
    },
    update: {
      status: initialStageStatus,
    },
    create: {
      applicationId: application.id,
      stageId: firstStage.id,
      status: initialStageStatus,
    },
  });

  // Create initial notification
  await prisma.notification.create({
    data: {
      userId,
      applicationId: application.id,
      title: `Application Tracked: ${recruitment.title}`,
      message: `You are now tracking ${recruitment.title}. Current active stage: ${firstStage.stageName}.`,
      type: "SUCCESS",
      linkUrl: `/my-exams`,
    },
  });

  // If application deadline exists, create a default deadline reminder
  if (recruitment.appDeadline && new Date(recruitment.appDeadline) > new Date()) {
    const deadlineDate = new Date(recruitment.appDeadline);
    const reminderDate = new Date(deadlineDate.getTime() - 24 * 60 * 60 * 1000); // 1 day before
    if (reminderDate > new Date()) {
      await prisma.reminder.create({
        data: {
          userId,
          applicationId: application.id,
          stageId: firstStage.id,
          reminderType: "APP_DEADLINE",
          title: `Application Deadline approaching for ${recruitment.title}`,
          scheduledFor: reminderDate,
          presetOption: "1_DAY_BEFORE",
        },
      });
    }
  }

  return { application, stageProgress, firstStage };
}

/**
 * Handle user result outcome for any stage.
 * Generic stageOrder progression: stageOrder -> stageOrder + 1
 * Strictly unlocks next stage ONLY if user chooses "SELECTED_FOR_NEXT".
 */
export async function advanceStageOutcome(params: {
  userId: string;
  applicationId: string;
  stageId: string;
  outcome: UserStageOutcome;
  userNotes?: string;
}): Promise<StageProgressionResult> {
  const { userId, applicationId, stageId, outcome, userNotes } = params;

  const application = await prisma.userApplication.findFirst({
    where: { id: applicationId, userId },
    include: {
      recruitment: {
        include: {
          stages: {
            orderBy: { stageOrder: "asc" },
          },
        },
      },
    },
  });

  if (!application) {
    throw new Error("Application not found or unauthorized");
  }

  const currentStage = application.recruitment.stages.find((s) => s.id === stageId);
  if (!currentStage) {
    throw new Error("Specified stage not found in recruitment");
  }

  // 1. If Outcome is "SELECTED_FOR_NEXT"
  if (outcome === "SELECTED_FOR_NEXT") {
    // Find stage with stageOrder + 1
    const nextStage = application.recruitment.stages.find(
      (s) => s.stageOrder === currentStage.stageOrder + 1
    );

    // Update current stage progress to completed & qualified
    await prisma.userStageProgress.upsert({
      where: {
        applicationId_stageId: {
          applicationId: application.id,
          stageId: currentStage.id,
        },
      },
      update: {
        status: "SELECTED_FOR_NEXT",
        outcome: "SELECTED_FOR_NEXT",
        userNotes: userNotes || undefined,
        completedAt: new Date(),
      },
      create: {
        applicationId: application.id,
        stageId: currentStage.id,
        status: "SELECTED_FOR_NEXT",
        outcome: "SELECTED_FOR_NEXT",
        userNotes,
        completedAt: new Date(),
      },
    });

    if (nextStage) {
      // Unlock and activate Next Stage
      let nextStageInitialStatus = "PENDING";
      if (nextStage.admitCardStatus === "RELEASED") {
        nextStageInitialStatus = "ADMIT_CARD_AVAILABLE";
      }

      await prisma.userStageProgress.upsert({
        where: {
          applicationId_stageId: {
            applicationId: application.id,
            stageId: nextStage.id,
          },
        },
        update: {
          status: nextStageInitialStatus,
        },
        create: {
          applicationId: application.id,
          stageId: nextStage.id,
          status: nextStageInitialStatus,
        },
      });

      // Update application currentStageOrder
      await prisma.userApplication.update({
        where: { id: application.id },
        data: {
          currentStageOrder: nextStage.stageOrder,
          overallStatus: "SELECTED_STAGE",
        },
      });

      // Dispatch celebration notification
      await prisma.notification.create({
        data: {
          userId,
          applicationId: application.id,
          title: `🎯 Selected for ${nextStage.stageName}!`,
          message: `Great job! You qualified ${currentStage.stageName}. ${nextStage.stageName} is now active in your tracker.`,
          type: "SUCCESS",
          linkUrl: `/my-exams`,
        },
      });

      return {
        success: true,
        message: `Congratulations! ${nextStage.stageName} has been unlocked and activated.`,
        nextStageUnlocked: true,
        nextStageName: nextStage.stageName,
      };
    } else {
      // No more stages! User cleared all rounds
      await prisma.userApplication.update({
        where: { id: application.id },
        data: {
          overallStatus: "FINAL_SELECTED",
        },
      });

      await prisma.notification.create({
        data: {
          userId,
          applicationId: application.id,
          title: `🏆 FINAL SELECTION: ${application.recruitment.title}!`,
          message: `Heartiest congratulations! You have cleared all recruitment stages successfully!`,
          type: "SUCCESS",
          linkUrl: `/my-exams`,
        },
      });

      return {
        success: true,
        message: "Heartiest congratulations! You have cleared the final stage!",
        nextStageUnlocked: false,
        isFinalSelected: true,
      };
    }
  }

  // 2. If Outcome is "NOT_SELECTED"
  if (outcome === "NOT_SELECTED") {
    await prisma.userStageProgress.upsert({
      where: {
        applicationId_stageId: {
          applicationId: application.id,
          stageId: currentStage.id,
        },
      },
      update: {
        status: "NOT_SELECTED",
        outcome: "NOT_SELECTED",
        userNotes: userNotes || undefined,
        completedAt: new Date(),
      },
      create: {
        applicationId: application.id,
        stageId: currentStage.id,
        status: "NOT_SELECTED",
        outcome: "NOT_SELECTED",
        userNotes,
        completedAt: new Date(),
      },
    });

    await prisma.userApplication.update({
      where: { id: application.id },
      data: {
        overallStatus: "NOT_SELECTED",
      },
    });

    await prisma.notification.create({
      data: {
        userId,
        applicationId: application.id,
        title: `Stage Outcome: ${currentStage.stageName}`,
        message: `Outcome marked as Not Selected for ${currentStage.stageName}. Keep preparing; more opportunities are waiting!`,
        type: "INFO",
        linkUrl: `/my-exams`,
      },
    });

    return {
      success: true,
      message: `Stage marked as Not Selected. Application closed without unlocking subsequent stages.`,
      nextStageUnlocked: false,
      isUnsuccessful: true,
    };
  }

  // 3. If User manually selected "FINAL_SELECTED"
  if (outcome === "FINAL_SELECTED") {
    await prisma.userStageProgress.upsert({
      where: {
        applicationId_stageId: {
          applicationId: application.id,
          stageId: currentStage.id,
        },
      },
      update: {
        status: "FINAL_SELECTED",
        outcome: "FINAL_SELECTED",
        userNotes: userNotes || undefined,
        completedAt: new Date(),
      },
      create: {
        applicationId: application.id,
        stageId: currentStage.id,
        status: "FINAL_SELECTED",
        outcome: "FINAL_SELECTED",
        userNotes,
        completedAt: new Date(),
      },
    });

    await prisma.userApplication.update({
      where: { id: application.id },
      data: {
        overallStatus: "FINAL_SELECTED",
      },
    });

    return {
      success: true,
      message: "Final selection confirmed!",
      nextStageUnlocked: false,
      isFinalSelected: true,
    };
  }

  return {
    success: false,
    message: "Invalid outcome selected",
    nextStageUnlocked: false,
  };
}
