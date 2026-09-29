import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required to access Application Vault" },
        { status: 401 }
      );
    }

    const url = new URL(req.url);
    const recruitmentId = url.searchParams.get("recruitmentId");

    if (recruitmentId) {
      const record = await prisma.applicationVault.findUnique({
        where: {
          userId_recruitmentId: {
            userId: user.id,
            recruitmentId,
          },
        },
        include: {
          recruitment: {
            include: { organization: true },
          },
        },
      });

      return NextResponse.json({
        success: true,
        vaultRecord: record || null,
        disclaimer:
          "Self-Reported Reference: All credentials and receipt records are maintained privately by the candidate. No official verification with the recruitment board is claimed or implied.",
      });
    }

    // List all vault records for the logged-in candidate
    const records = await prisma.applicationVault.findMany({
      where: { userId: user.id },
      include: {
        recruitment: {
          include: { organization: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      records,
      totalCount: records.length,
      disclaimer:
        "Self-Reported Reference: All credentials and receipt records are maintained privately by the candidate. No official verification with the recruitment board is claimed or implied.",
    });
  } catch (error: any) {
    console.error("Error fetching vault records:", error);
    return NextResponse.json(
      { error: "Failed to fetch vault records", details: error?.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required to save to Application Vault" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      recruitmentId,
      applicationNumber,
      registrationNumber,
      rollNumber,
      portalUserId,
      paymentReference,
      transactionId,
      submissionDate,
      applicationPdfUrl,
      paymentReceiptUrl,
      personalNotes,
    } = body;

    if (!recruitmentId) {
      return NextResponse.json(
        { error: "recruitmentId is required" },
        { status: 400 }
      );
    }

    // Ensure recruitment exists
    const rec = await prisma.recruitment.findUnique({
      where: { id: recruitmentId },
    });

    if (!rec) {
      return NextResponse.json(
        { error: "Recruitment not found" },
        { status: 404 }
      );
    }

    const parsedDate = submissionDate ? new Date(submissionDate) : null;

    const vaultRecord = await prisma.applicationVault.upsert({
      where: {
        userId_recruitmentId: {
          userId: user.id,
          recruitmentId,
        },
      },
      create: {
        userId: user.id,
        recruitmentId,
        applicationNumber: applicationNumber?.trim() || null,
        registrationNumber: registrationNumber?.trim() || null,
        rollNumber: rollNumber?.trim() || null,
        portalUserId: portalUserId?.trim() || null,
        paymentReference: paymentReference?.trim() || null,
        transactionId: transactionId?.trim() || null,
        submissionDate: parsedDate,
        applicationPdfUrl: applicationPdfUrl?.trim() || null,
        paymentReceiptUrl: paymentReceiptUrl?.trim() || null,
        personalNotes: personalNotes?.trim() || null,
        isGovernmentVerified: false,
        verificationDisclaimer:
          "Self-Reported Reference: These identifiers and receipts were manually recorded by the applicant and have NOT been verified by official government exam servers.",
      },
      update: {
        applicationNumber: applicationNumber?.trim() || null,
        registrationNumber: registrationNumber?.trim() || null,
        rollNumber: rollNumber?.trim() || null,
        portalUserId: portalUserId?.trim() || null,
        paymentReference: paymentReference?.trim() || null,
        transactionId: transactionId?.trim() || null,
        submissionDate: parsedDate,
        applicationPdfUrl: applicationPdfUrl?.trim() || null,
        paymentReceiptUrl: paymentReceiptUrl?.trim() || null,
        personalNotes: personalNotes?.trim() || null,
      },
      include: {
        recruitment: {
          include: { organization: true },
        },
      },
    });

    // Also sync registrationNumber and rollNumber into UserApplication if tracked
    const userApp = await prisma.userApplication.findUnique({
      where: {
        userId_recruitmentId: {
          userId: user.id,
          recruitmentId,
        },
      },
    });

    if (userApp) {
      await prisma.userApplication.update({
        where: { id: userApp.id },
        data: {
          registrationNumber: registrationNumber?.trim() || userApp.registrationNumber,
          rollNumber: rollNumber?.trim() || userApp.rollNumber,
        },
      });
    }

    return NextResponse.json({
      success: true,
      vaultRecord,
      message: "Application credentials & receipt reference recorded securely in Vault",
    });
  } catch (error: any) {
    console.error("Error saving vault record:", error);
    return NextResponse.json(
      { error: "Failed to save vault record", details: error?.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Vault record ID is required" }, { status: 400 });
    }

    const record = await prisma.applicationVault.findUnique({
      where: { id },
    });

    if (!record || record.userId !== user.id) {
      return NextResponse.json({ error: "Record not found or unauthorized" }, { status: 404 });
    }

    await prisma.applicationVault.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Vault record deleted" });
  } catch (error: any) {
    console.error("Error deleting vault record:", error);
    return NextResponse.json(
      { error: "Failed to delete vault record", details: error?.message },
      { status: 500 }
    );
  }
}
