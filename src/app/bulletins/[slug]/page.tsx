import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { prisma } from "@/lib/db";
import {
  GraduationCap,
  Calendar,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  FileText,
  Users,
  Award,
  ShieldCheck,
  ChevronRight,
  Clock,
  ArrowLeft,
  Share2,
  BookOpen
} from "lucide-react";
import { BulletinDocumentChecklist } from "@/components/bulletins/BulletinDocumentChecklist";

export const dynamic = "force-dynamic";

interface BulletinDetailPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({
  params,
}: BulletinDetailPageProps): Promise<Metadata> {
  const bulletin = await prisma.careerBulletin.findUnique({
    where: { slug: params.slug },
  });

  if (!bulletin) {
    return {
      title: "Career Bulletin Not Found | BharatExam Tracker",
    };
  }

  return {
    title: `${bulletin.title} | Career Advisories & Educational Bulletins`,
    description: bulletin.summary,
    keywords: [
      "Career Bulletin",
      bulletin.category,
      "Karnataka",
      "Scholarship",
      "Educational Scheme",
      "Govt Exam Guidance",
      ...(bulletin.tags ? bulletin.tags.split(",").map((t) => t.trim()) : []),
    ],
    openGraph: {
      title: bulletin.title,
      description: bulletin.summary,
      type: "article",
      publishedTime: bulletin.publishedAt.toISOString(),
      url: `https://exam-tracker-blue.vercel.app/bulletins/${bulletin.slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title: bulletin.title,
      description: bulletin.summary,
    },
  };
}

export default async function BulletinDetailPage({
  params,
}: BulletinDetailPageProps) {
  const bulletin = await prisma.careerBulletin.findUnique({
    where: { slug: params.slug },
  });

  if (!bulletin) {
    notFound();
  }

  // Fetch related bulletins
  const relatedBulletins = await prisma.careerBulletin.findMany({
    where: {
      id: { not: bulletin.id },
      OR: [{ category: bulletin.category }, { isFeatured: true }],
    },
    take: 3,
    orderBy: { publishedAt: "desc" },
  });

  // Parse how to apply steps
  let parsedSteps: string[] = [];
  if (bulletin.howToApplySteps) {
    try {
      parsedSteps = JSON.parse(bulletin.howToApplySteps);
    } catch {
      parsedSteps = [bulletin.howToApplySteps];
    }
  }

  // Parse documents required
  const documentList = bulletin.documentsRequired
    ? bulletin.documentsRequired
        .split("\n")
        .map((d) => d.replace(/^\d+[\.\)]\s*/, "").trim())
        .filter((d) => d.length > 0)
    : [];

  const getCategoryTheme = (cat: string) => {
    switch (cat) {
      case "SCHOLARSHIP":
        return {
          label: "Scholarship & Financial Aid",
          color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
        };
      case "EXAM_ADVISORY":
        return {
          label: "Examination & Hall Ticket Advisory",
          color: "text-amber-400 bg-amber-500/10 border-amber-500/30",
        };
      case "FREE_COACHING":
        return {
          label: "Free Coaching & Skill Bootcamp",
          color: "text-purple-400 bg-purple-500/10 border-purple-500/30",
        };
      case "DOCUMENTATION_GUIDE":
        return {
          label: "e-KYC & Documentation Guide",
          color: "text-blue-400 bg-blue-500/10 border-blue-500/30",
        };
      case "STUDENT_AID":
        return {
          label: "Student Travel & Welfare Aid",
          color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30",
        };
      default:
        return {
          label: "Career Advisory",
          color: "text-slate-400 bg-slate-500/10 border-slate-500/30",
        };
    }
  };

  const theme = getCategoryTheme(bulletin.category);

  // Schema.org Structured Data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: bulletin.title,
    description: bulletin.summary,
    datePublished: bulletin.publishedAt.toISOString(),
    dateModified: bulletin.updatedAt.toISOString(),
    publisher: {
      "@type": "Organization",
      name: "BharatExam Tracker",
      url: "https://exam-tracker-blue.vercel.app",
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://exam-tracker-blue.vercel.app/bulletins/${bulletin.slug}`,
    },
  };

  return (
    <div className="min-h-screen pb-24">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb Navigation */}
      <div className="border-b border-slate-800 bg-[#090f1f]/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-2 text-xs text-slate-400">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/bulletins" className="hover:text-white transition-colors">
              Career & Educational Bulletins
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-200 truncate max-w-xs">{bulletin.title}</span>
          </nav>
        </div>
      </div>

      {/* Hero Header */}
      <section className="relative overflow-hidden border-b border-slate-800 bg-gradient-to-b from-[#0b1428] via-[#091022] to-[#070b18] py-10 md:py-14">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/bulletins"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-400 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Bulletins</span>
          </Link>

          {/* Badge & Dates */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span
              className={`text-xs font-semibold px-3 py-1 rounded-full border ${theme.color}`}
            >
              {theme.label}
            </span>

            <span className="text-xs text-slate-400 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>
                Published on{" "}
                {new Date(bulletin.publishedAt).toLocaleDateString("en-IN", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </span>

            {bulletin.deadline && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>
                  Last Date:{" "}
                  {new Date(bulletin.deadline).toLocaleDateString("en-IN", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight mb-4">
            {bulletin.title}
          </h1>

          {/* Summary */}
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-6">
            {bulletin.summary}
          </p>

          {/* Highlight Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 border-t border-slate-800">
            {bulletin.benefits && (
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[11px] uppercase tracking-wider text-slate-400 block mb-1">
                  Financial Grant / Benefit
                </span>
                <span className="text-sm font-bold text-emerald-400 flex items-center gap-1.5">
                  <Award className="w-4 h-4 shrink-0" />
                  <span>{bulletin.benefits}</span>
                </span>
              </div>
            )}

            {bulletin.targetAudience && (
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[11px] uppercase tracking-wider text-slate-400 block mb-1">
                  Target Candidate Group
                </span>
                <span className="text-sm font-semibold text-white flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>{bulletin.targetAudience}</span>
                </span>
              </div>
            )}

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 block mb-1">
                Authorized Portal
              </span>
              <span className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>{bulletin.officialPortalName || "Verified Portal"}</span>
              </span>
            </div>
          </div>

          {/* Direct CTA */}
          {bulletin.officialLink && (
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <a
                href={bulletin.officialLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-sm shadow-lg shadow-cyan-600/20 transition-all"
              >
                <span>Apply on Official Portal</span>
                <ExternalLink className="w-4 h-4" />
              </a>

              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Official Domain Verified</span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Main Body */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column (Content & Steps) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Eligibility Summary Card */}
            {bulletin.eligibilitySummary && (
              <div className="rounded-2xl border border-cyan-500/20 bg-slate-900/60 p-6 shadow-md">
                <h2 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                  <span>Eligibility & Criteria Overview</span>
                </h2>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {bulletin.eligibilitySummary}
                </p>
              </div>
            )}

            {/* How to Apply Step-by-Step */}
            {parsedSteps.length > 0 && (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-md">
                <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-400" />
                  <span>Step-by-Step Application Procedure</span>
                </h2>

                <div className="space-y-3">
                  {parsedSteps.map((step, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-800/40 border border-slate-800 text-xs sm:text-sm text-slate-200"
                    >
                      <div className="w-6 h-6 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                        {idx + 1}
                      </div>
                      <p className="leading-relaxed">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Detailed Content / Advisory Notes */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 sm:p-8 shadow-md">
              <h2 className="text-lg font-bold text-white mb-4">
                Detailed Advisory & Program Specifications
              </h2>
              <div className="prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed whitespace-pre-line space-y-3">
                {bulletin.content}
              </div>
            </div>
          </div>

          {/* Right Column (Documents Checklist & Related) */}
          <div className="space-y-6">
            {/* Interactive Document Checklist */}
            <BulletinDocumentChecklist
              bulletinTitle={bulletin.title}
              documents={documentList}
            />

            {/* Official Portal Verification Box */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 space-y-3">
              <h3 className="text-xs uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Verification Security Notice</span>
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                BharatExam Tracker directly verifies all URLs against authentic state government registries and recognized CSR trusts. We never charge application mediation fees or collect passwords.
              </p>
              {bulletin.officialLink && (
                <a
                  href={bulletin.officialLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
                >
                  <span>Launch Official Portal</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>

            {/* Related Advisories */}
            {relatedBulletins.length > 0 && (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
                <h3 className="text-xs uppercase font-bold tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-cyan-400" />
                  <span>Related Bulletins</span>
                </h3>

                <div className="space-y-3">
                  {relatedBulletins.map((rel) => (
                    <Link
                      key={rel.id}
                      href={`/bulletins/${rel.slug}`}
                      className="block p-3 rounded-xl bg-slate-800/40 border border-slate-800 hover:border-slate-700 transition-colors group"
                    >
                      <h4 className="text-xs font-bold text-white group-hover:text-cyan-400 transition-colors line-clamp-2">
                        {rel.title}
                      </h4>
                      {rel.benefits && (
                        <p className="text-[11px] text-emerald-400 font-medium mt-1">
                          {rel.benefits}
                        </p>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
