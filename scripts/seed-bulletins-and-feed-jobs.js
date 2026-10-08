const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function executeWithRetry(fn, maxRetries = 6) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt === maxRetries) throw err;
      console.warn(`[Retry ${attempt}] Waiting for DB: ${err.message}. Retrying in 2s...`);
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
}

async function main() {
  console.log("=== Seeding Feed Recruitments & Career/Educational Bulletins ===");

  // 1. Organizations
  const orgs = [
    {
      shortName: "GDG_COURT",
      name: "District & Sessions Court, Gadag (Karnataka Judiciary)",
      category: "STATE_PSC",
      officialWebsite: "https://gadag.dcourts.gov.in",
      logoUrl: "https://gadag.dcourts.gov.in/wp-content/themes/district-court/images/emblem.png"
    },
    {
      shortName: "CANARA",
      name: "Canara Bank",
      category: "BANKING",
      officialWebsite: "https://canarabank.com",
      logoUrl: "https://canarabank.com/media/canara-bank-logo.png"
    },
    {
      shortName: "BOB",
      name: "Bank of Baroda",
      category: "BANKING",
      officialWebsite: "https://www.bankofbaroda.bank.in",
      logoUrl: "https://www.bankofbaroda.bank.in/themes/bob/logo.png"
    },
    {
      shortName: "KAR_PRISONS",
      name: "Karnataka Prisons & Correctional Services Department",
      category: "STATE_PSC",
      officialWebsite: "https://cetonline.karnataka.gov.in/kea/",
      logoUrl: "https://cetonline.karnataka.gov.in/kea/images/kea_logo.png"
    },
    {
      shortName: "CSB",
      name: "Central Silk Board (Ministry of Textiles)",
      category: "CENTRAL",
      officialWebsite: "https://csb.gov.in",
      logoUrl: "https://csb.gov.in/images/csb-logo.png"
    },
    {
      shortName: "BEL",
      name: "Bharat Electronics Limited",
      category: "PSU",
      officialWebsite: "https://bel-india.in",
      logoUrl: "https://bel-india.in/assets/images/bel_logo.png"
    },
    {
      shortName: "SS_BANK",
      name: "Shri Siddheshwar Co-operative Bank Ltd, Vijayapura",
      category: "BANKING",
      officialWebsite: "https://ssbankvijaypur.com",
      logoUrl: "https://ssbankvijaypur.com/images/logo.png"
    }
  ];

  const orgMap = {};
  for (const org of orgs) {
    const record = await executeWithRetry(() =>
      prisma.organization.upsert({
        where: { shortName: org.shortName },
        update: {
          name: org.name,
          category: org.category,
          officialWebsite: org.officialWebsite,
          logoUrl: org.logoUrl
        },
        create: org
      })
    );
    orgMap[org.shortName] = record.id;
    console.log(`✓ Organization upserted: ${org.name} (${org.shortName})`);
  }

  // Get existing org IDs for KEA, AAI
  const keaOrg = await executeWithRetry(() => prisma.organization.findUnique({ where: { shortName: "KEA" } }));
  if (keaOrg) orgMap["KEA"] = keaOrg.id;

  const aaiOrg = await executeWithRetry(() => prisma.organization.findUnique({ where: { shortName: "AAI" } }));
  if (aaiOrg) orgMap["AAI"] = aaiOrg.id;

  // 2. Official Domains Verification Registry
  const officialDomains = [
    { domain: "gadag.dcourts.gov.in", orgName: "District & Sessions Court, Gadag", orgShortName: "GDG_COURT", sourceType: "GOV_NIC", trustStatus: "VERIFIED_GOV" },
    { domain: "canarabank.com", orgName: "Canara Bank", orgShortName: "CANARA", sourceType: "BANKING_INSTITUTE", trustStatus: "VERIFIED_GOV" },
    { domain: "nats.education.gov.in", orgName: "National Apprenticeship Training Scheme (Ministry of Education)", orgShortName: "NATS", sourceType: "GOV_NIC", trustStatus: "VERIFIED_GOV" },
    { domain: "bankofbaroda.bank.in", orgName: "Bank of Baroda", orgShortName: "BOB", sourceType: "BANKING_INSTITUTE", trustStatus: "VERIFIED_GOV" },
    { domain: "csb.gov.in", orgName: "Central Silk Board", orgShortName: "CSB", sourceType: "GOV_NIC", trustStatus: "VERIFIED_GOV" },
    { domain: "bel-india.in", orgName: "Bharat Electronics Limited", orgShortName: "BEL", sourceType: "AUTONOMOUS_BODY", trustStatus: "VERIFIED_GOV" },
    { domain: "ssbankvijaypur.com", orgName: "Shri Siddheshwar Co-operative Bank", orgShortName: "SS_BANK", sourceType: "BANKING_INSTITUTE", trustStatus: "TRUSTED_VENDOR" },
    { domain: "ssp.postmatric.karnataka.gov.in", orgName: "Karnataka State Scholarship Portal (SSP)", orgShortName: "SSP_KAR", sourceType: "GOV_NIC", trustStatus: "VERIFIED_GOV" },
    { domain: "sevasindhu.karnataka.gov.in", orgName: "Seva Sindhu Karnataka", orgShortName: "SEVA_SINDHU", sourceType: "GOV_NIC", trustStatus: "VERIFIED_GOV" },
    { domain: "buddy4study.com", orgName: "Buddy4Study CSR Portal Partner", orgShortName: "B4S", sourceType: "EXAM_VENDOR_TCS_ION", trustStatus: "TRUSTED_VENDOR" },
  ];

  for (const dom of officialDomains) {
    await executeWithRetry(() =>
      prisma.officialDomain.upsert({
        where: { domain: dom.domain },
        update: dom,
        create: dom
      })
    );
  }
  console.log(`✓ Official domains registered.`);

  // 3. New Recruitments from Portal
  const recruitmentsToSeed = [
    {
      slug: "gadag-district-court-peon-recruitment-2026",
      orgShortName: "GDG_COURT",
      title: "Gadag District Court Peon (ಜವಾನ) Recruitment 2026",
      notificationNumber: "GDG-DC/ADM/01/2026",
      shortDescription: "22 Peon (ಜವಾನ) vacancies in Karnataka Judicial Department, Gadag District Court for 10th / SSLC pass candidates.",
      fullDescription: "District & Sessions Court Gadag invites online applications from eligible Karnataka candidates for filling up 22 Peon (ಜವಾನ) vacancies in the establishment of the District Judiciary, Gadag. The selection will be based on marks secured in the 10th standard (SSLC) followed by document verification and interview.",
      vacancies: 22,
      totalVacanciesNote: "22 Peon positions across Taluka and District Courts of Gadag district.",
      fresherEligible: true,
      experienceReq: "None required. Fresher 10th/SSLC pass eligible.",
      minAge: 18,
      maxAge: 35,
      ageRelaxationDetails: "Category 2A/2B/3A/3B: 38 years, SC/ST/Cat-1: 40 years",
      payScale: "₹17,000 - ₹28,950 (State Judicial Pay Matrix Level-1)",
      inHandSalaryMin: 23500,
      inHandSalaryMax: 27800,
      allowances: "State DA, HRA, Medical allowance, Uniform allowance",
      appStartDate: new Date("2026-09-25T00:00:00Z"),
      appDeadline: new Date("2026-10-31T23:59:00Z"),
      appFeeGeneral: 200,
      appFeeReserved: 100,
      officialNotificationUrl: "https://gadag.dcourts.gov.in/notice-category/recruitment/",
      officialApplyUrl: "https://gadag.dcourts.gov.in/online-recruitment/",
      officialAdmitCardUrl: "https://gadag.dcourts.gov.in/recruitment/interview-call-letter",
      officialResultUrl: "https://gadag.dcourts.gov.in/recruitment/merit-list",
      status: "ACTIVE",
      stateLocation: "Karnataka",
      syllabusSummary: "Merit based on SSLC/10th marks (85% weightage) + Viva-Voce / Personal Interview (15% weightage). Questions in interview test basic knowledge of Kannada reading/writing, etiquette, and suitability for judicial court duties.",
      selectionProcessSummary: "10th Standard Academic Merit List (1:10 ratio call) -> Document Verification -> Viva-Voce / Interview -> Final Selection Merit List.",
      examPattern: [
        {
          section: "10th Standard Academic Score Weightage",
          questions: 0,
          marks: 85,
          duration: "Academic Merit",
          negativeMarking: "None",
          topics: ["SSLC / 10th Standard Board Examination percentage conversion"]
        },
        {
          section: "Personal Interview / Viva-Voce",
          questions: 5,
          marks: 15,
          duration: "10 minutes",
          negativeMarking: "None",
          topics: ["Kannada Language Fluency, Physical Suitability, Basic Etiquette and Judicial Peon Duties"]
        }
      ],
      stages: [
        {
          stageOrder: 1,
          stageName: "Online Application & Document Upload",
          description: "Online submission of 10th marks card, caste/income certificate, and domicile certificate on Gadag e-Court portal.",
          eligibilityNote: "10th / SSLC pass.",
          status: "SCHEDULED"
        },
        {
          stageOrder: 2,
          stageName: "Shortlisting & Document Verification",
          description: "Shortlisting candidates in 1:10 ratio based on SSLC merit and physical verification of original certificates.",
          eligibilityNote: "Candidates within merit cutoff.",
          status: "SCHEDULED"
        },
        {
          stageOrder: 3,
          stageName: "Viva-Voce / Interview (15 Marks)",
          description: "Interview by Selection Committee at District Court Complex, Gadag.",
          eligibilityNote: "Shortlisted candidates.",
          status: "SCHEDULED"
        }
      ],
      posts: [
        {
          postName: "Peon (ಜವಾನ)",
          vacancies: 22,
          department: "Judicial Department, Government of Karnataka",
          qualifications: "Must have passed 10th Standard (SSLC) or equivalent examination with Kannada as one of the subjects."
        }
      ],
      qualifications: ["10TH_PASS", "SSLC"]
    },
    {
      slug: "canara-bank-graduate-apprentice-recruitment-2026",
      orgShortName: "CANARA",
      title: "Canara Bank Graduate Apprentice Recruitment 2026",
      notificationNumber: "CB/RP/APPRENTICE/2026",
      shortDescription: "3,500 Graduate Apprentice posts across India (581 in Karnataka) under National Apprenticeship Training Scheme (NATS).",
      fullDescription: "Canara Bank, a premier Public Sector Bank, invites online applications for engagement of 3,500 Graduate Apprentices under the Apprentices Act, 1961. The training program offers banking operations exposure and ₹15,000 monthly stipend. 581 posts are allocated specifically to branches in Karnataka.",
      vacancies: 3500,
      totalVacanciesNote: "3,500 Graduate Apprentices across India (Karnataka: 581 posts).",
      fresherEligible: true,
      experienceReq: "Fresh graduates who graduated between Oct 2020 and Oct 2026. No prior job experience required.",
      minAge: 20,
      maxAge: 28,
      ageRelaxationDetails: "OBC: 31 years, SC/ST: 33 years, PwBD: 38 years",
      payScale: "Monthly Stipend: ₹15,000/- (Govt of India DBT ₹4,500 + Canara Bank ₹10,500)",
      inHandSalaryMin: 15000,
      inHandSalaryMax: 15000,
      allowances: "Subsidized medical insurance coverage during 1-year apprenticeship tenure",
      appStartDate: new Date("2026-09-21T00:00:00Z"),
      appDeadline: new Date("2026-10-17T23:59:00Z"),
      appFeeGeneral: 500,
      appFeeReserved: 0,
      officialNotificationUrl: "https://canarabank.com/media/canara-bank-apprentice-notification-2026.pdf",
      officialApplyUrl: "https://nats.education.gov.in",
      officialAdmitCardUrl: "https://canarabank.com/careers/apprentice-merit",
      officialResultUrl: "https://canarabank.com/careers/apprentice-selection-list",
      status: "ACTIVE",
      stateLocation: "All India (581 Karnataka)",
      syllabusSummary: "Merit list formulated based on aggregate graduation marks (70% weightage) and 12th marks (30% weightage). Local language test conducted for the applied state (Kannada proficiency test for Karnataka candidates).",
      selectionProcessSummary: "NATS Registration -> Canara Bank Application -> Merit-based Shortlisting -> Local Language Proficiency Test -> Document Verification -> Medical Fitness.",
      examPattern: [
        {
          section: "Academic Merit Score Evaluation",
          questions: 0,
          marks: 100,
          duration: "Merit Score",
          negativeMarking: "None",
          topics: ["Degree aggregate marks (70%) + Class 12 / PUC percentage (30%)"]
        },
        {
          section: "Local Language Proficiency Test (Kannada for Karnataka)",
          questions: 30,
          marks: 50,
          duration: "45 minutes",
          negativeMarking: "Qualifying",
          topics: ["Local language reading comprehension, writing basic notices, speaking and customer communication"]
        }
      ],
      stages: [
        {
          stageOrder: 1,
          stageName: "NATS Portal Enrollment & Bank Registration",
          description: "Candidate registration on MHRD NATS portal (nats.education.gov.in) followed by Canara Bank Apprentice application.",
          eligibilityNote: "Graduation completed after October 2020.",
          status: "SCHEDULED"
        },
        {
          stageOrder: 2,
          stageName: "Merit List Publication & Shortlisting",
          description: "State-wise and category-wise merit shortlisting based on normalized graduation percentage.",
          eligibilityNote: "Registered candidates.",
          status: "SCHEDULED"
        },
        {
          stageOrder: 3,
          stageName: "Local Language Test & Document Verification",
          description: "Verification of 10th/12th/Degree certificates and language proficiency test for non-native board students.",
          eligibilityNote: "Merit-shortlisted candidates.",
          status: "SCHEDULED"
        }
      ],
      posts: [
        {
          postName: "Graduate Apprentice",
          vacancies: 3500,
          department: "Branch Banking & Operations, Canara Bank",
          qualifications: "A Degree (Graduation) in any discipline from a recognized University."
        }
      ],
      qualifications: ["ANY_GRADUATE", "BA", "BCOM", "BSC", "BTECH", "BE", "BCA", "BBA"]
    },
    {
      slug: "karnataka-prisons-department-jailor-warder-recruitment-2026",
      orgShortName: "KAR_PRISONS",
      title: "Karnataka Prisons Department Jailor, Warder & Instructor Recruitment 2026",
      notificationNumber: "KEA/PRISONS/RECRUIT/869/2026",
      shortDescription: "869 posts: 45 Jailors, 800 Warders, and 24 Vocational Instructors across Central & District Prisons in Karnataka via KEA.",
      fullDescription: "Karnataka Examination Authority (KEA) in coordination with the Karnataka Prisons and Correctional Services Department invites online applications for recruitment to 869 uniformed vacancies. The posts comprise 45 Jailor vacancies, 800 Warder posts, and 24 Vocational Instructors. Selection is conducted via a state-wide written examination and physical endurance standards.",
      vacancies: 869,
      totalVacanciesNote: "869 posts (45 Jailor, 800 Warder, 24 Instructor) across Belagavi, Mysuru, Kalaburagi, and Bengaluru central prisons.",
      fresherEligible: true,
      experienceReq: "None for Warder and Jailor. Instructor requires relevant ITI/technical trade certificate.",
      minAge: 20,
      maxAge: 28,
      ageRelaxationDetails: "Cat 2A/2B/3A/3B: 30 years, SC/ST/Cat-1: 32 years",
      payScale: "Warder: ₹21,400 - ₹52,650; Jailor: ₹37,900 - ₹70,850",
      inHandSalaryMin: 32000,
      inHandSalaryMax: 54000,
      allowances: "State Police/Uniform Allowance, DA, HRA, Risk Allowance, Ration Subsidy",
      appStartDate: new Date("2026-09-15T00:00:00Z"),
      appDeadline: new Date("2026-10-15T23:59:00Z"),
      appFeeGeneral: 500,
      appFeeReserved: 250,
      officialNotificationUrl: "https://cetonline.karnataka.gov.in/kea/documents/prisons_recruitment_2026.pdf",
      officialApplyUrl: "https://cetonline.karnataka.gov.in/kea/prisons2026",
      officialAdmitCardUrl: "https://cetonline.karnataka.gov.in/kea/prisons2026/hallticket",
      officialResultUrl: "https://cetonline.karnataka.gov.in/kea/prisons2026/merit",
      status: "ACTIVE",
      stateLocation: "Karnataka",
      syllabusSummary: "Written Objective Examination (100 marks, 120 mins). Sections: General Knowledge (40 marks), Mental Ability & Reasoning (30 marks), General Kannada / English (20 marks), and Basic Law & Human Rights Awareness (10 marks). Negative marking: 0.25 marks per incorrect response.",
      selectionProcessSummary: "Written Competitive Examination -> Physical Standard Test (PST) & Endurance Test (ET) in 1:5 ratio -> Medical Examination -> Document Verification.",
      examPattern: [
        {
          section: "General Knowledge & Current Affairs",
          questions: 40,
          marks: 40,
          duration: "Part of 120 min test",
          negativeMarking: "0.25 marks per wrong answer",
          topics: ["Karnataka History, Geography, Indian Constitution, Everyday Science, Current Events"]
        },
        {
          section: "Mental Ability, Arithmetic & Reasoning",
          questions: 30,
          marks: 30,
          duration: "Part of 120 min test",
          negativeMarking: "0.25 marks per wrong answer",
          topics: ["Number Series, Coding-Decoding, Percentages, Averages, Venn Diagrams, Spatial Reasoning"]
        },
        {
          section: "General Kannada & Language Comprehension",
          questions: 20,
          marks: 20,
          duration: "Part of 120 min test",
          negativeMarking: "0.25 marks per wrong answer",
          topics: ["Kannada Grammar, Vocabulary, Antonyms, Sentence Correction, Reading Comprehension"]
        },
        {
          section: "Human Rights & Prison Administration Awareness",
          questions: 10,
          marks: 10,
          duration: "Part of 120 min test",
          negativeMarking: "0.25 marks per wrong answer",
          topics: ["Fundamental Rights, Basic Criminal Procedure Code, Principles of Correctional Administration"]
        }
      ],
      stages: [
        {
          stageOrder: 1,
          stageName: "Written Competitive Examination (OMR)",
          description: "100 multiple choice questions conducted across district centres in Karnataka by KEA.",
          eligibilityNote: "All eligible registered applicants.",
          status: "SCHEDULED"
        },
        {
          stageOrder: 2,
          stageName: "Physical Endurance Test (ET) & Physical Standard Test (PST)",
          description: "Height/Chest measurements followed by 1600m run, Long jump/High jump, and Shot put for 1:5 shortlisted candidates.",
          eligibilityNote: "Written examination cutoff qualifying candidates.",
          status: "SCHEDULED"
        },
        {
          stageOrder: 3,
          stageName: "Medical Examination & Document Verification",
          description: "Vision test, color blindness check, physical fitness certification and original certificate verification.",
          eligibilityNote: "PST/ET qualified candidates.",
          status: "SCHEDULED"
        }
      ],
      posts: [
        {
          postName: "Warder (ವಾರ್ಡರ್)",
          vacancies: 800,
          department: "Karnataka Prisons and Correctional Services Department",
          qualifications: "Must have passed SSLC / 10th Standard or equivalent."
        },
        {
          postName: "Jailor (ಜೈಲರ್)",
          vacancies: 45,
          department: "Karnataka Prisons and Correctional Services Department",
          qualifications: "Must possess a Bachelor's Degree in any discipline from a recognized University."
        },
        {
          postName: "Vocational Instructor",
          vacancies: 24,
          department: "Karnataka Prisons and Correctional Services Department",
          qualifications: "SSLC with ITI / Diploma in relevant technical trade (Carpentry, Weaving, Tailoring, Agriculture)."
        }
      ],
      qualifications: ["10TH_PASS", "SSLC", "ANY_GRADUATE", "DIPLOMA", "ITI"]
    },
    {
      slug: "bank-of-baroda-wealth-executive-credit-analyst-2026",
      orgShortName: "BOB",
      title: "Bank of Baroda Wealth Management Executive & Credit Analyst Recruitment 2026",
      notificationNumber: "BOB/HRM/REC/ADVT/2026/08",
      shortDescription: "1,100 Specialist Officer vacancies for Wealth Management Executives, Credit Analysts, and Private Bankers at Bank of Baroda.",
      fullDescription: "Bank of Baroda (BOB), one of India's largest public sector banks, invites online applications for appointment of 1,100 Wealth Management Executives and Credit Analysts on regular and contractual positions across major metro and urban centres.",
      vacancies: 1100,
      totalVacanciesNote: "1,100 specialist officer posts across India.",
      fresherEligible: false,
      experienceReq: "1-2 years experience in BFSI / Wealth Management / Credit appraisal required.",
      minAge: 24,
      maxAge: 38,
      ageRelaxationDetails: "OBC: 3 years, SC/ST: 5 years, PwD: 10 years",
      payScale: "₹48,480 - ₹85,920 (Scale-I to Scale-II) / Attractive CTC for Wealth Executives",
      inHandSalaryMin: 62000,
      inHandSalaryMax: 95000,
      allowances: "Bank DA, HRA, City Compensatory Allowance, Performance Incentive, Medical Insurance",
      appStartDate: new Date("2026-09-10T00:00:00Z"),
      appDeadline: new Date("2026-10-15T23:59:00Z"),
      appFeeGeneral: 600,
      appFeeReserved: 100,
      officialNotificationUrl: "https://www.bankofbaroda.bank.in/career/recruitment-wealth-credit-2026.pdf",
      officialApplyUrl: "https://www.bankofbaroda.bank.in/career/current-opportunities",
      officialAdmitCardUrl: "https://www.bankofbaroda.bank.in/career/interview-call-letters",
      officialResultUrl: "https://www.bankofbaroda.bank.in/career/final-results",
      status: "ACTIVE",
      stateLocation: "All India (Bengaluru, Mumbai, Delhi)",
      syllabusSummary: "Evaluation involves online cognitive test / profile evaluation followed by structured Personal Interview & Group Discussion testing Credit Appraisal, Risk Management, Wealth Advisory Regulations, Financial Modeling, and Client Relationship Management.",
      selectionProcessSummary: "Shortlisting based on qualification & experience -> Online Assessment Test (if required) -> Personal Interview -> Final Offer.",
      examPattern: [
        {
          section: "Financial Knowledge & Credit Analysis",
          questions: 40,
          marks: 50,
          duration: "45 minutes",
          negativeMarking: "0.25 marks",
          topics: ["Ratio Analysis, Working Capital Assessment, Balance Sheet Analysis, NPA Resolution, RBI Prudential Norms"]
        },
        {
          section: "Personal Interview & Competency Evaluation",
          questions: 0,
          marks: 100,
          duration: "30 minutes",
          negativeMarking: "None",
          topics: ["Client Profiling, Portfolio Management, Banking Regulations, Communication & Presentation"]
        }
      ],
      stages: [
        {
          stageOrder: 1,
          stageName: "Online Application & Portfolio Submission",
          description: "Online registration and experience documentation on Bank of Baroda careers portal.",
          eligibilityNote: "Degree with relevant BFSI experience.",
          status: "SCHEDULED"
        },
        {
          stageOrder: 2,
          stageName: "Personal Interview & Case Assessment",
          description: "Panel interview and credit evaluation case study conducted in zonal offices.",
          eligibilityNote: "Shortlisted candidates.",
          status: "SCHEDULED"
        }
      ],
      posts: [
        {
          postName: "Wealth Management Executive",
          vacancies: 600,
          department: "Wealth Management Division, Bank of Baroda",
          qualifications: "Graduation in any discipline with AMFI / NISM certification and 1 year experience in wealth advisory."
        },
        {
          postName: "Credit Analyst (MMG/S-II)",
          vacancies: 500,
          department: "Corporate & SME Credit Department, Bank of Baroda",
          qualifications: "CA / CFA / MBA Finance with 2 years credit appraisal experience."
        }
      ],
      qualifications: ["MBA", "CA", "ANY_GRADUATE", "BCOM"]
    },
    {
      slug: "central-silk-board-csb-ae-deputy-director-2026",
      orgShortName: "CSB",
      title: "Central Silk Board Assistant Engineer & Deputy Director Recruitment 2026",
      notificationNumber: "CSB/ESTT/02/2026",
      shortDescription: "17 Assistant Engineer (Civil/Electrical) and Deputy Director posts at Central Silk Board HQ, Bengaluru, Ministry of Textiles.",
      fullDescription: "Central Silk Board (CSB), a statutory body under the Ministry of Textiles, Government of India, headquartered in Bengaluru, Karnataka, invites applications for 17 permanent posts of Assistant Engineer (Civil & Electrical) and Deputy Director (Administration & Finance).",
      vacancies: 17,
      totalVacanciesNote: "17 gazetted and technical vacancies headquartered at CSB Central Office, Bengaluru.",
      fresherEligible: true,
      experienceReq: "Fresher B.E/B.Tech eligible for Assistant Engineer posts; 5 years administrative experience for Deputy Director.",
      minAge: 21,
      maxAge: 35,
      ageRelaxationDetails: "Central Govt OBC: 38 years, SC/ST: 40 years",
      payScale: "Pay Level-10 (₹56,100 - ₹1,77,500) to Level-11 (₹67,700 - ₹2,08,700)",
      inHandSalaryMin: 82000,
      inHandSalaryMax: 105000,
      allowances: "Central DA, HRA (Bengaluru rate 30%), Transport Allowance, CGHS Health Coverage",
      appStartDate: new Date("2026-09-08T00:00:00Z"),
      appDeadline: new Date("2026-10-18T23:59:00Z"),
      appFeeGeneral: 1000,
      appFeeReserved: 0,
      officialNotificationUrl: "https://csb.gov.in/recruitment/advt_02_2026.pdf",
      officialApplyUrl: "https://csb.gov.in/recruitment",
      officialAdmitCardUrl: "https://csb.gov.in/recruitment/interview-schedule",
      officialResultUrl: "https://csb.gov.in/recruitment/selected-candidates",
      status: "ACTIVE",
      stateLocation: "Karnataka (Bengaluru)",
      syllabusSummary: "Paper 1: General Intelligence, General Awareness & Quantitative Aptitude (100 marks). Paper 2: Technical Civil / Electrical Engineering Domain Subject Paper (200 marks). Negative marking: 0.25 marks.",
      selectionProcessSummary: "Written Competitive Examination (Computer Based / OMR) -> Technical Interview -> Document Verification.",
      examPattern: [
        {
          section: "General Awareness, Reasoning & English",
          questions: 100,
          marks: 100,
          duration: "120 minutes",
          negativeMarking: "0.25 marks",
          topics: ["Current Affairs, Indian Economy, General Science, Logical Reasoning, General English"]
        },
        {
          section: "Technical Engineering Domain (Civil / Electrical)",
          questions: 100,
          marks: 200,
          duration: "120 minutes",
          negativeMarking: "0.50 marks",
          topics: ["Structural Analysis, Building Materials, RCC Design, Power Systems, Electrical Machines, Estimating & Costing"]
        }
      ],
      stages: [
        {
          stageOrder: 1,
          stageName: "Written Competitive Examination",
          description: "Technical and General ability test conducted in Bengaluru.",
          eligibilityNote: "B.E/B.Tech in Civil/Electrical or Master's Degree.",
          status: "SCHEDULED"
        },
        {
          stageOrder: 2,
          stageName: "Document Verification & Technical Interview",
          description: "Original degree verification and interview at Central Silk Board, Madiwala, Bengaluru.",
          eligibilityNote: "Written exam merit qualified candidates.",
          status: "SCHEDULED"
        }
      ],
      posts: [
        {
          postName: "Assistant Engineer (Civil)",
          vacancies: 8,
          department: "Engineering Division, Central Silk Board",
          qualifications: "Bachelor's Degree in Civil Engineering (B.E./B.Tech) from a recognized University."
        },
        {
          postName: "Assistant Engineer (Electrical)",
          vacancies: 6,
          department: "Engineering Division, Central Silk Board",
          qualifications: "Bachelor's Degree in Electrical Engineering (B.E./B.Tech) from a recognized University."
        },
        {
          postName: "Deputy Director (Administration)",
          vacancies: 3,
          department: "Administration Wing, Central Silk Board",
          qualifications: "Master's Degree with experience in central government rules and administration."
        }
      ],
      qualifications: ["BE", "BTECH", "CIVIL", "ELECTRICAL", "POST_GRADUATE"]
    },
    {
      slug: "bel-deputy-engineer-recruitment-2026",
      orgShortName: "BEL",
      title: "BEL Deputy Engineer (E-II) Recruitment 2026",
      notificationNumber: "BEL/KOCHI/DEP-ENGG/2026/01",
      shortDescription: "14 Deputy Engineer (E-II) posts in Computer Science, ECE, and Mechanical at Bharat Electronics Limited.",
      fullDescription: "Bharat Electronics Limited (BEL), a Navratna PSU under the Ministry of Defence, invites online applications for 14 Deputy Engineer (E-II) permanent vacancies. Candidates with first class B.E./B.Tech in Computer Science, Electronics & Communication, or Mechanical Engineering are invited to apply.",
      vacancies: 14,
      totalVacanciesNote: "14 permanent executive positions in BEL Defence Systems unit.",
      fresherEligible: false,
      experienceReq: "Minimum 1-2 years relevant post-qualification industrial/R&D experience.",
      minAge: 21,
      maxAge: 27,
      ageRelaxationDetails: "OBC: 30 years, SC/ST: 32 years, PwBD: 37 years",
      payScale: "₹40,000 - ₹1,40,000 (Executive Grade E-II) + Performance Related Pay (PRP)",
      inHandSalaryMin: 68000,
      inHandSalaryMax: 84000,
      allowances: "35% Perks & Allowances, Company leased accommodation or HRA, Medical benefits, PF, Gratuity",
      appStartDate: new Date("2026-09-02T00:00:00Z"),
      appDeadline: new Date("2026-10-20T23:59:00Z"),
      appFeeGeneral: 500,
      appFeeReserved: 0,
      officialNotificationUrl: "https://bel-india.in/wp-content/uploads/2026/09/deputy_engg_advt.pdf",
      officialApplyUrl: "https://bel-india.in/careers/",
      officialAdmitCardUrl: "https://bel-india.in/careers/written-test-call-letter",
      officialResultUrl: "https://bel-india.in/careers/results",
      status: "ACTIVE",
      stateLocation: "All India (Bengaluru & Kochi Units)",
      syllabusSummary: "Written Test (85 marks) comprising General Aptitude (Mental Ability, Quant, English - 25 marks) and Technical Domain Specialization Paper (Computer Science / ECE / Mechanical - 60 marks). Interview carries 15 marks.",
      selectionProcessSummary: "Written Test (85% weightage) -> Shortlisting in 1:5 ratio -> Personal Interview (15% weightage) -> Final Merit List.",
      examPattern: [
        {
          section: "General Aptitude & Reasoning",
          questions: 25,
          marks: 25,
          duration: "Part of 90 min test",
          negativeMarking: "None",
          topics: ["Quantitative Aptitude, Logical Reasoning, Data Interpretation, Technical English"]
        },
        {
          section: "Technical Engineering Knowledge",
          questions: 60,
          marks: 60,
          duration: "Part of 90 min test",
          negativeMarking: "None",
          topics: ["Core Engineering Syllabus (Embedded Systems, Signal Processing, Algorithms, Thermodynamics)"]
        }
      ],
      stages: [
        {
          stageOrder: 1,
          stageName: "Online Application & Document Submission",
          description: "Online submission on BEL career portal with verified marksheets and experience certificates.",
          eligibilityNote: "B.E/B.Tech with required industrial experience.",
          status: "SCHEDULED"
        },
        {
          stageOrder: 2,
          stageName: "Written Test (85 Marks)",
          description: "Objective test evaluating engineering acumen and general aptitude.",
          eligibilityNote: "Screened candidates.",
          status: "SCHEDULED"
        },
        {
          stageOrder: 3,
          stageName: "Personal Interview (15 Marks)",
          description: "Technical and managerial interview at BEL centre.",
          eligibilityNote: "Candidates qualifying written test cutoff.",
          status: "SCHEDULED"
        }
      ],
      posts: [
        {
          postName: "Deputy Engineer (Electronics & Communication)",
          vacancies: 6,
          department: "Radar & Communication Division, BEL",
          qualifications: "First Class B.E./B.Tech in Electronics / ECE / Telecommunication from an AICTE recognized institute."
        },
        {
          postName: "Deputy Engineer (Computer Science)",
          vacancies: 5,
          department: "Software & Digital Systems Division, BEL",
          qualifications: "First Class B.E./B.Tech in Computer Science / Information Technology."
        },
        {
          postName: "Deputy Engineer (Mechanical)",
          vacancies: 3,
          department: "Mechanical Design & Fabrication Division, BEL",
          qualifications: "First Class B.E./B.Tech in Mechanical Engineering."
        }
      ],
      qualifications: ["BE", "BTECH", "CSE", "ECE", "MECHANICAL"]
    }
  ];

  for (const rData of recruitmentsToSeed) {
    const orgId = orgMap[rData.orgShortName];
    if (!orgId) {
      console.warn(`Org not found for ${rData.orgShortName}, skipping recruitment`);
      continue;
    }

    const rec = await executeWithRetry(() =>
      prisma.recruitment.upsert({
        where: { slug: rData.slug },
        update: {
          title: rData.title,
          notificationNumber: rData.notificationNumber,
          shortDescription: rData.shortDescription,
          fullDescription: rData.fullDescription,
          vacancies: rData.vacancies,
          totalVacanciesNote: rData.totalVacanciesNote,
          fresherEligible: rData.fresherEligible,
          experienceReq: rData.experienceReq,
          minAge: rData.minAge,
          maxAge: rData.maxAge,
          ageRelaxationDetails: rData.ageRelaxationDetails,
          payScale: rData.payScale,
          inHandSalaryMin: rData.inHandSalaryMin,
          inHandSalaryMax: rData.inHandSalaryMax,
          allowances: rData.allowances,
          appStartDate: rData.appStartDate,
          appDeadline: rData.appDeadline,
          appFeeGeneral: rData.appFeeGeneral,
          appFeeReserved: rData.appFeeReserved,
          officialNotificationUrl: rData.officialNotificationUrl,
          officialApplyUrl: rData.officialApplyUrl,
          officialAdmitCardUrl: rData.officialAdmitCardUrl,
          officialResultUrl: rData.officialResultUrl,
          status: rData.status,
          stateLocation: rData.stateLocation,
          syllabusSummary: rData.syllabusSummary,
          selectionProcessSummary: rData.selectionProcessSummary,
          examPatternJson: JSON.stringify(rData.examPattern),
          orgId: orgId,
          cycleYear: 2026,
          cycleName: "2026 Cycle",
        },
        create: {
          slug: rData.slug,
          title: rData.title,
          notificationNumber: rData.notificationNumber,
          shortDescription: rData.shortDescription,
          fullDescription: rData.fullDescription,
          vacancies: rData.vacancies,
          totalVacanciesNote: rData.totalVacanciesNote,
          fresherEligible: rData.fresherEligible,
          experienceReq: rData.experienceReq,
          minAge: rData.minAge,
          maxAge: rData.maxAge,
          ageRelaxationDetails: rData.ageRelaxationDetails,
          payScale: rData.payScale,
          inHandSalaryMin: rData.inHandSalaryMin,
          inHandSalaryMax: rData.inHandSalaryMax,
          allowances: rData.allowances,
          appStartDate: rData.appStartDate,
          appDeadline: rData.appDeadline,
          appFeeGeneral: rData.appFeeGeneral,
          appFeeReserved: rData.appFeeReserved,
          officialNotificationUrl: rData.officialNotificationUrl,
          officialApplyUrl: rData.officialApplyUrl,
          officialAdmitCardUrl: rData.officialAdmitCardUrl,
          officialResultUrl: rData.officialResultUrl,
          status: rData.status,
          stateLocation: rData.stateLocation,
          syllabusSummary: rData.syllabusSummary,
          selectionProcessSummary: rData.selectionProcessSummary,
          examPatternJson: JSON.stringify(rData.examPattern),
          orgId: orgId,
          cycleYear: 2026,
          cycleName: "2026 Cycle",
        }
      })
    );

    // Stages
    await executeWithRetry(() => prisma.recruitmentStage.deleteMany({ where: { recruitmentId: rec.id } }));
    for (const st of rData.stages) {
      await executeWithRetry(() =>
        prisma.recruitmentStage.create({
          data: {
            recruitmentId: rec.id,
            stageOrder: st.stageOrder,
            stageName: st.stageName,
            description: st.description,
            eligibilityNote: st.eligibilityNote,
            status: st.status
          }
        })
      );
    }

    // Posts
    await executeWithRetry(() => prisma.recruitmentPost.deleteMany({ where: { recruitmentId: rec.id } }));
    for (const p of rData.posts) {
      await executeWithRetry(() =>
        prisma.recruitmentPost.create({
          data: {
            recruitmentId: rec.id,
            postName: p.postName,
            vacancies: p.vacancies,
            department: p.department,
            qualifications: p.qualifications
          }
        })
      );
    }

    // Qualifications
    await executeWithRetry(() => prisma.recruitmentQualification.deleteMany({ where: { recruitmentId: rec.id } }));
    for (const q of rData.qualifications) {
      await executeWithRetry(() =>
        prisma.recruitmentQualification.create({
          data: {
            recruitmentId: rec.id,
            qualificationCode: q
          }
        })
      );
    }

    console.log(`✓ Seeded Recruitment: ${rData.title}`);
  }

  // 4. Career & Educational Guidance Bulletins (Scholarships, Student Welfare, Advisories)
  const bulletinsToSeed = [
    {
      slug: "aditya-birla-capital-scholarship-2026-27",
      title: "Aditya Birla Capital Scholarship Program 2026-27 for Female Students",
      category: "SCHOLARSHIP",
      summary: "Financial scholarship of up to ₹60,000 for girl students pursuing Class 9–12, Polytechnic Diploma, Undergraduate (UG), and Postgraduate (PG) professional courses.",
      content: `### Overview of Aditya Birla Capital Scholarship Program 2026-27

The **Aditya Birla Capital Scholarship Program 2026-27** is an initiative by the **Aditya Birla Capital Foundation** (the CSR arm of Aditya Birla Capital Limited). This program aims to support meritorious female students from economically weaker sections to continue their secondary, higher secondary, polytechnic, and undergraduate/postgraduate higher education without financial hindrance.

#### Scholarship Grant Amounts by Category:
- **Class 9 & 10 Students:** ₹18,000 per academic year
- **Class 11 & 12 (PUC / Intermediate):** ₹24,000 per academic year
- **Polytechnic / Diploma Courses:** ₹30,000 per academic year
- **Undergraduate (General Degree BA / B.Com / B.Sc / BCA / BBA):** ₹36,000 per academic year
- **Professional Degree (B.E. / B.Tech / MBBS / LLB / Nursing):** ₹60,000 per academic year
- **Postgraduate (PG) Courses:** ₹60,000 per academic year

#### Eligibility Criteria:
1. **Gender:** Exclusively open for female (girl) candidates across India.
2. **Current Enrolment:** Must be currently studying in Class 9 to 12, Polytechnic, or pursuing UG/PG degree in a recognized school, college, or university.
3. **Academic Performance:** Must have secured at least **60% marks** in the previous academic year or semester examination.
4. **Income Ceiling:** Annual family income from all sources must not exceed **₹6,00,000 (6 Lakhs per annum)**.

#### Important Application Dates:
- **Application Start Date:** Active
- **Application Deadline:** 31 October 2026
- **Results & Disbursal:** Starting December 2026 via Direct Benefit Transfer (DBT).`,
      targetAudience: "Class 9-12, Polytechnic, Undergraduate & Postgraduate Female Students",
      benefits: "Up to ₹60,000 per academic year directly into student bank account",
      deadline: new Date("2026-10-31T23:59:00Z"),
      officialLink: "https://www.buddy4study.com/page/aditya-birla-capital-scholarship-program",
      officialPortalName: "Buddy4Study CSR Partner Portal",
      eligibilitySummary: "Female students enrolled in Class 9-12, Polytechnic, UG or PG; Minimum 60% in previous exam; Family annual income < ₹6 Lakhs.",
      documentsRequired: "1. Previous year mark sheet\n2. Government-issued photo ID (Aadhaar Card)\n3. Current academic year admission proof (College ID / Fee receipt / Bonafide certificate)\n4. Family income proof (Salary slip / Form 16 / Income certificate issued by Tehsildar / ITR)\n5. Student bank account passbook copy\n6. Passport size photograph",
      howToApplySteps: JSON.stringify([
        "Click on the 'Apply Now' button on the official Buddy4Study / Aditya Birla Capital scholarship page.",
        "Sign in using your registered mobile number, email, or Google account.",
        "Select your education category (School / Polytechnic / UG / PG) and fill in personal, academic, and family income details.",
        "Upload scanned copies of required documents (Marks Card, Income Certificate, Fee Receipt, Aadhaar, Bank Passbook).",
        "Accept the declarations and submit the application. Note down your unique Application Reference Number for tracking."
      ]),
      tags: "Scholarship, Aditya Birla, Girls Education, Higher Education, Financial Aid, Karnataka",
      isFeatured: true,
      publishedAt: new Date("2026-10-05T08:43:00Z")
    },
    {
      slug: "muskaan-scholarship-program-2026-27",
      title: "Valvoline Cummins Muskaan Scholarship Program 2.0 (2026-27)",
      category: "SCHOLARSHIP",
      summary: "Financial assistance of ₹12,000 for Class 9 to 12 school students to cover school fees, uniforms, and learning resources, with priority for children of commercial drivers and mechanics.",
      content: `### Valvoline Cummins Muskaan Scholarship Program 2.0 (2026-27)

**Valvoline Cummins Private Limited (VCPL)** presents the **Muskaan Scholarship Program 2.0** as part of its Corporate Social Responsibility (CSR) mission to help underprivileged children continue their high school education and curb secondary school dropouts.

#### Scholarship Benefit:
- **Financial Grant:** Fixed financial grant of **₹12,000** per selected student for one academic year.
- **Usage:** Can be utilized for tuition fees, school books, stationery, uniforms, and educational digital devices.

#### Affirmative Priority:
- Children of commercial transport vehicle drivers (truck drivers, taxi/cab drivers, auto drivers).
- Children of independent automobile mechanics and garage workers.
- Daily-wage earners and single-parent households.

#### Eligibility Conditions:
1. Students currently enrolled in **Class 9, 10, 11, or 12** in any recognized government or private school in India.
2. Minimum **60% marks** secured in the preceding grade/standard.
3. Annual family income from all sources must be **less than ₹4,00,000 (4 Lakhs per annum)**.
4. Pan-India eligibility, with open applications for Karnataka students.`,
      targetAudience: "Class 9th to 12th School Students across India",
      benefits: "₹12,000 one-time annual financial grant",
      deadline: new Date("2026-10-30T23:59:00Z"),
      officialLink: "https://www.buddy4study.com/page/muskaan-scholarship-program",
      officialPortalName: "Valvoline Cummins CSR Education Foundation",
      eligibilitySummary: "Students in grades 9 to 12; Min 60% marks in previous year; Family annual income < ₹4 Lakhs. Children of drivers & mechanics given special priority.",
      documentsRequired: "1. Previous academic year mark sheet\n2. Student Aadhaar Card\n3. Current year school admission proof / fee receipt\n4. Family income certificate or parent driving license / commercial driver badge (if applicable)\n5. Bank account passbook copy of student or joint account with parent",
      howToApplySteps: JSON.stringify([
        "Visit the official Muskaan Scholarship Program application portal.",
        "Register with your mobile number and create your applicant profile.",
        "Fill in school details, parent occupation (driver/mechanic/other), and family income.",
        "Upload the required documents (Marks Card, Income certificate / Driving license proof, Passbook).",
        "Review and submit the online application before the 30th October deadline."
      ]),
      tags: "Muskaan, Valvoline, School Scholarship, Class 9-12, High School, Financial Support",
      isFeatured: true,
      publishedAt: new Date("2026-10-05T08:03:00Z")
    },
    {
      slug: "karnataka-ssp-scholarship-ekyc-npci-seeding-guide",
      title: "Karnataka SSP Pre-Matric & Post-Matric: Mandatory Aadhaar e-KYC & NPCI Seeding Guidelines",
      category: "DOCUMENTATION_GUIDE",
      summary: "Critical step-by-step advisory for Karnataka students to complete NPCI bank mapping and Aadhaar e-KYC to prevent scholarship DBT rejection on the State Scholarship Portal (SSP).",
      content: `### Karnataka State Scholarship Portal (SSP) - Aadhaar e-KYC & Bank Seeding Advisory

Every year, thousands of eligible students in Karnataka face delayed or rejected scholarship payouts due to **inactive bank accounts, Aadhaar mismatch, or non-seeding with the National Payments Corporation of India (NPCI) mapping server**.

The Karnataka Centre for e-Governance and the Departments of Social Welfare, Backward Classes Welfare, Minorities, and Tribal Welfare have issued mandatory compliance directives for all Pre-Matric and Post-Matric applicants.

---

### 1. The Critical Difference: Aadhaar Linking vs. NPCI Aadhaar Seeding
- **Aadhaar Linking:** Your bank branch has your Aadhaar number recorded in your account profile (KYC).
- **NPCI Seeding (Mandatory for Scholarships):** Your specific bank account is officially designated on the NPCI mapper as your primary account for receiving Government Direct Benefit Transfer (DBT) funds.
- *Note:* You can link Aadhaar with multiple bank accounts, but **only one bank account can be NPCI-seeded** at any given time.

---

### 2. How to Check Your NPCI Aadhaar Seeding Status Online:
1. Visit the UIDAI MyAadhaar portal (\`myaadhaar.uidai.gov.in\`).
2. Log in with your Aadhaar number and OTP received on your Aadhaar-registered mobile number.
3. Click on **'Bank Seeding Status'**.
4. Check whether your status is **'Active'** and note the name of the bank mapped.
5. If the status is 'Inactive' or 'Not Seeded', immediately visit your bank branch and submit the **Mandate for NPCI Aadhaar DBT Seeding Form**.

---

### 3. SATS (Student Achievement Tracking System) ID Verification
For Pre-Matric and PUC students, your SATS ID must match your school records precisely. Ensure that:
- Your name spelling in SATS matches your Aadhaar card letter-by-letter.
- Your date of birth in school records is identical to your Aadhaar card.
- If there is any discrepancy, submit an update request to your school headmaster or college principal before submitting your SSP application.

---

### 4. Caste & Income Certificate Verification
- Certificates issued by the Karnataka Revenue Department (Nemmadi / Nadakacheri) have an RD number (e.g., \`RD0038472910\`).
- Ensure the RD number belongs to you or your parent and is currently valid (Income certificates are generally valid for 5 years).
- In the SSP portal, entering the RD number automatically pulls caste and income details; verify that the annual income matches the scholarship scheme eligibility threshold.`,
      targetAudience: "All Pre-Matric, Post-Matric, Diploma & University Students in Karnataka",
      benefits: "Guarantees successful, error-free Direct Benefit Transfer (DBT) of Karnataka government scholarships",
      deadline: null,
      officialLink: "https://ssp.postmatric.karnataka.gov.in/",
      officialPortalName: "State Scholarship Portal (SSP) Karnataka",
      eligibilitySummary: "Mandatory for all students applying for SSP Pre-Matric and Post-Matric scholarships in Karnataka.",
      documentsRequired: "1. Aadhaar Card\n2. Aadhaar-linked Active Bank Account Passbook\n3. Caste & Income Certificate (RD Number)\n4. SATS ID / College Registration Number\n5. SSLC Marks Card Registration Number",
      howToApplySteps: JSON.stringify([
        "Verify your Aadhaar-bank NPCI status on myaadhaar.uidai.gov.in.",
        "Obtain or renew your Nadakacheri Caste & Income Certificate RD Number.",
        "Create or log in to your SSP student account on ssp.postmatric.karnataka.gov.in.",
        "Enter your Aadhaar e-KYC consent and link your SATS / University Registration Number.",
        "Submit the application and save the acknowledgment receipt for college verification."
      ]),
      tags: "SSP, Karnataka, Aadhaar, e-KYC, NPCI, DBT, Scholarship, Nadakacheri",
      isFeatured: true,
      publishedAt: new Date("2026-10-04T10:00:00Z")
    },
    {
      slug: "karnataka-student-bus-pass-seva-sindhu-application-guide",
      title: "Karnataka Student Concession Bus Pass 2026-27: Online Seva Sindhu Application Procedure",
      category: "STUDENT_AID",
      summary: "Comprehensive guide for students in Karnataka to apply for subsidized or free state transport bus passes across BMTC, KSRTC, NWKRTC, and KKRTC corporations via Seva Sindhu.",
      content: `### Karnataka Student Concession Bus Pass 2026-27 Guide

The Karnataka State Road Transport Corporation (KSRTC), Bangalore Metropolitan Transport Corporation (BMTC), North Western Karnataka Road Transport Corporation (NWKRTC), and Kalyana Karnataka Road Transport Corporation (KKRTC) offer heavily subsidized student bus passes for the academic year 2026-27.

#### Coverage & Eligibility:
- **Primary & Secondary School Students:** Subsidized or free pass up to 10th standard.
- **PUC / 10+2 Students:** Rural and urban route passes.
- **Diploma & ITI Students:** Full concession on industrial training routes.
- **Degree, Post-Graduate, Medical & Engineering Students:** College-to-residence route passes.
- **Female Students in Karnataka:** Avail free travel in non-AC ordinary city and ordinary suburban buses under the state government Shakti scheme (ordinary BMTC/KSRTC red buses); student passes are required for inter-district, express, and non-city routes.

#### Steps to Apply on Seva Sindhu:
1. Visit the Seva Sindhu portal (\`sevasindhu.karnataka.gov.in\`).
2. Search for **'Issue of Student Bus Pass (KSRTC / BMTC / NWKRTC / KKRTC)'**.
3. Enter your SATS number (for school/PUC) or University Registration / Admission Number.
4. Select your residence location, college/school location, and boarding/destination bus stops.
5. Upload a recent passport-size photograph and student ID card.
6. The application is forwarded online to your educational institution head for digital verification.
7. Upon approval, you will receive an SMS confirmation. Pay the nominal administrative fee online or at the designated bus depot counter and collect the smart card pass.`,
      targetAudience: "School, PU, ITI, Diploma, Degree, and PG Students in Karnataka",
      benefits: "Subsidized / Concessional travel across all 4 state transport corporations (BMTC, KSRTC, NWKRTC, KKRTC)",
      deadline: null,
      officialLink: "https://sevasindhu.karnataka.gov.in/",
      officialPortalName: "Seva Sindhu Portal Karnataka",
      eligibilitySummary: "Bonafide students studying in recognized government or private educational institutions in Karnataka.",
      documentsRequired: "1. Current academic year fee receipt / College ID card\n2. Aadhaar Card\n3. Passport size digital photograph\n4. SATS Number (for school/PUC) or Admission Number",
      howToApplySteps: JSON.stringify([
        "Log in to sevasindhu.karnataka.gov.in.",
        "Apply for 'Student Bus Pass' under your relevant transport corporation.",
        "Enter boarding, destination, and route details.",
        "College principal / headmaster approves the application online.",
        "Collect smart pass from your designated depot counter."
      ]),
      tags: "KSRTC, BMTC, NWKRTC, KKRTC, Student Pass, Seva Sindhu, Travel Concession, Karnataka",
      isFeatured: false,
      publishedAt: new Date("2026-10-03T11:00:00Z")
    },
    {
      slug: "karnataka-free-residential-coaching-upsc-kas-banking-ssc",
      title: "Karnataka Backward Classes & Social Welfare Free Residential Coaching Scheme for Competitive Exams",
      category: "FREE_COACHING",
      summary: "Government of Karnataka offers 100% free residential classroom coaching and ₹10,000 monthly stipend for meritorious graduates preparing for UPSC, KPSC (KAS), Banking, and SSC exams.",
      content: `### Karnataka Free Competitive Examination Coaching Scheme 2026

The **Department of Social Welfare** and **Department of Backward Classes Welfare**, Government of Karnataka, conduct a prestigious state-level program providing **free intensive coaching for competitive examinations** to candidates belonging to SC, ST, Category-1, 2A, 2B, 3A, 3B, and Minority communities.

#### Examinations Covered:
- **UPSC Civil Services Examination (IAS / IPS / IFS)**
- **KPSC Gazetted Probationers Examination (KAS Group A & B)**
- **Banking Exams (IBPS PO, SBI PO, RBI Grade B)**
- **SSC Exams (Combined Graduate Level - CGL, CHSL, CPO SI)**
- **Judicial Services Examination (Civil Judge)**

#### Key Benefits Provided:
- **100% Tuition Fee Waiver:** Admission to top-tier empanelled coaching institutes in Bengaluru, Delhi, Hyderabad, and Dharwad.
- **Monthly Stipend:** ₹10,000 per month for UPSC aspirants; ₹6,000 to ₹8,000 per month for KAS/Banking aspirants for boarding and lodging.
- **Free Study Material & Library Access:** Comprehensive printed modules, mock test series, and interview preparation sessions.

#### Selection Process:
Selection is based purely on a **Common State-Level Entrance Test (CET)** conducted across all district headquarters in Karnataka, followed by category-wise reservation roster allotment.`,
      targetAudience: "Graduates and Final Year Students preparing for Competitive Exams in Karnataka",
      benefits: "100% Free top-tier institute coaching + ₹10,000 monthly stipend + free test series",
      deadline: new Date("2026-11-15T23:59:00Z"),
      officialLink: "https://sw.kar.nic.in/",
      officialPortalName: "Social Welfare Department & BCWD Karnataka",
      eligibilitySummary: "Graduates with domicile in Karnataka; Category reservation compliance; Selection through State Entrance Test.",
      documentsRequired: "1. Degree Certificate / Final Year Marksheet\n2. Domicile / Nativity Certificate\n3. Caste & Income Certificate\n4. Aadhaar Card\n5. Entrance Exam Hall Ticket",
      howToApplySteps: JSON.stringify([
        "Apply online on sw.kar.nic.in or bcwd.karnataka.gov.in during the notification window.",
        "Choose your target exam stream (UPSC / KAS / Banking / SSC).",
        "Download hall ticket and appear for the state entrance examination.",
        "Attend counselling and select your preferred empanelled coaching institute based on merit rank."
      ]),
      tags: "Free Coaching, UPSC, KAS, Banking, SSC, Social Welfare, Karnataka, Stipend",
      isFeatured: true,
      publishedAt: new Date("2026-10-02T12:00:00Z")
    },
    {
      slug: "free-employability-skill-training-women-bangalore",
      title: "NextGen Learning Academy & Samarthanam Foundation: 5-Day Free Employability Training for Women",
      category: "FREE_COACHING",
      summary: "Free 5-day employability skill training bootcamp in Malleshwaram, Bengaluru, with 100% placement interview assistance and free meals for female job seekers.",
      content: `### 5-Day Free Employability & Skill Development Bootcamp for Women

**Samarthanam Trust for the Disabled** in collaboration with **NextGen Learning Academy** is conducting a dedicated **5-day offline career readiness bootcamp** for female job seekers in Malleshwaram, Bengaluru.

#### Key Highlights:
- **Program Duration:** 5 intensive days (10:00 AM to 4:30 PM).
- **Location:** Malleshwaram, Bengaluru (Near Central Bus & Metro Station).
- **Course Fee:** ₹0 (Completely Free).
- **Meals:** Free lunch and refreshments provided during training hours.
- **Placement Support:** 100% interview facilitation with partner IT, BPO, E-commerce, Retail, and Banking companies.

#### Curriculum Highlights:
1. **Business English & Spoken Communication:** Overcoming hesitation, fluent workplace conversations, and email etiquette.
2. **Corporate Interview Preparation:** Self-introduction mastery, STAR method for answering behavioral questions, and handling stress questions.
3. **Resume & LinkedIn Optimization:** Building an ATS-compliant resume and optimizing digital professional visibility.
4. **Basic Digital & Office Productivity:** Google Workspace, MS Excel fundamentals, and professional online etiquette.
5. **Mock Interviews & Group Discussions:** Simulated panel interviews with individual feedback from corporate HR trainers.

#### Who Can Apply:
- Any female candidate who has completed Graduation (B.A, B.Com, B.Sc, BBA, BCA, B.E) or Diploma.
- Freshers seeking their first corporate role or candidates looking to restart their careers.`,
      targetAudience: "Female Graduates and Diploma Holders in Bengaluru / Karnataka",
      benefits: "Free 5-day bootcamp + 100% placement interview connections + Free meals",
      deadline: new Date("2026-10-25T23:59:00Z"),
      officialLink: "https://www.samarthanam.org/",
      officialPortalName: "Samarthanam Trust Education & Livelihood Initiative",
      eligibilitySummary: "Female candidates with degree/diploma looking for corporate entry or placement in Bengaluru.",
      documentsRequired: "1. Updated Resume\n2. Degree Marks Card / Passing Certificate\n3. Aadhaar Card copy",
      howToApplySteps: JSON.stringify([
        "Fill out the candidate registration Google Form or contact Samarthanam Malleshwaram centre directly.",
        "Attend the orientation session with your resume and Aadhaar card.",
        "Complete the 5-day classroom training modules.",
        "Participate in the exclusive on-campus recruitment drive."
      ]),
      tags: "Free Training, Women Empowerment, Malleshwaram, Bangalore, Placement, Soft Skills",
      isFeatured: false,
      publishedAt: new Date("2026-10-01T09:30:00Z")
    },
    {
      slug: "kea-state-exams-dress-code-omr-guidelines-advisory",
      title: "KEA & State Competitive Examinations: Mandatory Dress Code, OMR Rules & Hall Ticket Advisory",
      category: "EXAM_ADVISORY",
      summary: "Crucial examination day guidelines issued by KEA and State recruiting authorities detailing strict dress code norms, prohibited electronic accessories, and OMR barcode handling.",
      content: `### KEA & Karnataka Competitive Examinations Official Exam Day Advisory

In light of tightened examination security across Karnataka Examination Authority (KEA) recruitment exams (such as VAO, FDA, SDA, Police, and Prisons recruitment), candidates must strictly adhere to the following exam day protocols. Failure to comply will lead to debarment at the entry gate.

---

### 1. Mandatory Dress Code Regulations:
- **Male Candidates:**
  - Must wear half-sleeve shirts/T-shirts only. Full-sleeve shirts are strictly prohibited.
  - Plain trousers or pants without elaborate pockets, zips, or metal buttons.
  - Footwear: Sandals or slippers with thin soles only. **Shoes, boots, and thick-soled footwear are strictly prohibited.**
- **Female Candidates:**
  - Half-sleeve kurtas, tops, or salwar kameez without metallic embellishments, embroidery, or brooches.
  - Plain slippers or flat sandals. High heels and enclosed shoes are barred.
  - Elaborate jewelry, earrings, metallic clips, and mangalsutra with heavy pendants must be avoided.

---

### 2. Hall Ticket & Identification Requirements:
- **Color Printout:** Candidates are advised to bring a clear, legible printout of the official Hall Ticket.
- **Original Photo ID Proof (Mandatory):** Bring at least one valid original ID:
  - Aadhaar Card (Printed e-Aadhaar is acceptable if clear).
  - Voter ID (EPIC Card).
  - Driving License.
  - Passport.
  - *Note:* College ID or photocopies of IDs are **not** accepted as sole verification.
- **Photographs:** Carry 2 passport-size photographs matching the one uploaded on the application form.

---

### 3. Permissible Writing Material & OMR Instructions:
- Only **Blue or Black Ballpoint Pens** with a transparent outer barrel are permitted. Gel pens, ink pens, and pencils are strictly disallowed.
- Ensure that the question booklet version code is bubbled accurately on the OMR sheet in the initial 10 minutes.
- Never fold, tear, staple, or write rough work on the OMR sheet or near the barcode areas.
- Any stray pencil or pen mark in the barcode area causes automated optical scanner rejection.`,
      targetAudience: "All Candidates appearing for KEA, KPSC & Karnataka State Recruitment Exams",
      benefits: "Avoids exam-day disqualification and ensures smooth gate verification",
      deadline: null,
      officialLink: "https://cetonline.karnataka.gov.in/kea/",
      officialPortalName: "Karnataka Examination Authority (KEA)",
      eligibilitySummary: "Applicable to all registered candidates appearing in state competitive examinations.",
      documentsRequired: "1. Official Printed Hall Ticket\n2. Original Valid Government Photo ID Proof\n3. Two Passport-size Photographs\n4. Transparent Blue/Black Ballpoint Pen",
      howToApplySteps: JSON.stringify([
        "Download your Hall Ticket from the official recruiting authority website 7-10 days before the exam.",
        "Check exam centre address, reporting time, and shift details carefully.",
        "Ensure dress code compliance on the day of the exam.",
        "Report to the exam centre at least 90 minutes before gate closure time."
      ]),
      tags: "KEA, Exam Guidelines, Dress Code, OMR Rules, Hall Ticket, Karnataka Exams",
      isFeatured: false,
      publishedAt: new Date("2026-09-30T14:00:00Z")
    }
  ];

  for (const bData of bulletinsToSeed) {
    await executeWithRetry(() =>
      prisma.careerBulletin.upsert({
        where: { slug: bData.slug },
        update: bData,
        create: bData
      })
    );
    console.log(`✓ Seeded Career Bulletin: ${bData.title}`);
  }

  console.log("\n=== Seeding Completed Successfully! ===");
}

main()
  .catch((err) => {
    console.error("Seeding failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
