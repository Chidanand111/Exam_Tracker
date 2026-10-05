const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function run() {
  console.log("Seeding features 56-62: Citations, Review Queue, Audit Logs, Domains, URL Health...");

  // 1. Official Domains
  const domains = [
    {
      domain: "ssc.gov.in",
      orgName: "Staff Selection Commission",
      orgShortName: "SSC",
      allowedSubdomains: "*.ssc.gov.in",
      sourceType: "GOV_NIC",
      trustStatus: "VERIFIED_GOV",
      notes: "Primary portal for SSC notifications and one-time registration."
    },
    {
      domain: "upsc.gov.in",
      orgName: "Union Public Service Commission",
      orgShortName: "UPSC",
      allowedSubdomains: "*.upsc.gov.in, upsconline.nic.in",
      sourceType: "GOV_NIC",
      trustStatus: "VERIFIED_GOV",
      notes: "Official apex central recruitment agency portal."
    },
    {
      domain: "ibps.in",
      orgName: "Institute of Banking Personnel Selection",
      orgShortName: "IBPS",
      allowedSubdomains: "*.ibps.in",
      sourceType: "BANKING_INSTITUTE",
      trustStatus: "VERIFIED_GOV",
      notes: "Autonomous nodal agency for public sector bank examinations."
    },
    {
      domain: "rrbcdg.gov.in",
      orgName: "Railway Recruitment Boards",
      orgShortName: "RRB",
      allowedSubdomains: "*.rrbcdg.gov.in, *.indianrailways.gov.in",
      sourceType: "GOV_NIC",
      trustStatus: "VERIFIED_GOV",
      notes: "Ministry of Railways official examination portals."
    },
    {
      domain: "isro.gov.in",
      orgName: "Indian Space Research Organisation",
      orgShortName: "ISRO",
      allowedSubdomains: "*.isro.gov.in",
      sourceType: "GOV_NIC",
      trustStatus: "VERIFIED_GOV",
      notes: "Department of Space centralised recruitment board."
    },
    {
      domain: "digialm.com",
      orgName: "Tata Consultancy Services (TCS iON Examination Engine)",
      orgShortName: "TCS iON",
      allowedSubdomains: "*.digialm.com, cdn.digialm.com",
      sourceType: "EXAM_VENDOR_TCS_ION",
      trustStatus: "TRUSTED_VENDOR",
      notes: "Official high-throughput CBT exam engine contracted by SSC, RRB, and AIIMS."
    }
  ];

  for (const d of domains) {
    const existing = await prisma.officialDomain.findUnique({ where: { domain: d.domain } });
    if (!existing) {
      await prisma.officialDomain.create({ data: d });
      console.log(`Registered domain: ${d.domain}`);
    }
  }

  // 2. Data Citations for Active Recruitments
  const cgl = await prisma.recruitment.findFirst({
    where: { title: { contains: "CGL", mode: "insensitive" } }
  });

  if (cgl) {
    const citationsCount = await prisma.dataCitation.count({ where: { recruitmentId: cgl.id } });
    if (citationsCount === 0) {
      const sampleCitations = [
        {
          recruitmentId: cgl.id,
          fieldName: "vacancies",
          fieldLabel: "Total Vacancies",
          extractedValue: "14,582 posts (Tentative)",
          sourceDocumentName: "Notice_CGL_2026_Official.pdf",
          sourceDocumentUrl: cgl.officialNotificationUrl,
          pageNumber: 7,
          sectionClause: "Para 2.1 (Vacancies & Reservation)",
          rawExcerpt: "There are approximately 14,582 vacancies for Group 'B' and Group 'C' posts. Firm vacancies will be determined by user departments prior to final result declaration.",
          confidenceScore: 0.99,
          isVerified: true,
          verifiedBy: "Official SSC Gazette Monitoring Desk"
        },
        {
          recruitmentId: cgl.id,
          fieldName: "minAge",
          fieldLabel: "Age Eligibility Limit",
          extractedValue: "18 to 30 years as on 01-08-2026",
          sourceDocumentName: "Notice_CGL_2026_Official.pdf",
          sourceDocumentUrl: cgl.officialNotificationUrl,
          pageNumber: 4,
          sectionClause: "Para 5.1 (Permissible Age Window)",
          rawExcerpt: "A candidate must be between 18 to 30 years of age as on the crucial cut-off date of 01.08.2026. Crucial date is fixed in accordance with DoP&T OM No. 14017/70/87-Estt.(RR).",
          confidenceScore: 1.0,
          isVerified: true,
          verifiedBy: "Staff Selection Commission Examination Board"
        },
        {
          recruitmentId: cgl.id,
          fieldName: "qualification",
          fieldLabel: "Essential Qualification",
          extractedValue: "Bachelor's Degree in Any Discipline",
          sourceDocumentName: "Notice_CGL_2026_Official.pdf",
          sourceDocumentUrl: cgl.officialNotificationUrl,
          pageNumber: 6,
          sectionClause: "Para 6.2 (Educational Criteria)",
          rawExcerpt: "Candidates must possess Bachelor’s Degree from a recognized University or equivalent as on or before the crucial closing date of application receipt.",
          confidenceScore: 0.98,
          isVerified: true,
          verifiedBy: "Staff Selection Commission Gazette Cell"
        },
        {
          recruitmentId: cgl.id,
          fieldName: "payScale",
          fieldLabel: "Pay Level & Scale",
          extractedValue: "Level-7 (₹44,900 to ₹1,42,400) & Level-4/5/6",
          sourceDocumentName: "Notice_CGL_2026_Official.pdf",
          sourceDocumentUrl: cgl.officialNotificationUrl,
          pageNumber: 2,
          sectionClause: "Para 1.1 (Pay Matrix Structure)",
          rawExcerpt: "Pay Level-7 carries initial basic pay of ₹44,900 plus Central Government admissible allowances including DA, HRA, and Transport Allowance.",
          confidenceScore: 1.0,
          isVerified: true,
          verifiedBy: "Ministry of Personnel, Public Grievances & Pensions"
        },
        {
          recruitmentId: cgl.id,
          fieldName: "appDeadline",
          fieldLabel: "Application Submission Last Date",
          extractedValue: "27 July 2026, 23:00 IST",
          sourceDocumentName: "Corrigendum_Notice_01_2026.pdf",
          sourceDocumentUrl: cgl.officialApplyUrl,
          pageNumber: 1,
          sectionClause: "Corrigendum Clause 2",
          rawExcerpt: "In view of server traffic load, the Commission has resolved to extend the last date for submission of online applications to 27.07.2026 (23:00 Hours).",
          confidenceScore: 0.96,
          isVerified: true,
          verifiedBy: "Under Secretary (P&P-I), SSC New Delhi"
        }
      ];

      for (const cit of sampleCitations) {
        await prisma.dataCitation.create({ data: cit });
      }
      console.log(`Seeded ${sampleCitations.length} data citations for SSC CGL.`);
    }
  }

  // 3. Human Review Queue Sample Items
  const reviewCount = await prisma.reviewQueueItem.count();
  if (reviewCount === 0 && cgl) {
    await prisma.reviewQueueItem.create({
      data: {
        recruitmentId: cgl.id,
        itemType: "CHANGED_SOURCE_DOC",
        fieldName: "appDeadline",
        currentValue: "24 July 2026",
        proposedValue: "27 July 2026",
        severity: "HIGH",
        description: "Automated crawler detected a 3-page Corrigendum PDF extending registration cutoff by 72 hours.",
        status: "APPROVED_FIELD",
        reviewerEmail: "admin@bharatexam.in",
        resolutionNotes: "Approved following verification with official SSC press release.",
        reviewedAt: new Date(Date.now() - 2 * 86400000)
      }
    });

    await prisma.reviewQueueItem.create({
      data: {
        recruitmentId: cgl.id,
        itemType: "LOW_CONFIDENCE_FIELD",
        fieldName: "inHandSalaryMax",
        currentValue: "₹72,000/mo",
        proposedValue: "₹78,400/mo",
        severity: "MEDIUM",
        description: "AI extraction confidence was 71.4% on City X category HRA calculation (50% DA vs 27% HRA).",
        status: "PENDING_REVIEW"
      }
    });

    await prisma.reviewQueueItem.create({
      data: {
        recruitmentId: cgl.id,
        itemType: "BROKEN_OFFICIAL_URL",
        fieldName: "officialResultUrl",
        currentValue: "https://ssc.gov.in/results-2026-cgl-tier1",
        proposedValue: "https://ssc.gov.in/results",
        severity: "LOW",
        description: "Direct deep link returned HTTP 302 redirecting to commission root results directory.",
        status: "PENDING_REVIEW"
      }
    });
    console.log("Seeded sample review queue items.");
  }

  // 4. Admin Audit Logs
  const auditCount = await prisma.adminAuditLog.count();
  if (auditCount === 0) {
    await prisma.adminAuditLog.create({
      data: {
        adminEmail: "admin@bharatexam.in",
        action: "PUBLISH_CORRIGENDUM",
        entityType: "Recruitment",
        entityId: cgl ? cgl.id : "cgl-2026",
        entityTitle: "SSC Combined Graduate Level (CGL) 2026",
        previousValue: JSON.stringify({ appDeadline: "2026-07-24T23:00:00Z", vacancies: 14000 }),
        newValue: JSON.stringify({ appDeadline: "2026-07-27T23:00:00Z", vacancies: 14582 }),
        reason: "Corrigendum No. 1/2026 issued by Under Secretary SSC (HQ).",
        ipAddress: "127.0.0.1",
        timestamp: new Date(Date.now() - 3 * 86400000)
      }
    });

    await prisma.adminAuditLog.create({
      data: {
        adminEmail: "admin@bharatexam.in",
        action: "APPROVE_EXTRACTION",
        entityType: "OfficialSource",
        entityId: "ssc-hq",
        entityTitle: "Staff Selection Commission Official Gazette",
        previousValue: "PENDING_REVIEW",
        newValue: "VERIFIED_OFFICIAL",
        reason: "Source certificate validated via NIC SSL root.",
        ipAddress: "127.0.0.1",
        timestamp: new Date(Date.now() - 7 * 86400000)
      }
    });
    console.log("Seeded immutable admin audit logs.");
  }

  // 5. URL Health Checks
  const healthCount = await prisma.urlHealthCheck.count();
  if (healthCount === 0 && cgl) {
    await prisma.urlHealthCheck.create({
      data: {
        recruitmentId: cgl.id,
        url: cgl.officialNotificationUrl,
        urlType: "NOTIFICATION_PDF",
        statusCode: 200,
        status: "HEALTHY",
        responseTimeMs: 342,
        isPdfAccessible: true,
        lastCheckedAt: new Date()
      }
    });

    await prisma.urlHealthCheck.create({
      data: {
        recruitmentId: cgl.id,
        url: cgl.officialApplyUrl,
        urlType: "APPLY_PORTAL",
        statusCode: 200,
        status: "HEALTHY",
        responseTimeMs: 285,
        isPdfAccessible: false,
        lastCheckedAt: new Date()
      }
    });

    await prisma.urlHealthCheck.create({
      data: {
        recruitmentId: cgl.id,
        url: "https://ssc.gov.in/notice-archive-old-sample-broken.pdf",
        urlType: "NOTIFICATION_PDF",
        statusCode: 404,
        status: "BROKEN_404",
        responseTimeMs: 140,
        isPdfAccessible: false,
        errorMessage: "HTTP 404 Not Found from commission web server.",
        lastCheckedAt: new Date()
      }
    });
    console.log("Seeded URL health check records.");
  }

  console.log("All features 56-62 data seeded successfully!");
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
