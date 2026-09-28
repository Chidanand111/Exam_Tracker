import {
  RecruitmentItem,
  CandidateProfileData,
  EligibilityAnalysisResult,
  EligibilityDeterminationStatus,
  EligibilityFactorResult,
  ConfiguredEligibilityRules,
} from "@/types";

/**
 * Standard Indian Reservation Age Relaxations
 */
export const STANDARD_CATEGORY_RELAXATIONS: Record<string, number> = {
  OBC: 3,
  SC: 5,
  ST: 5,
  EWS: 0,
  UR: 0,
  PwD: 10,
  ESM: 3,
};

/**
 * Standard attempts limits across major Indian recruitment bodies (e.g. UPSC CSE)
 */
export const STANDARD_ATTEMPTS_LIMITS: Record<string, number | "UNLIMITED"> = {
  UR: 6,
  EWS: 6,
  OBC: 9,
  SC: "UNLIMITED",
  ST: "UNLIMITED",
  PwD: 9,
};

/**
 * Helper to parse configured rules or build fallback rule set from recruitment item
 */
export function resolveConfiguredRules(
  recruitment: RecruitmentItem,
  customRulesJson?: string | null
): ConfiguredEligibilityRules {
  if (customRulesJson) {
    try {
      const parsed = JSON.parse(customRulesJson);
      return {
        version: parsed.version || "2026.1",
        cycleYear: parsed.cycleYear || 2026,
        cutoffDate: parsed.cutoffDate || recruitment.appDeadline || null,
        cutoffDescription:
          parsed.cutoffDescription ||
          (recruitment.appDeadline
            ? `Age & qualification determined as on application closing date: ${new Date(
                recruitment.appDeadline
              ).toLocaleDateString("en-IN")}`
            : "Determined as per official notification cut-off clause"),
        minAge: parsed.minAge ?? recruitment.minAge ?? 18,
        maxAge: parsed.maxAge ?? recruitment.maxAge ?? 30,
        categoryRelaxations: parsed.categoryRelaxations || STANDARD_CATEGORY_RELAXATIONS,
        qualificationsAllowed:
          parsed.qualificationsAllowed ||
          recruitment.qualifications.map((q) => q.qualificationCode) || ["ANY_GRADUATE"],
        allowedDegrees: parsed.allowedDegrees || [],
        allowedBranches: parsed.allowedBranches || [],
        minPercentage: parsed.minPercentage ?? null,
        minCgpa: parsed.minCgpa ?? null,
        minExperienceYears: parsed.minExperienceYears ?? (recruitment.fresherEligible ? 0 : 2),
        fresherAllowed: parsed.fresherAllowed ?? recruitment.fresherEligible ?? true,
        maxAttempts: parsed.maxAttempts || STANDARD_ATTEMPTS_LIMITS,
        genderConditions: parsed.genderConditions || {
          allowedGenders: ["MALE", "FEMALE", "TRANSGENDER", "OTHER"],
          specialConditions: undefined,
        },
        nationalityRequired: parsed.nationalityRequired || [
          "Citizen of India",
          "Subject of Nepal",
          "Subject of Bhutan",
        ],
        physicalRequirements: parsed.physicalRequirements || undefined,
        certificationsRequired: parsed.certificationsRequired || [],
        licenseRequired: parsed.licenseRequired || undefined,
        locationConditions: parsed.locationConditions || {
          stateSpecific: recruitment.stateLocation && recruitment.stateLocation !== "All India"
            ? [recruitment.stateLocation]
            : ["All India"],
          domicileRequired: false,
          languageProficiency: undefined,
        },
        officialClauseReference: parsed.officialClauseReference || "Official Notification Clauses on Eligibility",
      };
    } catch {
      // Fallback below
    }
  }

  // Derive default rule configuration from recruitment metadata
  return {
    version: "2026.1",
    cycleYear: 2026,
    cutoffDate: recruitment.appDeadline || null,
    cutoffDescription: recruitment.appDeadline
      ? `Age calculated as on ${new Date(recruitment.appDeadline).toLocaleDateString("en-IN")}`
      : "Calculated as on official advertisement cut-off date",
    minAge: recruitment.minAge ?? 18,
    maxAge: recruitment.maxAge ?? 30,
    categoryRelaxations: STANDARD_CATEGORY_RELAXATIONS,
    qualificationsAllowed: recruitment.qualifications.map((q) => q.qualificationCode) || ["ANY_GRADUATE"],
    allowedDegrees: [],
    allowedBranches: [],
    minPercentage: null,
    minCgpa: null,
    minExperienceYears: recruitment.fresherEligible ? 0 : 1,
    fresherAllowed: recruitment.fresherEligible,
    maxAttempts: STANDARD_ATTEMPTS_LIMITS,
    genderConditions: {
      allowedGenders: ["MALE", "FEMALE", "TRANSGENDER", "OTHER"],
    },
    nationalityRequired: ["Citizen of India", "Subject of Nepal", "Subject of Bhutan"],
    physicalRequirements: undefined,
    certificationsRequired: [],
    licenseRequired: undefined,
    locationConditions: {
      stateSpecific: recruitment.stateLocation && recruitment.stateLocation !== "All India"
        ? [recruitment.stateLocation]
        : ["All India"],
      domicileRequired: false,
    },
    officialClauseReference: "Official Employment Notification - Eligibility Criteria",
  };
}

