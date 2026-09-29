export type Role = "USER" | "ADMIN";

export type RecruitmentStatus = 
  | "ACTIVE" 
  | "CLOSING_SOON" 
  | "EXAM_SCHEDULED" 
  | "ADMIT_CARD_OUT" 
  | "RESULT_OUT" 
  | "COMPLETED" 
  | "CANCELLED";

export type StageAdmitCardStatus = "NOT_ANNOUNCED" | "UPCOMING" | "RELEASED";
export type StageResultStatus = "NOT_ANNOUNCED" | "UPCOMING" | "RELEASED";

export type ApplicationOverallStatus = 
  | "APPLIED" 
  | "IN_PROGRESS" 
  | "SELECTED_STAGE" 
  | "FINAL_SELECTED" 
  | "NOT_SELECTED" 
  | "WITHDRAWN";

export type StageProgressStatus = 
  | "PENDING" 
  | "ADMIT_CARD_AVAILABLE" 
  | "EXAM_SCHEDULED" 
  | "EXAM_COMPLETED" 
  | "RESULT_AVAILABLE" 
  | "SELECTED_FOR_NEXT" 
  | "NOT_SELECTED" 
  | "FINAL_SELECTED";

export type UserStageOutcome = 
  | "SELECTED_FOR_NEXT" 
  | "NOT_SELECTED" 
  | "FINAL_SELECTED" 
  | "AWAITED";

export type ReminderType = 
  | "APP_DEADLINE" 
  | "EXAM_DATE" 
  | "REPORTING_TIME" 
  | "ADMIT_CARD" 
  | "RESULT" 
  | "NEXT_ROUND" 
  | "CUSTOM";

export type ReminderPreset = 
  | "7_DAYS_BEFORE" 
  | "3_DAYS_BEFORE" 
  | "1_DAY_BEFORE" 
  | "CUSTOM";

export type NotificationType = "INFO" | "ALERT" | "SUCCESS" | "WARNING";

export type CandidateCategory = "UR" | "OBC" | "SC" | "ST" | "EWS";
export type CandidateGender = "MALE" | "FEMALE" | "TRANSGENDER" | "OTHER";

export interface CandidateProfileData {
  id?: string;
  userId?: string;
  highestQualification?: string | null;
  degree?: string | null;
  branch?: string | null;
  graduationYear?: number | null;
  percentage?: number | null;
  dateOfBirth?: string | null;
  gender?: CandidateGender | null;
  category?: CandidateCategory | null;
  isPwD: boolean;
  pwDType?: string | null;
  isExServiceman: boolean;
  preferredStates: string[];
  preferredCities: string[];
  preferredDepartments: string[];
  preferredSectors: string[];
  preferredJobTypes: string[];
  preferredMinSalary?: number | null;
  willingToRelocate: boolean;
  languagesKnown: string[];
  skills: string[];

  // Advanced Eligibility Attributes (Optional)
  nationality?: string | null;
  physicalHeightCm?: number | null;
  hasDrivingLicense?: boolean;
  licenseType?: string | null;
  attemptsCount?: number | null;
  certifications?: string[];

  isCompleted: boolean;
  isPrivate: boolean;
}

export type EligibilityDeterminationStatus =
  | "ELIGIBLE"
  | "POTENTIALLY_ELIGIBLE"
  | "ELIGIBILITY_UNCLEAR"
  | "NOT_ELIGIBLE";

export type EligibilityFactorStatus =
  | "PASSED"
  | "FAILED"
  | "CONDITION_REQUIRES_VERIFICATION"
  | "DATA_UNAVAILABLE"
  | "NOT_APPLICABLE";

export type EligibilityFactorCode =
  | "MIN_AGE"
  | "MAX_AGE"
  | "CUTOFF_DATE"
  | "QUALIFICATION"
  | "DEGREE_SPECIALIZATION"
  | "BRANCH"
  | "PERCENTAGE"
  | "CGPA"
  | "EXPERIENCE"
  | "ATTEMPTS"
  | "CATEGORY_RELAXATION"
  | "GENDER_CONDITIONS"
  | "NATIONALITY"
  | "PHYSICAL_REQUIREMENTS"
  | "PROFESSIONAL_CERTIFICATIONS"
  | "LICENSE_REQUIREMENTS"
  | "LOCATION_CONDITIONS";

export interface EligibilityFactorResult {
  factorCode: EligibilityFactorCode;
  factorName: string;
  categoryGroup: "AGE_AND_DEMOGRAPHICS" | "ACADEMICS" | "EXPERIENCE_AND_ATTEMPTS" | "TECHNICAL_AND_PHYSICAL";
  status: EligibilityFactorStatus;
  badgeLabel: string;
  explanation: string; // e.g. "✓ Degree requirement matched", "⚠ Category-specific condition requires verification", "Eligibility cannot be determined from the available information."
  candidateValueDisplay: string;
  ruleRequirementDisplay: string;
  officialNotificationClause?: string | null;
  isDataMissing: boolean;
}

