"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ExternalLink,
  BookmarkCheck,
  CheckCircle2,
  Calendar,
  Users,
  GraduationCap,
  Building2,
  IndianRupee,
  FileText,
  AlertTriangle,
  Clock,
  Award,
  Layers,
  ShieldCheck,
  ChevronRight,
  Download,
  Sparkles,
  Lock,
  FileCheck2,
  Scale,
} from "lucide-react";
import { RecruitmentItem, CandidateProfileData } from "@/types";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { SalaryBadge } from "@/components/ui/SalaryBadge";
import { DynamicStageTimeline } from "@/components/stages/DynamicStageTimeline";
import { EligibilityBadge } from "@/components/eligibility/EligibilityBadge";
import { WhyAmIEligibleModal } from "@/components/eligibility/WhyAmIEligibleModal";
import { evaluateEligibilityCompatibility } from "@/lib/eligibility-engine";
import { ShortlistButton } from "@/components/shortlist/ShortlistButton";
import { ApplicationChecklistModal } from "@/components/checklists/ApplicationChecklistModal";
import { ApplicationVaultModal } from "@/components/vault/ApplicationVaultModal";
import RecruitmentNotesModal from "@/components/notes/RecruitmentNotesModal";

export default function RecruitmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [recruitment, setRecruitment] = useState<RecruitmentItem | null>(null);
  const [profile, setProfile] = useState<CandidateProfileData | null>(null);
  const [showWhyEligibleModal, setShowWhyEligibleModal] = useState(false);
  const [showChecklistModal, setShowChecklistModal] = useState(false);
  const [showVaultModal, setShowVaultModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isApplied, setIsApplied] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [regNo, setRegNo] = useState("");
  const [rollNo, setRollNo] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchRecruitment();
    checkIfApplied();
    fetchProfile();
  }, [id]);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/profile");
      const data = await res.json();
      if (data.profile) setProfile(data.profile);
    } catch {
      // ignore
    }
  };

  const fetchRecruitment = async () => {
    try {
      const res = await fetch(`/api/recruitments/${id}`);
      const data = await res.json();
      if (res.ok) {
        setRecruitment(data.recruitment);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const checkIfApplied = async () => {
    try {
      const res = await fetch("/api/applications");
      if (res.ok) {
        const data = await res.json();
        const found = (data.applications || []).some((a: any) => a.recruitmentId === id);
        setIsApplied(found);
      }
    } catch {
      // not logged in or error
    }
  };

  const handleApplyOfficially = () => {
    if (recruitment?.officialApplyUrl) {
      window.open(recruitment.officialApplyUrl, "_blank", "noopener,noreferrer");
    }
  };

  const handleMarkApplied = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recruitmentId: id,
          registrationNumber: regNo || undefined,
          rollNumber: rollNo || undefined,
          notes: notes || undefined,
        }),
      });

      if (res.ok) {
        setIsApplied(true);
        setShowApplyModal(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12 space-y-6 animate-pulse">
        <div className="h-8 w-1/3 bg-slate-800 rounded-xl" />
        <div className="h-64 bg-slate-900 rounded-3xl border border-slate-800" />
      </div>
    );
  }

  if (!recruitment) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Recruitment Not Found</h2>
        <p className="text-xs text-slate-400">The requested recruitment does not exist in our verified database.</p>
        <Link href="/discover" className="inline-block px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold">
          Return to Discovery
        </Link>
      </div>
    );
  }

  const examPattern = recruitment.examPatternJson
    ? JSON.parse(recruitment.examPatternJson)
    : [];

  const analysis = recruitment
    ? evaluateEligibilityCompatibility(recruitment, profile)
    : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-400">
        <Link href="/" className="hover:text-white">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/discover" className="hover:text-white">Recruitments</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-300 truncate max-w-xs">{recruitment.title}</span>
      </nav>

      {/* Hero Header Card */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-xs px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase tracking-wider">
                {recruitment.organization.shortName} • {recruitment.organization.category}
              </span>
              <StatusBadge status={recruitment.status} />
              {recruitment.fresherEligible && (
                <span className="font-bold text-xs px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Freshers Eligible</span>
                </span>
              )}
              {analysis && (
                <div className="flex items-center gap-2 pl-1">
                  <EligibilityBadge status={analysis.determination} size="md" />
                  <button
                    type="button"
                    onClick={() => setShowWhyEligibleModal(true)}
                    className="text-xs font-bold text-blue-400 hover:text-blue-300 hover:underline flex items-center gap-1"
                  >
                    <span>Why am I eligible?</span>
                  </button>
                </div>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-snug">
              {recruitment.title}
            </h1>

            <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
              {recruitment.shortDescription}
            </p>

            <div className="flex items-center gap-4 text-xs text-slate-400 pt-1">
              {recruitment.notificationNumber && (
                <span>Notice No: <strong className="text-slate-300">{recruitment.notificationNumber}</strong></span>
              )}
              <span>Last Verified: <strong className="text-slate-300">{new Date(recruitment.lastOfficialVerifiedAt).toLocaleDateString()}</strong></span>
            </div>
          </div>

          {/* Sticky/Fixed Actions Bar on Header */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 min-w-[240px] shrink-0">
            <button
              onClick={handleApplyOfficially}
              className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02]"
              title={`Direct official website: ${recruitment.officialApplyUrl}`}
            >
              <span>Apply Officially</span>
              <ExternalLink className="w-4 h-4 text-blue-200" />
            </button>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setShowChecklistModal(true)}
                className="flex items-center justify-center gap-1.5 px-2.5 py-2.5 rounded-xl bg-blue-600/15 hover:bg-blue-600/25 border border-blue-500/30 text-blue-300 text-xs font-semibold transition-colors"
                title="Preparation Checklist"
              >
                <FileCheck2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>Checklist</span>
              </button>

              <button
                type="button"
                onClick={() => setShowVaultModal(true)}
                className="flex items-center justify-center gap-1.5 px-2.5 py-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-semibold transition-colors"
                title="Reference & Receipt Vault"
              >
                <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Vault</span>
              </button>

              <button
                type="button"
                onClick={() => setShowNotesModal(true)}
                className="flex items-center justify-center gap-1.5 px-2.5 py-2.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-300 text-xs font-semibold transition-colors"
                title="Private Workspace Notes"
              >
                <FileText className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <span>Notes</span>
              </button>
            </div>

            <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800">
              <ShortlistButton recruitmentId={recruitment.id} variant="button" />

              <Link
                href={`/compare?ids=${recruitment.id}`}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
                title="Compare with another recruitment side-by-side"
              >
                <Scale className="w-3.5 h-3.5 text-indigo-400" />
                <span>Compare</span>
              </Link>
            </div>

            {isApplied ? (
              <Link
                href="/my-exams"
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 text-sm font-bold hover:bg-emerald-600/30 transition-colors"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>✓ Tracking Application</span>
              </Link>
            ) : (
              <button
                onClick={() => setShowApplyModal(true)}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-sm font-bold transition-colors"
              >
                <BookmarkCheck className="w-4 h-4 text-blue-400" />
                <span>I've Applied</span>
              </button>
            )}

            <a
              href={recruitment.officialNotificationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 px-4 py-2 text-xs text-slate-400 hover:text-white font-medium"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Official Notification PDF</span>
              <ExternalLink className="w-3 h-3 text-slate-500" />
            </a>
          </div>
        </div>

        {/* Change History Corrigendum Banner (Feature 15: Change Detection) */}
        {recruitment.changeHistory && recruitment.changeHistory.length > 0 && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-300 text-sm">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Official Corrigendum / Notification Updates Detected</span>
            </div>
            {recruitment.changeHistory.map((ch) => (
              <div key={ch.id} className="pl-6 text-xs text-amber-200/90 leading-relaxed">
                <span className="font-semibold text-white">⚠ {ch.changedField} Updated: </span>
                <span className="line-through text-amber-400/80 mr-2">Old: {ch.oldValue}</span>
                <span className="font-bold text-emerald-400">New: {ch.newValue}</span>
                {ch.changeReason && <span className="text-amber-300/80 ml-2">({ch.changeReason})</span>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Grid of Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 cols): Stages, Syllabus, Pattern */}
        <div className="lg:col-span-2 space-y-8">
          {/* Eligibility Compatibility Engine Section (17-Factor Rules Analysis) */}
          {analysis && (
            <div className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-blue-400" />
                    <h3 className="text-base font-bold text-white tracking-tight">
                      Eligibility Compatibility Engine
                    </h3>
                    <EligibilityBadge status={analysis.determination} size="sm" />
                  </div>
                  <p className="text-xs text-slate-400">
                    Transparent 17-factor rule evaluation (Engine v{analysis.ruleVersion} • {analysis.cycleYear} Cycle)
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowWhyEligibleModal(true)}
                    className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/30 transition-all flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-blue-200" />
                    <span>Why am I eligible?</span>
                  </button>

                  <a
                    href={recruitment.officialNotificationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors flex items-center gap-1"
                  >
                    <FileText className="w-3.5 h-3.5 text-blue-400" />
                    <span>Check official notification</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>
                </div>
              </div>

              {/* Indicative Non-Official Disclaimer */}
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-[11px] text-amber-200/90 leading-relaxed">
                  {analysis.disclaimer}
                </p>
              </div>

              {/* Cut-off Reference Date */}
              {analysis.cutoffDescription && (
                <div className="p-2.5 rounded-xl bg-blue-950/30 border border-blue-500/20 text-blue-300 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-400" />
                    <span>{analysis.cutoffDescription}</span>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-blue-400">Crucial Cut-Off</span>
                </div>
              )}

              {/* Factor Breakdown Preview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {analysis.factors.slice(0, 6).map((f, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-2xl border text-xs space-y-1 ${
                      f.status === "PASSED"
                        ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-300"
                        : f.status === "FAILED"
                        ? "bg-rose-950/20 border-rose-500/30 text-rose-300"
                        : f.status === "CONDITION_REQUIRES_VERIFICATION"
                        ? "bg-amber-950/20 border-amber-500/30 text-amber-300"
                        : "bg-slate-800/40 border-slate-700/60 text-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-[11px]">{f.factorName}</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-900/60 border border-slate-800">
                        {f.status === "PASSED"
                          ? "✓ Matched"
                          : f.status === "FAILED"
                          ? "✕ Failed"
                          : f.status === "CONDITION_REQUIRES_VERIFICATION"
                          ? "⚠ Verification Req."
                          : "? Incomplete Data"}
                      </span>
                    </div>
                    <p className="text-[11px] leading-snug">{f.explanation}</p>
                  </div>
                ))}
              </div>

              <div className="pt-2 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80">
                <span>
                  Evaluated {analysis.passedCount} verified factors, {analysis.verificationCount} conditions requiring verification, and {analysis.unclearCount} factors with incomplete data.
                </span>
                <button
                  type="button"
                  onClick={() => setShowWhyEligibleModal(true)}
                  className="text-blue-400 font-bold hover:underline"
                >
                  Inspect all 17 factors →
                </button>
              </div>
            </div>
          )}

          {/* Dynamic Stages Section */}
          <div className="glass-panel rounded-3xl p-6 border border-slate-800">
            <DynamicStageTimeline
              stages={recruitment.stages}
              isApplied={isApplied}
            />
          </div>

          {/* Job Description & Posts */}
          <div className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-400" />
              <span>Posts, Vacancies & Department Breakdown</span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              {recruitment.fullDescription}
            </p>

            {recruitment.posts && recruitment.posts.length > 0 && (
              <div className="overflow-x-auto mt-4">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px]">
                      <th className="py-2.5 px-3">Post Name</th>
                      <th className="py-2.5 px-3">Department</th>
                      <th className="py-2.5 px-3">Vacancies</th>
                      <th className="py-2.5 px-3">Qualification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {recruitment.posts.map((post) => (
                      <tr key={post.id} className="hover:bg-slate-800/30">
                        <td className="py-2.5 px-3 font-semibold text-white">{post.postName}</td>
                        <td className="py-2.5 px-3 text-slate-300">{post.department || "Not specified"}</td>
                        <td className="py-2.5 px-3 text-blue-400 font-bold">
                          {post.vacancies ? post.vacancies.toLocaleString() : "Not specified"}
                        </td>
                        <td className="py-2.5 px-3 text-slate-400">{post.qualifications}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Exam Pattern & Syllabus */}
          <div className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-400" />
              <span>Exam Pattern & Selection Scheme</span>
            </h3>

            {recruitment.selectionProcessSummary && (
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
                <span className="font-semibold text-slate-300 block mb-1">Selection Scheme:</span>
                <p className="text-slate-400 leading-relaxed">{recruitment.selectionProcessSummary}</p>
              </div>
            )}

            {examPattern.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px]">
                      <th className="py-2.5 px-3">Section / Subject</th>
                      <th className="py-2.5 px-3">Questions</th>
                      <th className="py-2.5 px-3">Maximum Marks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {examPattern.map((p: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-800/30">
                        <td className="py-2.5 px-3 font-medium text-white">{p.section}</td>
                        <td className="py-2.5 px-3 text-slate-300">{p.questions}</td>
                        <td className="py-2.5 px-3 text-emerald-400 font-bold">{p.marks}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {recruitment.syllabusSummary && (
              <div className="pt-2 text-xs text-slate-400 leading-relaxed">
                <span className="font-semibold text-slate-300 block mb-1">Syllabus Overview:</span>
                <p>{recruitment.syllabusSummary}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1 col): Key Parameters & Dates */}
        <div className="space-y-6">
          {/* Important Dates Box */}
          <div className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-400" />
              <span>Important Dates</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-2 border-b border-slate-800/80">
                <span className="text-slate-400">Applications Open</span>
                <span className="font-semibold text-white">
                  {recruitment.appStartDate
                    ? new Date(recruitment.appStartDate).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : "Not specified"}
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-800/80">
                <span className="text-slate-400">Application Deadline</span>
                <span className="font-bold text-amber-400">
                  {recruitment.appDeadline
                    ? new Date(recruitment.appDeadline).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : "Not specified"}
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-800/80">
                <span className="text-slate-400">Admit Card Status</span>
                <span className="font-semibold text-slate-200">
                  {recruitment.status === "ADMIT_CARD_OUT" ? "Available Now" : "Not Announced"}
                </span>
              </div>
            </div>
          </div>

          {/* Eligibility & Age Limits */}
          <div className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-emerald-400" />
              <span>Eligibility & Age Criteria</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 text-[11px] block">Educational Qualifications:</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {recruitment.qualifications.map((q) => (
                    <span
                      key={q.id}
                      className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-200 font-medium border border-slate-700"
                    >
                      {q.qualificationCode.replace("_", " ")}
                    </span>
                  ))}
                </div>
              </div>

              <div className="py-2 border-t border-slate-800/80">
                <span className="text-slate-400 text-[11px] block">Age Limit:</span>
                <span className="font-semibold text-white">
                  {recruitment.minAge && recruitment.maxAge
                    ? `${recruitment.minAge} to ${recruitment.maxAge} Years`
                    : "Not specified"}
                </span>
              </div>

              {recruitment.ageRelaxationDetails && (
                <div className="py-2 border-t border-slate-800/80">
                  <span className="text-slate-400 text-[11px] block">Age Relaxation:</span>
                  <span className="text-slate-300 leading-relaxed text-[11px]">
                    {recruitment.ageRelaxationDetails}
                  </span>
                </div>
              )}

              <div className="py-2 border-t border-slate-800/80">
                <span className="text-slate-400 text-[11px] block">Experience Requirement:</span>
                <span className="font-semibold text-emerald-400">
                  {recruitment.fresherEligible ? "No experience required (Freshers Eligible)" : recruitment.experienceReq || "Experience Required"}
                </span>
              </div>
            </div>
          </div>

          {/* Salary & Emoluments */}
          <div className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <IndianRupee className="w-4 h-4 text-emerald-400" />
              <span>Salary & Emoluments</span>
            </h3>

            <div className="space-y-3 text-xs">
              <SalaryBadge
                payScale={recruitment.payScale}
                inHandMin={recruitment.inHandSalaryMin}
                inHandMax={recruitment.inHandSalaryMax}
              />

              {recruitment.allowances && (
                <div className="pt-2 text-[11px] text-slate-400 leading-relaxed">
                  <span className="font-semibold text-slate-300 block mb-1">Applicable Allowances:</span>
                  <p>{recruitment.allowances}</p>
                </div>
              )}
            </div>
          </div>

          {/* Application Fee */}
          <div className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-3 text-xs">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Application Fee
            </h3>
            <div className="flex items-center justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">General / OBC / EWS</span>
              <span className="font-semibold text-white">
                {recruitment.appFeeGeneral !== null ? `₹${recruitment.appFeeGeneral}` : "Not specified"}
              </span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-slate-400">SC / ST / PwD / Women</span>
              <span className="font-semibold text-emerald-400">
                {recruitment.appFeeReserved !== null ? (recruitment.appFeeReserved === 0 ? "Exempted (₹0)" : `₹${recruitment.appFeeReserved}`) : "Not specified"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal for "I've Applied" */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl glass-panel bg-slate-900 border border-slate-700 shadow-2xl p-6">
            <h3 className="text-base font-bold text-white">Track Your Application</h3>
            <p className="text-xs text-slate-400 mt-1">
              Add {recruitment.title} to your personal dashboard to track dynamic exam stages, shift assignments, and admit cards.
            </p>

            <form onSubmit={handleMarkApplied} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Registration / Application Number (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. SSC2026CGL984210"
                  value={regNo}
                  onChange={(e) => setRegNo(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Roll Number (If allotted)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 2201048892"
                  value={rollNo}
                  onChange={(e) => setRollNo(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Personal Target / Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Target Post: Inspector of Income Tax"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-xs text-slate-300 hover:bg-slate-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/30 transition-colors"
                >
                  {submitting ? "Adding..." : "Add to My Exams"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Why Am I Eligible Modal */}
      {analysis && (
        <WhyAmIEligibleModal
          isOpen={showWhyEligibleModal}
          onClose={() => setShowWhyEligibleModal(false)}
          analysis={analysis}
        />
      )}

      {/* Preparation Checklist Modal */}
      <ApplicationChecklistModal
        isOpen={showChecklistModal}
        onClose={() => setShowChecklistModal(false)}
        recruitmentId={recruitment.id}
        recruitmentTitle={recruitment.title}
        organizationName={recruitment.organization?.name}
        officialNotificationUrl={recruitment.officialNotificationUrl}
        officialApplyUrl={recruitment.officialApplyUrl}
      />

      {/* Application Reference & Receipt Vault Modal */}
      <ApplicationVaultModal
        isOpen={showVaultModal}
        onClose={() => setShowVaultModal(false)}
        recruitmentId={recruitment.id}
        recruitmentTitle={recruitment.title}
        organizationName={recruitment.organization?.name}
        officialApplyUrl={recruitment.officialApplyUrl}
      />

      {/* Recruitment Notes & Private Workspace Modal */}
      <RecruitmentNotesModal
        isOpen={showNotesModal}
        onClose={() => setShowNotesModal(false)}
        recruitmentId={recruitment.id}
        recruitmentTitle={recruitment.title}
      />
    </div>
  );
}
