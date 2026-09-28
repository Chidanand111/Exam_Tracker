import { prisma } from "../lib/db";

async function main() {
  console.log("Seeding versioned EligibilityRuleSet records...");

  const recruitments = await prisma.recruitment.findMany({
    include: {
      organization: true,
      qualifications: true,
    },
  });

  console.log(`Found ${recruitments.length} recruitments.`);

  for (const rec of recruitments) {
    const existing = await prisma.eligibilityRuleSet.findFirst({
      where: { recruitmentId: rec.id, isActive: true },
    });

    if (existing) {
      console.log(`RuleSet already exists for: ${rec.title}`);
      continue;
    }

    const titleLower = rec.title.toLowerCase();
    const isPoliceOrDefence =
      titleLower.includes("police") ||
      titleLower.includes("constable") ||
      titleLower.includes("capf") ||
      titleLower.includes("si") ||
      titleLower.includes("sub-inspector") ||
      titleLower.includes("defence") ||
      rec.organization.category === "DEFENCE";

    const isTransportOrDriving =
      titleLower.includes("driver") ||
      titleLower.includes("constable") ||
      titleLower.includes("transport");

    const isEngineering =
      titleLower.includes("engineer") ||
      titleLower.includes("technical") ||
      titleLower.includes("isro") ||
      titleLower.includes("drdo") ||
      rec.qualifications.some((q) => q.qualificationCode.includes("BTECH") || q.qualificationCode.includes("BE"));

    const cutoff = rec.appDeadline || new Date("2026-08-01T00:00:00Z");

    const rulesConfig = {
      version: "2026.1",
      cycleYear: 2026,
      cutoffDate: cutoff.toISOString(),
      cutoffDescription: `Age & eligibility calculated as on ${new Date(cutoff).toLocaleDateString("en-IN")} as per Para 5.1 of Official Notice`,
      minAge: rec.minAge || 18,
      maxAge: rec.maxAge || 30,
      categoryRelaxations: {
        OBC: 3,
        SC: 5,
        ST: 5,
        EWS: 0,
        UR: 0,
        PwD: 10,
        ESM: 3,
      },
      qualificationsAllowed: rec.qualifications.map((q) => q.qualificationCode),
      allowedDegrees: isEngineering ? ["B.Tech", "B.E.", "B.Sc Engineering"] : [],
      allowedBranches: isEngineering ? ["Computer Science", "Information Technology", "Mechanical", "Electrical", "Civil", "Any"] : [],
      minPercentage: null,
      minCgpa: null,
      minExperienceYears: rec.fresherEligible ? 0 : 2,
      fresherAllowed: rec.fresherEligible,
      maxAttempts: {
        UR: 6,
        EWS: 6,
        OBC: 9,
        SC: "UNLIMITED",
        ST: "UNLIMITED",
        PwD: 9,
      },
      genderConditions: {
        allowedGenders: ["MALE", "FEMALE", "TRANSGENDER", "OTHER"],
      },
      nationalityRequired: ["Citizen of India", "Subject of Nepal", "Subject of Bhutan"],
      physicalRequirements: isPoliceOrDefence
        ? {
            minHeightMaleCm: 165,
            minHeightFemaleCm: 152,
            chestExpansionCm: 5,
            eyesightCriteria: "6/6 without glasses for distance vision",
            details: "Standard Physical Efficiency & Measurement Test (PST/PET) as per Annexure VII",
          }
        : undefined,
      certificationsRequired: [],
      licenseRequired: isTransportOrDriving
        ? {
            required: true,
            type: "Valid LMV (Light Motor Vehicle) Driving License",
            details: "Must hold valid driving license as on date of physical endurance test",
          }
        : undefined,
      locationConditions: {
        stateSpecific: rec.stateLocation && rec.stateLocation !== "All India" ? [rec.stateLocation] : ["All India"],
        domicileRequired: rec.organization.category === "STATE_PSC",
      },
      officialClauseReference: `Employment Notice Clause 5.1-5.7 & Annexure IV (${rec.title})`,
    };

    await prisma.eligibilityRuleSet.create({
      data: {
        recruitmentId: rec.id,
        version: "2026.1",
        cycleYear: 2026,
        ruleName: `${rec.title} Eligibility Rules`,
        description: `Official versioned criteria for ${rec.title}`,
        isActive: true,
        cutoffDate: cutoff,
        cutoffDescription: rulesConfig.cutoffDescription,
        rulesJson: JSON.stringify(rulesConfig),
        officialClauseReference: rulesConfig.officialClauseReference,
      },
    });

    console.log(`Created rule set for: ${rec.title}`);
  }

  console.log("Seeding completed successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
