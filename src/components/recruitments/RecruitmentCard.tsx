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
} from "lucide-react";
import { RecruitmentItem, CandidateProfileData } from "@/types";
import { evaluateRecruitmentMatch } from "@/lib/profile-matcher";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { SalaryBadge } from "@/components/ui/SalaryBadge";
import { EligibilityBadge } from "@/components/eligibility/EligibilityBadge";
import { WhyAmIEligibleModal } from "@/components/eligibility/WhyAmIEligibleModal";

interface RecruitmentCardProps {
  recruitment: RecruitmentItem;
  candidateProfile?: CandidateProfileData | null;
  isApplied?: boolean;
  onAppliedSuccess?: () => void;
  onOpenProfile?: () => void;
}

export function RecruitmentCard({
  recruitment,
  candidateProfile,
  isApplied = false,
  onAppliedSuccess,
  onOpenProfile,
}: RecruitmentCardProps) {
  const [applied, setApplied] = useState(isApplied);
  const [loading, setLoading] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showMatchDetails, setShowMatchDetails] = useState(false);
  const [showWhyEligibleModal, setShowWhyEligibleModal] = useState(false);
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
    <div className="glass-card rounded-2xl p-5 flex flex-col justify-between border border-slate-800 relative group overflow-hidden">
      {/* Top Banner & Status */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-center font-bold text-slate-300 text-xs shadow-inner">
              <Building2 className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  {recruitment.organization.shortName}
                </span>
                <span className="text-[10px] text-slate-500 font-medium">
                  • {recruitment.organization.category}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate max-w-[200px] sm:max-w-xs">
                {recruitment.organization.name}
              </p>
            </div>
          </div>

          <StatusBadge status={recruitment.status} size="sm" />
        </div>

        {/* Transparent Eligibility Compatibility Overlay (Indicative, non-destructive) */}
        <div className="mb-3 p-3 rounded-2xl bg-slate-900/90 border border-slate-700/80 shadow-inner space-y-2">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <EligibilityBadge
                status={match.analysis?.determination || "ELIGIBILITY_UNCLEAR"}
                size="sm"
              />

              {candidateProfile && candidateProfile.isCompleted && (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    match.score >= 80
                      ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                      : match.score >= 60
                      ? "bg-blue-500/15 text-blue-400 border-blue-500/30"
                      : "bg-slate-800 text-slate-400 border-slate-700"
                  }`}
                >
                  {match.score}% Score
                </span>
              )}

              {match.isFeeExempt && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30">
                  🎉 100% Fee Free
                </span>
              )}
            </div>

            {/* "Why am I eligible?" Action Button */}
            {match.analysis && (
              <button
                type="button"
                onClick={() => setShowWhyEligibleModal(true)}
                className="text-[11px] font-bold text-blue-400 hover:text-blue-300 hover:underline flex items-center gap-1 shrink-0"
              >
                <Sparkles className="w-3 h-3 text-blue-400" />
                <span>Why am I eligible?</span>
              </button>
            )}
          </div>

          {/* Quick Transparent Factor Explanations */}
          {match.analysis ? (
            <div className="space-y-1 text-[11px]">
              {match.analysis.factors.slice(0, 3).map((f, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-1.5 truncate ${
                    f.status === "PASSED"
                      ? "text-emerald-300"
                      : f.status === "FAILED"
                      ? "text-rose-300 font-semibold"
                      : f.status === "CONDITION_REQUIRES_VERIFICATION"
                      ? "text-amber-300"
                      : "text-slate-400 italic"
                  }`}
                >
                  <span className="shrink-0 font-bold">
                    {f.status === "PASSED"
                      ? "✓"
                      : f.status === "FAILED"
                      ? "✕"
                      : f.status === "CONDITION_REQUIRES_VERIFICATION"
                      ? "⚠"
                      : "?"}
                  </span>
                  <span className="truncate">{f.explanation}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[11px] text-slate-400 italic">
              Eligibility cannot be determined from the available information.
            </p>
          )}

          {/* Subtle Non-Official Disclaimer */}
          <div className="pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
            <span>Automated indicative analysis • Not an official decision</span>
            <button
              type="button"
              onClick={() => setShowWhyEligibleModal(true)}
              className="text-blue-400 hover:underline font-medium"
            >
              View 17 factors →
            </button>
          </div>
        </div>

        {/* Title */}
        <Link href={`/exams/${recruitment.id}`} className="group-hover:text-blue-400 transition-colors">
          <h3 className="font-bold text-white text-base leading-snug tracking-tight mb-2">
            {recruitment.title}
          </h3>
        </Link>

        {/* Short Description */}
        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
          {recruitment.shortDescription}
        </p>

        {/* Highlights Grid */}
        <div className="grid grid-cols-2 gap-2.5 py-3 border-y border-slate-800/80 mb-4 text-xs">
          {/* Vacancies */}
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-400 shrink-0" />
            <div>
              <span className="text-slate-400 text-[10px] block leading-none">Vacancies</span>
              <span className="font-semibold text-white">
                {recruitment.vacancies ? `${recruitment.vacancies.toLocaleString()} Posts` : "Not announced"}
              </span>
            </div>
          </div>

          {/* Fresher Eligibility */}
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <span className="text-slate-400 text-[10px] block leading-none">Freshers</span>
              <span className="font-semibold text-emerald-400">
                {recruitment.fresherEligible ? "Fully Eligible" : "Experience Req."}
              </span>
            </div>
          </div>

          {/* Salary In-Hand Estimate */}
          <div className="col-span-2 pt-1">
            <SalaryBadge
              payScale={recruitment.payScale}
              inHandMin={recruitment.inHandSalaryMin}
              inHandMax={recruitment.inHandSalaryMax}
            />
          </div>
        </div>

        {/* Qualifications Badges */}
        <div className="flex flex-wrap items-center gap-1.5 mb-4">
          {recruitment.qualifications.slice(0, 4).map((q) => (
            <span
              key={q.id}
              className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300 border border-slate-700/60"
            >
              {q.qualificationCode.replace("_", " ")}
            </span>
          ))}
          {recruitment.qualifications.length > 4 && (
            <span className="text-[10px] text-slate-400">
              +{recruitment.qualifications.length - 4} more
            </span>
          )}
        </div>

        {/* Dynamic Stages sequence preview */}
        {recruitment.stages && recruitment.stages.length > 0 && (
          <div className="mb-4 p-2 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 flex items-center gap-1.5 overflow-hidden text-ellipsis whitespace-nowrap">
            <span className="text-slate-500 font-semibold uppercase text-[9px]">Stages:</span>
            {recruitment.stages.map((st, idx) => (
              <React.Fragment key={st.id}>
                <span className="text-slate-300 font-medium">{st.stageName}</span>
                {idx < recruitment.stages.length - 1 && <span className="text-slate-600">→</span>}
              </React.Fragment>
            ))}
          </div>
        )}
      </div>

      {/* Footer Dates & Action Buttons */}
      <div className="pt-2">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Last Date: <strong className="text-slate-200">{formattedDeadline}</strong></span>
          </div>
          {isClosingSoon && (
            <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
              Closing Soon
            </span>
          )}
        </div>

        {/* Check Official Notification Action Link */}
        <div className="flex items-center justify-between text-xs pb-2.5 mb-2.5 border-b border-slate-800/80">
          <a
            href={recruitment.officialNotificationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-blue-400 transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span>Check official notification</span>
            <ExternalLink className="w-3 h-3 text-slate-500" />
          </a>

          {match.analysis && (
            <button
              type="button"
              onClick={() => setShowWhyEligibleModal(true)}
              className="text-[11px] font-semibold text-blue-400 hover:text-blue-300 hover:underline flex items-center gap-1"
            >
              <span>Why am I eligible?</span>
              <span>→</span>
            </button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          {/* Apply Officially Button */}
          <button
            onClick={handleApplyClick}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/20 transition-all hover:scale-[1.02]"
            title={`Apply on Official Portal: ${recruitment.officialApplyUrl}`}
          >
            <span>Apply Officially</span>
            <ExternalLink className="w-3.5 h-3.5 text-blue-200" />
          </button>

          {/* I've Applied / Tracked Button */}
          {applied ? (
            <Link
              href="/my-exams"
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold hover:bg-emerald-600/30 transition-colors"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>✓ Tracking</span>
            </Link>
          ) : (
            <button
              onClick={() => setShowApplyModal(true)}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition-colors"
            >
              <BookmarkCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>I've Applied</span>
            </button>
          )}
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
                  disabled={loading}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/30 transition-colors"
                >
                  {loading ? "Adding..." : "Add to My Exams"}
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
    </div>
  );
}
