import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://exam-tracker-blue.vercel.app";

  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/discover",
          "/recruitments/",
          "/compare",
          "/manifest.json",
        ],
        disallow: [
          "/admin/",
          "/applications/",
          "/my-exams/",
          "/profile/",
          "/privacy-center/",
          "/saved-searches/",
          "/api/",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
