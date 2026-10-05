import React from "react";
import { AlertTriangle, ExternalLink, Calendar, Info } from "lucide-react";

export interface ConflictItem {
  id: string;
  fieldName: string;
  fieldLabel: string;
  source1Name: string;
  source1Url: string;
  source1Value: string;
  source1Timestamp: Date | string;
  source2Name: string;
  source2Url: string;
  source2Value: string;
  source2Timestamp: Date | string;
  status: string;
  resolutionNotes?: string | null;
}

interface InformationConflictBannerProps {
  conflicts: ConflictItem[];
}

export function InformationConflictBanner({ conflicts }: InformationConflictBannerProps) {
  if (!conflicts || conflicts.length === 0) return null;

  return (
    <div className="rounded-xl border border-rose-500/40 bg-rose-950/20 p-4 text-slate-200 space-y-3.5">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400 shrink-0 mt-0.5">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-rose-300 flex items-center gap-2">
            <span>Conflicting official information detected. Verification required.</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/30 text-rose-200 border border-rose-500/40 font-mono">
              {conflicts.length} Discrepanc{conflicts.length > 1 ? "ies" : "y"}
            </span>
          </h4>
          <p className="text-xs text-slate-300/90 mt-1 leading-relaxed">
            Different official commission channels currently report divergent information. BharatExam Tracker
            does not silently guess or override either source. Both official versions are displayed below
            with timestamps for your verification.
          </p>
        </div>
      </div>

      <div className="space-y-3 mt-2">
        {conflicts.map((conflict) => (
          <div
            key={conflict.id}
            className="p-3.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs space-y-2.5"
          >
            <div className="flex items-center justify-between text-slate-300 border-b border-slate-800 pb-2">
              <span className="font-semibold text-slate-200">{conflict.fieldLabel}</span>
              <span className="text-[11px] text-amber-400 flex items-center gap-1 font-mono">
                <Info className="w-3 h-3" />
                Editorial Review Pending
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              {/* Source 1 */}
              <div className="p-3 rounded-md bg-slate-950/70 border border-slate-800/80 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-medium truncate max-w-[200px]">
                    Source A: {conflict.source1Name}
                  </span>
                  <a
                    href={conflict.source1Url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 flex items-center gap-1 text-[11px]"
                  >
                    View <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="text-sm font-bold text-amber-300">
                  {conflict.source1Value}
                </div>
                <div className="text-[10px] text-slate-500 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Noted: {new Date(conflict.source1Timestamp).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </div>
              </div>

              {/* Source 2 */}
              <div className="p-3 rounded-md bg-slate-950/70 border border-slate-800/80 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-medium truncate max-w-[200px]">
                    Source B: {conflict.source2Name}
                  </span>
                  <a
                    href={conflict.source2Url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 flex items-center gap-1 text-[11px]"
                  >
                    View <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="text-sm font-bold text-emerald-300">
                  {conflict.source2Value}
                </div>
                <div className="text-[10px] text-slate-500 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Noted: {new Date(conflict.source2Timestamp).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </div>
              </div>
            </div>

            {conflict.resolutionNotes && (
              <div className="text-[11px] text-slate-400 bg-slate-950/40 p-2 rounded border border-slate-800/50 mt-1 italic">
                <span className="font-semibold text-slate-300 not-italic">Verification Note: </span>
                {conflict.resolutionNotes}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
