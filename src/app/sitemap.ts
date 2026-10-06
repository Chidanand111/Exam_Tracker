import { MetadataRoute } from "next";
import { prisma } from "@/lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://exam-tracker-blue.vercel.app";

  // Static public routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/discover`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/discover?fresher=true`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/compare`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
  ];

  try {
    // Dynamic public recruitment URLs (only non-archived or active reference records)
    const recruitments = await prisma.recruitment.findMany({
      where: {
        isArchived: false,
      },
      select: {
        id: true,
        slug: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: "desc" },
      take: 100,
    });

    const recruitmentRoutes: MetadataRoute.Sitemap = recruitments.flatMap((r) => {
      const slug = r.slug || r.id;
      const lastMod = r.updatedAt ? new Date(r.updatedAt) : new Date();

      return [
        {
          url: `${baseUrl}/recruitments/${slug}`,
          lastModified: lastMod,
          changeFrequency: "daily",
          priority: 0.9,
        },
        {
          url: `${baseUrl}/recruitments/${slug}/eligibility`,
          lastModified: lastMod,
          changeFrequency: "weekly",
          priority: 0.8,
        },
        {
          url: `${baseUrl}/recruitments/${slug}/selection-process`,
          lastModified: lastMod,
          changeFrequency: "weekly",
          priority: 0.8,
        },
        {
          url: `${baseUrl}/recruitments/${slug}/syllabus`,
          lastModified: lastMod,
          changeFrequency: "weekly",
          priority: 0.8,
        },
        {
          url: `${baseUrl}/recruitments/${slug}/important-dates`,
          lastModified: lastMod,
          changeFrequency: "daily",
          priority: 0.8,
        },
      ];
    });

    return [...staticRoutes, ...recruitmentRoutes];
  } catch (error) {
    console.warn("Failed to generate dynamic sitemap entries, returning static routes:", error);
    return staticRoutes;
  }
}
