const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function executeWithRetry(fn, maxRetries = 5) {
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
  console.log("Seeding KEA (Karnataka Examination Authority) and its recruitments...");

  // 1. Create / Upsert Organization
  const keaOrg = await executeWithRetry(() =>
    prisma.organization.upsert({
      where: { shortName: "KEA" },
      update: {
        name: "Karnataka Examination Authority",
        category: "STATE_PSC",
        officialWebsite: "https://cetonline.karnataka.gov.in/kea/",
        logoUrl: "https://cetonline.karnataka.gov.in/kea/images/kea_logo.png",
      },
      create: {
        shortName: "KEA",
        name: "Karnataka Examination Authority",
        category: "STATE_PSC",
        officialWebsite: "https://cetonline.karnataka.gov.in/kea/",
        logoUrl: "https://cetonline.karnataka.gov.in/kea/images/kea_logo.png",
      },
    })
  );
  console.log(`✓ KEA Organization upserted: ${keaOrg.id}`);

  // 2. Create / Upsert Official Source
  await executeWithRetry(() =>
    prisma.officialSource.upsert({
      where: { code: "KEA_RECRUITMENT" },
      update: {
        name: "Karnataka Examination Authority (KEA) Direct Recruitment Portal",
        category: "STATE_PSC",
        url: "https://cetonline.karnataka.gov.in/kea/",
        listUrl: "https://cetonline.karnataka.gov.in/kea/recruitment",
        status: "HEALTHY",
        orgId: keaOrg.id,
      },
      create: {
        code: "KEA_RECRUITMENT",
        name: "Karnataka Examination Authority (KEA) Direct Recruitment Portal",
        category: "STATE_PSC",
        url: "https://cetonline.karnataka.gov.in/kea/",
        listUrl: "https://cetonline.karnataka.gov.in/kea/recruitment",
        status: "HEALTHY",
        orgId: keaOrg.id,
      },
    })
  );
  console.log("✓ KEA Official Source registered");

  // 3. Register Official Domain
  await executeWithRetry(() =>
    prisma.officialDomain.upsert({
      where: { domain: "cetonline.karnataka.gov.in" },
      update: {
        orgName: "Karnataka Examination Authority (KEA)",
        orgShortName: "KEA",
        sourceType: "AUTONOMOUS_BODY",
        trustStatus: "VERIFIED_GOV",
        allowedSubdomains: "*.karnataka.gov.in,cetonline.karnataka.gov.in",
      },
      create: {
        domain: "cetonline.karnataka.gov.in",
        orgName: "Karnataka Examination Authority (KEA)",
        orgShortName: "KEA",
        sourceType: "AUTONOMOUS_BODY",
        trustStatus: "VERIFIED_GOV",
        allowedSubdomains: "*.karnataka.gov.in,cetonline.karnataka.gov.in",
      },
    })
  );
  console.log("✓ KEA Official Domain registered");

  // 4. Create / Upsert Recruitment Family
  const keaFamily = await executeWithRetry(() =>
    prisma.recruitmentFamily.upsert({
      where: { slug: "kea-karnataka-state-direct-recruitments" },
      update: {
        name: "KEA Karnataka State Direct Recruitments",
        shortCode: "KEA_STATE",
        orgId: keaOrg.id,
      },
      create: {
        name: "KEA Karnataka State Direct Recruitments",
        shortCode: "KEA_STATE",
        slug: "kea-karnataka-state-direct-recruitments",
        orgId: keaOrg.id,
      },
    })
  );
  console.log(`✓ KEA Family registered: ${keaFamily.id}`);

  // 5. Define KEA Recruitments
  const keaRecruitments = [
    {
      slug: "kea-village-administrative-officer-vao-grama-prashasaka-2026",
      title: "KEA Village Administrative Officer (VAO - Grama Prashasaka) 2026",
      notificationNumber: "KEA/RECRUIT/VAO/01/2026",
      shortDescription: "1,000 Village Administrative Officers (Grama Prashasaka) under Revenue Department Karnataka across all 31 districts.",
      fullDescription: "Karnataka Examination Authority (KEA) invites online applications on behalf of the Department of Revenue for direct recruitment of 1,000 Village Administrative Officers (Grama Prashasaka) in Karnataka. Open for 12th/PUC pass and Graduates.",
      vacancies: 1000,
      totalVacanciesNote: "1,000 regular district cadre posts with Kalyana Karnataka (HK) 371(J) reservations.",
      fresherEligible: true,
      experienceReq: "None required. Fresh candidates eligible.",
      minAge: 18,
      maxAge: 35,
      ageRelaxationDetails: "Category 2A/2B/3A/3B: 38 years, SC/ST/Cat-1: 40 years",
      payScale: "Pay Scale ₹21,400 - ₹42,000 (State Pay Matrix Level-3)",
      inHandSalaryMin: 29000,
      inHandSalaryMax: 34000,
      allowances: "Karnataka State DA, HRA, Medical Aid, Rural Conveyance Allowance",
      appStartDate: new Date("2026-03-05T00:00:00Z"),
      appDeadline: new Date("2026-04-15T23:59:00Z"),
      appFeeGeneral: 750,
      appFeeReserved: 500,
      officialNotificationUrl: "https://cetonline.karnataka.gov.in/kea/documents/notification_vao_2026.pdf",
      officialApplyUrl: "https://cetonline.karnataka.gov.in/kea/vao",
      officialAdmitCardUrl: "https://cetonline.karnataka.gov.in/kea/vao/admitcard",
      officialResultUrl: "https://cetonline.karnataka.gov.in/kea/vao/results",
      status: "ACTIVE",
      stateLocation: "Karnataka",
      syllabusSummary: "Compulsory Kannada Language Test (SSLC standard - 50 marks, qualifying). Written Competitive Exam: Paper 1 (General Knowledge - 100 marks) + Paper 2 (General Kannada / General English & Computer Literacy - 100 marks). 0.25 negative marking.",
      selectionProcessSummary: "Compulsory Kannada Language Examination (Qualifying) -> Written Competitive Examination (Paper-1 & Paper-2) -> 1:2 Verification & Merit List (No interview).",
      examPattern: [
        {
          section: "Paper 1: General Knowledge (Written OMR)",
          questions: 100,
          marks: 100,
          duration: "120 minutes",
          negativeMarking: "0.25 marks per wrong answer",
          topics: [
            "Indian Constitution & Governance",
            "History of Karnataka & Freedom Movement in Karnataka",
            "Geography of Karnataka & Natural Resources",
            "Rural Development & Panchayati Raj System in Karnataka",
            "State Government Welfare Schemes & Guarantees",
            "General Science & Everyday Applications",
            "State, National & International Current Affairs"
          ]
        },
        {
          section: "Paper 2: General Kannada / English & Computer Literacy",
          questions: 100,
          marks: 100,
          duration: "120 minutes",
          negativeMarking: "0.25 marks per wrong answer",
          topics: [
            "General Kannada Grammar, Idioms, Proverbs & Vocabulary (50 Marks)",
            "General English Basic Grammar, Tenses & Comprehension (25 Marks)",
            "Computer Literacy: MS Office, Internet, Cyber Security & E-Governance (25 Marks)"
          ]
        },
        {
          section: "Compulsory Kannada Language Test (Screening)",
          questions: 50,
          marks: 50,
          duration: "60 minutes",
          negativeMarking: "Qualifying (Min 35% / 17.5 marks required)",
          topics: [
            "Kannada Reading Comprehension",
            "Grammar (Vyakaran), Sandhi, Samasa, Tatsama-Tadbhava",
            "Vocabulary & Sentence Correction"
          ]
        }
      ],
      stages: [
        {
          stageOrder: 1,
          stageName: "Compulsory Kannada Language Test",
          description: "50 marks qualifying test (SSLC standard). Mandatory for candidates who did not study Kannada as first/second language in 10th standard.",
          eligibilityNote: "12th / PUC / Any Graduate.",
          status: "SCHEDULED"
        },
        {
          stageOrder: 2,
          stageName: "Written Competitive Examination (Paper 1 & Paper 2)",
          description: "Two OMR objective papers totaling 200 marks. 100% of final merit is determined by marks secured in this examination.",
          eligibilityNote: "Candidates qualifying Kannada language filter.",
          status: "SCHEDULED"
        },
        {
          stageOrder: 3,
          stageName: "Document Verification & District Allotment",
          description: "1:2 ratio verification of 10th/12th marksheets, rural reservation, Kannada medium certificate, and 371(J) eligibility.",
          eligibilityNote: "Candidates qualifying written examination merit cutoff.",
          status: "SCHEDULED"
        }
      ],
      posts: [
        {
          postName: "Village Administrative Officer (Grama Prashasaka)",
          vacancies: 1000,
          department: "Department of Revenue, Government of Karnataka",
          qualifications: "12th / PUC passed or Bachelor's Degree in any discipline"
        }
      ],
      qualifications: ["ANY_GRADUATE", "BA", "BCOM", "BSC", "BTECH", "BE", "BCA"]
    },
    {
      slug: "kea-fda-sda-boards-corporations-recruitment-2026",
      title: "KEA First & Second Division Assistant (FDA / SDA) Boards & Corporations 2026",
      notificationNumber: "KEA/ED/RECRUIT/FDA-SDA/2026",
      shortDescription: "650 FDA and SDA positions across Karnataka State Warehousing Corporation, KPTCL/BESCOM, Food & Civil Supplies, and Urban Development.",
      fullDescription: "Karnataka Examination Authority (KEA) conducts centralised recruitment for administrative assistants, First Division Assistants (FDA), and Second Division Assistants (SDA) across major state boards and public corporations.",
      vacancies: 650,
      totalVacanciesNote: "650 positions across state government public undertakings.",
      fresherEligible: true,
      experienceReq: "None required for freshers.",
      minAge: 18,
      maxAge: 35,
      ageRelaxationDetails: "Category 2A/2B/3A/3B: 38 years, SC/ST/Cat-1: 40 years",
      payScale: "FDA: ₹27,650 - ₹52,650; SDA: ₹21,400 - ₹42,000",
      inHandSalaryMin: 31000,
      inHandSalaryMax: 44000,
      allowances: "State DA, HRA, Medical reimbursement, Corporate statutory allowances",
      appStartDate: new Date("2026-05-10T00:00:00Z"),
      appDeadline: new Date("2026-06-12T23:59:00Z"),
      appFeeGeneral: 750,
      appFeeReserved: 500,
      officialNotificationUrl: "https://cetonline.karnataka.gov.in/kea/documents/notice_fda_sda_2026.pdf",
      officialApplyUrl: "https://cetonline.karnataka.gov.in/kea/boards2026",
      officialAdmitCardUrl: "https://cetonline.karnataka.gov.in/kea/boards2026/hallticket",
      officialResultUrl: "https://cetonline.karnataka.gov.in/kea/boards2026/merit",
      status: "ACTIVE",
      stateLocation: "Karnataka",
      syllabusSummary: "Paper 1: Compulsory Kannada (100 marks). Paper 2: General Knowledge & Current Events (100 marks). Paper 3: General English / Kannada & Computer Literacy (100 marks). Negative marking 0.25 per wrong answer.",
      selectionProcessSummary: "Written Examination across 3 papers -> Kannada Qualifying Filter -> Document Verification & Counselling Allotment based on 100% written merit.",
      examPattern: [
        {
          section: "Paper 1: Compulsory Kannada Language",
          questions: 100,
          marks: 100,
          duration: "120 minutes",
          negativeMarking: "Qualifying (35% cutoff)",
          topics: [
            "Kannada Grammar, Vocabulary, Comprehension, Translation from English to Kannada"
          ]
        },
        {
          section: "Paper 2: General Knowledge",
          questions: 100,
          marks: 100,
          duration: "120 minutes",
          negativeMarking: "0.25 marks per wrong answer",
          topics: [
            "Indian History, Karnataka History, Geography, Indian Polity, Economy & Current Affairs"
          ]
        },
        {
          section: "Paper 3: General English / Kannada & Computer Knowledge",
          questions: 100,
          marks: 100,
          duration: "120 minutes",
          negativeMarking: "0.25 marks per wrong answer",
          topics: [
            "English Grammar & Comprehension, Computer Fundamentals, MS Word, Excel, Email"
          ]
        }
      ],
      stages: [
        {
          stageOrder: 1,
          stageName: "Written Competitive Examination (OMR)",
          description: "Three papers conducted across two days. Paper 1 is qualifying; Paper 2 & 3 scores decide ranking.",
          eligibilityNote: "Degree for FDA, 12th/PUC or Degree for SDA.",
          status: "SCHEDULED"
        },
        {
          stageOrder: 2,
          stageName: "1:2 Document Verification & Counselling",
          description: "Scrutiny of marks cards, reservation certificates, and online preference web options.",
          eligibilityNote: "Candidates qualifying written exam cutoffs.",
          status: "SCHEDULED"
        }
      ],
      posts: [
        {
          postName: "First Division Assistant (FDA)",
          vacancies: 380,
          department: "State Warehousing / Food & Civil Supplies / KPTCL",
          qualifications: "Bachelor's Degree in any discipline"
        },
        {
          postName: "Second Division Assistant (SDA)",
          vacancies: 270,
          department: "State Boards & Authorities",
          qualifications: "12th / PUC passed or Bachelor's Degree"
        }
      ],
      qualifications: ["ANY_GRADUATE", "BCOM", "BA", "BSC", "BTECH", "BE", "BCA", "MBA"]
    },
    {
      slug: "kea-assistant-professor-gfgc-recruitment-2026",
      title: "KEA Assistant Professor (GFGC) Recruitment 2026",
      notificationNumber: "KEA/ED/ASST-PROF/2026",
      shortDescription: "1,242 Assistant Professor posts in Government First Grade Colleges under Karnataka Collegiate Education Department.",
      fullDescription: "Karnataka Examination Authority conducts direct competitive recruitment examination for appointment of Assistant Professors across 26 disciplines in Government First Grade Colleges.",
      vacancies: 1242,
      totalVacanciesNote: "1,242 collegiate faculty vacancies across 26 subjects.",
      fresherEligible: true,
      experienceReq: "Fresh post-graduates with NET/KSET/Ph.D eligible.",
      minAge: 22,
      maxAge: 40,
      ageRelaxationDetails: "Category 2A/2B/3A/3B: 43 years, SC/ST/Cat-1: 45 years",
      payScale: "UGC Academic Level-10 (₹57,700 to ₹1,82,400)",
      inHandSalaryMin: 78000,
      inHandSalaryMax: 92000,
      allowances: "UGC Central DA, HRA (Bengaluru/Mysuru/Hubballi rates), Academic Research Allowance",
      appStartDate: new Date("2026-02-15T00:00:00Z"),
      appDeadline: new Date("2026-03-25T23:59:00Z"),
      appFeeGeneral: 1000,
      appFeeReserved: 500,
      officialNotificationUrl: "https://cetonline.karnataka.gov.in/kea/documents/asst_prof_2026_notification.pdf",
      officialApplyUrl: "https://cetonline.karnataka.gov.in/kea/asstprof",
      officialAdmitCardUrl: "https://cetonline.karnataka.gov.in/kea/asstprof/hallticket",
      officialResultUrl: "https://cetonline.karnataka.gov.in/kea/asstprof/scorecard",
      status: "ACTIVE",
      stateLocation: "Karnataka",
      syllabusSummary: "Paper 1: Compulsory Kannada & English (100 marks each, qualifying). Paper 2: General Knowledge (50 marks, 25 Qs). Paper 3: Optional Technical / Subject Discipline Paper (250 marks, 125 Qs as per UGC syllabus). 0.25 negative marking.",
      selectionProcessSummary: "Competitive Written Examination (300 scored marks + Qualifying Languages) -> Merit List -> Document Verification & Web Counselling.",
      examPattern: [
        {
          section: "Paper 1: Compulsory Kannada & English (Qualifying)",
          questions: 100,
          marks: 200,
          duration: "120 minutes",
          negativeMarking: "Qualifying (Min 30-35% in each)",
          topics: ["Kannada Language Proficiency (100 Marks)", "English Language Proficiency (100 Marks)"]
        },
        {
          section: "Paper 2: General Knowledge",
          questions: 25,
          marks: 50,
          duration: "60 minutes",
          negativeMarking: "0.25 marks per wrong answer",
          topics: ["Indian Constitution, Karnataka History, Higher Education Policy, Current Affairs"]
        },
        {
          section: "Paper 3: Subject Specialization Paper",
          questions: 125,
          marks: 250,
          duration: "150 minutes",
          negativeMarking: "0.25 marks per wrong answer",
          topics: ["Advanced PG & UGC-NET syllabus for chosen discipline (Commerce, Economics, Physics, Chemistry, Computer Science, English, Kannada, Mathematics, etc.)"]
        }
      ],
      stages: [
        {
          stageOrder: 1,
          stageName: "Competitive Written Examination",
          description: "Subject matter OMR examination totaling 300 scored marks + 2 qualifying language papers.",
          eligibilityNote: "Master's Degree (55%) + NET / KSET / Ph.D.",
          status: "SCHEDULED"
        },
        {
          stageOrder: 2,
          stageName: "Document Verification & Web Counselling",
          description: "Scrutiny of PG degrees, NET/KSET certificates, API score validation, and college allotment.",
          eligibilityNote: "Candidates qualifying written test merit.",
          status: "SCHEDULED"
        }
      ],
      posts: [
        {
          postName: "Assistant Professor (GFGC)",
          vacancies: 1242,
          department: "Department of Collegiate Education, Government of Karnataka",
          qualifications: "Master's Degree with minimum 55% + UGC-NET / KSET / Ph.D."
        }
      ],
      qualifications: ["MBA", "MCA", "BSC", "BCOM", "BA", "BTECH"]
    }
  ];

  for (const rData of keaRecruitments) {
    // Upsert Recruitment
    const recruitment = await executeWithRetry(() =>
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
          orgId: keaOrg.id,
          familyId: keaFamily.id,
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
          orgId: keaOrg.id,
          familyId: keaFamily.id,
          cycleYear: 2026,
          cycleName: "2026 Cycle",
        },
      })
    );

    // Clean and create stages
    await executeWithRetry(() => prisma.recruitmentStage.deleteMany({ where: { recruitmentId: recruitment.id } }));
    for (const st of rData.stages) {
      await executeWithRetry(() =>
        prisma.recruitmentStage.create({
          data: {
            recruitmentId: recruitment.id,
            stageOrder: st.stageOrder,
            stageName: st.stageName,
            description: st.description,
            eligibilityNote: st.eligibilityNote,
            status: st.status,
          },
        })
      );
    }

    // Clean and create posts
    await executeWithRetry(() => prisma.recruitmentPost.deleteMany({ where: { recruitmentId: recruitment.id } }));
    for (const p of rData.posts) {
      await executeWithRetry(() =>
        prisma.recruitmentPost.create({
          data: {
            recruitmentId: recruitment.id,
            postName: p.postName,
            vacancies: p.vacancies,
            department: p.department,
            qualifications: p.qualifications,
          },
        })
      );
    }

    // Clean and create qualifications
    await executeWithRetry(() => prisma.recruitmentQualification.deleteMany({ where: { recruitmentId: recruitment.id } }));
    for (const q of rData.qualifications) {
      await executeWithRetry(() =>
        prisma.recruitmentQualification.create({
          data: {
            recruitmentId: recruitment.id,
            qualificationCode: q,
          },
        })
      );
    }

    console.log(`✓ Seeded KEA Recruitment: "${rData.title}" (${rData.stages.length} stages)`);
  }

  console.log("\nKEA recruitments and organization successfully seeded!");
}

main()
  .catch((err) => {
    console.error("Error seeding KEA:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
