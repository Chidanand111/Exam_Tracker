const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function executeWithRetry(fn, maxRetries = 6) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt === maxRetries) throw err;
      console.warn(`[Retry ${attempt}] Waiting for Neon DB to wake up: ${err.message}. Retrying in 2s...`);
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
}

async function main() {
  const recCount = await executeWithRetry(() => prisma.recruitment.count());
  const bulletinCount = await executeWithRetry(() => prisma.careerBulletin.count());
  const bulletins = await executeWithRetry(() =>
    prisma.careerBulletin.findMany({
      select: { title: true, category: true, slug: true, benefits: true }
    })
  );
  const recentRecruitments = await executeWithRetry(() =>
    prisma.recruitment.findMany({
      where: {
        slug: {
          in: [
            "gadag-district-court-peon-recruitment-2026",
            "canara-bank-graduate-apprentice-recruitment-2026",
            "karnataka-prisons-department-jailor-warder-recruitment-2026",
            "bank-of-baroda-wealth-executive-credit-analyst-2026",
            "central-silk-board-csb-ae-deputy-director-2026",
            "bel-deputy-engineer-recruitment-2026"
          ]
        }
      },
      select: { title: true, slug: true, vacancies: true, stateLocation: true }
    })
  );

  console.log(`\n========================================`);
  console.log(`✓ Total Verified Recruitments in DB: ${recCount}`);
  console.log(`✓ Total Career & Edu Bulletins in DB: ${bulletinCount}`);
  console.log(`========================================\n`);

  console.log(`--- Newly Added Feed Recruitments ---`);
  recentRecruitments.forEach(r => console.log(`• [${r.vacancies || 'N/A'} Vacancies] ${r.title} (${r.stateLocation})`));

  console.log(`\n--- Career Advisories & Educational Bulletins ---`);
  bulletins.forEach(b => console.log(`• [${b.category}] ${b.title} -> ${b.benefits || ''}`));
}

main().finally(() => prisma.$disconnect());
