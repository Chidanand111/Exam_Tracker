"use client";

import React from "react";
import {
  Layers,
  CheckCircle2,
  Calendar,
  ArrowRight,
  ShieldCheck,
  Award,
  Clock,
  Sparkles,
  HelpCircle,
} from "lucide-react";

interface Stage {
  id: string;
  stageOrder: number;
  stageName: string;
  description?: string | null;
  eligibilityNote?: string | null;
  status: string;
  schedules?: any[];
}

interface Props {
  recruitment: {
    id: string;
    title: string;
    organization?: { shortName?: string; name?: string };
    selectionProcessSummary?: string | null;
    stages?: Stage[];
  };
}

export function RecruitmentSelectionProcessView({ recruitment }: Props) {
  const stages = recruitment.stages || [];
  const sortedStages = [...stages].sort((a, b) => a.stageOrder - b.stageOrder);

  return (
    <div className="space-y-6">
      {/* Header Overview Card */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Layers className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                Official Multi-Stage Selection Pipeline
              </h3>
              <p className="text-xs text-slate-400">
                Sequential qualification criteria, stages progression, and final empanelment rules
              </p>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold shrink-0">
            <Award className="w-3.5 h-3.5" />
            <span>{sortedStages.length} Selection Stages</span>
          </div>
        </div>

        {/* Selection Process Summary */}
        {recruitment.selectionProcessSummary ? (
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5 text-xs">
            <span className="text-slate-300 font-semibold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Official Selection Methodology:
            </span>
            <p className="text-slate-300 leading-relaxed">
              {recruitment.selectionProcessSummary}
            </p>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-400">
            Selection involves sequential objective screening, merit examination, and document verification.
          </div>
        )}
      </div>

      {/* Visual Stage Pipeline Flow */}
      <div className="space-y-4">
        <h4 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <span>Stage-by-Stage Progression</span>
        </h4>

        {sortedStages.length === 0 ? (
          <div className="p-8 text-center rounded-2xl border border-slate-800 bg-slate-900/40 text-slate-400 text-xs">
            Stage schedule details are being announced by the recruiting authority.
          </div>
        ) : (
          <div className="relative space-y-4">
            {sortedStages.map((stage, idx) => {
              const isLast = idx === sortedStages.length - 1;

              return (
                <div key={stage.id} className="relative">
                  <div className="p-5 sm:p-6 rounded-2xl border border-slate-800 bg-slate-900/70 space-y-4 hover:border-slate-700 transition-colors">
                    {/* Top Row: Stage Order Badge & Status */}
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <span className="flex items-center justify-center w-7 h-7 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-md shadow-blue-500/20">
                          {stage.stageOrder}
                        </span>
                        <div>
                          <h5 className="text-base font-bold text-white tracking-tight">
                            {stage.stageName}
                          </h5>
                          <span className="text-[11px] text-slate-400 font-mono">
                            Stage {stage.stageOrder} of {sortedStages.length}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-medium">
                          {stage.status.replace(/_/g, " ")}
                        </span>
                      </div>
                    </div>

                    {/* Stage Description */}
                    <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                      {stage.description || "Official stage guidelines published in the recruitment gazette."}
                    </p>

                    {/* Eligibility & Condition to Advance */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                      {stage.eligibilityNote && (
                        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                            Eligibility Requirement
                          </span>
                          <span className="text-slate-200 font-medium leading-snug">
                            {stage.eligibilityNote}
                          </span>
                        </div>
                      )}

                      <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                          Next Stage Progression Rule
                        </span>
                        <span className="text-slate-200 font-medium leading-snug">
                          {isLast
                            ? "Final Merit List & Departmental Empanelment"
                            : `Must secure minimum qualifying cutoff to enter Stage ${stage.stageOrder + 1}`}
                        </span>
                      </div>
                    </div>

                    {/* Schedule info if available */}
                    {stage.schedules && stage.schedules.length > 0 && (
                      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                        <div className="flex items-center gap-2 text-amber-400">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{stage.schedules.length} Exam Shifts Scheduled</span>
                        </div>
                        <span className="text-[11px] text-slate-400 font-mono">
                          Reporting slots announced
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Connecting Arrow between stages */}
                  {!isLast && (
                    <div className="flex justify-center py-2">
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] text-slate-400 font-mono">
                        <span>Advances to next stage</span>
                        <ArrowRight className="w-3 h-3 text-blue-400" />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Verification & Transparency Footnote */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-3 text-xs text-slate-300">
        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="text-white block font-semibold">Official Merit Policy:</strong>
          <p className="text-slate-400 leading-relaxed">
            All stage progressions adhere to the official reservation quotas (SC, ST, OBC, EWS, PwBD, Ex-Servicemen) and tie-breaking criteria as formulated by the recruiting authority. Admit cards for each successive stage are released only to candidates qualifying the preceding stage.
          </p>
        </div>
      </div>
    </div>
  );
}
