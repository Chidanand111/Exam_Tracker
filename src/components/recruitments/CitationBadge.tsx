"use client";

import React, { useState } from "react";
import {
  FileText,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  ChevronRight,
  Info,
  CheckCircle2,
} from "lucide-react";

export interface CitationData {
  id?: string;
  fieldName: string;
  documentName?: string | null;
  documentUrl?: string | null;
  pageNumber: number;
  sectionClause?: string | null;
  rawExcerpt?: string | null;
  confidenceScore?: number | null;
  verifiedByAdmin?: boolean;
}

interface Props {
  citation?: CitationData | null;
  onOpenViewer?: (page: number) => void;
  compact?: boolean;
}

export function CitationBadge({ citation, onOpenViewer, compact = false }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  if (!citation) return null;

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
        className={`group inline-flex items-center gap-1 font-mono transition-all rounded-md cursor-pointer ${
          compact
            ? "px-1.5 py-0.5 text-[10px] bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20"
            : "px-2 py-0.5 text-[11px] bg-slate-800/80 hover:bg-slate-700/80 text-blue-300 border border-slate-700 hover:border-blue-500/40"
        }`}
        title="View Official Source Citation"
      >
        <FileText className="w-3 h-3 text-blue-400 shrink-0" />
        <span>p.{citation.pageNumber}</span>
        {citation.sectionClause && (
          <span className="hidden sm:inline text-slate-400 truncate max-w-[90px]">
            • {citation.sectionClause.split(":")[0]}
          </span>
        )}
        <Sparkles className="w-2.5 h-2.5 text-blue-400 group-hover:scale-125 transition-transform" />
      </button>

      {/* Popover Card */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div
            onMouseLeave={() => setIsOpen(false)}
            className="absolute left-0 bottom-full mb-2 z-50 w-80 sm:w-96 p-3.5 bg-slate-900 border border-blue-500/30 rounded-xl shadow-2xl text-slate-200 text-xs backdrop-blur-md animate-in fade-in zoom-in-95 duration-150"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
              <div className="flex items-center gap-1.5 font-semibold text-white">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="capitalize">
                  {citation.fieldName.replace(/([A-Z])/g, " $1")} Citation
                </span>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <CheckCircle2 className="w-2.5 h-2.5" />
                {citation.confidenceScore ? `${Math.round(citation.confidenceScore * 100)}% Match` : "Verified"}
              </span>
            </div>

            {/* Document & Location details */}
            <div className="space-y-1.5 mb-2.5 text-[11px]">
              <div className="flex items-start justify-between text-slate-400">
                <span>Source Document:</span>
                <span className="text-slate-200 font-medium text-right truncate max-w-[200px]">
                  {citation.documentName || "Official Notification PDF"}
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-400">
                <span>Notification Page:</span>
                <span className="font-mono text-blue-400 font-semibold">
                  Page {citation.pageNumber}
                </span>
              </div>

              {citation.sectionClause && (
                <div className="flex items-start justify-between text-slate-400">
                  <span>Clause/Section:</span>
                  <span className="text-slate-200 font-medium text-right max-w-[220px]">
                    {citation.sectionClause}
                  </span>
                </div>
              )}
            </div>

            {/* Raw Excerpt Quote */}
            {citation.rawExcerpt && (
              <div className="p-2.5 bg-slate-950/80 rounded-lg border border-slate-800 mb-3">
                <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-500 block mb-1">
                  Official Excerpt Quote
                </span>
                <p className="text-[11px] text-slate-300 italic font-serif leading-relaxed line-clamp-4">
                  &ldquo;{citation.rawExcerpt}&rdquo;
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-800/80">
              {onOpenViewer && (
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    onOpenViewer(citation.pageNumber);
                  }}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg text-xs transition-colors"
                >
                  <FileText className="w-3.5 h-3.5" />
                  Jump to Page {citation.pageNumber} in Document
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
