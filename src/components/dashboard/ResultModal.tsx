"use client";

import React, { useState } from "react";
import { X, Award, CheckCircle2, XCircle, Trophy, HelpCircle, ExternalLink } from "lucide-react";
import { StageDetails, UserStageOutcome } from "@/types";

interface ResultModalProps {
  stage: StageDetails;
  applicationId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (result: any) => void;
}

export function ResultModal({
  stage,
  applicationId,
  isOpen,
  onClose,
  onSuccess,
}: ResultModalProps) {
  const [selectedOutcome, setSelectedOutcome] = useState<UserStageOutcome | null>(null);
  const [userNotes, setUserNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOutcome || selectedOutcome === "AWAITED") {
      setError("Please select an official outcome.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/applications/${applicationId}/stage-result`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stageId: stage.id,
          outcome: selectedOutcome,
          userNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update result outcome");
      }

      onSuccess(data);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-2xl glass-panel bg-slate-900 border border-slate-700 shadow-2xl p-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Record Stage Result</h3>
              <p className="text-xs text-slate-400">{stage.stageName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Official Link Helper */}
        {stage.resultUrl && (
          <div className="mt-4 p-3 rounded-xl bg-blue-950/30 border border-blue-500/20 flex items-center justify-between">
            <div className="text-xs text-slate-300">
              Check your roll number in the official result merit list:
            </div>
            <a
              href={stage.resultUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-blue-400 hover:underline font-semibold"
            >
              <span>Official Result Portal</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              What is your result for this stage?
            </label>
            <p className="text-xs text-slate-400 mb-3">
              We never assume results. Please select your outcome according to the official merit list.
            </p>

            <div className="space-y-2">
              {/* Option 1: Selected for Next Stage */}
              <button
                type="button"
                onClick={() => setSelectedOutcome("SELECTED_FOR_NEXT")}
                className={`w-full p-3.5 rounded-xl border text-left transition-all flex items-start gap-3 ${
                  selectedOutcome === "SELECTED_FOR_NEXT"
                    ? "bg-emerald-600/20 border-emerald-500 text-white ring-1 ring-emerald-500"
                    : "bg-slate-800/40 border-slate-800 text-slate-300 hover:bg-slate-800"
                }`}
              >
                <div className="mt-0.5 w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500 flex items-center justify-center text-emerald-400 shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white flex items-center gap-1.5">
                    <span>Selected for Next Stage</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-semibold">
                      Unlocks Round {stage.stageOrder + 1}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                    Qualified in the merit list! Activates the next recruitment round in your personal tracker with new schedules and admit card alerts.
                  </p>
                </div>
              </button>

              {/* Option 2: Not Selected */}
              <button
                type="button"
                onClick={() => setSelectedOutcome("NOT_SELECTED")}
                className={`w-full p-3.5 rounded-xl border text-left transition-all flex items-start gap-3 ${
                  selectedOutcome === "NOT_SELECTED"
                    ? "bg-rose-600/20 border-rose-500 text-white ring-1 ring-rose-500"
                    : "bg-slate-800/40 border-slate-800 text-slate-300 hover:bg-slate-800"
                }`}
              >
                <div className="mt-0.5 w-5 h-5 rounded-full bg-rose-500/20 border border-rose-500 flex items-center justify-center text-rose-400 shrink-0">
                  <XCircle className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">Not Selected</div>
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                    Did not make the cutoff. Marks this application as unsuccessful and closes subsequent stages gracefully.
                  </p>
                </div>
              </button>

              {/* Option 3: Final Selected */}
              <button
                type="button"
                onClick={() => setSelectedOutcome("FINAL_SELECTED")}
                className={`w-full p-3.5 rounded-xl border text-left transition-all flex items-start gap-3 ${
                  selectedOutcome === "FINAL_SELECTED"
                    ? "bg-amber-600/20 border-amber-500 text-white ring-1 ring-amber-500"
                    : "bg-slate-800/40 border-slate-800 text-slate-300 hover:bg-slate-800"
                }`}
              >
                <div className="mt-0.5 w-5 h-5 rounded-full bg-amber-500/20 border border-amber-500 flex items-center justify-center text-amber-400 shrink-0">
                  <Trophy className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">Final Selected</div>
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                    Cleared all stages and recommended for appointment in the department!
                  </p>
                </div>
              </button>

              {/* Option 4: Result Not Checked */}
              <button
                type="button"
                onClick={() => {
                  setSelectedOutcome("AWAITED");
                  onClose();
                }}
                className="w-full p-2.5 rounded-xl border border-slate-800 text-left text-slate-400 hover:bg-slate-800 text-xs flex items-center gap-2"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Result Not Checked Yet (Decide Later)</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Personal Result Notes (Marks / Roll No. / Remarks)
            </label>
            <input
              type="text"
              placeholder="e.g. Scored 158.5 in Tier 1. Cleared UR cutoff by 12 marks."
              value={userNotes}
              onChange={(e) => setUserNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
              {error}
            </div>
          )}

          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !selectedOutcome || selectedOutcome === "AWAITED"}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-xs font-semibold text-white shadow-md shadow-blue-600/30 transition-colors disabled:opacity-50"
            >
              {loading ? "Recording..." : "Confirm & Update Tracker"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
