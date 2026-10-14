"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ExternalLink,
  BookmarkCheck,
  CheckCircle2,
  Calendar,
  Users,
  GraduationCap,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Building2,
  FileText,
  Scale,
  Lock,
  FileCheck2,
} from "lucide-react";
import { RecruitmentItem, CandidateProfileData } from "@/types";
import { evaluateRecruitmentMatch } from "@/lib/profile-matcher";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { SalaryBadge } from "@/components/ui/SalaryBadge";
import { EligibilityBadge } from "@/components/eligibility/EligibilityBadge";
import { WhyAmIEligibleModal } from "@/components/eligibility/WhyAmIEligibleModal";
import { ShortlistButton } from "@/components/shortlist/ShortlistButton";
import { ApplicationChecklistModal } from "@/components/checklists/ApplicationChecklistModal";
import { ApplicationVaultModal } from "@/components/vault/ApplicationVaultModal";
import RecruitmentNotesModal from "@/components/notes/RecruitmentNotesModal";

interface RecruitmentCardProps {
  recruitment: RecruitmentItem;
  candidateProfile?: CandidateProfileData | null;
  isApplied?: boolean;
  onAppliedSuccess?: () => void;
  onOpenProfile?: () => void;
  isSelectedForCompare?: boolean;
  onToggleCompare?: () => void;
}

