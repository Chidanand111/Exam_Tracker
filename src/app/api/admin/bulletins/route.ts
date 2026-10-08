import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { logAdminAction } from "@/lib/audit-logger";

export const dynamic = "force-dynamic";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function GET(req: Request) {
  try {
    await requireAdmin();
    const bulletins = await prisma.careerBulletin.findMany({
      orderBy: { publishedAt: "desc" },
    });
    return NextResponse.json({ bulletins });
  } catch (error: any) {
    if (error.status === 401 || error.status === 403) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Failed to fetch bulletins" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const admin = await requireAdmin();
    const body = await req.json();

    const {
      title,
      category,
      summary,
      content,
      targetAudience,
      benefits,
      deadline,
      officialLink,
      officialPortalName,
      eligibilitySummary,
      documentsRequired,
      howToApplySteps,
      tags,
      isFeatured,
    } = body;

    if (!title || !category || !summary || !content) {
      return NextResponse.json(
        { error: "Missing required fields: title, category, summary, content" },
        { status: 400 }
      );
    }

    const baseSlug = slugify(title);
    let finalSlug = baseSlug;
    let count = 1;
    while (await prisma.careerBulletin.findUnique({ where: { slug: finalSlug } })) {
      finalSlug = `${baseSlug}-${count}`;
      count++;
    }

    const bulletin = await prisma.careerBulletin.create({
      data: {
        title,
        slug: finalSlug,
        category,
        summary,
        content,
        targetAudience: targetAudience || null,
        benefits: benefits || null,
        deadline: deadline ? new Date(deadline) : null,
        officialLink: officialLink || null,
        officialPortalName: officialPortalName || null,
        eligibilitySummary: eligibilitySummary || null,
        documentsRequired: documentsRequired || null,
        howToApplySteps: howToApplySteps ? (typeof howToApplySteps === "string" ? howToApplySteps : JSON.stringify(howToApplySteps)) : null,
        tags: tags || null,
        isFeatured: Boolean(isFeatured),
      },
    });

    await logAdminAction({
      adminEmail: admin.email,
      action: "CREATE_CAREER_BULLETIN",
      entityType: "CAREER_BULLETIN",
      entityId: bulletin.id,
      entityTitle: bulletin.title,
      newValue: { title: bulletin.title, category: bulletin.category, slug: bulletin.slug },
      reason: "Published educational and career bulletin",
    });

    return NextResponse.json({ success: true, bulletin }, { status: 201 });
  } catch (error: any) {
    if (error.status === 401 || error.status === 403) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Admin create bulletin error:", error);
    return NextResponse.json({ error: "Failed to create bulletin" }, { status: 500 });
  }
}