export interface EligibilityAnalysisResult {
  recruitmentId: string;
  recruitmentTitle: string;
  determination: EligibilityDeterminationStatus; // ELIGIBLE | POTENTIALLY_ELIGIBLE | ELIGIBILITY_UNCLEAR | NOT_ELIGIBLE
  determinationLabel: "Eligible" | "Potentially eligible" | "Eligibility unclear" | "Not eligible";
  disclaimer: string;
  factors: EligibilityFactorResult[];
  cutoffDateString?: string | null;
  cutoffDescription?: string | null;
  ruleVersion: string;
  cycleYear: number;
  officialNotificationUrl: string;
  passedCount: number;
  unclearCount: number;
  failedCount: number;
  verificationCount: number;
  whyEligibleSummary: string[];
}

export interface ConfiguredEligibilityRules {
  version: string;
  cycleYear: number;
  cutoffDate?: string | null;
  cutoffDescription?: string | null;
  minAge?: number | null;
  maxAge?: number | null;
  categoryRelaxations?: Record<string, number>; // e.g. { "OBC": 3, "SC": 5, "ST": 5, "PwD": 10, "ESM": 3 }
  qualificationsAllowed?: string[]; // e.g. ["ANY_GRADUATE", "BTECH", "BE"]
  allowedDegrees?: string[]; // e.g. ["B.Tech", "B.E.", "B.Com"]
  allowedBranches?: string[]; // e.g. ["Computer Science", "Information Technology", "Any"]
  minPercentage?: number | null; // e.g. 60.0
  minCgpa?: number | null; // e.g. 6.5
  minExperienceYears?: number | null;
  fresherAllowed?: boolean;
  maxAttempts?: Record<string, number | "UNLIMITED">; // e.g. { "UR": 6, "OBC": 9, "SC": "UNLIMITED", "ST": "UNLIMITED" }
  genderConditions?: {
    allowedGenders?: string[];
    specialConditions?: string;
  };
  nationalityRequired?: string[]; // e.g. ["Citizen of India", "Subject of Nepal", "Subject of Bhutan"]
  physicalRequirements?: {
    minHeightMaleCm?: number;
    minHeightFemaleCm?: number;
    chestExpansionCm?: number;
    eyesightCriteria?: string;
    details?: string;
  };
  certificationsRequired?: string[]; // e.g. ["CCC Computer Certificate", "GATE 2026 Qualified"]
  licenseRequired?: {
    required: boolean;
    type?: string; // e.g. "LMV (Light Motor Vehicle)"
    details?: string;
  };
  locationConditions?: {
    stateSpecific?: string[]; // e.g. ["Uttar Pradesh", "Karnataka"]
    domicileRequired?: boolean;
    languageProficiency?: string;
  };
  officialClauseReference?: string;
}

export interface EligibilityMatchResult {
  score: number; // 0 - 100
  isAgeEligible: boolean;
  isDegreeEligible: boolean;
  isFeeExempt: boolean;
  ageRelaxationYears: number;
  calculatedAge: number | null;
  reasons: string[];
  highlights: string[];
  analysis?: EligibilityAnalysisResult;
}

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: Role;
  profile?: CandidateProfileData | null;
}

export interface ShiftSlot {
  id: string;
  stageId: string;
  examDate: string;
  shiftNumber: number;
  shiftName: string;
  startTime: string;
  endTime: string;
  reportingTime?: string | null;
  instructions?: string | null;
}

export interface StageDetails {
  id: string;
  recruitmentId: string;
  stageOrder: number;
  stageName: string;
  description?: string | null;
  eligibilityNote?: string | null;
  admitCardUrl?: string | null;
  resultUrl?: string | null;
  admitCardStatus: StageAdmitCardStatus;
  resultStatus: StageResultStatus;
  status: string;
  schedules: ShiftSlot[];
}

export interface RecruitmentItem {
  id: string;
  title: string;
  notificationNumber?: string | null;
  shortDescription: string;
  fullDescription: string;
  vacancies?: number | null;
  totalVacanciesNote?: string | null;
  fresherEligible: boolean;
  experienceReq?: string | null;
  minAge?: number | null;
  maxAge?: number | null;
  ageRelaxationDetails?: string | null;
  payScale: string;
  inHandSalaryMin?: number | null;
  inHandSalaryMax?: number | null;
  allowances?: string | null;
  appStartDate?: string | null;
  appDeadline?: string | null;
  appFeeGeneral?: number | null;
  appFeeReserved?: number | null;
  officialNotificationUrl: string;
  officialApplyUrl: string;
  officialAdmitCardUrl?: string | null;
  officialResultUrl?: string | null;
  status: RecruitmentStatus;
  stateLocation?: string | null;
  syllabusSummary?: string | null;
  examPatternJson?: string | null;
  selectionProcessSummary?: string | null;
  lastOfficialVerifiedAt: string;
  organization: {
    id: string;
    name: string;
    shortName: string;
    category: string;
    officialWebsite: string;
    logoUrl?: string | null;
  };
  posts: Array<{
    id: string;
    postName: string;
    postCode?: string | null;
    vacancies?: number | null;
    department?: string | null;
    qualifications: string;
    branchRequirements?: string | null;
  }>;
  qualifications: Array<{
    id: string;
    qualificationCode: string;
    stream?: string | null;
  }>;
  stages: StageDetails[];
  changeHistory?: Array<{
    id: string;
    changedField: string;
    oldValue: string;
    newValue: string;
    changeReason?: string | null;
    detectedAt: string;
  }>;
}