export function RecruitmentCard({
  recruitment,
  candidateProfile,
  isApplied = false,
  onAppliedSuccess,
  onOpenProfile,
  isSelectedForCompare = false,
  onToggleCompare,
}: RecruitmentCardProps) {
  const [applied, setApplied] = useState(isApplied);
  const [loading, setLoading] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showMatchDetails, setShowMatchDetails] = useState(false);
  const [showWhyEligibleModal, setShowWhyEligibleModal] = useState(false);
  const [showChecklistModal, setShowChecklistModal] = useState(false);
  const [showVaultModal, setShowVaultModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [regNo, setRegNo] = useState("");
  const [rollNo, setRollNo] = useState("");
  const [notes, setNotes] = useState("");

  const match = evaluateRecruitmentMatch(recruitment, candidateProfile);

  const handleApplyClick = () => {
    // 4. Application Flow: Open official application URL in a new browser tab.
    // Do not replace current tab. Do not disguise third party URL.
    window.open(recruitment.officialApplyUrl, "_blank", "noopener,noreferrer");
  };

  const handleMarkApplied = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recruitmentId: recruitment.id,
          registrationNumber: regNo || undefined,
          rollNumber: rollNo || undefined,
          notes: notes || undefined,
        }),
      });

      if (res.ok) {
        setApplied(true);
        setShowApplyModal(false);
        if (onAppliedSuccess) onAppliedSuccess();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formattedDeadline = recruitment.appDeadline
    ? new Date(recruitment.appDeadline).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Not specified";

  // Check if deadline is closing within 7 days
  const isClosingSoon =
    recruitment.appDeadline &&
    new Date(recruitment.appDeadline).getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000 &&
    new Date(recruitment.appDeadline).getTime() > Date.now();

  return (
    <div className="glass-card rounded-xl p-5 flex flex-col justify-between border border-[var(--border-default)] relative group">
      {/* ── Organization & Status header ── */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-default)] flex items-center justify-center shrink-0">
              <Building2 className="w-4.5 h-4.5 text-[var(--accent-400)]" style={{ width: '18px', height: '18px' }} />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide block truncate">
                {recruitment.organization.shortName}
                <span className="font-normal normal-case tracking-normal text-[var(--text-disabled)] ml-1">
                  · {recruitment.organization.category}
                </span>
              </span>
              <p className="text-xs text-[var(--text-tertiary)] truncate">
                {recruitment.organization.name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {onToggleCompare && (
              <button
                type="button"
                onClick={onToggleCompare}
                className={`px-2 py-1 rounded-md border text-xs font-medium flex items-center gap-1 transition-colors ${
                  isSelectedForCompare
                    ? "bg-[var(--semantic-info-bg)] border-[var(--semantic-info-border)] text-[var(--accent-400)]"
                    : "bg-[var(--bg-surface)] border-[var(--border-default)] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
                }`}
                title="Select for side-by-side comparison"
              >
                <Scale className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{isSelectedForCompare ? "Comparing" : "Compare"}</span>
              </button>
            )}
            <ShortlistButton recruitmentId={recruitment.id} variant="icon" />
            <StatusBadge status={recruitment.status} size="sm" />
          </div>
        </div>

        {/* ── Title (primary information, front and centre) ── */}
        <div className="mb-3">
          <Link
            href={`/recruitments/${(recruitment as any).slug || recruitment.id}`}
            className="hover:text-[var(--accent-400)] transition-colors block"
          >
            <h3 className="font-semibold text-[var(--text-primary)] text-base leading-snug">
              {recruitment.title}
            </h3>
          </Link>

          {/* Reliability badge row */}
          <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
            {(recruitment as any).sourceReliabilityState && (
              <span
                className={`text-xs px-2 py-0.5 rounded-md border font-medium ${
                  (recruitment as any).sourceReliabilityState === "VERIFIED_OFFICIAL"
                    ? "bg-[var(--semantic-success-bg)] text-[var(--semantic-success)] border-[var(--semantic-success-border)]"
                    : (recruitment as any).sourceReliabilityState === "CONFLICTING_INFORMATION"
                    ? "bg-[var(--semantic-danger-bg)] text-[var(--semantic-danger)] border-[var(--semantic-danger-border)]"
                    : "bg-[var(--semantic-info-bg)] text-[var(--accent-400)] border-[var(--semantic-info-border)]"
                }`}
              >
                {(recruitment as any).sourceReliabilityState === "VERIFIED_OFFICIAL"
                  ? "✓ Verified Official"
                  : (recruitment as any).sourceReliabilityState === "CONFLICTING_INFORMATION"
                  ? "⚠ Conflicting Notices"
                  : "Official Source Found"}
              </span>
            )}
            {(recruitment as any).cycleName && (
              <span className="text-xs px-1.5 py-0.5 rounded bg-[var(--bg-subtle)] text-[var(--text-tertiary)] font-mono">
                {(recruitment as any).cycleName}
              </span>
            )}
          </div>
        </div>

        {/* ── Short description ── */}
        <p className="text-sm text-[var(--text-secondary)] line-clamp-2 leading-relaxed mb-4">
          {recruitment.shortDescription}
        </p>

        {/* ── Compact eligibility indicator ── */}
        <div className="mb-3 flex items-center gap-2 flex-wrap">
          <EligibilityBadge
            status={match.analysis?.determination || "ELIGIBILITY_UNCLEAR"}
            size="sm"
          />
          {candidateProfile?.isCompleted && (
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-md border ${
                match.score >= 80
                  ? "bg-[var(--semantic-success-bg)] text-[var(--semantic-success)] border-[var(--semantic-success-border)]"
                  : match.score >= 60
                  ? "bg-[var(--semantic-info-bg)] text-[var(--accent-400)] border-[var(--semantic-info-border)]"
                  : "bg-[var(--bg-surface)] text-[var(--text-secondary)] border-[var(--border-default)]"
              }`}
            >
              {match.score}% match
            </span>
          )}
          {match.isFeeExempt && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20">
              Fee-free category
            </span>
          )}
          {match.analysis && (
            <button
              type="button"
              onClick={() => setShowWhyEligibleModal(true)}
              className="text-xs font-medium text-[var(--accent-400)] hover:underline flex items-center gap-1 ml-auto"
            >
              <Sparkles className="w-3 h-3" />
              Eligibility details
            </button>
          )}
        </div>

        {/* (title/description moved above eligibility) */}

        {/* ── Key facts grid ── */}
        <div className="grid grid-cols-2 gap-3 py-3 border-y border-[var(--border-subtle)] mb-3 text-sm">
          <div className="flex items-start gap-2">
            <Users className="w-3.5 h-3.5 text-[var(--accent-400)] shrink-0 mt-0.5" />
            <div>
              <span className="text-xs text-[var(--text-tertiary)] block">Vacancies</span>
              <span className="font-semibold text-[var(--text-primary)] text-sm">
                {recruitment.vacancies ? `${recruitment.vacancies.toLocaleString("en-IN")} posts` : "Not announced"}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <GraduationCap className="w-3.5 h-3.5 text-[var(--semantic-success)] shrink-0 mt-0.5" />
            <div>
              <span className="text-xs text-[var(--text-tertiary)] block">Freshers</span>
              <span className={`font-semibold text-sm ${recruitment.fresherEligible ? "text-[var(--semantic-success)]" : "text-[var(--text-secondary)]"}`}>
                {recruitment.fresherEligible ? "Eligible" : "Exp. required"}
              </span>
            </div>
          </div>

          <div className="col-span-2">
            <SalaryBadge
              payScale={recruitment.payScale}
              inHandMin={recruitment.inHandSalaryMin}
              inHandMax={recruitment.inHandSalaryMax}
            />
          </div>
        </div>

        {/* ── Qualification tags ── */}
        {recruitment.qualifications.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 mb-3">
            {recruitment.qualifications.slice(0, 4).map((q) => (
              <span
                key={q.id}
                className="text-xs px-2 py-0.5 rounded bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border-subtle)]"
              >
                {q.qualificationCode.replace("_", " ")}
              </span>
            ))}
            {recruitment.qualifications.length > 4 && (
              <span className="text-xs text-[var(--text-tertiary)]">
                +{recruitment.qualifications.length - 4} more
              </span>
            )}
          </div>
        )}

        {/* ── Exam stages preview ── */}
        {recruitment.stages && recruitment.stages.length > 0 && (
          <div className="mb-3 p-2.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center gap-1.5 overflow-hidden">
            <span className="text-xs text-[var(--text-disabled)] font-medium uppercase tracking-wider shrink-0">Stages:</span>
            <div className="flex items-center gap-1.5 overflow-hidden text-ellipsis whitespace-nowrap">
              {recruitment.stages.map((st, idx) => (
                <React.Fragment key={st.id}>
                  <span className="text-xs text-[var(--text-secondary)] font-medium">{st.stageName}</span>
                  {idx < recruitment.stages.length - 1 && <span className="text-[var(--text-disabled)] text-xs">→</span>}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      <div className="pt-3 border-t border-[var(--border-subtle)] mt-1">
        {/* Deadline row */}
        <div className="flex items-center justify-between text-xs text-[var(--text-tertiary)] mb-3">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 shrink-0" />
            <span>Last date: <strong className="text-[var(--text-secondary)] font-medium">{formattedDeadline}</strong></span>
          </div>
          {isClosingSoon && (
            <span className="text-xs font-semibold text-amber-400 bg-[var(--semantic-warning-bg)] px-2 py-0.5 rounded border border-[var(--semantic-warning-border)]">
              Closing soon
            </span>
          )}
        </div>

        {/* Notification link */}
        <div className="flex items-center justify-between mb-3">
          <a
            href={recruitment.officialNotificationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--accent-400)] transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-[var(--accent-400)] shrink-0" />
            Official notification
            <ExternalLink className="w-3 h-3 text-[var(--text-disabled)]" />
          </a>
        </div>

        {/* ── Secondary actions (workflow tools) ── */}
        <div className="flex items-center gap-1.5 mb-3">
          <button
            type="button"
            onClick={() => setShowChecklistModal(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-[var(--bg-surface)] hover:bg-[var(--bg-subtle)] border border-[var(--border-default)] text-xs text-[var(--text-secondary)] font-medium transition-colors"
            title="Application preparation checklist"
          >
            <FileCheck2 className="w-3.5 h-3.5 shrink-0" />
            Checklist
          </button>
          <button
            type="button"
            onClick={() => setShowVaultModal(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-[var(--bg-surface)] hover:bg-[var(--bg-subtle)] border border-[var(--border-default)] text-xs text-[var(--text-secondary)] font-medium transition-colors"
            title="Reference & receipt vault"
          >
            <Lock className="w-3.5 h-3.5 shrink-0" />
            Vault
          </button>
          <button
            type="button"
            onClick={() => setShowNotesModal(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-[var(--bg-surface)] hover:bg-[var(--bg-subtle)] border border-[var(--border-default)] text-xs text-[var(--text-secondary)] font-medium transition-colors"
            title="Private workspace notes"
          >
            <FileText className="w-3.5 h-3.5 shrink-0" />
            Notes
          </button>
        </div>

        {/* ── Primary actions ── */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleApplyClick}
            className="btn btn-primary"
            title={`Apply on official portal: ${recruitment.officialApplyUrl}`}
          >
            Apply Officially
            <ExternalLink className="w-3.5 h-3.5" />
          </button>

          {applied ? (
            <Link
              href="/my-exams"
              className="btn btn-sm flex items-center justify-center gap-1.5 bg-[var(--semantic-success-bg)] border border-[var(--semantic-success-border)] text-[var(--semantic-success)] hover:bg-[rgba(16,185,129,0.18)] transition-colors font-semibold text-xs rounded-md py-2 px-3"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Tracking
            </Link>
          ) : (
            <button
              onClick={() => setShowApplyModal(true)}
              className="btn btn-secondary btn-sm"
            >
              <BookmarkCheck className="w-3.5 h-3.5" />
              I&apos;ve Applied
            </button>
          )}
        </div>
      </div>

      {/* ── "I've Applied" modal ── */}
      {showApplyModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
          onClick={(e) => { if (e.target === e.currentTarget) setShowApplyModal(false); }}
        >
          <div className="relative w-full max-w-md rounded-xl glass-panel border border-[var(--border-default)] shadow-[var(--shadow-lg)] p-6">
            <h3 className="text-base font-semibold text-[var(--text-primary)] mb-1">Track Your Application</h3>
            <p className="text-sm text-[var(--text-secondary)] mb-4">
              Add <strong className="text-[var(--text-primary)] font-medium">{recruitment.title}</strong> to your dashboard to track exam stages, shifts, and admit cards.
            </p>

            <form onSubmit={handleMarkApplied} className="space-y-4">
              <div>
                <label className="form-label">
                  Registration / Application Number <span className="font-normal text-[var(--text-disabled)]">(optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. SSC2026CGL984210"
                  value={regNo}
                  onChange={(e) => setRegNo(e.target.value)}
                  className="form-input"
                />
              </div>

              <div>
                <label className="form-label">
                  Roll Number <span className="font-normal text-[var(--text-disabled)]">(if allotted)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. 2201048892"
                  value={rollNo}
                  onChange={(e) => setRollNo(e.target.value)}
                  className="form-input"
                />
              </div>

              <div>
                <label className="form-label">Personal target / notes</label>
                <input
                  type="text"
                  placeholder="e.g. Target: Inspector of Income Tax"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="pt-4 border-t border-[var(--border-subtle)] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="btn btn-ghost btn-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary btn-sm bg-[var(--semantic-success)] border-[var(--semantic-success)] hover:opacity-90"
                >
                  {loading ? "Saving…" : "Add to My Exams"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Why Am I Eligible Full Factor Transparency Modal */}
      {match.analysis && (
        <WhyAmIEligibleModal
          isOpen={showWhyEligibleModal}
          onClose={() => setShowWhyEligibleModal(false)}
          analysis={match.analysis}
          onOpenProfile={onOpenProfile}
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
