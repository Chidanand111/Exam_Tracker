import { prisma } from "@/lib/db";

export interface DuplicateSignalsBreakdown {
  orgMatch: boolean;
  orgWeight: number;
  titleScore: number;
  titleWeight: number;
  notificationMatch: boolean;
  notificationWeight: number;
  urlMatch: boolean;
  urlWeight: number;
  vacanciesEqual: boolean;
  vacanciesWeight: number;
  postsOverlap: boolean;
  postsWeight: number;
  dateProximity: boolean;
  dateWeight: number;
  documentHashMatch: boolean;
  documentHashWeight: number;
}

export interface SimilarityResult {
  similarityScore: number; // 0 to 100
  signalsBreakdown: DuplicateSignalsBreakdown;
  shouldAlert: boolean;
}

function normalize(text?: string | null): string {
  if (!text) return "";
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function diceCoefficient(s1: string, s2: string): number {
  const norm1 = normalize(s1);
  const norm2 = normalize(s2);
  if (!norm1 || !norm2) return 0;
  if (norm1 === norm2) return 1;

  const words1 = new Set(norm1.split(" "));
  const words2 = new Set(norm2.split(" "));
  let intersection = 0;
  words1.forEach((word) => {
    if (words2.has(word)) intersection++;
  });
  return (2 * intersection) / (words1.size + words2.size);
}

export function evaluatePairSimilarity(r1: any, r2: any): SimilarityResult {
  let score = 0;
  const maxScore = 170; // Sum of potential weights

  // 1. Organization Match (Weight 25)
  const orgMatch = Boolean(r1.orgId && r2.orgId && r1.orgId === r2.orgId);
  const orgWeight = orgMatch ? 25 : 0;
  score += orgWeight;

  // 2. Title Token Overlap (Weight 30)
  const titleDice = diceCoefficient(r1.title, r2.title);
  const titleWeight = Math.round(titleDice * 30);
  score += titleWeight;

  // 3. Notification Number Match (Weight 35)
  let notificationMatch = false;
  let notificationWeight = 0;
  if (r1.notificationNumber && r2.notificationNumber) {
    const norm1 = normalize(r1.notificationNumber);
    const norm2 = normalize(r2.notificationNumber);
    if (norm1 === norm2) {
      notificationMatch = true;
      notificationWeight = 35;
    } else if (norm1.includes(norm2) || norm2.includes(norm1)) {
      notificationMatch = true;
      notificationWeight = 20;
    }
  }
  score += notificationWeight;

  // 4. Notification URL Match (Weight 25)
  let urlMatch = false;
  let urlWeight = 0;
  if (r1.officialNotificationUrl && r2.officialNotificationUrl) {
    if (r1.officialNotificationUrl === r2.officialNotificationUrl) {
      urlMatch = true;
      urlWeight = 25;
    } else {
      try {
        const u1 = new URL(r1.officialNotificationUrl);
        const u2 = new URL(r2.officialNotificationUrl);
        if (u1.hostname === u2.hostname && u1.pathname === u2.pathname) {
          urlMatch = true;
          urlWeight = 20;
        }
      } catch {
        // invalid url
      }
    }
  }
  score += urlWeight;

  // 5. Vacancy Count Equality (Weight 15)
  let vacanciesEqual = false;
  let vacanciesWeight = 0;
  if (r1.vacancies && r2.vacancies) {
    if (r1.vacancies === r2.vacancies) {
      vacanciesEqual = true;
      vacanciesWeight = 15;
    } else if (Math.abs(r1.vacancies - r2.vacancies) / r1.vacancies <= 0.05) {
      vacanciesEqual = true;
      vacanciesWeight = 8;
    }
  }
  score += vacanciesWeight;

  // 6. Post Names Overlap (Weight 20)
  let postsOverlap = false;
  let postsWeight = 0;
  const posts1 = (r1.posts || []).map((p: any) => normalize(p.postName)).filter(Boolean);
  const posts2 = (r2.posts || []).map((p: any) => normalize(p.postName)).filter(Boolean);
  if (posts1.length > 0 && posts2.length > 0) {
    const intersection = posts1.filter((p: string) => posts2.includes(p));
    if (intersection.length > 0) {
      postsOverlap = true;
      postsWeight = Math.min(20, Math.round((intersection.length / Math.max(posts1.length, posts2.length)) * 20));
    }
  }
  score += postsWeight;

  // 7. Date Proximity (Weight 10)
  let dateProximity = false;
  let dateWeight = 0;
  if (r1.appStartDate && r2.appStartDate) {
    const diffDays = Math.abs(
      (new Date(r1.appStartDate).getTime() - new Date(r2.appStartDate).getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diffDays <= 14) {
      dateProximity = true;
      dateWeight = 10;
    }
  }
  score += dateWeight;

  // 8. Document Hash Match (Weight 40)
  let documentHashMatch = false;
  let documentHashWeight = 0;
  const hash1 = r1.documents?.[0]?.hash;
  const hash2 = r2.documents?.[0]?.hash;
  if (hash1 && hash2 && hash1 === hash2) {
    documentHashMatch = true;
    documentHashWeight = 40;
    score += documentHashWeight;
  }

  // Normalized similarity score out of 100
  const normalizedScore = Math.min(100, Math.round((score / 120) * 100 * 10) / 10);
  const shouldAlert = normalizedScore >= 65.0;

  return {
    similarityScore: normalizedScore,
    signalsBreakdown: {
      orgMatch,
      orgWeight,
      titleScore: Math.round(titleDice * 100) / 100,
      titleWeight,
      notificationMatch,
      notificationWeight,
      urlMatch,
      urlWeight,
      vacanciesEqual,
      vacanciesWeight,
      postsOverlap,
      postsWeight,
      dateProximity,
      dateWeight,
      documentHashMatch,
      documentHashWeight,
    },
    shouldAlert,
  };
}

export async function runDuplicateScan() {
  const recruitments = await prisma.recruitment.findMany({
    where: { isArchived: false },
    include: {
      organization: true,
      posts: true,
      documents: { select: { hash: true } },
    },
  });

  const alertsCreated: any[] = [];

  for (let i = 0; i < recruitments.length; i++) {
    for (let j = i + 1; j < recruitments.length; j++) {
      const r1 = recruitments[i];
      const r2 = recruitments[j];

      // Do not compare cycles of the same family as duplicates if their cycle years differ
      if (r1.familyId && r2.familyId && r1.familyId === r2.familyId && r1.cycleYear !== r2.cycleYear) {
        continue;
      }

      const sim = evaluatePairSimilarity(r1, r2);

      if (sim.shouldAlert) {
        // Check if alert already exists
        const existing = await prisma.duplicateAlert.findFirst({
          where: {
            OR: [
              { recruitmentId1: r1.id, recruitmentId2: r2.id },
              { recruitmentId1: r2.id, recruitmentId2: r1.id },
            ],
          },
        });

        if (!existing) {
          const alert = await prisma.duplicateAlert.create({
            data: {
              recruitmentId1: r1.id,
              recruitmentId2: r2.id,
              title1: r1.title,
              title2: r2.title,
              orgShortName: r1.organization?.shortName || "GOVT",
              similarityScore: sim.similarityScore,
              signalsBreakdown: sim.signalsBreakdown as any,
              status: "PENDING_REVIEW",
              reviewNotes: `Automated Multi-Signal Detector flagged ${(sim.similarityScore).toFixed(1)}% match. Multiple signals matched: Title (${sim.signalsBreakdown.titleWeight} pts), Org (${sim.signalsBreakdown.orgWeight} pts), Vacancies (${sim.signalsBreakdown.vacanciesWeight} pts).`,
            },
          });
          alertsCreated.push(alert);
        }
      }
    }
  }

  return {
    scannedCount: recruitments.length,
    newAlertsCount: alertsCreated.length,
    alertsCreated,
  };
}
