"use client";

import React from "react";
import { CheckCircle2, Circle, Lock, ExternalLink, Calendar, Clock, Award, AlertCircle } from "lucide-react";
import { StageDetails, UserStageProgressItem } from "@/types";

interface DynamicStageTimelineProps {
  stages: StageDetails[];
  currentStageOrder?: number;
  userProgress?: UserStageProgressItem[];
  onOpenResultModal?: (stage: StageDetails) => void;
  onOpenScheduleModal?: (stage: StageDetails) => void;
  isApplied?: boolean;
}

export function DynamicStageTimeline({
  stages,
  currentStageOrder = 1,
  userProgress = [],
  onOpenResultModal,
  onOpenScheduleModal,
  isApplied = false,
}: DynamicStageTimelineProps) {
  // Sort stages purely by stageOrder ASC
  const sortedStages = [...stages].sort((a, b) => a.stageOrder - b.stageOrder);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div>
          <h3 className="text-sm font-semibold text-white">Recruitment Stages & Progression</h3>
          <p className="text-xs text-slate-400">
            Dynamic selection rounds defined by the recruiting commission ({stages.length} stages total)
          </p>
        </div>
        {isApplied && (
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
            Active: Round {currentStageOrder}
          </span>
        )}
      </div>

      <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-800">
        {sortedStages.map((stage) => {
          const progress = userProgress.find((p) => p.stageId === stage.id);
          const isCompleted = progress?.status === "SELECTED_FOR_NEXT" || progress?.outcome === "SELECTED_FOR_NEXT";
          const isUnsuccessful = progress?.status === "NOT_SELECTED" || progress?.outcome === "NOT_SELECTED";
          const isActive = isApplied && stage.stageOrder === currentStageOrder && !isUnsuccessful;
          const isLocked = isApplied && stage.stageOrder > currentStageOrder;

          // Status colors & icon
          let indicatorIcon = (
            <div className="w-6 h-6 rounded-full bg-slate-900 border-2 border-slate-600 flex items-center justify-center text-xs font-bold text-slate-400">
              {stage.stageOrder}
            </div>
          );

          if (isCompleted) {
            indicatorIcon = (
              <div className="w-6 h-6 rounded-full bg-emerald-600 border-2 border-emerald-400 flex items-center justify-center text-white">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
            );
          } else if (isUnsuccessful) {
            indicatorIcon = (
              <div className="w-6 h-6 rounded-full bg-rose-600 border-2 border-rose-400 flex items-center justify-center text-white text-xs font-bold">
                ✕
              </div>
            );
          } else if (isActive) {
            indicatorIcon = (
              <div className="w-6 h-6 rounded-full bg-blue-600 border-2 border-blue-400 flex items-center justify-center text-white animate-pulse">
                <Circle className="w-3.5 h-3.5 fill-current" />
              </div>
            );
          } else if (isLocked) {
            indicatorIcon = (
              <div className="w-6 h-6 rounded-full bg-slate-900 border-2 border-slate-800 flex items-center justify-center text-slate-500">
                <Lock className="w-3 h-3" />
              </div>
            );
          }

          return (
            <div
              key={stage.id}
              className={`relative p-4 rounded-xl border transition-all ${
                isActive
                  ? "bg-blue-950/20 border-blue-500/40 shadow-lg shadow-blue-500/5 ring-1 ring-blue-500/20"
                  : isCompleted
                  ? "bg-emerald-950/15 border-emerald-500/30"
                  : isLocked
                  ? "bg-slate-900/40 border-slate-800/80 opacity-60"
                  : "bg-slate-900/60 border-slate-800"
              }`}
            >
              {/* Timeline dot marker */}
              <div className="absolute -left-6 sm:-left-8 top-4 -translate-x-1/2">
                {indicatorIcon}
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
                      Round {stage.stageOrder}
                    </span>
                    <h4 className="text-base font-bold text-white tracking-tight">{stage.stageName}</h4>
                  </div>
                  {stage.description && (
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed max-w-xl">
                      {stage.description}
                    </p>
                  )}
                </div>

                {/* Stage Status Pill */}
                <div>
                  {isCompleted ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Cleared & Qualified</span>
                    </span>
                  ) : isUnsuccessful ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/25">
                      <span>Not Selected</span>
                    </span>
                  ) : isActive ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/25 animate-pulse">
                      <span>Active Stage</span>
                    </span>
                  ) : isLocked ? (
                    <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                      <Lock className="w-2.5 h-2.5" />
                      <span>Locked (Awaiting Round {stage.stageOrder - 1})</span>
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400">Scheduled</span>
                  )}
                </div>
              </div>

              {/* Schedules / Shifts Available */}
              {stage.schedules && stage.schedules.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-800/80">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Calendar className="w-3 h-3 text-blue-400" />
                    <span>Official Exam Dates & Shifts ({stage.schedules.length} slots available)</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {stage.schedules.slice(0, 3).map((slot) => (
                      <div
                        key={slot.id}
                        className="p-2 rounded-lg bg-slate-800/50 border border-slate-800 text-xs"
                      >
                        <div className="font-medium text-slate-200">
                          {new Date(slot.examDate).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </div>
                        <div className="text-slate-400 text-[11px] mt-0.5">
                          {slot.shiftName} • {slot.startTime}
                        </div>
                      </div>
                    ))}
                    {stage.schedules.length > 3 && (
                      <div className="p-2 rounded-lg bg-slate-800/30 border border-dashed border-slate-700 text-xs flex items-center justify-center text-slate-400">
                        +{stage.schedules.length - 3} more shifts
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* User Assigned Exam Shift */}
              {progress?.examSchedule && (
                <div className="mt-3 p-3 rounded-lg bg-blue-900/20 border border-blue-500/30 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-blue-400 tracking-wider">
                      My Assigned Exam Slot
                    </span>
                    <div className="font-semibold text-white mt-0.5">
                      {new Date(progress.examSchedule.examDate).toLocaleDateString("en-IN", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}{" "}
                      • {progress.examSchedule.shiftName} ({progress.examSchedule.examTime})
                    </div>
                    {progress.examSchedule.examCenterName && (
                      <p className="text-slate-300 text-[11px] mt-0.5">
                        📍 Center: {progress.examSchedule.examCenterName}
                      </p>
                    )}
                  </div>

                  {onOpenScheduleModal && (
                    <button
                      onClick={() => onOpenScheduleModal(stage)}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium self-start sm:self-center transition-colors"
                    >
                      Edit Slot
                    </button>
                  )}
                </div>
              )}

              {/* Action Buttons for this stage: Admit Card, Shift Selector, Result */}
              <div className="mt-3 flex flex-wrap items-center gap-2 pt-2">
                {/* Admit Card Download */}
                {stage.admitCardStatus === "RELEASED" && (
                  <a
                    href={stage.admitCardUrl || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm shadow-emerald-600/30 transition-colors"
                  >
                    <span>🎫 Download Official Admit Card</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}

                {/* Personal Shift Assignment Button (if applied and not locked) */}
                {isApplied && !isLocked && !progress?.examSchedule && onOpenScheduleModal && (
                  <button
                    onClick={() => onOpenScheduleModal(stage)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Select My Exam Shift</span>
                  </button>
                )}

                {/* Result Released & Outcome Trigger */}
                {stage.resultStatus === "RELEASED" && isApplied && !isLocked && onOpenResultModal && (
                  <button
                    onClick={() => onOpenResultModal(stage)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-blue-500/20 transition-colors"
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>Check Result & Update Outcome</span>
                  </button>
                )}

                {/* Official Result URL direct link */}
                {stage.resultStatus === "RELEASED" && stage.resultUrl && (
                  <a
                    href={stage.resultUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
                  >
                    <span>Official Result PDF/Portal</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
