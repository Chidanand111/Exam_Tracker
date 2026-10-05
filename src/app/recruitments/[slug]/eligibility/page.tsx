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
      title: "Eligibility Not Found | BharatExam Tracker",
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://exam-tracker-blue.vercel.app";
  const canonicalUrl = `${baseUrl}/recruitments/${recruitment.slug || recruitment.id}/eligibility`;
  const title = `${recruitment.title} - Official Eligibility Criteria & Age Limits | BharatExam`;
  const description = `Check educational qualifications, minimum age (${recruitment.minAge} yrs), maximum age (${recruitment.maxAge} yrs), category relaxation, and fresher eligibility for ${recruitment.title}.`;

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

export default async function RecruitmentEligibilityPage({ params }: PageProps) {
  const recruitment = await resolveRecruitment(params.slug);

  if (!recruitment) {
    notFound();
  }

  return (
    <RecruitmentDeepLinkView
      recruitment={recruitment}
      activeSubTab="eligibility"
    />
  );
}
