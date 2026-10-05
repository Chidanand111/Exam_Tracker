import { notFound } from "next/navigation";
import { Metadata } from "next";
import { resolveRecruitment } from "@/lib/slugs";
import { RecruitmentDeepLinkView } from "@/components/recruitments/RecruitmentDeepLinkView";

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const recruitment = await resolveRecruitment(params.slug);
  if (!recruitment) {
    return {
      title: "Recruitment Not Found | BharatExam Tracker",
      description: "The requested recruitment notice could not be found.",
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://exam-tracker-blue.vercel.app";
  const canonicalUrl = `${baseUrl}/recruitments/${recruitment.slug || recruitment.id}`;
  const vacanciesText = recruitment.vacancies
    ? `${recruitment.vacancies.toLocaleString("en-IN")} Vacancies`
    : "Announced Vacancies";
  const title = `${recruitment.title} - ${vacanciesText} | Eligibility, Dates & Exam Stages`;
  const description = `${recruitment.shortDescription} Official pay band: ${recruitment.payScale}. Apply directly on official ${recruitment.organization.name} portal before deadline.`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: "BharatExam Tracker",
      locale: "en_IN",
      type: "article",
      images: [
        {
          url: recruitment.organization.logoUrl || `${baseUrl}/og-default.png`,
          width: 800,
          height: 600,
          alt: recruitment.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    robots: {
      index: !recruitment.isArchived,
      follow: true,
    },
  };
}

export default async function RecruitmentSlugPage({ params }: PageProps) {
  const recruitment = await resolveRecruitment(params.slug);

  if (!recruitment) {
    notFound();
  }

  return (
    <RecruitmentDeepLinkView
      recruitment={recruitment}
      activeSubTab="overview"
    />
  );
}
