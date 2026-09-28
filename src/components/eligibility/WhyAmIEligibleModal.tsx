"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  X,
  ExternalLink,
  ShieldAlert,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  XCircle,
  FileText,
  User,
  Sparkles,
  Info,
  Clock,
  Layers,
} from "lucide-react";
import { EligibilityAnalysisResult, EligibilityFactorStatus } from "@/types";
import { EligibilityBadge } from "./EligibilityBadge";

interface WhyAmIEligibleModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysis: EligibilityAnalysisResult;
  onOpenProfile?: () => void;
}

export function WhyAmIEligibleModal({
  isOpen,
  onClose,
  analysis,
  onOpenProfile,
}: WhyAmIEligibleModalProps) {
  const [filterTab, setFilterTab] = useState<"ALL" | EligibilityFactorStatus>("ALL");

  if (!isOpen) return null;

  const filteredFactors =
    filterTab === "ALL"
      ? analysis.factors
      : analysis.factors.filter((f) => f.status === filterTab);

  const handleOpenNotification = () => {
    if (analysis.officialNotificationUrl) {
      window.open(analysis.officialNotificationUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-3xl rounded-3xl glass-panel bg-slate-900 border border-slate-700 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-5 sm:p-6 pb-4 border-b border-slate-800 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <EligibilityBadge status={analysis.determination} size="md" />
              <span className="text-[11px] text-slate-400 font-mono">
                Engine v{analysis.ruleVersion} ({analysis.cycleYear} Cycle)
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight leading-snug">
              Eligibility Compatibility Analysis
            </h2>
            <p className="text-xs text-slate-400 truncate max-w-lg">
              {analysis.recruitmentTitle}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors shrink-0"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 text-xs">
          {/* Non-Official Indicative Disclaimer Banner */}
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-[11px] uppercase tracking-wider block">
                Non-Official Automated Assessment
              </span>
              <p className="text-[11px] text-amber-200/90 leading-relaxed">
                {analysis.disclaimer}
              </p>
            </div>
          </div>

          {/* Cut-off Reference Date Banner */}
          {analysis.cutoffDescription && (
            <div className="p-3 rounded-2xl bg-blue-950/40 border border-blue-500/30 text-blue-200 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-400 shrink-0" />
                <span className="text-[11px] font-medium">
                  {analysis.cutoffDescription}
                </span>
              </div>
              <span className="text-[10px] uppercase font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/20 shrink-0">
                Crucial Cut-Off
              </span>
            </div>
          )}

          {/* Quick Summary Counts */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <button
              onClick={() => setFilterTab("ALL")}
              className={`p-2.5 rounded-xl border text-left transition-colors ${
                filterTab === "ALL"
                  ? "bg-slate-800 border-blue-500"
                  : "bg-slate-900/60 border-slate-800 hover:bg-slate-800/60"
              }`}
            >
              <span className="text-[10px] text-slate-400 block font-semibold">Total Factors</span>
              <span className="text-base font-extrabold text-white">
                {analysis.factors.length}
              </span>
            </button>

            <button
              onClick={() => setFilterTab("PASSED")}
              className={`p-2.5 rounded-xl border text-left transition-colors ${
                filterTab === "PASSED"
                  ? "bg-emerald-950/40 border-emerald-500"
                  : "bg-slate-900/60 border-slate-800 hover:bg-slate-800/60"
              }`}
            >
              <span className="text-[10px] text-emerald-400 block font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Met
              </span>
              <span className="text-base font-extrabold text-emerald-300">
                {analysis.passedCount}
              </span>
            </button>

            <button
              onClick={() => setFilterTab("CONDITION_REQUIRES_VERIFICATION")}
              className={`p-2.5 rounded-xl border text-left transition-colors ${
                filterTab === "CONDITION_REQUIRES_VERIFICATION"
                  ? "bg-amber-950/40 border-amber-500"
                  : "bg-slate-900/60 border-slate-800 hover:bg-slate-800/60"
              }`}
            >
              <span className="text-[10px] text-amber-400 block font-semibold flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Needs Verification
              </span>
              <span className="text-base font-extrabold text-amber-300">
                {analysis.verificationCount}
              </span>
            </button>

            <button
              onClick={() => setFilterTab("DATA_UNAVAILABLE")}
              className={`p-2.5 rounded-xl border text-left transition-colors ${
                filterTab === "DATA_UNAVAILABLE"
                  ? "bg-sky-950/40 border-sky-500"
                  : "bg-slate-900/60 border-slate-800 hover:bg-slate-800/60"
              }`}
            >
              <span className="text-[10px] text-sky-400 block font-semibold flex items-center gap-1">
                <HelpCircle className="w-3 h-3" /> Incomplete Data
              </span>
              <span className="text-base font-extrabold text-sky-300">
                {analysis.unclearCount}
              </span>
            </button>
          </div>

          {/* Factor-by-Factor Breakdown List */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-400" />
              <span>Configured Factor Determinations ({filteredFactors.length})</span>
            </h3>

            <div className="space-y-2.5">
              {filteredFactors.map((factor, index) => {
                const isPass = factor.status === "PASSED";
                const isFail = factor.status === "FAILED";
                const isVerification = factor.status === "CONDITION_REQUIRES_VERIFICATION";
                const isMissing = factor.status === "DATA_UNAVAILABLE";

                return (
                  <div
                    key={index}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      isPass
                        ? "bg-emerald-950/15 border-emerald-500/25"
                        : isFail
                        ? "bg-rose-950/20 border-rose-500/30"
                        : isVerification
                        ? "bg-amber-950/20 border-amber-500/30"
                        : "bg-slate-800/40 border-slate-700/60"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        {isPass && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                        {isFail && <XCircle className="w-4 h-4 text-rose-400 shrink-0" />}
                        {isVerification && (
                          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                        )}
                        {isMissing && <HelpCircle className="w-4 h-4 text-sky-400 shrink-0" />}

                        <span className="font-bold text-white text-xs">
                          {factor.factorName}
                        </span>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          isPass
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            : isFail
                            ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                            : isVerification
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                            : "bg-sky-500/10 text-sky-400 border-sky-500/30"
                        }`}
                      >
                        {factor.badgeLabel}
                      </span>
                    </div>

                    {/* Transparent Explanation */}
                    <p
                      className={`text-xs font-medium leading-relaxed ${
                        isPass
                          ? "text-emerald-300"
                          : isFail
                          ? "text-rose-300 font-semibold"
                          : isVerification
                          ? "text-amber-300"
                          : "text-slate-300"
                      }`}
                    >
                      {factor.explanation}
                    </p>

                    {/* Criteria vs Candidate Comparison Grid */}
                    <div className="mt-2.5 pt-2.5 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                      <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                        <span className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">
                          Official Rule Requirement
                        </span>
                        <span className="text-slate-300 font-medium leading-snug">
                          {factor.ruleRequirementDisplay}
                        </span>
                      </div>

                      <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                        <span className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">
                          Your Candidate Profile Value
                        </span>
                        <span
                          className={`font-medium leading-snug ${
                            factor.isDataMissing ? "text-amber-400 italic" : "text-white"
                          }`}
                        >
                          {factor.candidateValueDisplay}
                        </span>
                      </div>
                    </div>

                    {factor.officialNotificationClause && (
                      <span className="block mt-2 text-[10px] text-slate-500 italic">
                        Reference: {factor.officialNotificationClause}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-900/90 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {onOpenProfile && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenProfile();
                }}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <User className="w-3.5 h-3.5 text-blue-400" />
                <span>Update Profile Factors</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={handleOpenNotification}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/30 flex items-center justify-center gap-1.5 transition-all"
            >
              <span>Check Official Notification</span>
              <ExternalLink className="w-3.5 h-3.5 text-blue-200" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
