"use client";

import React from "react";
import { Sparkles, X, Filter } from "lucide-react";
import { InterpretedFilter } from "@/lib/search-query-parser";

interface Props {
  filters: InterpretedFilter[];
  onRemoveFilter: (key: string) => void;
  onClearAll?: () => void;
}

export function InterpretedQueryBadges({
  filters,
  onRemoveFilter,
  onClearAll,
}: Props) {
  if (!filters || filters.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs animate-in fade-in">
      <div className="flex items-center gap-1.5 font-semibold text-blue-400 shrink-0">
        <Sparkles className="w-3.5 h-3.5" />
        <span>Interpreted Filters:</span>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 flex-1">
        {filters.map((f) => (
          <span
            key={f.key}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 border border-blue-500/30 text-white text-xs shadow-sm font-medium"
          >
            <span className="text-slate-400 font-normal">{f.label}:</span>
            <span className="font-semibold text-blue-300">{f.displayValue}</span>
            <button
              type="button"
              onClick={() => onRemoveFilter(f.key)}
              className="ml-1 p-0.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              title={`Remove ${f.label} filter`}
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>

      {onClearAll && filters.length > 1 && (
        <button
          type="button"
          onClick={onClearAll}
          className="text-[11px] text-slate-400 hover:text-slate-200 underline shrink-0"
        >
          Reset All
        </button>
      )}
    </div>
  );
}
