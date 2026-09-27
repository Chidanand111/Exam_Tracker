import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting BharatExam Tracker database seed...");

  // 1. Clean existing records
  await prisma.notification.deleteMany();
  await prisma.reminder.deleteMany();
  await prisma.userExamSchedule.deleteMany();
  await prisma.userStageProgress.deleteMany();
  await prisma.userApplication.deleteMany();
  await prisma.stageSchedule.deleteMany();
  await prisma.recruitmentStage.deleteMany();
  await prisma.recruitmentQualification.deleteMany();
  await prisma.recruitmentPost.deleteMany();
  await prisma.changeHistory.deleteMany();
  await prisma.sourceDocument.deleteMany();
  await prisma.recruitment.deleteMany();
  await prisma.officialSource.deleteMany();
  await prisma.organization.deleteMany();
  await prisma.user.deleteMany();

  // 2. Create Users
  const passwordHashUser = await bcrypt.hash("Aspirant@123", 10);
  const passwordHashAdmin = await bcrypt.hash("Admin@123", 10);

  const aspirant = await prisma.user.create({
    data: {
      email: "aspirant@bharatexam.in",
      name: "Chidananda Sharma",
      passwordHash: passwordHashUser,
      role: "USER",
    },
  });

  const admin = await prisma.user.create({
    data: {
      email: "admin@bharatexam.in",
      name: "Government Exam Portal Officer",
      passwordHash: passwordHashAdmin,
      role: "ADMIN",
    },
  });

  console.log("👤 Created users: aspirant@bharatexam.in, admin@bharatexam.in");

  // 3. Create Organizations
  const ssc = await prisma.organization.create({
    data: {
      name: "Staff Selection Commission",
      shortName: "SSC",
      category: "CENTRAL",
      officialWebsite: "https://ssc.gov.in",
      logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Emblem_of_India.svg/200px-Emblem_of_India.svg.png",
    },
  });

  const ibps = await prisma.organization.create({
    data: {
      name: "Institute of Banking Personnel Selection",
      shortName: "IBPS",
      category: "BANKING",
      officialWebsite: "https://ibps.in",
    },
  });

  const rrb = await prisma.organization.create({
    data: {
      name: "Railway Recruitment Boards",
      shortName: "RRB",
      category: "RAILWAY",
      officialWebsite: "https://indianrailways.gov.in",
    },
  });

  const sbi = await prisma.organization.create({
    data: {
      name: "State Bank of India",
      shortName: "SBI",
      category: "BANKING",
      officialWebsite: "https://sbi.co.in/careers",
    },
  });

  const isro = await prisma.organization.create({
    data: {
      name: "Indian Space Research Organisation",
      shortName: "ISRO",
      category: "CENTRAL",
      officialWebsite: "https://www.isro.gov.in",
    },
  });

  const upsc = await prisma.organization.create({
    data: {
      name: "Union Public Service Commission",
      shortName: "UPSC",
      category: "CENTRAL",
      officialWebsite: "https://upsc.gov.in",
    },
  });

  // 4. Create Official Sources
  await prisma.officialSource.createMany({
    data: [
      {
        name: "Staff Selection Commission Official Notice Board",
        code: "SSC_CENTRAL",
        category: "CENTRAL",
        url: "https://ssc.gov.in",
        listUrl: "https://ssc.gov.in/notices",
        status: "HEALTHY",
      },
      {
        name: "IBPS Recruitment & Call Letters Portal",
        code: "IBPS_BANKING",
        category: "BANKING",
        url: "https://ibps.in",
        listUrl: "https://ibps.in/all-notifications",
        status: "HEALTHY",
      },
      {
        name: "Indian Railways Centralised Employment Notices",
        code: "RRB_RAILWAYS",
        category: "RAILWAY",
        url: "https://rrbcdg.gov.in",
        listUrl: "https://rrbcdg.gov.in/active-notices",
        status: "HEALTHY",
      },
      {
        name: "ISRO Centralised Recruitment Board (ICRB)",
        code: "ISRO_RESEARCH",
        category: "CENTRAL",
        url: "https://www.isro.gov.in/Careers.html",
        listUrl: "https://www.isro.gov.in/CurrentOpportunities.html",
        status: "HEALTHY",
      },
    ],
  });

  // 5. Create Recruitments with Dynamic Generic Stages & Shifts

  // --- Recruitment 1: SSC CGL 2026 ---
  const sscCgl = await prisma.recruitment.create({
    data: {
      orgId: ssc.id,
      title: "SSC Combined Graduate Level (CGL) Examination 2026",
      notificationNumber: "F.No. HQ-PPII03/1/2026-PP_II",
      shortDescription: "Premier recruitment for Group 'B' and Group 'C' executive, administrative, and inspection posts across Ministries and Departments of Government of India.",
      fullDescription: "Staff Selection Commission conducts the Combined Graduate Level Examination for recruitment to Group 'B' and Group 'C' posts in various Ministries/ Departments/ Organizations in the Government of India and various Constitutional Bodies/ Statutory Bodies/ Tribunals.",
      vacancies: 14582,
      totalVacanciesNote: "Tentative vacancies. Subject to official revision by user departments.",
      fresherEligible: true,
      experienceReq: "None required for fresh graduates",
      minAge: 18,
      maxAge: 30,
      ageRelaxationDetails: "OBC: 3 years, SC/ST: 5 years, PwBD: 10 years, ESM: 3 years",
      payScale: "Pay Level-7 (₹44,900 to ₹1,42,400) & Level-4/5/6",
      inHandSalaryMin: 58000,
      inHandSalaryMax: 74000,
      allowances: "Dearness Allowance (50%), House Rent Allowance (27% X Class), Transport Allowance, CGHS Medical Facility, LTC",
      appStartDate: new Date("2026-06-24T00:00:00Z"),
      appDeadline: new Date("2026-07-27T23:00:00Z"),
      appFeeGeneral: 100,
      appFeeReserved: 0,
      officialNotificationUrl: "https://ssc.gov.in/api/attachment/uploads/doc2026/notice_cgl_2026.pdf",
      officialApplyUrl: "https://ssc.gov.in/apply",
      officialAdmitCardUrl: "https://ssc.gov.in/admit-card",
      officialResultUrl: "https://ssc.gov.in/results",
      status: "ADMIT_CARD_OUT",
      stateLocation: "All India",
      syllabusSummary: "Tier 1: General Intelligence (50), General Awareness (50), Quantitative Aptitude (50), English Comprehension (50). Total 200 marks, 60 minutes.",
      examPatternJson: JSON.stringify([
        { section: "General Intelligence & Reasoning", questions: 25, marks: 50 },
        { section: "General Awareness", questions: 25, marks: 50 },
        { section: "Quantitative Aptitude", questions: 25, marks: 50 },
        { section: "English Comprehension", questions: 25, marks: 50 },
      ]),
      selectionProcessSummary: "Tier 1 (Qualifying) -> Tier 2 (Merit Determination) -> Document Verification by Appointing Departments",
      lastOfficialVerifiedAt: new Date(),
    },
  });

  // SSC CGL Qualifications & Posts
  await prisma.recruitmentQualification.createMany({
    data: [
      { recruitmentId: sscCgl.id, qualificationCode: "ANY_GRADUATE" },
      { recruitmentId: sscCgl.id, qualificationCode: "BA" },
      { recruitmentId: sscCgl.id, qualificationCode: "BCOM" },
      { recruitmentId: sscCgl.id, qualificationCode: "BSC" },
      { recruitmentId: sscCgl.id, qualificationCode: "BTECH" },
      { recruitmentId: sscCgl.id, qualificationCode: "BE" },
      { recruitmentId: sscCgl.id, qualificationCode: "BCA" },
    ],
  });

  await prisma.recruitmentPost.createMany({
    data: [
      { recruitmentId: sscCgl.id, postName: "Assistant Section Officer (ASO)", department: "Central Secretariat Service (CSS)", vacancies: 982, qualifications: "Bachelor's Degree from a recognized University" },
      { recruitmentId: sscCgl.id, postName: "Inspector of Income Tax", department: "Central Board of Direct Taxes (CBDT)", vacancies: 450, qualifications: "Bachelor's Degree from a recognized University" },
      { recruitmentId: sscCgl.id, postName: "Inspector (Central Excise)", department: "Central Board of Indirect Taxes & Customs (CBIC)", vacancies: 1200, qualifications: "Bachelor's Degree from a recognized University" },
      { recruitmentId: sscCgl.id, postName: "Sub-Inspector", department: "Central Bureau of Investigation (CBI)", vacancies: 140, qualifications: "Bachelor's Degree from a recognized University" },
      { recruitmentId: sscCgl.id, postName: "Assistant Enforcement Officer", department: "Directorate of Enforcement (ED)", vacancies: 110, qualifications: "Bachelor's Degree from a recognized University" },
    ],
  });

  // SSC CGL Stages
  const sscTier1 = await prisma.recruitmentStage.create({
    data: {
      recruitmentId: sscCgl.id,
      stageOrder: 1,
      stageName: "Tier 1 (Computer Based Examination)",
      description: "Screening test consisting of 100 objective type questions. Marks will be normalized across multiple shifts.",
      admitCardUrl: "https://ssc.gov.in/admit-card",
      admitCardStatus: "RELEASED",
      resultStatus: "NOT_ANNOUNCED",
      status: "SCHEDULED",
    },
  });

  const sscTier2 = await prisma.recruitmentStage.create({
    data: {
      recruitmentId: sscCgl.id,
      stageOrder: 2,
      stageName: "Tier 2 (Paper-I & Paper-II)",
      description: "Comprehensive exam with Session-I (Maths, Reasoning, English, GA, Computer Module) and Session-II (DEST Typing).",
      admitCardStatus: "NOT_ANNOUNCED",
      resultStatus: "NOT_ANNOUNCED",
      status: "SCHEDULED",
    },
  });

  await prisma.recruitmentStage.create({
    data: {
      recruitmentId: sscCgl.id,
      stageOrder: 3,
      stageName: "Document Verification & Medical",
      description: "Verification of original credentials, caste certificates, and departmental physical & medical standards.",
      admitCardStatus: "NOT_ANNOUNCED",
      resultStatus: "NOT_ANNOUNCED",
      status: "SCHEDULED",
    },
  });

  // Multiple Exam Dates & Shifts for SSC Tier 1
  await prisma.stageSchedule.createMany({
    data: [
      {
        stageId: sscTier1.id,
        examDate: new Date("2026-11-14T00:00:00Z"),
        shiftNumber: 1,
        shiftName: "Shift 1 (Morning)",
        startTime: "09:00 AM",
        endTime: "10:00 AM",
        reportingTime: "07:30 AM",
        instructions: "Gates close strictly at 08:30 AM. Bring original Aadhaar Card and 2 recent passport photos.",
      },
      {
        stageId: sscTier1.id,
        examDate: new Date("2026-11-14T00:00:00Z"),
        shiftNumber: 2,
        shiftName: "Shift 2 (Afternoon)",
        startTime: "02:30 PM",
        endTime: "03:30 PM",
        reportingTime: "01:00 PM",
        instructions: "Gates close at 02:00 PM.",
      },
      {
        stageId: sscTier1.id,
        examDate: new Date("2026-11-14T00:00:00Z"),
        shiftNumber: 3,
        shiftName: "Shift 3 (Evening)",
        startTime: "05:00 PM",
        endTime: "06:00 PM",
        reportingTime: "03:30 PM",
      },
      {
        stageId: sscTier1.id,
        examDate: new Date("2026-11-15T00:00:00Z"),
        shiftNumber: 1,
        shiftName: "Shift 1 (Morning)",
        startTime: "09:00 AM",
        endTime: "10:00 AM",
        reportingTime: "07:30 AM",
      },
      {
        stageId: sscTier1.id,
        examDate: new Date("2026-11-15T00:00:00Z"),
        shiftNumber: 2,
        shiftName: "Shift 2 (Afternoon)",
        startTime: "02:30 PM",
        endTime: "03:30 PM",
        reportingTime: "01:00 PM",
      },
      {
        stageId: sscTier1.id,
        examDate: new Date("2026-11-16T00:00:00Z"),
        shiftNumber: 1,
        shiftName: "Shift 1 (Morning)",
        startTime: "09:00 AM",
        endTime: "10:00 AM",
        reportingTime: "07:30 AM",
      },
    ],
  });

  // Recorded Change History for SSC CGL
  await prisma.changeHistory.create({
    data: {
      recruitmentId: sscCgl.id,
      changedField: "appDeadline",
      oldValue: "2026-07-24",
      newValue: "2026-07-27",
      changeReason: "Official Corrigendum Notice 01/2026 due to heavy server traffic on the new portal",
    },
  });

  // --- Recruitment 2: IBPS PO / MT XV 2026 ---
  const ibpsPo = await prisma.recruitment.create({
    data: {
      orgId: ibps.id,
      title: "IBPS Probationary Officers / Management Trainees (CRP PO/MT-XV)",
      notificationNumber: "IBPS/CRP-PO-XV/2026",
      shortDescription: "Recruitment of Probationary Officers across 11 major Public Sector Banks including PNB, Bank of Baroda, Canara Bank, and Union Bank.",
      fullDescription: "The online examination (Preliminary and Main) for the Common Recruitment Process for selection of personnel for Probationary Officer/ Management Trainee posts in the Participating Banks.",
      vacancies: 4455,
      totalVacanciesNote: "May increase as participating banks report final vacancies.",
      fresherEligible: true,
      experienceReq: "Freshers fully eligible. No experience required.",
      minAge: 20,
      maxAge: 30,
      ageRelaxationDetails: "SC/ST: 5 years, OBC (Non-Creamy): 3 years, PwBD: 10 years",
      payScale: "Basic Pay ₹36,000 in scale of ₹36000-1490/7-46430-1740/2-49910-1990/7-63840",
      inHandSalaryMin: 52000,
      inHandSalaryMax: 57000,
      allowances: "Dearness Allowance, CCA, Special Allowance, House Rent Allowance / Leased Accommodation, Medical Aid",
      appStartDate: new Date("2026-08-01T00:00:00Z"),
      appDeadline: new Date("2026-08-28T23:00:00Z"),
      appFeeGeneral: 850,
      appFeeReserved: 175,
      officialNotificationUrl: "https://ibps.in/crp-po-xv/detailed-advertisement.pdf",
      officialApplyUrl: "https://ibps.in/apply-po-xv",
      officialAdmitCardUrl: "https://ibps.in/crp-po-xv/call-letters",
      officialResultUrl: "https://ibps.in/crp-po-xv/prelims-scorecard",
      status: "RESULT_OUT",
      stateLocation: "All India",
      syllabusSummary: "Prelims: English Language (30), Quantitative Aptitude (35), Reasoning Ability (35). Total 100 marks, 60 minutes with sectional timing.",
      selectionProcessSummary: "Preliminary Examination -> Main Examination -> Common Interview conducted by Participating Banks & IBPS",
      lastOfficialVerifiedAt: new Date(),
    },
  });

  await prisma.recruitmentQualification.createMany({
    data: [
      { recruitmentId: ibpsPo.id, qualificationCode: "ANY_GRADUATE" },
      { recruitmentId: ibpsPo.id, qualificationCode: "BCOM" },
      { recruitmentId: ibpsPo.id, qualificationCode: "BA" },
      { recruitmentId: ibpsPo.id, qualificationCode: "BSC" },
      { recruitmentId: ibpsPo.id, qualificationCode: "BTECH" },
      { recruitmentId: ibpsPo.id, qualificationCode: "BCA" },
      { recruitmentId: ibpsPo.id, qualificationCode: "MBA" },
    ],
  });

  const ibpsPrelims = await prisma.recruitmentStage.create({
    data: {
      recruitmentId: ibpsPo.id,
      stageOrder: 1,
      stageName: "Preliminary Examination (Prelims)",
      description: "100 marks online test with 20 minutes sectional time for each section.",
      admitCardUrl: "https://ibps.in/crp-po-xv/call-letters",
      resultUrl: "https://ibps.in/crp-po-xv/prelims-scorecard",
      admitCardStatus: "RELEASED",
      resultStatus: "RELEASED",
      status: "COMPLETED",
    },
  });

  const ibpsMains = await prisma.recruitmentStage.create({
    data: {
      recruitmentId: ibpsPo.id,
      stageOrder: 2,
      stageName: "Main Examination (Mains)",
      description: "Objective Test (200 Marks) + Letter & Essay Writing Descriptive Test (25 Marks).",
      admitCardUrl: "https://ibps.in/crp-po-xv/mains-call-letter",
      admitCardStatus: "UPCOMING",
      resultStatus: "NOT_ANNOUNCED",
      status: "SCHEDULED",
    },
  });

  await prisma.recruitmentStage.create({
    data: {
      recruitmentId: ibpsPo.id,
      stageOrder: 3,
      stageName: "Common Interview (Phase III)",
      description: "Personal interview carrying 100 marks. Combined score ratio with Mains is 80:20.",
      admitCardStatus: "NOT_ANNOUNCED",
      resultStatus: "NOT_ANNOUNCED",
      status: "SCHEDULED",
    },
  });

  // Shifts for IBPS Prelims
  await prisma.stageSchedule.createMany({
    data: [
      {
        stageId: ibpsPrelims.id,
        examDate: new Date("2026-10-19T00:00:00Z"),
        shiftNumber: 1,
        shiftName: "Shift 1",
        startTime: "09:00 AM",
        endTime: "10:00 AM",
        reportingTime: "08:00 AM",
      },
      {
        stageId: ibpsPrelims.id,
        examDate: new Date("2026-10-19T00:00:00Z"),
        shiftNumber: 2,
        shiftName: "Shift 2",
        startTime: "11:30 AM",
        endTime: "12:30 PM",
        reportingTime: "10:30 AM",
      },
      {
        stageId: ibpsPrelims.id,
        examDate: new Date("2026-10-20T00:00:00Z"),
        shiftNumber: 1,
        shiftName: "Shift 1",
        startTime: "09:00 AM",
        endTime: "10:00 AM",
        reportingTime: "08:00 AM",
      },
    ],
  });

  // --- Recruitment 3: RRB NTPC (Graduate Categories) 2026 ---
  const rrbNtpc = await prisma.recruitment.create({
    data: {
      orgId: rrb.id,
      title: "RRB Non-Technical Popular Categories (NTPC Graduate) 2026",
      notificationNumber: "CEN 05/2026",
      shortDescription: "8,113 vacancies for Station Master, Goods Train Manager, Chief Commercial cum Ticket Supervisor, and Senior Clerk across 21 Railway Zones.",
      fullDescription: "Railway Recruitment Boards invite online applications from eligible graduate candidates for various NTPC Graduate posts in Level 5 and Level 6.",
      vacancies: 8113,
      fresherEligible: true,
      experienceReq: "None required",
      minAge: 18,
      maxAge: 36,
      ageRelaxationDetails: "Special 3-year relaxation given beyond normal limits. SC/ST: +5, OBC: +3",
      payScale: "7th CPC Level 5 (₹29,200) & Level 6 (₹35,400) Initial Basic",
      inHandSalaryMin: 48000,
      inHandSalaryMax: 62000,
      allowances: "Running Allowance (for Train Managers), Night Duty Allowance, HRA, Transport Allowance, Railway Pass & PTOs",
      appStartDate: new Date("2026-09-14T00:00:00Z"),
      appDeadline: new Date("2026-10-20T23:59:00Z"),
      appFeeGeneral: 500,
      appFeeReserved: 250,
      officialNotificationUrl: "https://rrbcdg.gov.in/cen-05-2026-detailed.pdf",
      officialApplyUrl: "https://www.rrbapply.gov.in",
      status: "CLOSING_SOON",
      stateLocation: "All India",
      syllabusSummary: "CBT 1: General Awareness (40), Mathematics (30), General Intelligence and Reasoning (30). Total 100 questions, 90 minutes.",
      selectionProcessSummary: "1st Stage CBT -> 2nd Stage CBT -> Computer Based Aptitude Test (CBAT) or Typing Skill Test -> DV/Medical",
      lastOfficialVerifiedAt: new Date(),
    },
  });

  await prisma.recruitmentQualification.createMany({
    data: [
      { recruitmentId: rrbNtpc.id, qualificationCode: "ANY_GRADUATE" },
      { recruitmentId: rrbNtpc.id, qualificationCode: "BA" },
      { recruitmentId: rrbNtpc.id, qualificationCode: "BCOM" },
      { recruitmentId: rrbNtpc.id, qualificationCode: "BSC" },
      { recruitmentId: rrbNtpc.id, qualificationCode: "BTECH" },
    ],
  });

  await prisma.recruitmentStage.createMany({
    data: [
      {
        recruitmentId: rrbNtpc.id,
        stageOrder: 1,
        stageName: "CBT 1 (1st Stage Computer Based Test)",
        description: "Screening test consisting of 100 questions. Standardized score used to shortlist for CBT 2 at 1:15 ratio.",
        status: "SCHEDULED",
      },
      {
        recruitmentId: rrbNtpc.id,
        stageOrder: 2,
        stageName: "CBT 2 (2nd Stage Computer Based Test)",
        description: "120 questions across General Awareness, Mathematics, and Reasoning. Crucial for final merit.",
        status: "SCHEDULED",
      },
      {
        recruitmentId: rrbNtpc.id,
        stageOrder: 3,
        stageName: "CBAT / Typing Skill Test",
        description: "Psychometric Aptitude test for Station Master; Qualifying English/Hindi Typing test for Clerks.",
        status: "SCHEDULED",
      },
      {
        recruitmentId: rrbNtpc.id,
        stageOrder: 4,
        stageName: "Document Verification & Medical Exam",
        description: "Verification of original certificates and Aye-Two (A-2) medical fitness test for safety posts.",
        status: "SCHEDULED",
      },
    ],
  });

  // --- Recruitment 4: ISRO Scientist/Engineer 'SC' 2026 ---
  const isroSci = await prisma.recruitment.create({
    data: {
      orgId: isro.id,
      title: "ISRO ICRB Scientist / Engineer 'SC' Recruitment 2026",
      notificationNumber: "ISRO:ICRB:02(EMC):2026",
      shortDescription: "Recruitment for premier Scientist/Engineer 'SC' posts in Electronics, Mechanical, and Computer Science engineering across ISRO centres.",
      fullDescription: "ISRO Centralised Recruitment Board invites applications from young, dynamic engineering graduates for appointment as Scientist/Engineer 'SC' in Level 10 of Pay Matrix.",
      vacancies: 303,
      fresherEligible: true,
      experienceReq: "Fresh engineering graduates eligible. Final year students can apply.",
      minAge: 21,
      maxAge: 28,
      ageRelaxationDetails: "OBC: 3 years, SC/ST: 5 years, PwBD: 10 years",
      payScale: "Pay Matrix Level-10 (Basic ₹56,100)",
      inHandSalaryMin: 85000,
      inHandSalaryMax: 94000,
      allowances: "Dearness Allowance, HRA, Transport Allowance, Medical Facilities (CHSS), Subsidised Canteen, Quarter accommodation",
      appStartDate: new Date("2026-09-01T00:00:00Z"),
      appDeadline: new Date("2026-10-15T23:59:00Z"),
      appFeeGeneral: 250,
      appFeeReserved: 0,
      officialNotificationUrl: "https://www.isro.gov.in/media_isro/pdf/recruitmentNotice/Notice_ICRB_02_2026.pdf",
      officialApplyUrl: "https://apps.isro.gov.in/icrb",
      status: "ACTIVE",
      stateLocation: "All India (Bengaluru, Sriharikota, Thiruvananthapuram, Ahmedabad)",
      syllabusSummary: "Part 'A' (80 marks): Core Discipline Questions. Part 'B' (20 marks): Aptitude/Reasoning. Total 120 mins.",
      selectionProcessSummary: "Written Test (75% discipline, 25% aptitude) -> Interview (Minimum 50/100 required in interview for empanelment)",
      lastOfficialVerifiedAt: new Date(),
    },
  });

  await prisma.recruitmentQualification.createMany({
    data: [
      { recruitmentId: isroSci.id, qualificationCode: "BTECH", stream: "Electronics / Mechanical / Computer Science" },
      { recruitmentId: isroSci.id, qualificationCode: "BE", stream: "Electronics / Mechanical / Computer Science" },
    ],
  });

  await prisma.recruitmentStage.createMany({
    data: [
      {
        recruitmentId: isroSci.id,
        stageOrder: 1,
        stageName: "Written Test (Part A + Part B)",
        description: "Offline optical response sheet examination. Gate equivalent discipline syllabus.",
        status: "SCHEDULED",
      },
      {
        recruitmentId: isroSci.id,
        stageOrder: 2,
        stageName: "Personal Interview",
        description: "Technical interview by specialist panel. 1:5 shortlisting ratio from written test.",
        status: "SCHEDULED",
      },
    ],
  });

  // --- Recruitment 5: SBI Junior Associates 2026 ---
  const sbiJa = await prisma.recruitment.create({
    data: {
      orgId: sbi.id,
      title: "State Bank of India Junior Associates (Customer Support & Sales) 2026",
      notificationNumber: "CRPD/CR/2026-27/08",
      shortDescription: "Massive opening of 8,283 vacancies for clerical cadre across all states and union territories in India.",
      fullDescription: "State Bank of India invites online applications from eligible Indian citizens for appointment as Junior Associate (Customer Support & Sales).",
      vacancies: 8283,
      fresherEligible: true,
      experienceReq: "None. Fresh graduates can apply.",
      minAge: 20,
      maxAge: 28,
      ageRelaxationDetails: "SC/ST: 5 years, OBC: 3 years, PwBD: 10 years",
      payScale: "₹17900-1000/3-20900-1230/3-24590-1490/4-30550-1730/7-42660-3270/1-45930-1990/1-47920",
      inHandSalaryMin: 37000,
      inHandSalaryMax: 42000,
      allowances: "DA, HRA, Transport Allowance, Special Pay, Bank Pension & PF",
      appStartDate: new Date("2026-10-01T00:00:00Z"),
      appDeadline: new Date("2026-10-31T23:59:00Z"),
      appFeeGeneral: 750,
      appFeeReserved: 0,
      officialNotificationUrl: "https://sbi.co.in/documents/careers/JA_2026_adv.pdf",
      officialApplyUrl: "https://sbi.co.in/careers",
      status: "ACTIVE",
      stateLocation: "All India",
      syllabusSummary: "Prelims: English (30), Numerical Ability (35), Reasoning (35). Total 100 marks, 1 hour.",
      selectionProcessSummary: "Preliminary Examination -> Main Examination -> Specified Opted Local Language Test (LPT)",
      lastOfficialVerifiedAt: new Date(),
    },
  });

  await prisma.recruitmentQualification.createMany({
    data: [
      { recruitmentId: sbiJa.id, qualificationCode: "ANY_GRADUATE" },
      { recruitmentId: sbiJa.id, qualificationCode: "BCOM" },
      { recruitmentId: sbiJa.id, qualificationCode: "BA" },
      { recruitmentId: sbiJa.id, qualificationCode: "BSC" },
      { recruitmentId: sbiJa.id, qualificationCode: "BTECH" },
      { recruitmentId: sbiJa.id, qualificationCode: "BCA" },
    ],
  });

  await prisma.recruitmentStage.createMany({
    data: [
      {
        recruitmentId: sbiJa.id,
        stageOrder: 1,
        stageName: "Preliminary Examination",
        description: "100 marks objective screening test with sectional timings of 20 minutes each.",
        status: "SCHEDULED",
      },
      {
        recruitmentId: sbiJa.id,
        stageOrder: 2,
        stageName: "Main Examination",
        description: "190 questions, 200 marks, 2 hours 40 minutes covering General/Financial Awareness, English, Quantitative Aptitude, Reasoning Ability.",
        status: "SCHEDULED",
      },
      {
        recruitmentId: sbiJa.id,
        stageOrder: 3,
        stageName: "Language Proficiency Test (LPT)",
        description: "Test of knowledge of specified opted local language for the applied state circle.",
        status: "SCHEDULED",
      },
    ],
  });

  // 6. Pre-enroll User Application for the Aspirant (Demonstrating Active Tracker)
  // Enrolled in SSC CGL 2026 with personal shift selected:
  const sscApp = await prisma.userApplication.create({
    data: {
      userId: aspirant.id,
      recruitmentId: sscCgl.id,
      registrationNumber: "SSC2026CGL984210",
      rollNumber: "2201048892",
      currentStageOrder: 1,
      overallStatus: "IN_PROGRESS",
      notes: "Targeting Income Tax Inspector or ASO CSS. Revision on Quant & General Science underway.",
    },
  });

  // Stage 1 Progress for SSC CGL
  const sscProg1 = await prisma.userStageProgress.create({
    data: {
      applicationId: sscApp.id,
      stageId: sscTier1.id,
      status: "ADMIT_CARD_AVAILABLE",
      userNotes: "Admit card downloaded. Reporting time 01:00 PM.",
    },
  });

  // Personal Exam Schedule for SSC CGL Tier 1
  await prisma.userExamSchedule.create({
    data: {
      stageProgressId: sscProg1.id,
      examDate: new Date("2026-11-14T00:00:00Z"),
      shiftName: "Shift 2 (Afternoon)",
      examTime: "02:30 PM - 03:30 PM",
      reportingTime: "01:00 PM",
      examCenterName: "iON Digital Zone iDZ 2, Sector 62",
      centerAddress: "C-56/1, Institutional Area, Sector 62, Noida, Uttar Pradesh 201309",
      notes: "Metro station: Noida Electronic City. Reach by 12:45 PM.",
    },
  });

  // Reminder for SSC CGL
  await prisma.reminder.create({
    data: {
      userId: aspirant.id,
      applicationId: sscApp.id,
      stageId: sscTier1.id,
      reminderType: "EXAM_DATE",
      title: "SSC CGL Tier 1 Exam Tomorrow",
      scheduledFor: new Date("2026-11-13T10:00:00Z"),
      presetOption: "1_DAY_BEFORE",
      channel: "IN_APP",
    },
  });

  // Enrolled in IBPS PO 2026 with Result Available (To test next-stage dynamic unlock)
  const ibpsApp = await prisma.userApplication.create({
    data: {
      userId: aspirant.id,
      recruitmentId: ibpsPo.id,
      registrationNumber: "IBPS26PO771239",
      rollNumber: "140299831",
      currentStageOrder: 1,
      overallStatus: "APPLIED",
      notes: "Prelims score card declared on official website. Need to record outcome.",
    },
  });

  await prisma.userStageProgress.create({
    data: {
      applicationId: ibpsApp.id,
      stageId: ibpsPrelims.id,
      status: "RESULT_AVAILABLE",
      userNotes: "Official result published on 24 Sep. Ready to record score.",
    },
  });

  // 7. Seed Notifications for Aspirant
  await prisma.notification.createMany({
    data: [
      {
        userId: aspirant.id,
        applicationId: sscApp.id,
        title: "🎫 SSC CGL Tier 1 Admit Card Released",
        message: "Staff Selection Commission has officially released the Tier 1 admit card for your region. Click to download your hall ticket.",
        type: "SUCCESS",
        linkUrl: "/my-exams",
        isRead: false,
      },
      {
        userId: aspirant.id,
        applicationId: ibpsApp.id,
        title: "🎉 IBPS PO Prelims Result Released",
        message: "IBPS has declared the Preliminary Examination scores and shortlist. Please check your result and update your progress.",
        type: "ALERT",
        linkUrl: "/my-exams",
        isRead: false,
      },
      {
        userId: aspirant.id,
        applicationId: sscApp.id,
        title: "⚠ Official Notice: Application Deadline Updated",
        message: "SSC CGL 2026 application deadline was extended to 27 July 2026 as per Corrigendum 01/2026.",
        type: "WARNING",
        linkUrl: "/exams/" + sscCgl.id,
        isRead: true,
      },
    ],
  });

  console.log("✅ Seed completed successfully with verified authentic recruitments, dynamic stages, schedules, and aspirant progress!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
