import { Metadata } from "next";
import Link from "next/link";
import {
  ShieldCheck,
  Building2,
  Clock,
  Cpu,
  FileCheck2,
  AlertTriangle,
  Mail,
  ExternalLink,
  ShieldAlert,
  Sparkles,
  GitBranch,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Trust & Transparency Protocol | BharatExam Tracker",
  description:
    "Learn where BharatExam Tracker sources government exam data, how official sources are verified, how AI extraction and human reviews operate, and our platform non-guarantees.",
};

export default function TrustPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            Official Source Integrity & Data Policy
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Trust & Transparency Architecture
          </h1>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">
            Our multi-layer verification methodology ensures Indian graduates and freshers receive authenticated, citation-backed government exam intelligence.
          </p>
        </div>

        {/* Core Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 1. Official Sources Only */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">1. Where Data Comes From</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Every recruitment record originates exclusively from primary commission portals (e.g. <code>ssc.gov.in</code>, <code>upsc.gov.in</code>, <code>ibps.in</code>) and official Gazette notifications. We do not aggregate from unverified blogs, forum rumors, or third-party job aggregators.
            </p>
          </div>

          {/* 2. Automated Monitoring Cadence */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">2. Monitoring Cadence</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Automated source monitors poll official recruitment notice boards every 2 to 4 hours. URL health checks validate that application portals and admit card links are active and return valid HTTP 200 responses.
            </p>
          </div>

          {/* 3. AI Extraction + Citation Traceability */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">3. AI Extraction & Traceability</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              When notifications are published as PDFs, our extraction pipeline captures vacancies, age limits, pay scales, and exam dates with citation-level traceability—recording the exact PDF page, clause, and raw text excerpt.
            </p>
          </div>

          {/* 4. Human Review Queue */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">4. Human Review & Conflict Protocol</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              When commission channels disagree (e.g. portal banner shows a 3-day extension while the PDF shows the original deadline), we never silently guess. We flag the conflict on the recruitment card and route it to our Human Review Queue.
            </p>
          </div>
        </div>

        {/* Platform Non-Guarantees Section */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white">Platform Non-Guarantees</h3>
          </div>
          <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
            <p>
              • <strong>Not an Official Portal:</strong> BharatExam Tracker is an independent software tool. We do not conduct examinations, issue official hall tickets, or process government employment applications.
            </p>
            <p>
              • <strong>Advisory Eligibility:</strong> Compatibility scores (e.g. "Eligible", "Category condition requires verification") are algorithmic comparisons and do not constitute an official admission decision. You must review the official commission gazette.
            </p>
            <p>
              • <strong>Personal Timelines:</strong> Personal schedules, shift reminders, and result marks are saved by the user and do not alter the commission’s master database.
            </p>
          </div>
        </div>

        {/* Error Reporting */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-blue-400" />
              Found an Inaccuracy or Broken URL?
            </h4>
            <p className="text-xs text-slate-400">
              Contact our editorial desk directly at <code>editorial@bharatexam.org</code>. Corrigendums are verified and updated with immutable audit logs.
            </p>
          </div>

          <Link
            href="/help"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shrink-0 transition-colors"
          >
            Visit Help Center
          </Link>
        </div>
      </div>
    </div>
  );
}