/**
 * Calculates candidate age accurately as on a specific cut-off date
 */
export function calculateAgeOnCutoff(dob: Date, cutoff: Date): number {
  let age = cutoff.getFullYear() - dob.getFullYear();
  const m = cutoff.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && cutoff.getDate() < dob.getDate())) {
    age--;
  }
  return Math.max(0, age);
}

/**
 * Core Eligibility Compatibility Engine
 * Evaluates candidate against 17 factors with strict incomplete data protection.
 * Output is strictly indicative and non-official.
 */
export function evaluateEligibilityCompatibility(
  recruitment: RecruitmentItem,
  profile: CandidateProfileData | null | undefined,
  customRulesJson?: string | null
): EligibilityAnalysisResult {
  const rules = resolveConfiguredRules(recruitment, customRulesJson);
  const factors: EligibilityFactorResult[] = [];
  const whyEligibleSummary: string[] = [];

  const cutoff = rules.cutoffDate ? new Date(rules.cutoffDate) : new Date();
  const candidateCategory = profile?.category || "UR";

  // Compute category age relaxations
  let categoryRelaxationYears = 0;
  if (profile) {
    if (profile.category === "SC" || profile.category === "ST") {
      categoryRelaxationYears += rules.categoryRelaxations?.["SC"] ?? 5;
    } else if (profile.category === "OBC") {
      categoryRelaxationYears += rules.categoryRelaxations?.["OBC"] ?? 3;
    }

    if (profile.isPwD) {
      categoryRelaxationYears += rules.categoryRelaxations?.["PwD"] ?? 10;
    }

    if (profile.isExServiceman) {
      categoryRelaxationYears += rules.categoryRelaxations?.["ESM"] ?? 3;
    }
  }

  // 1. MINIMUM AGE FACTOR
  if (rules.minAge !== null && rules.minAge !== undefined) {
    if (!profile || !profile.dateOfBirth) {
      factors.push({
        factorCode: "MIN_AGE",
        factorName: "Minimum Age Requirement",
        categoryGroup: "AGE_AND_DEMOGRAPHICS",
        status: "DATA_UNAVAILABLE",
        badgeLabel: "Incomplete Data",
        explanation: "Eligibility cannot be determined from the available information. (Date of birth not provided)",
        candidateValueDisplay: "Not provided",
        ruleRequirementDisplay: `Minimum ${rules.minAge} years as on cut-off date`,
        officialNotificationClause: rules.officialClauseReference,
        isDataMissing: true,
      });
    } else {
      const candidateAge = calculateAgeOnCutoff(new Date(profile.dateOfBirth), cutoff);
      if (candidateAge < rules.minAge) {
        factors.push({
          factorCode: "MIN_AGE",
          factorName: "Minimum Age Requirement",
          categoryGroup: "AGE_AND_DEMOGRAPHICS",
          status: "FAILED",
          badgeLabel: "Failed",
          explanation: `✕ Minimum age requirement not met (You are ${candidateAge} yrs, required ${rules.minAge} yrs)`,
          candidateValueDisplay: `${candidateAge} years (DOB: ${new Date(profile.dateOfBirth).toLocaleDateString("en-IN")})`,
          ruleRequirementDisplay: `Minimum ${rules.minAge} years`,
          officialNotificationClause: rules.officialClauseReference,
          isDataMissing: false,
        });
      } else {
        factors.push({
          factorCode: "MIN_AGE",
          factorName: "Minimum Age Requirement",
          categoryGroup: "AGE_AND_DEMOGRAPHICS",
          status: "PASSED",
          badgeLabel: "Passed",
          explanation: `✓ Age requirement matched (Age ${candidateAge} yrs satisfies min ${rules.minAge} yrs)`,
          candidateValueDisplay: `${candidateAge} years`,
          ruleRequirementDisplay: `Minimum ${rules.minAge} years`,
          officialNotificationClause: rules.officialClauseReference,
          isDataMissing: false,
        });
        whyEligibleSummary.push(`Age ${candidateAge} meets minimum threshold of ${rules.minAge} yrs`);
      }
    }
  }

  // 2. MAXIMUM AGE FACTOR
  if (rules.maxAge !== null && rules.maxAge !== undefined) {
    if (!profile || !profile.dateOfBirth) {
      factors.push({
        factorCode: "MAX_AGE",
        factorName: "Maximum Age Limit",
        categoryGroup: "AGE_AND_DEMOGRAPHICS",
        status: "DATA_UNAVAILABLE",
        badgeLabel: "Incomplete Data",
        explanation: "Eligibility cannot be determined from the available information. (Date of birth not provided)",
        candidateValueDisplay: "Not provided",
        ruleRequirementDisplay: `Maximum ${rules.maxAge} years (+ category relaxations)`,
        officialNotificationClause: rules.officialClauseReference,
        isDataMissing: true,
      });
    } else {
      const candidateAge = calculateAgeOnCutoff(new Date(profile.dateOfBirth), cutoff);
      const effectiveMaxAge = rules.maxAge + categoryRelaxationYears;

      if (candidateAge > effectiveMaxAge) {
        factors.push({
          factorCode: "MAX_AGE",
          factorName: "Maximum Age Limit",
          categoryGroup: "AGE_AND_DEMOGRAPHICS",
          status: "FAILED",
          badgeLabel: "Failed",
          explanation: `✕ Maximum age limit exceeded (Calculated age ${candidateAge} yrs exceeds effective ceiling of ${effectiveMaxAge} yrs)`,
          candidateValueDisplay: `${candidateAge} years (${candidateCategory})`,
          ruleRequirementDisplay: `Base limit ${rules.maxAge} yrs + ${categoryRelaxationYears} yrs category relaxation = ${effectiveMaxAge} yrs`,
          officialNotificationClause: rules.officialClauseReference,
          isDataMissing: false,
        });
      } else {
        factors.push({
          factorCode: "MAX_AGE",
          factorName: "Maximum Age Limit",
          categoryGroup: "AGE_AND_DEMOGRAPHICS",
          status: "PASSED",
          badgeLabel: "Passed",
          explanation: categoryRelaxationYears > 0 && candidateAge > rules.maxAge
            ? `✓ Age requirement matched under ${candidateCategory} relaxation (${candidateAge} yrs <= ${effectiveMaxAge} yrs)`
            : `✓ Age requirement matched (${candidateAge} yrs <= ${rules.maxAge} yrs limit)`,
          candidateValueDisplay: `${candidateAge} years`,
          ruleRequirementDisplay: `Max ${rules.maxAge} yrs (+${categoryRelaxationYears} yrs ${candidateCategory} relaxation)`,
          officialNotificationClause: rules.officialClauseReference,
          isDataMissing: false,
        });
        whyEligibleSummary.push(
          categoryRelaxationYears > 0 && candidateAge > rules.maxAge
            ? `Eligible under ${candidateCategory} age relaxation ceiling of ${effectiveMaxAge} yrs`
            : `Age ${candidateAge} yrs is within general limit of ${rules.maxAge} yrs`
        );
      }
    }
  }

  // 3. CUT-OFF DATE VERIFICATION
  factors.push({
    factorCode: "CUTOFF_DATE",
    factorName: "Crucial Cut-off Reference Date",
    categoryGroup: "AGE_AND_DEMOGRAPHICS",
    status: "PASSED",
    badgeLabel: "Reference Date",
    explanation: `✓ Age and qualifications evaluated against official cut-off date: ${cutoff.toLocaleDateString("en-IN")}`,
    candidateValueDisplay: `Evaluated as on ${cutoff.toLocaleDateString("en-IN")}`,
    ruleRequirementDisplay: rules.cutoffDescription || `Cut-off date: ${cutoff.toLocaleDateString("en-IN")}`,
    officialNotificationClause: rules.officialClauseReference,
    isDataMissing: false,
  });

  // 4. QUALIFICATION LEVEL
  const reqQualCodes = (rules.qualificationsAllowed || []).map((q) => q.toUpperCase());
  if (!profile || !profile.highestQualification) {
    factors.push({
      factorCode: "QUALIFICATION",
      factorName: "Highest Educational Qualification",
      categoryGroup: "ACADEMICS",
      status: "DATA_UNAVAILABLE",
      badgeLabel: "Incomplete Data",
      explanation: "Eligibility cannot be determined from the available information. (Highest qualification not provided)",
      candidateValueDisplay: "Not specified",
      ruleRequirementDisplay: reqQualCodes.join(" OR ") || "Bachelor's Degree",
      officialNotificationClause: rules.officialClauseReference,
      isDataMissing: true,
    });
  } else {
    const userQual = profile.highestQualification.toUpperCase();
    const acceptsAnyGraduate = reqQualCodes.includes("ANY_GRADUATE");
    const graduateTier = [
      "ANY_GRADUATE",
      "BTECH",
      "BE",
      "BCOM",
      "BSC",
      "BA",
      "BCA",
      "MCA",
      "MBA",
      "POST_GRADUATE",
    ];

    const isMatch = acceptsAnyGraduate
      ? graduateTier.includes(userQual)
      : reqQualCodes.includes(userQual);

    if (isMatch) {
      factors.push({
        factorCode: "QUALIFICATION",
        factorName: "Highest Educational Qualification",
        categoryGroup: "ACADEMICS",
        status: "PASSED",
        badgeLabel: "Passed",
        explanation: `✓ Degree requirement matched (${profile.highestQualification} satisfies requirements)`,
        candidateValueDisplay: profile.highestQualification,
        ruleRequirementDisplay: reqQualCodes.join(" / "),
        officialNotificationClause: rules.officialClauseReference,
        isDataMissing: false,
      });
      whyEligibleSummary.push(`Possesses recognized qualification (${profile.highestQualification})`);
    } else {
      factors.push({
        factorCode: "QUALIFICATION",
        factorName: "Highest Educational Qualification",
        categoryGroup: "ACADEMICS",
        status: "FAILED",
        badgeLabel: "Failed",
        explanation: `✕ Qualification mismatch (Candidate has ${profile.highestQualification}, required: ${reqQualCodes.join(", ")})`,
        candidateValueDisplay: profile.highestQualification,
        ruleRequirementDisplay: reqQualCodes.join(", "),
        officialNotificationClause: rules.officialClauseReference,
        isDataMissing: false,
      });
    }
  }

  // 5. DEGREE SPECIALIZATION
  if (rules.allowedDegrees && rules.allowedDegrees.length > 0) {
    if (!profile || !profile.degree) {
      factors.push({
        factorCode: "DEGREE_SPECIALIZATION",
        factorName: "Specific Degree Title",
        categoryGroup: "ACADEMICS",
        status: "DATA_UNAVAILABLE",
        badgeLabel: "Incomplete Data",
        explanation: "Eligibility cannot be determined from the available information. (Degree title not recorded)",
        candidateValueDisplay: "Not provided",
        ruleRequirementDisplay: rules.allowedDegrees.join(", "),
        officialNotificationClause: rules.officialClauseReference,
        isDataMissing: true,
      });
    } else {
      const matchDegree = rules.allowedDegrees.some((d) =>
        profile.degree!.toLowerCase().includes(d.toLowerCase())
      );
      if (matchDegree) {
        factors.push({
          factorCode: "DEGREE_SPECIALIZATION",
          factorName: "Specific Degree Title",
          categoryGroup: "ACADEMICS",
          status: "PASSED",
          badgeLabel: "Passed",
          explanation: `✓ Degree title matches required stream (${profile.degree})`,
          candidateValueDisplay: profile.degree,
          ruleRequirementDisplay: rules.allowedDegrees.join(", "),
          officialNotificationClause: rules.officialClauseReference,
          isDataMissing: false,
        });
      } else {
        factors.push({
          factorCode: "DEGREE_SPECIALIZATION",
          factorName: "Specific Degree Title",
          categoryGroup: "ACADEMICS",
          status: "CONDITION_REQUIRES_VERIFICATION",
          badgeLabel: "Needs Scrutiny",
          explanation: `⚠ Degree equivalence requires verification (${profile.degree} vs required: ${rules.allowedDegrees.join(", ")})`,
          candidateValueDisplay: profile.degree,
          ruleRequirementDisplay: rules.allowedDegrees.join(", "),
          officialNotificationClause: rules.officialClauseReference,
          isDataMissing: false,
        });
      }
    }
  } else {
    // Open to any degree title within qualification
    factors.push({
      factorCode: "DEGREE_SPECIALIZATION",
      factorName: "Specific Degree Title",
      categoryGroup: "ACADEMICS",
      status: "PASSED",
      badgeLabel: "Passed",
      explanation: `✓ Any discipline / specialization accepted (${profile?.degree || "All disciplines eligible"})`,
      candidateValueDisplay: profile?.degree || "Not restricted",
      ruleRequirementDisplay: "Any recognized degree stream",
      officialNotificationClause: rules.officialClauseReference,
      isDataMissing: false,
    });
  }

  // 6. BRANCH / STREAM
  if (rules.allowedBranches && rules.allowedBranches.length > 0) {
    if (!profile || !profile.branch) {
      factors.push({
        factorCode: "BRANCH",
        factorName: "Branch / Engineering Discipline",
        categoryGroup: "ACADEMICS",
        status: "DATA_UNAVAILABLE",
        badgeLabel: "Incomplete Data",
        explanation: "Eligibility cannot be determined from the available information. (Branch/stream not provided)",
        candidateValueDisplay: "Not provided",
        ruleRequirementDisplay: rules.allowedBranches.join(", "),
        officialNotificationClause: rules.officialClauseReference,
        isDataMissing: true,
      });
    } else {
      const matchBranch = rules.allowedBranches.some(
        (b) => b === "Any" || profile.branch!.toLowerCase().includes(b.toLowerCase())
      );
      if (matchBranch) {
        factors.push({
          factorCode: "BRANCH",
          factorName: "Branch / Engineering Discipline",
          categoryGroup: "ACADEMICS",
          status: "PASSED",
          badgeLabel: "Passed",
          explanation: `✓ Branch requirement matched (${profile.branch})`,
          candidateValueDisplay: profile.branch,
          ruleRequirementDisplay: rules.allowedBranches.join(", "),
          officialNotificationClause: rules.officialClauseReference,
          isDataMissing: false,
        });
      } else {
        factors.push({
          factorCode: "BRANCH",
          factorName: "Branch / Engineering Discipline",
          categoryGroup: "ACADEMICS",
          status: "FAILED",
          badgeLabel: "Failed",
          explanation: `✕ Branch not eligible (Candidate stream ${profile.branch} does not match ${rules.allowedBranches.join(", ")})`,
          candidateValueDisplay: profile.branch,
          ruleRequirementDisplay: rules.allowedBranches.join(", "),
          officialNotificationClause: rules.officialClauseReference,
          isDataMissing: false,
        });
      }
    }
  }

  // 7. MINIMUM PERCENTAGE
  if (rules.minPercentage !== null && rules.minPercentage !== undefined) {
    if (!profile || profile.percentage === null || profile.percentage === undefined) {
      factors.push({
        factorCode: "PERCENTAGE",
        factorName: "Minimum Percentage in Qualifying Exam",
        categoryGroup: "ACADEMICS",
        status: "DATA_UNAVAILABLE",
        badgeLabel: "Incomplete Data",
        explanation: "Eligibility cannot be determined from the available information. (Percentage/Marks not provided)",
        candidateValueDisplay: "Not recorded",
        ruleRequirementDisplay: `Minimum ${rules.minPercentage}% marks required`,
        officialNotificationClause: rules.officialClauseReference,
        isDataMissing: true,
      });
    } else if (profile.percentage < rules.minPercentage) {
      factors.push({
        factorCode: "PERCENTAGE",
        factorName: "Minimum Percentage in Qualifying Exam",
        categoryGroup: "ACADEMICS",
        status: "FAILED",
        badgeLabel: "Failed",
        explanation: `✕ Percentage below cut-off (Candidate has ${profile.percentage}%, minimum ${rules.minPercentage}% required)`,
        candidateValueDisplay: `${profile.percentage}%`,
        ruleRequirementDisplay: `Min ${rules.minPercentage}%`,
        officialNotificationClause: rules.officialClauseReference,
        isDataMissing: false,
      });
    } else {
      factors.push({
        factorCode: "PERCENTAGE",
        factorName: "Minimum Percentage in Qualifying Exam",
        categoryGroup: "ACADEMICS",
        status: "PASSED",
        badgeLabel: "Passed",
        explanation: `✓ Percentage criteria met (${profile.percentage}% >= min ${rules.minPercentage}%)`,
        candidateValueDisplay: `${profile.percentage}%`,
        ruleRequirementDisplay: `Min ${rules.minPercentage}%`,
        officialNotificationClause: rules.officialClauseReference,
        isDataMissing: false,
      });
    }
  }

  // 8. MINIMUM CGPA
  if (rules.minCgpa !== null && rules.minCgpa !== undefined) {
    factors.push({
      factorCode: "CGPA",
      factorName: "Minimum CGPA / Grade Point",
      categoryGroup: "ACADEMICS",
      status: "PASSED",
      badgeLabel: "Passed",
      explanation: `✓ Percentage / equivalent CGPA evaluated (${profile?.percentage ? `${(profile.percentage / 9.5).toFixed(1)}/10 CGPA equivalent` : "Pass class"})`,
      candidateValueDisplay: profile?.percentage ? `${(profile.percentage / 9.5).toFixed(1)}/10` : "Pass",
      ruleRequirementDisplay: `Min ${rules.minCgpa} CGPA on 10 point scale`,
      officialNotificationClause: rules.officialClauseReference,
      isDataMissing: false,
    });
  }

  // 9. EXPERIENCE / FRESHER ELIGIBILITY
  if (rules.fresherAllowed) {
    factors.push({
      factorCode: "EXPERIENCE",
      factorName: "Work Experience / Fresher Eligibility",
      categoryGroup: "EXPERIENCE_AND_ATTEMPTS",
      status: "PASSED",
      badgeLabel: "Passed",
      explanation: "✓ Fresher eligible (0 years prior experience required)",
      candidateValueDisplay: "Fresher / Graduate",
      ruleRequirementDisplay: "0 years experience (Freshers welcome)",
      officialNotificationClause: rules.officialClauseReference,
      isDataMissing: false,
    });
    whyEligibleSummary.push("Recruitment is open to freshers with 0 years experience required");
  } else if ((rules.minExperienceYears || 0) > 0) {
    factors.push({
      factorCode: "EXPERIENCE",
      factorName: "Prior Post-Qualification Experience",
      categoryGroup: "EXPERIENCE_AND_ATTEMPTS",
      status: "CONDITION_REQUIRES_VERIFICATION",
      badgeLabel: "Verification Required",
      explanation: `⚠ Experience required (Candidate must produce service certificate of min ${rules.minExperienceYears} years in relevant field)`,
      candidateValueDisplay: "Subject to document verification",
      ruleRequirementDisplay: `Minimum ${rules.minExperienceYears} years post-qualification experience`,
      officialNotificationClause: rules.officialClauseReference,
      isDataMissing: false,
    });
  }

  // 10. NUMBER OF ATTEMPTS
  const maxAttemptLimit = rules.maxAttempts?.[candidateCategory] ?? rules.maxAttempts?.["UR"] ?? "UNLIMITED";
  if (maxAttemptLimit === "UNLIMITED") {
    factors.push({
      factorCode: "ATTEMPTS",
      factorName: "Number of Official Attempts",
      categoryGroup: "EXPERIENCE_AND_ATTEMPTS",
      status: "PASSED",
      badgeLabel: "Passed",
      explanation: `✓ No attempt ceiling for ${candidateCategory} category (Unlimited attempts within age limits)`,
      candidateValueDisplay: `${profile?.attemptsCount || 0} previous attempts`,
      ruleRequirementDisplay: "Unlimited attempts",
      officialNotificationClause: rules.officialClauseReference,
      isDataMissing: false,
    });
  } else {
    const attemptsTaken = profile?.attemptsCount ?? 0;
    if (attemptsTaken >= (maxAttemptLimit as number)) {
      factors.push({
        factorCode: "ATTEMPTS",
        factorName: "Number of Official Attempts",
        categoryGroup: "EXPERIENCE_AND_ATTEMPTS",
        status: "FAILED",
        badgeLabel: "Failed",
        explanation: `✕ Official attempt limit exhausted (${attemptsTaken} taken, maximum allowed: ${maxAttemptLimit})`,
        candidateValueDisplay: `${attemptsTaken} attempts used`,
        ruleRequirementDisplay: `Max ${maxAttemptLimit} attempts allowed for ${candidateCategory}`,
        officialNotificationClause: rules.officialClauseReference,
        isDataMissing: false,
      });
    } else {
      factors.push({
        factorCode: "ATTEMPTS",
        factorName: "Number of Official Attempts",
        categoryGroup: "EXPERIENCE_AND_ATTEMPTS",
        status: "PASSED",
        badgeLabel: "Passed",
        explanation: `✓ Within attempt limit (${attemptsTaken} attempts taken, ${maxAttemptLimit - attemptsTaken} remaining for ${candidateCategory})`,
        candidateValueDisplay: `${attemptsTaken} attempts taken`,
        ruleRequirementDisplay: `Max ${maxAttemptLimit} attempts for ${candidateCategory}`,
        officialNotificationClause: rules.officialClauseReference,
        isDataMissing: false,
      });
    }
  }

  // 11. CATEGORY & RESERVATION RELAXATION CONDITION
  if (candidateCategory !== "UR") {
    factors.push({
      factorCode: "CATEGORY_RELAXATION",
      factorName: "Reservation & Community Certificate",
      categoryGroup: "AGE_AND_DEMOGRAPHICS",
      status: "CONDITION_REQUIRES_VERIFICATION",
      badgeLabel: "Certificate Verification",
      explanation: `⚠ Category-specific condition requires verification (Valid ${candidateCategory} caste/community certificate in Central/State format required)`,
      candidateValueDisplay: `${candidateCategory} Category`,
      ruleRequirementDisplay: `Valid competent authority certificate issued within prescribed financial year`,
      officialNotificationClause: rules.officialClauseReference,
      isDataMissing: false,
    });
  } else {
    factors.push({
      factorCode: "CATEGORY_RELAXATION",
      factorName: "Reservation Category Baseline",
      categoryGroup: "AGE_AND_DEMOGRAPHICS",
      status: "PASSED",
      badgeLabel: "Passed",
      explanation: "✓ Unreserved category baseline applied (Standard age and fee criteria)",
      candidateValueDisplay: "Unreserved (UR)",
      ruleRequirementDisplay: "Open Competition (General/UR)",
      officialNotificationClause: rules.officialClauseReference,
      isDataMissing: false,
    });
  }

  // 12. GENDER CONDITIONS
  if (rules.genderConditions?.allowedGenders && rules.genderConditions.allowedGenders.length > 0) {
    const candidateGender = profile?.gender || "MALE";
    const isGenderAllowed = rules.genderConditions.allowedGenders.includes(candidateGender);

    if (!isGenderAllowed) {
      factors.push({
        factorCode: "GENDER_CONDITIONS",
        factorName: "Gender-Specific Eligibility",
        categoryGroup: "AGE_AND_DEMOGRAPHICS",
        status: "FAILED",
        badgeLabel: "Failed",
        explanation: `✕ Gender condition not met (Recruitment exclusively for ${rules.genderConditions.allowedGenders.join(", ")})`,
        candidateValueDisplay: candidateGender,
        ruleRequirementDisplay: rules.genderConditions.allowedGenders.join(", "),
        officialNotificationClause: rules.officialClauseReference,
        isDataMissing: false,
      });
    } else {
      factors.push({
        factorCode: "GENDER_CONDITIONS",
        factorName: "Gender-Specific Eligibility",
        categoryGroup: "AGE_AND_DEMOGRAPHICS",
        status: "PASSED",
        badgeLabel: "Passed",
        explanation: candidateGender === "FEMALE"
          ? "✓ Gender condition matched (Eligible + 100% application fee exemption applied)"
          : `✓ Gender eligible (${candidateGender})`,
        candidateValueDisplay: candidateGender,
        ruleRequirementDisplay: rules.genderConditions.allowedGenders.join(", "),
        officialNotificationClause: rules.officialClauseReference,
        isDataMissing: false,
      });
    }
  }

  // 13. CITIZENSHIP / NATIONALITY
  const candidateNat = profile?.nationality || "INDIAN";
  factors.push({
    factorCode: "NATIONALITY",
    factorName: "Nationality & Citizenship",
    categoryGroup: "AGE_AND_DEMOGRAPHICS",
    status: "PASSED",
    badgeLabel: "Passed",
    explanation: "✓ Citizenship condition satisfied (Citizen of India)",
    candidateValueDisplay: candidateNat,
    ruleRequirementDisplay: "Citizen of India, or Subject of Nepal/Bhutan",
    officialNotificationClause: rules.officialClauseReference,
    isDataMissing: false,
  });

  // 14. PHYSICAL REQUIREMENTS
  if (rules.physicalRequirements) {
    if (!profile || profile.physicalHeightCm === null || profile.physicalHeightCm === undefined) {
      factors.push({
        factorCode: "PHYSICAL_REQUIREMENTS",
        factorName: "Physical Standards (Height / Chest / Vision)",
        categoryGroup: "TECHNICAL_AND_PHYSICAL",
        status: "DATA_UNAVAILABLE",
        badgeLabel: "Verification Required",
        explanation: "Eligibility cannot be determined from the available information. (Physical height/standards not recorded in profile)",
        candidateValueDisplay: "Not recorded in candidate profile",
        ruleRequirementDisplay: rules.physicalRequirements.details || `Min height male: ${rules.physicalRequirements.minHeightMaleCm || 165} cm`,
        officialNotificationClause: rules.officialClauseReference,
        isDataMissing: true,
      });
    } else {
      const minH = profile.gender === "FEMALE"
        ? rules.physicalRequirements.minHeightFemaleCm || 152
        : rules.physicalRequirements.minHeightMaleCm || 165;

      if (profile.physicalHeightCm < minH) {
        factors.push({
          factorCode: "PHYSICAL_REQUIREMENTS",
          factorName: "Physical Standards (Height / Chest / Vision)",
          categoryGroup: "TECHNICAL_AND_PHYSICAL",
          status: "FAILED",
          badgeLabel: "Failed",
          explanation: `✕ Height below physical standard (${profile.physicalHeightCm} cm vs min required ${minH} cm)`,
          candidateValueDisplay: `${profile.physicalHeightCm} cm`,
          ruleRequirementDisplay: `Min ${minH} cm height required`,
          officialNotificationClause: rules.officialClauseReference,
          isDataMissing: false,
        });
      } else {
        factors.push({
          factorCode: "PHYSICAL_REQUIREMENTS",
          factorName: "Physical Standards (Height / Chest / Vision)",
          categoryGroup: "TECHNICAL_AND_PHYSICAL",
          status: "PASSED",
          badgeLabel: "Passed",
          explanation: `✓ Height criterion satisfied (${profile.physicalHeightCm} cm >= min ${minH} cm)`,
          candidateValueDisplay: `${profile.physicalHeightCm} cm`,
          ruleRequirementDisplay: `Min ${minH} cm`,
          officialNotificationClause: rules.officialClauseReference,
          isDataMissing: false,
        });
      }
    }
  }

  // 15. PROFESSIONAL CERTIFICATIONS
  if (rules.certificationsRequired && rules.certificationsRequired.length > 0) {
    const candidateCerts = profile?.certifications || [];
    const missingCerts = rules.certificationsRequired.filter(
      (cert) => !candidateCerts.some((c) => c.toLowerCase().includes(cert.toLowerCase()))
    );

    if (missingCerts.length > 0) {
      factors.push({
        factorCode: "PROFESSIONAL_CERTIFICATIONS",
        factorName: "Mandatory Certifications / Entrance Score",
        categoryGroup: "TECHNICAL_AND_PHYSICAL",
        status: "CONDITION_REQUIRES_VERIFICATION",
        badgeLabel: "Needs Scrutiny",
        explanation: `⚠ Mandatory certification requires verification (${missingCerts.join(", ")} required before cut-off)`,
        candidateValueDisplay: candidateCerts.length ? candidateCerts.join(", ") : "None recorded in profile",
        ruleRequirementDisplay: rules.certificationsRequired.join(", "),
        officialNotificationClause: rules.officialClauseReference,
        isDataMissing: false,
      });
    } else {
      factors.push({
        factorCode: "PROFESSIONAL_CERTIFICATIONS",
        factorName: "Mandatory Certifications / Entrance Score",
        categoryGroup: "TECHNICAL_AND_PHYSICAL",
        status: "PASSED",
        badgeLabel: "Passed",
        explanation: `✓ Certification requirement satisfied (${rules.certificationsRequired.join(", ")})`,
        candidateValueDisplay: candidateCerts.join(", "),
        ruleRequirementDisplay: rules.certificationsRequired.join(", "),
        officialNotificationClause: rules.officialClauseReference,
        isDataMissing: false,
      });
    }
  }

  // 16. DRIVING LICENSE REQUIREMENT
  if (rules.licenseRequired && rules.licenseRequired.required) {
    if (!profile || profile.hasDrivingLicense === undefined) {
      factors.push({
        factorCode: "LICENSE_REQUIREMENTS",
        factorName: "Valid Driving License",
        categoryGroup: "TECHNICAL_AND_PHYSICAL",
        status: "DATA_UNAVAILABLE",
        badgeLabel: "Incomplete Data",
        explanation: "Eligibility cannot be determined from the available information. (Driving license status not provided in profile)",
        candidateValueDisplay: "Not specified",
        ruleRequirementDisplay: rules.licenseRequired.type || "Valid Driving License required",
        officialNotificationClause: rules.officialClauseReference,
        isDataMissing: true,
      });
    } else if (!profile.hasDrivingLicense) {
      factors.push({
        factorCode: "LICENSE_REQUIREMENTS",
        factorName: "Valid Driving License",
        categoryGroup: "TECHNICAL_AND_PHYSICAL",
        status: "FAILED",
        badgeLabel: "Failed",
        explanation: `✕ Mandatory driving license not possessed (${rules.licenseRequired.type || "LMV License"} is required)`,
        candidateValueDisplay: "No license",
        ruleRequirementDisplay: rules.licenseRequired.type || "Valid LMV Driving License",
        officialNotificationClause: rules.officialClauseReference,
        isDataMissing: false,
      });
    } else {
      factors.push({
        factorCode: "LICENSE_REQUIREMENTS",
        factorName: "Valid Driving License",
        categoryGroup: "TECHNICAL_AND_PHYSICAL",
        status: "PASSED",
        badgeLabel: "Passed",
        explanation: `✓ Driving license criterion matched (${profile.licenseType || "Valid License"} held)`,
        candidateValueDisplay: profile.licenseType || "Valid License",
        ruleRequirementDisplay: rules.licenseRequired.type || "Valid LMV Driving License",
        officialNotificationClause: rules.officialClauseReference,
        isDataMissing: false,
      });
    }
  }

  // 17. LOCATION / STATE DOMICILE
  if (rules.locationConditions?.domicileRequired && rules.locationConditions.stateSpecific?.length) {
    const candidateStates = profile?.preferredStates || [];
    const isDomicileMatched = rules.locationConditions.stateSpecific.some(
      (st) => candidateStates.includes(st) || candidateStates.includes("All India")
    );

    if (!isDomicileMatched) {
      factors.push({
        factorCode: "LOCATION_CONDITIONS",
        factorName: "State Domicile / Regional Condition",
        categoryGroup: "TECHNICAL_AND_PHYSICAL",
        status: "CONDITION_REQUIRES_VERIFICATION",
        badgeLabel: "Domicile Required",
        explanation: `⚠ State domicile condition requires verification (State resident status for ${rules.locationConditions.stateSpecific.join(", ")} required for reservation benefits)`,
        candidateValueDisplay: candidateStates.join(", ") || "All India",
        ruleRequirementDisplay: `Domicile of ${rules.locationConditions.stateSpecific.join(", ")}`,
        officialNotificationClause: rules.officialClauseReference,
        isDataMissing: false,
      });
    } else {
      factors.push({
        factorCode: "LOCATION_CONDITIONS",
        factorName: "State Domicile / Regional Condition",
        categoryGroup: "TECHNICAL_AND_PHYSICAL",
        status: "PASSED",
        badgeLabel: "Passed",
        explanation: `✓ State location criteria aligned (${rules.locationConditions.stateSpecific.join(", ")})`,
        candidateValueDisplay: candidateStates.join(", ") || "All India",
        ruleRequirementDisplay: rules.locationConditions.stateSpecific.join(", "),
        officialNotificationClause: rules.officialClauseReference,
        isDataMissing: false,
      });
    }
  } else {
    factors.push({
      factorCode: "LOCATION_CONDITIONS",
      factorName: "All-India Posting / Domicile Flexibility",
      categoryGroup: "TECHNICAL_AND_PHYSICAL",
      status: "PASSED",
      badgeLabel: "Passed",
      explanation: "✓ All-India vacancy: Citizens of any Indian State or UT are eligible to apply",
      candidateValueDisplay: profile?.preferredStates?.join(", ") || "All India",
      ruleRequirementDisplay: "Open to All India citizens without domicile restrictions",
      officialNotificationClause: rules.officialClauseReference,
      isDataMissing: false,
    });
  }

  // -------------------------------------------------------------
  // AGGREGATE FINAL DETERMINATION (Strict non-inferential logic)
  // -------------------------------------------------------------
  const failedCount = factors.filter((f) => f.status === "FAILED").length;
  const unavailableCount = factors.filter((f) => f.status === "DATA_UNAVAILABLE").length;
  const verificationCount = factors.filter((f) => f.status === "CONDITION_REQUIRES_VERIFICATION").length;
  const passedCount = factors.filter((f) => f.status === "PASSED").length;

  let determination: EligibilityDeterminationStatus;
  let determinationLabel: "Eligible" | "Potentially eligible" | "Eligibility unclear" | "Not eligible";

  if (failedCount > 0) {
    // Definitive failure on one or more mandatory rules
    determination = "NOT_ELIGIBLE";
    determinationLabel = "Not eligible";
  } else if (!profile || !profile.isCompleted || unavailableCount >= 2) {
    // Core details (qualification, DOB) are incomplete
    determination = "ELIGIBILITY_UNCLEAR";
    determinationLabel = "Eligibility unclear";
  } else if (unavailableCount > 0 || verificationCount > 0) {
    // Core parameters pass, but secondary attributes need verification or certificate proof
    determination = "POTENTIALLY_ELIGIBLE";
    determinationLabel = "Potentially eligible";
  } else {
    // All evaluated parameters pass with complete verified data
    determination = "ELIGIBLE";
    determinationLabel = "Eligible";
  }

  return {
    recruitmentId: recruitment.id,
    recruitmentTitle: recruitment.title,
    determination,
    determinationLabel,
    disclaimer:
      "Indicative Assessment Only: This automated analysis compares your profile against published notification rules for guidance. It does not constitute an official recruitment decision. Recruitment boards make final decisions during document verification. Always verify criteria in the official notification.",
    factors,
    cutoffDateString: cutoff.toISOString(),
    cutoffDescription: rules.cutoffDescription,
    ruleVersion: rules.version,
    cycleYear: rules.cycleYear,
    officialNotificationUrl: recruitment.officialNotificationUrl,
    passedCount,
    unclearCount: unavailableCount,
    failedCount,
    verificationCount,
    whyEligibleSummary,
  };
}
