import { Metadata } from "next";
import Link from "next/link";
import {
  HelpCircle,
  ExternalLink,
  ShieldAlert,
  Search,
  CheckCircle2,
  FileCheck2,
  Calendar,
  Layers,
  Lock,
  Flag,
  ArrowRight,
  ShieldCheck,
  Building2,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Support & Help Center | BharatExam Tracker",
  description:
    "Learn how official government recruitment discovery, multi-stage application tracking, eligibility checks, and privacy protections work on BharatExam Tracker.",
};

export default function HelpCenterPage() {
  const helpTopics = [
    {
      id: "how-to-apply",
      icon: ExternalLink,
      title: "How Official Applications Work",
      summary: "Why you apply directly on the commission portal, not through third parties.",
      content: `BharatExam Tracker is designed to ensure 100% authenticity and security. When you click 'Apply on Official Portal', you are routed directly to the verified commission website (such as ssc.gov.in, upsc.gov.in, or ibps.in). We never accept application fees or submit forms on your behalf. After completing your application on the government portal, return here and click 'Track My Application' to log your registration number and begin tracking.`,
    },
    {
      id: "multi-stage-tracking",
      icon: Layers,
      title: "Multi-Stage Dynamic Progression",
      summary: "How Tier 1, Mains, CBT 2, Skill Tests, and Document Verification are tracked.",
      content: `Government exams rarely have uniform stage names. Our platform uses a dynamic stage engine: whether a recruitment uses Tier 1 → Tier 2, CBT 1 → CBT 2, or Written Exam → Interview, the tracker adapts. When official results are released, you mark your outcome ('Selected for Next Stage' or 'Not Selected'). Only qualified candidates unlock future stage tracking and admit card alerts.`,
    },
    {
      id: "eligibility-engine",
      icon: CheckCircle2,
      title: "Eligibility Compatibility Engine",
      summary: "How degrees, age windows, and category relaxations are matched.",
      content: `Our engine compares your Candidate Profile (degree, branch, graduation year, date of birth, category) against the recruitment rules. It transparently shows you matching factors (e.g. 'Bachelor's Degree matched', 'Age within 18-30 limit'). It is an advisory tool—critical requirements must always be cross-referenced with the official notification PDF.`,
    },
    {
      id: "status-meanings",
      icon: Calendar,
      title: "Interpreting Recruitment Statuses",
      summary: "Clear definitions for active, upcoming, admit card, and result states.",
      content: `🟢 Applications Open: Official submission window is currently accepting registrations.\n🟡 Upcoming: Notice announced; application window opening soon.\n🎫 Admit Card Released: Official hall tickets are downloadable via the direct commission link.\n🎉 Result Released: Scorecards/merit lists published; outcome confirmation required.\n🔴 Applications Closed: Registration deadline has passed; examination process underway.`,
    },
    {
      id: "privacy-vault",
      icon: Lock,
      title: "Candidate Document Vault & Privacy",
      summary: "How your personal documents, certificates, and notes are protected.",
      content: `Your Candidate Vault stores documents (degree certificates, marksheets, category proofs) solely for your application readiness. Documents are never submitted automatically or exposed publicly. You have complete data portability: export your entire history anytime as JSON/CSV or delete your account permanently in the Privacy Center.`,
    },
    {
      id: "reporting-errors",
      icon: Flag,
      title: "Reporting Discrepancies or Broken Links",
      summary: "Help maintain commission data accuracy across India.",
      content: `If you detect a conflicting date or a broken official link, click 'Report Error' on the recruitment page or email editorial@bharatexam.org. Our automated URL health monitor and editorial data review desk verify and log corrigendums within 4 hours.`,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
            <HelpCircle className="w-3.5 h-3.5" />
            Support & Knowledge Base
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            How BharatExam Tracker Works
          </h1>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">
            Everything you need to know about official recruitment discovery, dynamic exam stages, eligibility analysis, and personal data privacy.
          </p>
        </div>

        {/* Mandatory Independent Platform Disclaimer */}
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs leading-relaxed flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold text-amber-200 block mb-0.5">
              Important Authority Disclaimer:
            </strong>
            BharatExam Tracker is an independent discovery and personal tracking platform. We are NOT affiliated with, authorized by, or an agency of the Government of India, any State Government, or any recruiting commission (SSC, UPSC, IBPS, RRB). All official applications, admit card downloads, and fee payments take place exclusively on the respective commission portals.
          </div>
        </div>

        {/* Topics Grid */}
        <div className="space-y-4">
          {helpTopics.map((topic) => {
            const Icon = topic.icon;
            return (
              <div
                key={topic.id}
                id={topic.id}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all space-y-2.5"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">{topic.title}</h3>
                    <p className="text-xs text-slate-400">{topic.summary}</p>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed pl-11 whitespace-pre-line">
                  {topic.content}
                </p>
              </div>
            );
          })}
        </div>

        {/* Footer Navigation Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-800">
          <Link
            href="/trust"
            className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-blue-500/30 transition-all flex items-center justify-between group"
          >
            <div>
              <span className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors block">
                Trust & Transparency Page →
              </span>
              <span className="text-[11px] text-slate-500">
                How official sources are vetted and verified.
              </span>
            </div>
            <ShieldCheck className="w-4 h-4 text-slate-500 group-hover:text-blue-400" />
          </Link>

          <Link
            href="/privacy-center"
            className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/30 transition-all flex items-center justify-between group"
          >
            <div>
              <span className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors block">
                Privacy Center & Data Export →
              </span>
              <span className="text-[11px] text-slate-500">
                Manage your document vault and privacy settings.
              </span>
            </div>
            <Lock className="w-4 h-4 text-slate-500 group-hover:text-emerald-400" />
          </Link>
        </div>
      </div>
    </div>
  );
}
