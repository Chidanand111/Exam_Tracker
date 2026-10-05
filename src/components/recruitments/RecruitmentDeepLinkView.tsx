"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ExternalLink,
  CheckCircle2,
  Calendar,
  Users,
  GraduationCap,
  Building2,
  IndianRupee,
  FileText,
  AlertTriangle,
  Clock,
  Layers,
  ChevronRight,
  Download,
  Sparkles,
  Lock,
  FileCheck2,
  History,
  GitCommit,
  Share2,
  Check,
} from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { SalaryBadge } from "@/components/ui/SalaryBadge";
import { DynamicStageTimeline } from "@/components/stages/DynamicStageTimeline";
import { EligibilityBadge } from "@/components/eligibility/EligibilityBadge";
import { WhyAmIEligibleModal } from "@/components/eligibility/WhyAmIEligibleModal";
import { ShortlistButton } from "@/components/shortlist/ShortlistButton";
import { ApplicationChecklistModal } from "@/components/checklists/ApplicationChecklistModal";
import { ApplicationVaultModal } from "@/components/vault/ApplicationVaultModal";
import RecruitmentNotesModal from "@/components/notes/RecruitmentNotesModal";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { RecruitmentJsonLd } from "@/components/seo/RecruitmentJsonLd";
import { SourceReliabilityBadge } from "./SourceReliabilityBadge";
import { InformationConflictBanner } from "./InformationConflictBanner";
import { ArchivedBanner } from "./ArchivedBanner";
import { CycleSelector } from "./CycleSelector";
import { VersionHistoryModal } from "./VersionHistoryModal";
import { evaluateEligibilityCompatibility } from "@/lib/eligibility-engine";
import { NotificationPdfViewerModal } from "@/components/notifications/NotificationPdfViewerModal";
import { CitationBadge } from "./CitationBadge";
import { RecruitmentShareModal } from "@/components/sharing/RecruitmentShareModal";

interface Props {
  recruitment: any;
  activeSubTab?: "overview" | "eligibility" | "selection-process" | "important-dates";
}

