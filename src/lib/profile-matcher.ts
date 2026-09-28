import { RecruitmentItem, CandidateProfileData, EligibilityMatchResult } from "@/types";

/**
 * Evaluates candidate eligibility and personal match score against official recruitment criteria.
 * STRICT PRINCIPLE: Official recruitment data is never modified.
 * All outputs are derived candidate-specific match overlays.
 */
export function evaluateRecruitmentMatch(
  recruitment: RecruitmentItem,
  profile: CandidateProfileData | null | undefined
): EligibilityMatchResult {
  if (!profile || !profile.isCompleted) {
    return {
      score: 50,
      isAgeEligible: true,
      isDegreeEligible: true,
      isFeeExempt: false,
      ageRelaxationYears: 0,
      calculatedAge: null,
      reasons: [],
      highlights: ["Profile not completed - showing standard official criteria"],
    };
  }

  const highlights: string[] = [];
  const reasons: string[] = [];
  let score = 0;

  // 1. Calculate Age & Relaxations
  let calculatedAge: number | null = null;
  let ageRelaxationYears = 0;

  // Determine standard Indian reservation age relaxations
  if (profile.category === "SC" || profile.category === "ST") {
    ageRelaxationYears += 5;
  } else if (profile.category === "OBC") {
    ageRelaxationYears += 3;
  }

  if (profile.isPwD) {
    ageRelaxationYears += 10;
  }

  if (profile.isExServiceman) {
    ageRelaxationYears += 3;
  }

  let isAgeEligible = true;

  if (profile.dateOfBirth) {
    const dob = new Date(profile.dateOfBirth);
    const now = new Date();
    let age = now.getFullYear() - dob.getFullYear();
    const m = now.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) {
      age--;
    }
    calculatedAge = age;

    const effectiveMaxAge = (recruitment.maxAge || 40) + ageRelaxationYears;
    const effectiveMinAge = recruitment.minAge || 18;

    if (age < effectiveMinAge) {
      isAgeEligible = false;
      reasons.push(`Minimum age is ${effectiveMinAge} yrs (You are currently ${age} yrs)`);
    } else if (age > effectiveMaxAge) {
      isAgeEligible = false;
      reasons.push(
        `Age ${age} exceeds limit of ${recruitment.maxAge} yrs (even with +${ageRelaxationYears} yrs category relaxation)`
      );
    } else {
      score += 25;
      if (ageRelaxationYears > 0 && recruitment.maxAge && age > recruitment.maxAge) {
        highlights.push(`Eligible under ${profile.category} (+${ageRelaxationYears} yrs age relaxation)`);
      } else {
        highlights.push(`Age Eligible (${age} yrs)`);
      }
    }
  } else {
    // If no DOB provided, grant base age score
    score += 20;
  }

  // 2. Degree & Qualification Check
  let isDegreeEligible = false;
  const userQual = profile.highestQualification?.toUpperCase();
  const recruitmentQualCodes = recruitment.qualifications?.map((q) => q.qualificationCode.toUpperCase()) || [];

  const acceptsAnyGraduate = recruitmentQualCodes.includes("ANY_GRADUATE");
  const directMatch = userQual ? recruitmentQualCodes.includes(userQual) : false;

  // Graduates match ANY_GRADUATE
  const isGraduateTier = [
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
  ].includes(userQual || "");

  if (acceptsAnyGraduate && isGraduateTier) {
    isDegreeEligible = true;
    score += 35;
    highlights.push(`Degree Matched (${profile.degree || "Graduate Degree"})`);
  } else if (directMatch) {
    isDegreeEligible = true;
    score += 35;
    highlights.push(`Direct Specialisation Match (${userQual})`);
  } else if (recruitmentQualCodes.length === 0) {
    isDegreeEligible = true;
    score += 25;
  } else {
    reasons.push(`Requires specific qualifications: ${recruitmentQualCodes.join(", ")}`);
  }

  // 3. Application Fee Exemption Detection
  let isFeeExempt = false;
  const isFemale = profile.gender === "FEMALE";
  const isReserved = profile.category === "SC" || profile.category === "ST" || profile.isPwD;

  if ((isFemale || isReserved) && recruitment.appFeeReserved === 0 && (recruitment.appFeeGeneral || 0) > 0) {
    isFeeExempt = true;
    highlights.push(
      isFemale
        ? "🎉 100% Application Fee Exemption (Women candidates exempt)"
        : `🎉 100% Application Fee Exemption (${profile.category} / PwD exempt)`
    );
  }

  // 4. Sector & Board Preference
  if (profile.preferredSectors && profile.preferredSectors.length > 0) {
    const orgCat = recruitment.organization?.category;
    if (orgCat && profile.preferredSectors.includes(orgCat)) {
      score += 15;
      highlights.push(`Preferred Sector (${recruitment.organization.name})`);
    }
  } else {
    score += 10;
  }

  // 5. State & Location Match
  if (profile.preferredStates && profile.preferredStates.length > 0) {
    const examLocation = recruitment.stateLocation || "All India";
    const isAllIndia = examLocation.includes("All India");
    const matchesState = profile.preferredStates.some(
      (st) => examLocation.toLowerCase().includes(st.toLowerCase()) || st === "All India"
    );

    if (isAllIndia || matchesState) {
      score += 15;
      if (!isAllIndia) {
        highlights.push(`Target State Location (${examLocation})`);
      }
    }
  } else {
    score += 10;
  }

  // 6. Minimum Salary Preference
  if (profile.preferredMinSalary && profile.preferredMinSalary > 0) {
    const maxSalary = recruitment.inHandSalaryMax || recruitment.inHandSalaryMin || 0;
    if (maxSalary >= profile.preferredMinSalary) {
      score += 10;
      highlights.push(`Meets salary goal (₹${(recruitment.inHandSalaryMin || 0).toLocaleString()}+ / mo)`);
    }
  } else {
    score += 10;
  }

  // Normalize final score between 10 and 100
  const finalScore = Math.min(100, Math.max(10, Math.round(score)));

  return {
    score: finalScore,
    isAgeEligible,
    isDegreeEligible,
    isFeeExempt,
    ageRelaxationYears,
    calculatedAge,
    reasons,
    highlights,
  };
}
