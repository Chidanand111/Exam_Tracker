import React from "react";
import { Archive, History, BookOpen, AlertCircle } from "lucide-react";
import Link from "next/link";

interface ArchivedBannerProps {
  cycleYear?: number | null;
  activeCycleSlug?: string | null;
  activeCycleTitle?: string | null;
}

export function ArchivedBanner({
  cycleYear,
  activeCycleSlug,
  activeCycleTitle,
}: ArchivedBannerProps) {
  return (
    <div className="rounded-xl border border-purple-500/30 bg-purple-950/20 p-4 text-slate-200">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400 shrink-0 mt-0.5 sm:mt-0">
            <Archive className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-purple-300 flex items-center gap-2">
              <span>Historical Reference Archive</span>
              {cycleYear && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-200 border border-purple-500/30 font-mono">
                  Cycle {cycleYear}
                </span>
              )}
            </h4>
            <p className="text-xs text-slate-300/80 mt-1 leading-relaxed">
              This recruitment cycle has completed its examination and final appointment process.
              In accordance with platform policy, historical recruitment data, cutoffs, syllabus, and official notification PDFs
              are preserved indefinitely for reference and trend analysis.
            </p>
          </div>
        </div>

        {activeCycleSlug && (
          <Link
            href={`/recruitments/${activeCycleSlug}`}
            className="shrink-0 px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium transition-colors shadow-sm inline-flex items-center gap-1.5 self-end sm:self-center"
          >
            <span>View Active Cycle</span>
            <History className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>
    </div>
  );
}