export interface UserPersonalExamSchedule {
  id: string;
  stageProgressId: string;
  selectedScheduleId?: string | null;
  examDate: string;
  shiftName: string;
  examTime: string;
  reportingTime?: string | null;
  examCenterName?: string | null;
  centerAddress?: string | null;
  notes?: string | null;
}

export interface UserStageProgressItem {
  id: string;
  stageId: string;
  stage: StageDetails;
  status: StageProgressStatus;
  outcome?: UserStageOutcome | null;
  userNotes?: string | null;
  completedAt?: string | null;
  examSchedule?: UserPersonalExamSchedule | null;
}

export interface TrackedApplication {
  id: string;
  userId: string;
  recruitmentId: string;
  recruitment: RecruitmentItem;
  appliedDate: string;
  registrationNumber?: string | null;
  rollNumber?: string | null;
  currentStageOrder: number;
  overallStatus: ApplicationOverallStatus;
  notes?: string | null;
  stageProgress: UserStageProgressItem[];
  reminders: Array<{
    id: string;
    reminderType: ReminderType;
    title: string;
    scheduledFor: string;
    isTriggered: boolean;
  }>;
}

export interface FilterState {
  search: string;
  qualification: string;
  fresherOnly: boolean;
  experienceRequired: boolean;
  ageMax?: number;
  salaryMin?: number;
  category: string;
  stateLocation?: string;
  status: string;
  sortBy: "newest" | "closing_soon" | "exam_date" | "salary" | "vacancies";
}

// ==========================================
// Application Preparation Checklist Types
// ==========================================
export type ChecklistStageCategory =
  | "BEFORE_APPLYING"
  | "DOCUMENT_PREP"
  | "APPLICATION_FORM"
  | "POST_SUBMISSION";

export interface RecruitmentChecklistItemData {
  id: string;
  recruitmentId?: string | null;
  title: string;
  description?: string | null;
  stageCategory: ChecklistStageCategory;
  itemOrder: number;
  isRequired: boolean;
  isDefault: boolean;
}

export interface UserChecklistItemData {
  id: string;
  userId: string;
  recruitmentId: string;
  templateItemId?: string | null;
  title: string;
  stageCategory: ChecklistStageCategory;
  isCompleted: boolean;
  completedAt?: string | null;
  notes?: string | null;
  isCustom: boolean;
  createdAt: string;
}

// ==========================================
// 35. Application Reference & Receipt Vault Types
// ==========================================
export interface ApplicationVaultData {
  id: string;
  userId: string;
  recruitmentId: string;
  recruitment?: RecruitmentItem;
  applicationNumber?: string | null;
  registrationNumber?: string | null;
  rollNumber?: string | null;
  portalUserId?: string | null;
  paymentReference?: string | null;
  transactionId?: string | null;
  submissionDate?: string | null;
  applicationPdfUrl?: string | null;
  paymentReceiptUrl?: string | null;
  personalNotes?: string | null;
  isGovernmentVerified: boolean;
  verificationDisclaimer: string;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// 37. Saved Searches & 38. New-Match Discovery
// ==========================================
export interface SavedSearchData {
  id: string;
  userId: string;
  name: string;
  searchQuery?: string | null;
  filtersJson: string;
  filters?: Partial<FilterState>;
  sortPreference: string;
  notifyNewMatches: boolean;
  lastMatchedCount: number;
  lastCheckedAt: string;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// 39. Bookmarking & Shortlisting Types
// ==========================================
export type ShortlistLifecycleState =
  | "BOOKMARKED"
  | "INTERESTED"
  | "APPLIED"
  | "COMPLETED";

export interface RecruitmentShortlistData {
  id: string;
  userId: string;
  recruitmentId: string;
  recruitment: RecruitmentItem;
  lifecycleState: ShortlistLifecycleState;
  priority: "HIGH" | "MEDIUM" | "LOW";
  personalNotes?: string | null;
  targetPrepDays?: number | null;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// 36. Recruitment Comparison Types
// ==========================================
export interface RecruitmentComparisonAttribute {
  key: string;
  label: string;
  category: "ELIGIBILITY" | "COMPENSATION" | "DATES" | "PROCESS";
  values: Record<string, string | number | null | undefined>; // recruitmentId -> display value
}

