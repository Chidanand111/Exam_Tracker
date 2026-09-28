import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

function parseJsonArray(val: string | null | undefined): string[] {
  if (!val) return [];
  try {
    const parsed = JSON.parse(val);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return val.split(",").map((s) => s.trim()).filter(Boolean);
  }
}

export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ profile: null }, { status: 200 });
    }

    const profile = await prisma.candidateProfile.findUnique({
      where: { userId: session.id },
    });

    if (!profile) {
      return NextResponse.json({ profile: null });
    }

    // Format and return with parsed arrays
    const formatted = {
      ...profile,
      preferredStates: parseJsonArray(profile.preferredStates),
      preferredCities: parseJsonArray(profile.preferredCities),
      preferredDepartments: parseJsonArray(profile.preferredDepartments),
      preferredSectors: parseJsonArray(profile.preferredSectors),
      preferredJobTypes: parseJsonArray(profile.preferredJobTypes),
      languagesKnown: parseJsonArray(profile.languagesKnown),
      skills: parseJsonArray(profile.skills),
      dateOfBirth: profile.dateOfBirth?.toISOString() || null,
    };

    return NextResponse.json({ profile: formatted });
  } catch (error: any) {
    console.error("Profile GET error:", error);
    return NextResponse.json({ error: error?.message || "Failed to fetch profile" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: "Authentication required to update candidate profile" }, { status: 401 });
    }

    const body = await req.json();

    const dataToSave = {
      highestQualification: body.highestQualification || null,
      degree: body.degree || null,
      branch: body.branch || null,
      graduationYear: body.graduationYear ? parseInt(body.graduationYear) : null,
      percentage: body.percentage ? parseFloat(body.percentage) : null,
      dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : null,
      gender: body.gender || null,
      category: body.category || "UR",
      isPwD: Boolean(body.isPwD),
      pwDType: body.pwDType || null,
      isExServiceman: Boolean(body.isExServiceman),
      preferredStates: JSON.stringify(body.preferredStates || []),
      preferredCities: JSON.stringify(body.preferredCities || []),
      preferredDepartments: JSON.stringify(body.preferredDepartments || []),
      preferredSectors: JSON.stringify(body.preferredSectors || []),
      preferredJobTypes: JSON.stringify(body.preferredJobTypes || []),
      preferredMinSalary: body.preferredMinSalary ? parseInt(body.preferredMinSalary) : null,
      willingToRelocate: body.willingToRelocate !== false,
      languagesKnown: JSON.stringify(body.languagesKnown || []),
      skills: JSON.stringify(body.skills || []),
      isCompleted: true,
      isPrivate: true,
    };

    const updatedProfile = await prisma.candidateProfile.upsert({
      where: { userId: session.id },
      create: {
        userId: session.id,
        ...dataToSave,
      },
      update: dataToSave,
    });

    const formatted = {
      ...updatedProfile,
      preferredStates: parseJsonArray(updatedProfile.preferredStates),
      preferredCities: parseJsonArray(updatedProfile.preferredCities),
      preferredDepartments: parseJsonArray(updatedProfile.preferredDepartments),
      preferredSectors: parseJsonArray(updatedProfile.preferredSectors),
      preferredJobTypes: parseJsonArray(updatedProfile.preferredJobTypes),
      languagesKnown: parseJsonArray(updatedProfile.languagesKnown),
      skills: parseJsonArray(updatedProfile.skills),
      dateOfBirth: updatedProfile.dateOfBirth?.toISOString() || null,
    };

    return NextResponse.json({
      success: true,
      message: "Candidate profile saved successfully.",
      profile: formatted,
    });
  } catch (error: any) {
    console.error("Profile PUT error:", error);
    return NextResponse.json({ error: error?.message || "Failed to save profile" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    await prisma.candidateProfile.deleteMany({
      where: { userId: session.id },
    });

    return NextResponse.json({ success: true, message: "Profile cleared successfully" });
  } catch (error: any) {
    console.error("Profile DELETE error:", error);
    return NextResponse.json({ error: error?.message || "Failed to clear profile" }, { status: 500 });
  }
}
