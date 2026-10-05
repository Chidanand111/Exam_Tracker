import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET /api/user/privacy
// Returns user's privacy settings with defaults favoring privacy
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    let settings = await prisma.userPrivacySettings.findUnique({
      where: { userId: user.id },
    });

    if (!settings) {
      // Initialize with privacy-first defaults
      settings = await prisma.userPrivacySettings.create({
        data: {
          userId: user.id,
          profileVisibility: "PRIVATE", // Strictly private by default
          storeDocumentsInVault: true,
          allowPersonalizedDiscovery: true,
          emailNotifications: false, // Privacy default: opt-in
          inAppNotifications: true,
          smsAlerts: false, // Privacy default: opt-in
          telegramAlerts: false, // Privacy default: opt-in
          analyticsParticipation: false, // Privacy default: opt-in
          communicationPreference: "IN_APP_ONLY",
        },
      });
    }

    return NextResponse.json({
      success: true,
      privacySettings: settings,
      privacyCommitment: {
        title: "BharatExam Privacy Principles",
        summary:
          "Your tracking data, document references, and notes are private to you. We do not sell your data, expose your profile publicly, or share details with recruitment commissions.",
        defaultPolicy: "Privacy by Default",
      },
    });
  } catch (error: any) {
    console.error("Privacy GET Error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve privacy settings" },
      { status: 500 }
    );
  }
}

// PATCH /api/user/privacy
// Updates granular privacy preferences
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
    const {
      profileVisibility,
      storeDocumentsInVault,
      allowPersonalizedDiscovery,
      emailNotifications,
      inAppNotifications,
      smsAlerts,
      telegramAlerts,
      analyticsParticipation,
      communicationPreference,
    } = body;

    const updated = await prisma.userPrivacySettings.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        profileVisibility: profileVisibility || "PRIVATE",
        storeDocumentsInVault:
          storeDocumentsInVault !== undefined ? Boolean(storeDocumentsInVault) : true,
        allowPersonalizedDiscovery:
          allowPersonalizedDiscovery !== undefined
            ? Boolean(allowPersonalizedDiscovery)
            : true,
        emailNotifications: Boolean(emailNotifications),
        inAppNotifications:
          inAppNotifications !== undefined ? Boolean(inAppNotifications) : true,
        smsAlerts: Boolean(smsAlerts),
        telegramAlerts: Boolean(telegramAlerts),
        analyticsParticipation: Boolean(analyticsParticipation),
        communicationPreference: communicationPreference || "IN_APP_ONLY",
      },
      update: {
        ...(profileVisibility && { profileVisibility }),
        ...(storeDocumentsInVault !== undefined && {
          storeDocumentsInVault: Boolean(storeDocumentsInVault),
        }),
        ...(allowPersonalizedDiscovery !== undefined && {
          allowPersonalizedDiscovery: Boolean(allowPersonalizedDiscovery),
        }),
        ...(emailNotifications !== undefined && {
          emailNotifications: Boolean(emailNotifications),
        }),
        ...(inAppNotifications !== undefined && {
          inAppNotifications: Boolean(inAppNotifications),
        }),
        ...(smsAlerts !== undefined && { smsAlerts: Boolean(smsAlerts) }),
        ...(telegramAlerts !== undefined && {
          telegramAlerts: Boolean(telegramAlerts),
        }),
        ...(analyticsParticipation !== undefined && {
          analyticsParticipation: Boolean(analyticsParticipation),
        }),
        ...(communicationPreference && { communicationPreference }),
      },
    });

    return NextResponse.json({
      success: true,
      privacySettings: updated,
      message: "Privacy preferences updated successfully",
    });
  } catch (error: any) {
    console.error("Privacy PATCH Error:", error);
    return NextResponse.json(
      { error: "Failed to update privacy settings" },
      { status: 500 }
    );
  }
}
