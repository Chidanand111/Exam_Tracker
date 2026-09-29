import { prisma } from "../lib/db";

const DEFAULT_GLOBAL_CHECKLIST = [
  // Before applying
  {
    title: "Read official notification thoroughly",
    description: "Download the authentic notification PDF and review post specifications, vacancies, reservation clauses, and cut-off dates.",
    stageCategory: "BEFORE_APPLYING",
    itemOrder: 1,
    isRequired: true,
  },
  {
    title: "Confirm eligibility & calculate age on cut-off date",
    description: "Verify your age against the crucial cut-off date considering SC/ST/OBC/PwD/ESM relaxations and verify that your degree/stream is recognized.",
    stageCategory: "BEFORE_APPLYING",
    itemOrder: 2,
    isRequired: true,
  },
  {
    title: "Verify application fee & fee exemption criteria",
    description: "Check if you qualify for official fee exemption (Women, SC, ST, PwD, Ex-Servicemen) or keep Netbanking/UPI/Debit card ready for payment.",
    stageCategory: "BEFORE_APPLYING",
    itemOrder: 3,
    isRequired: true,
  },
  {
    title: "Verify personal details with 10th / Matriculation certificate",
    description: "Ensure candidate full name, father's name, mother's name, and date of birth match character-for-character with your Class 10 certificate.",
    stageCategory: "BEFORE_APPLYING",
    itemOrder: 4,
    isRequired: true,
  },

  // Document preparation
  {
    title: "Prepare photograph (Passport size, light background)",
    description: "Scan recent color passport photograph (white/light background) within prescribed dimensions and file size (typically 20KB - 50KB JPEG).",
    stageCategory: "DOCUMENT_PREP",
    itemOrder: 5,
    isRequired: true,
  },
  {
    title: "Prepare signature on plain white paper",
    description: "Sign with black or blue ballpoint ink within a clear bounding box and scan within 10KB - 20KB JPEG.",
    stageCategory: "DOCUMENT_PREP",
    itemOrder: 6,
    isRequired: true,
  },
  {
    title: "Prepare required certificates (Category, EWS, PwD, Domicile)",
    description: "Ensure OBC-NCL, EWS, or SC/ST certificates are issued by a competent revenue authority within the valid financial year in the prescribed Central/State format.",
    stageCategory: "DOCUMENT_PREP",
    itemOrder: 7,
    isRequired: true,
  },

  // Application Form
  {
    title: "Complete official online application form",
    description: "Fill all form columns on the authentic official commission website before the last date to avoid server congestion.",
    stageCategory: "APPLICATION_FORM",
    itemOrder: 8,
    isRequired: true,
  },

  // Post Submission / Vault
  {
    title: "Save Application Number & Registration ID",
    description: "Record your official registration number and roll/application credentials securely into your BharatExam Application Vault.",
    stageCategory: "POST_SUBMISSION",
    itemOrder: 9,
    isRequired: true,
  },
  {
    title: "Save submitted application PDF",
    description: "Download the final confirmation slip / submitted application printout PDF and store safely for Document Verification.",
    stageCategory: "POST_SUBMISSION",
    itemOrder: 10,
    isRequired: true,
  },
  {
    title: "Save payment receipt & Transaction Reference",
    description: "Save the e-challan, transaction reference ID, or bank acknowledgement confirming successful payment of the application fee.",
    stageCategory: "POST_SUBMISSION",
    itemOrder: 11,
    isRequired: true,
  },
];

async function main() {
  console.log("Seeding recruitment checklist items and global templates...");

  // 1. Seed Universal Global Templates (recruitmentId: null)
  for (const item of DEFAULT_GLOBAL_CHECKLIST) {
    const existing = await prisma.recruitmentChecklistItem.findFirst({
      where: {
        recruitmentId: null,
        title: item.title,
      },
    });

    if (!existing) {
      await prisma.recruitmentChecklistItem.create({
        data: {
          recruitmentId: null,
          title: item.title,
          description: item.description,
          stageCategory: item.stageCategory,
          itemOrder: item.itemOrder,
          isRequired: item.isRequired,
          isDefault: true,
        },
      });
      console.log(`Created global template item: ${item.title}`);
    }
  }

  // 2. Seed recruitment-specific items for existing recruitments
  const recruitments = await prisma.recruitment.findMany({
    include: { organization: true },
  });

  console.log(`Found ${recruitments.length} recruitments for checklist population.`);

  const existingRecruitmentChecklists = await prisma.recruitmentChecklistItem.findMany({
    select: { recruitmentId: true },
  });
  const populatedRecruitmentIds = new Set(
    existingRecruitmentChecklists.map((i) => i.recruitmentId).filter(Boolean)
  );

  const batchToInsert: any[] = [];

  for (const rec of recruitments) {
    if (populatedRecruitmentIds.has(rec.id)) continue;
    const titleLower = rec.title.toLowerCase();


    for (const item of DEFAULT_GLOBAL_CHECKLIST) {
      batchToInsert.push({
        recruitmentId: rec.id,
        title: item.title,
        description: item.description,
        stageCategory: item.stageCategory,
        itemOrder: item.itemOrder,
        isRequired: item.isRequired,
        isDefault: true,
      });
    }

    if (titleLower.includes("police") || titleLower.includes("constable") || titleLower.includes("si")) {
      batchToInsert.push({
        recruitmentId: rec.id,
        title: "Verify physical measurement standards (Height & Chest)",
        description: "Verify minimum height (165/168 cm male, 152/157 cm female) and chest expansion before applying for uniform posts.",
        stageCategory: "BEFORE_APPLYING",
        itemOrder: 12,
        isRequired: true,
        isDefault: false,
      });
      batchToInsert.push({
        recruitmentId: rec.id,
        title: "Keep valid Driving License (LMV/HMV) ready",
        description: "Ensure driving license is valid as of the closing date and not under suspension.",
        stageCategory: "DOCUMENT_PREP",
        itemOrder: 13,
        isRequired: false,
        isDefault: false,
      });
    }

    if (titleLower.includes("engineer") || titleLower.includes("isro") || titleLower.includes("drdo")) {
      batchToInsert.push({
        recruitmentId: rec.id,
        title: "Prepare GATE scorecard or B.Tech degree conversion certificate",
        description: "Ensure official university CGPA-to-percentage formula certificate or valid GATE registration card is at hand.",
        stageCategory: "DOCUMENT_PREP",
        itemOrder: 12,
        isRequired: true,
        isDefault: false,
      });
    }
  }

  if (batchToInsert.length > 0) {
    console.log(`Inserting ${batchToInsert.length} checklist items via createMany...`);
    await prisma.recruitmentChecklistItem.createMany({
      data: batchToInsert,
      skipDuplicates: true,
    });
  }

  console.log("Checklist seeding completed successfully!");
}


main()
  .catch((e) => {
    console.error("Error seeding checklists:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
