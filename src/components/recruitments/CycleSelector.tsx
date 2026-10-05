import React from "react";
import Link from "next/link";
import { Layers, Calendar, ArrowRight, CheckCircle2, Archive, Clock } from "lucide-react";

export interface CycleSummary {
  id: string;
  title: string;
  slug: string | null;
  cycleYear: number | null;
  cycleName: string | null;
  lifecycleStage: string;
  isArchived: boolean;
  vacancies: number | null;
  appDeadline: Date | string | null;
}

interface CycleSelectorProps {
  familyName: string;
  currentRecruitmentId: string;
  cycles: CycleSummary[];
}

export function CycleSelector({
  familyName,
  currentRecruitmentId,
  cycles,
}: CycleSelectorProps) {
  if (!cycles || cycles.length <= 1) return null;

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-blue-400" />
          <span className="text-xs font-semibold text-slate-300">
            Recruitment Family Cycles
          </span>
          <span className="text-[11px] text-slate-500 font-normal">
            ({familyName})
          </span>
        </div>
        <span className="text-[11px] text-slate-500">
          Independent Vacancies & Schedules
        </span>
      </div>

      <div className="flex flex-wrap gap-2 pt-1">
        {cycles.map((c) => {
          const isCurrent = c.id === currentRecruitmentId;
          const targetUrl = `/recruitments/${c.slug || c.id}`;

          return (
            <Link
              key={c.id}
              href={targetUrl}
              className={`px-3 py-2 rounded-lg border text-xs font-medium transition-all flex items-center gap-2 ${
                isCurrent
                  ? "bg-blue-600/20 border-blue-500 text-blue-300 ring-1 ring-blue-500/50 shadow-sm"
                  : "bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
              }`}
            >
              <div className="flex items-center gap-1.5">
                {c.isArchived ? (
                  <Archive className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                ) : isCurrent ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                ) : (
                  <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                )}
                <span>
                  {c.cycleName || c.cycleYear ? `Cycle ${c.cycleYear}` : c.title}
                </span>
              </div>

              {c.vacancies && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-400 font-mono">
                  {c.vacancies.toLocaleString("en-IN")} posts
                </span>
              )}

              {c.isArchived && (
                <span className="text-[9px] uppercase px-1 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
                  Archive
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
