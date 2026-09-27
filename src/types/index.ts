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

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: Role;
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
  status: string;
  sortBy: "newest" | "closing_soon" | "exam_date" | "salary" | "vacancies";
}
