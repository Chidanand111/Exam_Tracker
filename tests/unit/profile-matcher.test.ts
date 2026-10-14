import { describe, it, expect } from "vitest";
import { evaluateRecruitmentMatch } from "@/lib/profile-matcher";
import { RecruitmentItem, CandidateProfileData } from "@/types";

describe("evaluateRecruitmentMatch - Core Eligibility & Reservation Engine", () => {
  const baseRecruitment: RecruitmentItem = {
    id: "rec_ssc_cgl",
    title: "SSC CGL 2026",
    shortDescription: "Combined Graduate Level",
    fullDescription: "Group B and C Posts",
    fresherEligible: true,
    minAge: 18,
    maxAge: 30,
    payScale: "Level 7",
    appFeeGeneral: 100,
    appFeeReserved: 0,
    officialNotificationUrl: "https://ssc.gov.in",
    officialApplyUrl: "https://ssc.gov.in",
    status: "ACTIVE",
    lastOfficialVerifiedAt: new Date().toISOString(),
    qualifications: [
      {
        id: "q_1",
        qualificationCode: "ANY_GRADUATE",
        stream: null,
      },
    ],
    stages: [],
    posts: [],
    organization: {
      id: "org_ssc",
      name: "Staff Selection Commission",
      shortName: "SSC",
      category: "CENTRAL",
      officialWebsite: "https://ssc.gov.in",
    },
  };

  const createProfile = (partial: Partial<CandidateProfileData>): CandidateProfileData => ({
    highestQualification: "ANY_GRADUATE",
    category: "UR",
    gender: "MALE",
    isPwD: false,
    isExServiceman: false,
    isPrivate: true,
    preferredStates: ["All India"],
    preferredCities: [],
    preferredDepartments: [],
    preferredSectors: [],
    preferredJobTypes: [],
    willingToRelocate: true,
    languagesKnown: ["English", "Hindi"],
    skills: [],
    isCompleted: true,
    ...partial,
  });

  it("should grant +5 years age relaxation for SC/ST candidate over standard max age", () => {
    // Candidate age 33 (standard limit is 30, SC/ST gets +5 = 35 max age)
    const birthYear = new Date().getFullYear() - 33;
    const profile = createProfile({
      highestQualification: "BTECH",
      category: "SC",
      gender: "MALE",
      dateOfBirth: `${birthYear}-01-15`,
    });

    const match = evaluateRecruitmentMatch(baseRecruitment, profile);
    expect(match.isAgeEligible).toBe(true);
    expect(match.ageRelaxationYears).toBe(5);
    expect(match.highlights.some((h) => h.includes("SC (+5 yrs age relaxation)"))).toBe(true);
  });

  it("should detect 100% fee waiver for female candidates when appFeeReserved is 0", () => {
    const profile = createProfile({
      highestQualification: "BCOM",
      category: "UR",
      gender: "FEMALE",
      dateOfBirth: `${new Date().getFullYear() - 24}-05-20`,
    });

    const match = evaluateRecruitmentMatch(baseRecruitment, profile);
    expect(match.isFeeExempt).toBe(true);
    expect(match.highlights.some((h) => h.includes("100% Application Fee Exemption"))).toBe(true);
  });

  it("should match ANY_GRADUATE recruitment for B.Tech, B.Sc, B.Com, B.A graduates", () => {
    const profile = createProfile({
      highestQualification: "BTECH",
      degree: "B.Tech Computer Science",
      category: "UR",
      gender: "MALE",
      dateOfBirth: `${new Date().getFullYear() - 23}-03-10`,
    });

    const match = evaluateRecruitmentMatch(baseRecruitment, profile);
    expect(match.isDegreeEligible).toBe(true);
    expect(match.highlights.some((h) => h.includes("Degree Matched"))).toBe(true);
  });

  it("should report non-eligible when candidate age exceeds effective relaxed limit", () => {
    // Age 37 exceeds SC limit (30 + 5 = 35)
    const birthYear = new Date().getFullYear() - 37;
    const profile = createProfile({
      highestQualification: "BA",
      category: "SC",
      gender: "MALE",
      dateOfBirth: `${birthYear}-01-15`,
    });

    const match = evaluateRecruitmentMatch(baseRecruitment, profile);
    expect(match.isAgeEligible).toBe(false);
    expect(match.reasons.some((r) => r.toLowerCase().includes("exceed"))).toBe(true);
  });
});