export function RecruitmentDeepLinkView({
  recruitment,
  activeSubTab = "overview",
}: Props) {
  const router = useRouter();
  const [currentTab, setCurrentTab] = useState(activeSubTab);
  const [showWhyEligibleModal, setShowWhyEligibleModal] = useState(false);
  const [showChecklistModal, setShowChecklistModal] = useState(false);
  const [showVaultModal, setShowVaultModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showPdfViewer, setShowPdfViewer] = useState(false);
  const [viewerInitialPage, setViewerInitialPage] = useState<number>(1);
  const [copiedLink, setCopiedLink] = useState(false);

  // Application Record Modal state
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [regNo, setRegNo] = useState("");
  const [rollNo, setRollNo] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const baseSlug = recruitment.slug || recruitment.id;

  // Build citation lookup by field name
  const citationsByField = (recruitment.citations || []).reduce((acc: any, c: any) => {
    acc[c.fieldName] = c;
    return acc;
  }, {});

  const handleOpenCitationInDoc = (page: number) => {
    setViewerInitialPage(page);
    setShowPdfViewer(true);
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleRecordApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recruitmentId: recruitment.id,
          registrationNumber: regNo,
          rollNumber: rollNo,
          notes,
        }),
      });
      if (res.ok) {
        setShowApplyModal(false);
        router.push("/my-exams");
      } else if (res.status === 401) {
        router.push(`/login?returnUrl=/recruitments/${baseSlug}`);
      } else {
        const data = await res.json();
        alert(data.error || "Failed to record application");
      }
    } catch {
      alert("Error recording application");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16">
      {/* JSON-LD Structured Data */}
      <RecruitmentJsonLd recruitment={recruitment} />

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Breadcrumb Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
          <Breadcrumbs
            items={[
              { label: "Discover", href: "/discover" },
              { label: recruitment.organization.shortName, href: `/discover?search=${recruitment.organization.shortName}` },
              { label: recruitment.title },
            ]}
          />
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowShareModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-xs text-slate-300 transition-colors"
              title="Share public recruitment opportunity"
            >
              <Share2 className="w-3.5 h-3.5 text-blue-400" />
              <span>Share</span>
            </button>
            {recruitment.versions && recruitment.versions.length > 0 && (
              <button
                onClick={() => setShowVersionModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                title="Inspect version diffs"
              >
                <GitCommit className="w-3.5 h-3.5" />
                <span>Version History ({recruitment.versions.length})</span>
              </button>
            )}
          </div>
        </div>

        {/* Archived Banner (Requirement 52) */}
        {(recruitment.isArchived || recruitment.lifecycleStage === "ARCHIVED") && (
          <ArchivedBanner
            cycleYear={recruitment.cycleYear}
            activeCycleSlug={
              recruitment.family?.cycles?.find((c: any) => !c.isArchived)?.slug
            }
          />
        )}

        {/* Conflicting Information Banner (Requirement 51) */}
        {recruitment.conflicts && recruitment.conflicts.length > 0 && (
          <InformationConflictBanner conflicts={recruitment.conflicts} />
        )}

        {/* Source Reliability Badge (Requirement 50) */}
        <SourceReliabilityBadge
          state={recruitment.sourceReliabilityState}
          note={recruitment.sourceReliabilityNote}
          verifiedAt={recruitment.lastOfficialVerifiedAt}
          organizationName={recruitment.organization.name}
          sourceUrl={recruitment.officialNotificationUrl}
        />

        {/* Header Hero Section */}
        <div className="rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900 to-slate-900/50 p-6 sm:p-8 relative overflow-hidden shadow-xl">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="space-y-4 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="px-3 py-1 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400 font-semibold text-xs tracking-wider uppercase">
                  {recruitment.organization.name}
                </span>
                <StatusBadge status={recruitment.status} />
                <span className="px-2.5 py-0.5 rounded-md bg-slate-800 text-slate-300 text-xs">
                  {recruitment.stateLocation || "All India"}
                </span>
                {recruitment.lifecycleStage && (
                  <span className="px-2.5 py-0.5 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20 text-xs font-mono">
                    Lifecycle: {recruitment.lifecycleStage.replace(/_/g, " ")}
                  </span>
                )}
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight leading-snug">
                  {recruitment.title}
                </h1>
                {recruitment.notificationNumber && (
                  <p className="text-xs text-slate-400 font-mono mt-1">
                    Notification No: {recruitment.notificationNumber}
                  </p>
                )}
              </div>

              <p className="text-sm text-slate-300 leading-relaxed">
                {recruitment.shortDescription}
              </p>

              {/* Quick Spec Pills */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <div className="text-[11px] text-slate-400 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-blue-400" />
                      <span>Total Vacancies</span>
                    </div>
                    {citationsByField["vacancies"] && (
                      <CitationBadge
                        citation={citationsByField["vacancies"]}
                        onOpenViewer={handleOpenCitationInDoc}
                        compact
                      />
                    )}
                  </div>
                  <div className="text-base font-bold text-slate-100 mt-1">
                    {recruitment.vacancies ? recruitment.vacancies.toLocaleString("en-IN") : "To be notified"}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <div className="text-[11px] text-slate-400 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <IndianRupee className="w-3.5 h-3.5 text-emerald-400" />
                      <span>In-Hand Salary</span>
                    </div>
                    {citationsByField["payScale"] && (
                      <CitationBadge
                        citation={citationsByField["payScale"]}
                        onOpenViewer={handleOpenCitationInDoc}
                        compact
                      />
                    )}
                  </div>
                  <div className="text-base font-bold text-emerald-400 mt-1">
                    {recruitment.inHandSalaryMin
                      ? `₹${(recruitment.inHandSalaryMin / 1000).toFixed(0)}k - ₹${(recruitment.inHandSalaryMax / 1000).toFixed(0)}k/mo`
                      : "Pay Scale Listed"}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <div className="text-[11px] text-slate-400 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5 text-purple-400" />
                      <span>Age Window</span>
                    </div>
                    {citationsByField["ageLimit"] && (
                      <CitationBadge
                        citation={citationsByField["ageLimit"]}
                        onOpenViewer={handleOpenCitationInDoc}
                        compact
                      />
                    )}
                  </div>
                  <div className="text-base font-bold text-slate-100 mt-1">
                    {recruitment.minAge && recruitment.maxAge ? `${recruitment.minAge} - ${recruitment.maxAge} yrs` : "As per rules"}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <div className="text-[11px] text-slate-400 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-amber-400" />
                      <span>Deadline</span>
                    </div>
                    {citationsByField["appDeadline"] && (
                      <CitationBadge
                        citation={citationsByField["appDeadline"]}
                        onOpenViewer={handleOpenCitationInDoc}
                        compact
                      />
                    )}
                  </div>
                  <div className="text-base font-bold text-amber-400 mt-1 truncate">
                    {recruitment.appDeadline
                      ? new Date(recruitment.appDeadline).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "TBA"}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Card */}
            <div className="flex flex-col gap-3 min-w-[240px] shrink-0">
              <a
                href={recruitment.officialApplyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-center text-sm shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2"
              >
                <span>Apply on Official Portal</span>
                <ExternalLink className="w-4 h-4" />
              </a>

              {recruitment.officialNotificationUrl && (
                <button
                  type="button"
                  onClick={() => {
                    setViewerInitialPage(1);
                    setShowPdfViewer(true);
                  }}
                  className="w-full px-4 py-2.5 rounded-xl border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 text-xs font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>View In-App Notice (PDF)</span>
                </button>
              )}

              <a
                href={recruitment.officialNotificationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-3.5 h-3.5 text-slate-400" />
                <span>Download Official PDF</span>
              </a>

              <button
                onClick={() => setShowApplyModal(true)}
                className="w-full px-4 py-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Track My Application</span>
              </button>

              <div className="pt-2 border-t border-slate-800 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Save Exam:</span>
                  <ShortlistButton recruitmentId={recruitment.id} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setShowChecklistModal(true)}
                    className="p-2 rounded-lg border border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-[11px] text-slate-300 flex items-center justify-center gap-1.5"
                  >
                    <FileCheck2 className="w-3.5 h-3.5 text-blue-400" />
                    <span>Checklist</span>
                  </button>
                  <button
                    onClick={() => setShowNotesModal(true)}
                    className="p-2 rounded-lg border border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-[11px] text-slate-300 flex items-center justify-center gap-1.5"
                  >
                    <Lock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Private Notes</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recruitment Cycles Selector (Requirement 53) */}
        {recruitment.family && (
          <CycleSelector
            familyName={recruitment.family.name}
            currentRecruitmentId={recruitment.id}
            cycles={recruitment.family.cycles || []}
          />
        )}

        {/* Deep Link Sub-Tabs Navigation (Requirement 47) */}
        <div className="border-b border-slate-800">
          <nav className="flex space-x-6 overflow-x-auto text-sm font-medium">
            <Link
              href={`/recruitments/${baseSlug}`}
              className={`py-3 border-b-2 transition-colors whitespace-nowrap ${
                currentTab === "overview"
                  ? "border-blue-500 text-blue-400 font-semibold"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
              onClick={() => setCurrentTab("overview")}
            >
              Overview & Posts
            </Link>

            <Link
              href={`/recruitments/${baseSlug}/eligibility`}
              className={`py-3 border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                currentTab === "eligibility"
                  ? "border-blue-500 text-blue-400 font-semibold"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
              onClick={() => setCurrentTab("eligibility")}
            >
              <span>Eligibility & Rules</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 font-mono">
                Engine
              </span>
            </Link>

            <Link
              href={`/recruitments/${baseSlug}/selection-process`}
              className={`py-3 border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                currentTab === "selection-process"
                  ? "border-blue-500 text-blue-400 font-semibold"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
              onClick={() => setCurrentTab("selection-process")}
            >
              <span>Selection Process & Stages</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
                {recruitment.stages?.length || 0} Stages
              </span>
            </Link>

            <Link
              href={`/recruitments/${baseSlug}/important-dates`}
              className={`py-3 border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                currentTab === "important-dates"
                  ? "border-blue-500 text-blue-400 font-semibold"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
              onClick={() => setCurrentTab("important-dates")}
            >
              <span>Important Dates & Shift Blueprint</span>
            </Link>
          </nav>
        </div>

        {/* Tab 1: Overview & Posts */}
        {currentTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Full Description */}
              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-3">
                <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-400" />
                  Official Notification Overview
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                  {recruitment.fullDescription}
                </p>
              </div>

              {/* Vacancy Breakdown Table */}
              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-purple-400" />
                    Cadre & Post Wise Vacancy Distribution
                  </h3>
                  <span className="text-xs text-slate-500">
                    {recruitment.posts?.length || 0} Designated Posts
                  </span>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-800">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950/80 text-slate-400 font-mono border-b border-slate-800">
                      <tr>
                        <th className="p-3">Post Title</th>
                        <th className="p-3">Department</th>
                        <th className="p-3">Prescribed Qualification</th>
                        <th className="p-3 text-right">Vacancies</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {recruitment.posts && recruitment.posts.length > 0 ? (
                        recruitment.posts.map((post: any) => (
                          <tr key={post.id} className="hover:bg-slate-900/50">
                            <td className="p-3 font-medium text-slate-200">{post.postName}</td>
                            <td className="p-3 text-slate-400">{post.department || "General"}</td>
                            <td className="p-3 text-slate-300">{post.qualifications}</td>
                            <td className="p-3 text-right font-mono font-bold text-blue-400">
                              {post.vacancies ? post.vacancies.toLocaleString("en-IN") : "Indicated"}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="p-4 text-center text-slate-500">
                            All vacancies allocated under common cadre.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Sidebar Details */}
            <div className="space-y-6">
              {/* Pay Scale & Allowances */}
              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-4">
                <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                  <IndianRupee className="w-4 h-4 text-emerald-400" />
                  Salary Structure & Entitlements
                </h3>
                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <div className="text-xs text-slate-400">Pay Band:</div>
                  <div className="text-sm font-bold text-slate-200">{recruitment.payScale}</div>
                  {recruitment.allowances && (
                    <div className="text-xs text-slate-400 border-t border-slate-800/80 pt-2 leading-relaxed">
                      <span className="font-semibold text-slate-300">Allowances Included: </span>
                      {recruitment.allowances}
                    </div>
                  )}
                </div>
              </div>

              {/* Official Application Fee Structure */}
              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-3">
                <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400" />
                  Application Fee
                </h3>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                    <span className="text-slate-400 block">General / OBC:</span>
                    <span className="text-sm font-bold text-slate-200 mt-0.5 block">
                      {recruitment.appFeeGeneral !== null ? `₹${recruitment.appFeeGeneral}` : "Exempted"}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                    <span className="text-slate-400 block">SC / ST / PwD:</span>
                    <span className="text-sm font-bold text-emerald-400 mt-0.5 block">
                      {recruitment.appFeeReserved !== null ? `₹${recruitment.appFeeReserved}` : "Exempted"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Eligibility & Rules */}
        {currentTab === "eligibility" && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-blue-400" />
                    Official Eligibility Determination Rules
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Transparent rule evaluation comparing qualification, age window, category relaxation, and fresher eligibility.
                  </p>
                </div>
                <button
                  onClick={() => setShowWhyEligibleModal(true)}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors flex items-center gap-2 shrink-0"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Check My Profile Compatibility</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                  <span className="text-xs text-slate-400 font-medium">Educational Requirement:</span>
                  <div className="text-sm font-bold text-slate-200">
                    {recruitment.qualifications?.map((q: any) => q.qualificationCode).join(", ") || "Bachelor's Degree in any discipline"}
                  </div>
                  <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Freshers Allowed: {recruitment.fresherEligible ? "Yes" : "Experience Required"}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                  <span className="text-xs text-slate-400 font-medium">Prescribed Age Limits:</span>
                  <div className="text-sm font-bold text-slate-200">
                    {recruitment.minAge} to {recruitment.maxAge} Years
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Cutoff reference calculated as on official notification date.
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                  <span className="text-xs text-slate-400 font-medium">Relaxation Provisions:</span>
                  <div className="text-xs text-slate-300 leading-relaxed font-mono">
                    {recruitment.ageRelaxationDetails || "Standard central government age relaxation rules apply for reserved categories."}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Selection Process & Stages */}
        {currentTab === "selection-process" && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-4">
              <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                <Layers className="w-5 h-5 text-purple-400" />
                Sequential Examination Stages & Pattern
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {recruitment.selectionProcessSummary || "Screening Computer Based Examination followed by Merit Stage and Document Verification."}
              </p>

              {recruitment.stages && recruitment.stages.length > 0 ? (
                <div className="pt-4 space-y-4">
                  {recruitment.stages.map((stage: any, index: number) => (
                    <div
                      key={stage.id}
                      className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-semibold text-blue-400 uppercase">
                          Stage {stage.stageOrder}: {stage.stageName}
                        </span>
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                          {stage.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {stage.description || "Detailed stage instructions available in official notification."}
                      </p>
                      {stage.schedules && stage.schedules.length > 0 && (
                        <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-900 flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-amber-400" />
                          <span>{stage.schedules.length} Exam Shifts Scheduled</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 py-4">Stage details to be announced.</p>
              )}
            </div>
          </div>
        )}

        {/* Tab 4: Important Dates & Shift Blueprint */}
        {currentTab === "important-dates" && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-4">
              <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-400" />
                Official Schedule Timeline
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                  <span className="text-xs text-slate-400">Application Open Date</span>
                  <div className="text-sm font-bold text-slate-200 mt-1">
                    {recruitment.appStartDate
                      ? new Date(recruitment.appStartDate).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })
                      : "Gazette Release Date"}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                  <span className="text-xs text-slate-400">Application Submission Deadline</span>
                  <div className="text-sm font-bold text-amber-400 mt-1">
                    {recruitment.appDeadline
                      ? new Date(recruitment.appDeadline).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })
                      : "Announced in Corrigendum"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Why Am I Eligible Modal */}
      {showWhyEligibleModal && (
        <WhyAmIEligibleModal
          analysis={evaluateEligibilityCompatibility(recruitment, null)}
          isOpen={showWhyEligibleModal}
          onClose={() => setShowWhyEligibleModal(false)}
        />
      )}

      {/* Checklist Modal */}
      {showChecklistModal && (
        <ApplicationChecklistModal
          recruitmentId={recruitment.id}
          recruitmentTitle={recruitment.title}
          isOpen={showChecklistModal}
          onClose={() => setShowChecklistModal(false)}
        />
      )}

      {/* Vault Modal */}
      {showVaultModal && (
        <ApplicationVaultModal
          recruitmentId={recruitment.id}
          recruitmentTitle={recruitment.title}
          isOpen={showVaultModal}
          onClose={() => setShowVaultModal(false)}
        />
      )}

      {/* Notes Modal */}
      {showNotesModal && (
        <RecruitmentNotesModal
          recruitmentId={recruitment.id}
          recruitmentTitle={recruitment.title}
          isOpen={showNotesModal}
          onClose={() => setShowNotesModal(false)}
        />
      )}

      {/* Version History Modal (Requirement 54) */}
      {showVersionModal && (
        <VersionHistoryModal
          recruitmentTitle={recruitment.title}
          versions={recruitment.versions || []}
          isOpen={showVersionModal}
          onClose={() => setShowVersionModal(false)}
        />
      )}

      {/* Application Record Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-semibold text-slate-100">
              Record Application for Progression Tracking
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              After submitting externally on the official commission portal, record your application number
              here to monitor stages, schedules, and admit cards.
            </p>

            <form onSubmit={handleRecordApplication} className="space-y-3 pt-2 text-xs">
              <div>
                <label className="text-slate-300 font-medium block mb-1">
                  Registration / Application Number:
                </label>
                <input
                  type="text"
                  required
                  value={regNo}
                  onChange={(e) => setRegNo(e.target.value)}
                  placeholder="e.g. 20261009842"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">
                  Roll Number (If issued):
                </label>
                <input
                  type="text"
                  value={rollNo}
                  onChange={(e) => setRollNo(e.target.value)}
                  placeholder="e.g. 2201048291"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">
                  Private Application Notes:
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Applied for ASO and Inspector posts, uploaded 35kb photo"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium disabled:opacity-50"
                >
                  {submitting ? "Saving..." : "Save to My Exams"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Notification In-App PDF Viewer Modal (Feature 56) */}
      <NotificationPdfViewerModal
        isOpen={showPdfViewer}
        onClose={() => setShowPdfViewer(false)}
        documentUrl={recruitment.officialNotificationUrl || ""}
        documentTitle={`${recruitment.title} - Official Notification`}
        officialSourceUrl={recruitment.officialApplyUrl}
        documentVersion={recruitment.versions?.[0]?.versionNumber || 1}
        publicationDate={recruitment.appStartDate}
        recruitmentTitle={recruitment.title}
        citations={recruitment.citations || []}
        initialPage={viewerInitialPage}
      />

      {/* Recruitment Sharing Modal (Feature 62) */}
      <RecruitmentShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        recruitment={recruitment}
      />
    </div>
  );
}
