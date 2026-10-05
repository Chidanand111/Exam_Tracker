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
      title: "Selection Process Not Found | BharatExam Tracker",
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://exam-tracker-blue.vercel.app";
  const canonicalUrl = `${baseUrl}/recruitments/${recruitment.slug || recruitment.id}/selection-process`;
  const stagesCount = recruitment.stages?.length || 0;
  const title = `${recruitment.title} - Selection Process, Examination Stages (${stagesCount} Stages) | BharatExam`;
  const description = `Sequential examination stages, CBT exam patterns, normalization methodology, and document verification for ${recruitment.title}.`;

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
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function RecruitmentSelectionProcessPage({ params }: PageProps) {
  const recruitment = await resolveRecruitment(params.slug);

  if (!recruitment) {
    notFound();
  }

  return (
    <RecruitmentDeepLinkView
      recruitment={recruitment}
      activeSubTab="selection-process"
    />
  );
}
