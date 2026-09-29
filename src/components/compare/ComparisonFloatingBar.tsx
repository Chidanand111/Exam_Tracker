"use client";

import React from "react";
import Link from "next/link";
import { Scale, X, ArrowRight } from "lucide-react";

interface ComparisonFloatingBarProps {
  selectedRecruitments: Array<{ id: string; title: string; organizationName?: string }>;
  onRemove: (id: string) => void;
  onClear: () => void;
}

export function ComparisonFloatingBar({
  selectedRecruitments,
  onRemove,
  onClear,
}: ComparisonFloatingBarProps) {
  if (selectedRecruitments.length === 0) return null;

  const compareUrl = `/compare?ids=${selectedRecruitments.map((r) => r.id).join(",")}`;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-2xl px-4 animate-in slide-in-from-bottom-5 duration-200">
      <div className="p-3.5 rounded-2xl bg-slate-900/95 border border-blue-500/40 shadow-2xl backdrop-blur-md flex items-center justify-between gap-4 text-slate-100">
        
        {/* Left: Indicator & Chips */}
        <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar flex-1 min-w-0">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 shrink-0">
            <Scale className="w-4 h-4" />
            <span className="text-xs font-bold">{selectedRecruitments.length}/4</span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {selectedRecruitments.map((rec) => (
              <span
                key={rec.id}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs font-medium text-slate-200 shrink-0 max-w-[160px] truncate"
              >
                <span className="truncate">{rec.title}</span>
                <button
                  onClick={() => onRemove(rec.id)}
                  className="text-slate-400 hover:text-white p-0.5"
                  title="Remove from comparison"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onClear}
            className="px-2.5 py-1.5 text-xs text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            Clear
          </button>

          {selectedRecruitments.length >= 2 ? (
            <Link
              href={compareUrl}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/20 transition-all"
            >
              <span>Compare Workspace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <span className="text-[11px] text-slate-400 px-2 py-1 italic">
              Select 1 more to compare
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
