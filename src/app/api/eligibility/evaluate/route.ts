import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { evaluateEligibilityCompatibility } from "@/lib/eligibility-engine";
import { CandidateProfileData } from "@/types";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const recruitmentId = url.searchParams.get("recruitmentId");

    if (!recruitmentId) {
      return NextResponse.json(
        { error: "recruitmentId query parameter is required" },
        { status: 400 }
      );
    }

    const recruitment = await prisma.recruitment.findUnique({
      where: { id: recruitmentId },
      include: {
        organization: true,
        qualifications: true,
        posts: true,
        stages: {
          include: { schedules: true },
          orderBy: { stageOrder: "asc" },
        },
        ruleSets: {
          where: { isActive: true },
          take: 1,
        },
      },
    });

    if (!recruitment) {
      return NextResponse.json(
        { error: "Recruitment not found" },
        { status: 404 }
      );
    }

    // Attempt to fetch current user's candidate profile
    const user = await getCurrentUser();
    let profileData: CandidateProfileData | null = null;

    if (user) {
      const profile = await prisma.candidateProfile.findUnique({
        where: { userId: user.id },
      });

      if (profile) {
        profileData = {
          ...profile,
          dateOfBirth: profile.dateOfBirth?.toISOString() || null,
          gender: profile.gender as any,
          category: profile.category as any,
          preferredStates: profile.preferredStates ? JSON.parse(profile.preferredStates) : [],
          preferredCities: profile.preferredCities ? JSON.parse(profile.preferredCities) : [],
          preferredDepartments: profile.preferredDepartments ? JSON.parse(profile.preferredDepartments) : [],
          preferredSectors: profile.preferredSectors ? JSON.parse(profile.preferredSectors) : [],
          preferredJobTypes: profile.preferredJobTypes ? JSON.parse(profile.preferredJobTypes) : [],
          languagesKnown: profile.languagesKnown ? JSON.parse(profile.languagesKnown) : [],
          skills: profile.skills ? JSON.parse(profile.skills) : [],
          certifications: profile.certifications ? JSON.parse(profile.certifications) : [],
        };
      }
    }

    const activeRuleSet = recruitment.ruleSets?.[0];
    const analysis = evaluateEligibilityCompatibility(
      recruitment as any,
      profileData,
      activeRuleSet?.rulesJson
    );

    return NextResponse.json({
      success: true,
      analysis,
      ruleSet: activeRuleSet || null,
    });
  } catch (err: any) {
    console.error("Error evaluating eligibility:", err);
    return NextResponse.json(
      { error: "Failed to evaluate eligibility", details: err?.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { recruitmentId, profile: customProfile } = body;

    if (!recruitmentId) {
      return NextResponse.json(
        { error: "recruitmentId is required in body" },
        { status: 400 }
      );
    }

    const recruitment = await prisma.recruitment.findUnique({
      where: { id: recruitmentId },
      include: {
        organization: true,
        qualifications: true,
        posts: true,
        stages: {
          include: { schedules: true },
          orderBy: { stageOrder: "asc" },
        },
        ruleSets: {
          where: { isActive: true },
          take: 1,
        },
      },
    });

    if (!recruitment) {
      return NextResponse.json(
        { error: "Recruitment not found" },
        { status: 404 }
      );
    }

    let profileData: CandidateProfileData | null = customProfile || null;

    if (!profileData) {
      const user = await getCurrentUser();
      if (user) {
        const profile = await prisma.candidateProfile.findUnique({
          where: { userId: user.id },
        });

        if (profile) {
          profileData = {
            ...profile,
            dateOfBirth: profile.dateOfBirth?.toISOString() || null,
            gender: profile.gender as any,
            category: profile.category as any,
            preferredStates: profile.preferredStates ? JSON.parse(profile.preferredStates) : [],
            preferredCities: profile.preferredCities ? JSON.parse(profile.preferredCities) : [],
            preferredDepartments: profile.preferredDepartments ? JSON.parse(profile.preferredDepartments) : [],
            preferredSectors: profile.preferredSectors ? JSON.parse(profile.preferredSectors) : [],
            preferredJobTypes: profile.preferredJobTypes ? JSON.parse(profile.preferredJobTypes) : [],
            languagesKnown: profile.languagesKnown ? JSON.parse(profile.languagesKnown) : [],
            skills: profile.skills ? JSON.parse(profile.skills) : [],
            certifications: profile.certifications ? JSON.parse(profile.certifications) : [],
          };
        }
      }
    }

    const activeRuleSet = recruitment.ruleSets?.[0];
    const analysis = evaluateEligibilityCompatibility(
      recruitment as any,
      profileData,
      activeRuleSet?.rulesJson
    );

    return NextResponse.json({
      success: true,
      analysis,
      ruleSet: activeRuleSet || null,
    });
  } catch (err: any) {
    console.error("Error evaluating eligibility (POST):", err);
    return NextResponse.json(
      { error: "Failed to evaluate eligibility", details: err?.message },
      { status: 500 }
    );
  }
}

