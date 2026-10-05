import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q")?.trim() || "";

    if (!query || query.length < 2) {
      // Return top popular searches when empty or 1 char
      const popularOrgs = await prisma.organization.findMany({
        take: 4,
        select: { id: true, name: true, shortName: true, category: true },
        orderBy: { name: "asc" },
      });

      return NextResponse.json({
        suggestions: [
          { type: "qualification", label: "Graduate Freshers", value: "Graduate", category: "Qualification" },
          { type: "qualification", label: "B.Tech Government Jobs", value: "B.Tech", category: "Engineering" },
          { type: "sector", label: "Banking & Financial Services", value: "Banking", category: "Sector" },
          { type: "phrase", label: "Jobs closing this month", value: "closing soon", category: "Deadline" },
          ...popularOrgs.map((o) => ({
            type: "organization",
            label: `${o.shortName} (${o.name})`,
            value: o.shortName,
            category: "Commission",
          })),
        ],
      });
    }

    const qLower = query.toLowerCase();

    // 1. Search Organizations
    const matchedOrgs = await prisma.organization.findMany({
      where: {
        OR: [
          { shortName: { contains: query, mode: "insensitive" } },
          { name: { contains: query, mode: "insensitive" } },
        ],
      },
      take: 4,
      select: { shortName: true, name: true, category: true },
    });

    // 2. Search Recruitment Families
    const matchedFamilies = await prisma.recruitmentFamily.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { shortCode: { contains: query, mode: "insensitive" } },
          { slug: { contains: query, mode: "insensitive" } },
        ],
      },
      take: 4,
      select: { name: true, shortCode: true, slug: true },
    });

    // 3. Search Matching Recruitments by Title or Department
    const matchedRecruitments = await prisma.recruitment.findMany({
      where: {
        isArchived: false,
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { stateLocation: { contains: query, mode: "insensitive" } },
        ],
      },
      take: 4,
      select: { id: true, title: true, slug: true, stateLocation: true },
    });

    // 4. Common qualifications matching
    const qualMatches: Array<{ label: string; value: string }> = [];
    const knownQuals = [
      { code: "BTECH", label: "B.Tech / B.E." },
      { code: "ANY_GRADUATE", label: "Any Graduate" },
      { code: "BCA", label: "BCA / MCA" },
      { code: "BSC", label: "B.Sc (Science)" },
      { code: "BCOM", label: "B.Com (Commerce)" },
      { code: "BA", label: "B.A. (Arts)" },
      { code: "MBA", label: "MBA" },
    ];

    for (const kq of knownQuals) {
      if (kq.label.toLowerCase().includes(qLower) || kq.code.toLowerCase().includes(qLower)) {
        qualMatches.push({ label: kq.label, value: kq.code });
      }
    }

    // Combine formatted suggestions
    const suggestions: Array<{
      type: string;
      label: string;
      value: string;
      category: string;
    }> = [];

    matchedOrgs.forEach((o) => {
      suggestions.push({
        type: "organization",
        label: `${o.shortName} — ${o.name}`,
        value: o.shortName,
        category: "Commission / Board",
      });
    });

    matchedFamilies.forEach((f) => {
      suggestions.push({
        type: "family",
        label: `${f.name} (${f.shortCode})`,
        value: f.name,
        category: "Exam Family",
      });
    });

    qualMatches.forEach((q) => {
      suggestions.push({
        type: "qualification",
        label: `${q.label} Jobs`,
        value: q.label,
        category: "Degree / Qualification",
      });
    });

    matchedRecruitments.forEach((r) => {
      suggestions.push({
        type: "recruitment",
        label: r.title,
        value: r.title,
        category: "Active Recruitment",
      });
    });

    // State location suggestion if matches
    if (qLower.includes("karnataka") || qLower.includes("delhi") || qLower.includes("maharashtra")) {
      const stateCapitalized = query.charAt(0).toUpperCase() + query.slice(1);
      suggestions.push({
        type: "location",
        label: `Government Jobs in ${stateCapitalized}`,
        value: stateCapitalized,
        category: "Location",
      });
    }

    return NextResponse.json({
      query,
      suggestions: suggestions.slice(0, 8),
    });
  } catch (error: any) {
    console.error("Suggestions API error:", error);
    return NextResponse.json(
      { error: "Failed to generate suggestions" },
      { status: 500 }
    );
  }
}
