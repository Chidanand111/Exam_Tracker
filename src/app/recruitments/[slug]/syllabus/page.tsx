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
      title: "Syllabus Not Found | BharatExam Tracker",
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://exam-tracker-blue.vercel.app";
  const canonicalUrl = `${baseUrl}/recruitments/${recruitment.slug || recruitment.id}/syllabus`;
  const title = `${recruitment.title} - Official Syllabus, Exam Pattern & Marking Scheme | BharatExam`;
  const description = `Subject-wise syllabus, section questions, maximum marks, negative marking rules, and core topics for ${recruitment.title}.`;

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

export default async function RecruitmentSyllabusPage({ params }: PageProps) {
  const recruitment = await resolveRecruitment(params.slug);

  if (!recruitment) {
    notFound();
  }

  return (
    <RecruitmentDeepLinkView
      recruitment={recruitment}
      activeSubTab="syllabus"
    />
  );
}
