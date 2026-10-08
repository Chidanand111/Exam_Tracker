"use client";

import React, { useState, useEffect } from "react";
import { CheckSquare, Square, FileCheck, Info } from "lucide-react";

interface BulletinDocumentChecklistProps {
  bulletinTitle: string;
  documents: string[];
}

export function BulletinDocumentChecklist({
  bulletinTitle,
  documents,
}: BulletinDocumentChecklistProps) {
  const storageKey = `doc_checklist_${bulletinTitle.slice(0, 30)}`;
  const [checkedState, setCheckedState] = useState<Record<number, boolean>>({});

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setCheckedState(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
  }, [storageKey]);

  const toggleCheck = (idx: number) => {
    const nextState = { ...checkedState, [idx]: !checkedState[idx] };
    setCheckedState(nextState);
    try {
      localStorage.setItem(storageKey, JSON.stringify(nextState));
    } catch {
      // ignore
    }
  };

  if (!documents || documents.length === 0) {
    return null;
  }

  const completedCount = Object.values(checkedState).filter(Boolean).length;
  const allCompleted = completedCount === documents.length;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs uppercase font-bold tracking-wider text-slate-300 flex items-center gap-1.5">
          <FileCheck className="w-4 h-4 text-emerald-400" />
          <span>Application Document Readiness</span>
        </h3>
        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
          {completedCount}/{documents.length} Ready
        </span>
      </div>

      <p className="text-xs text-slate-400 mb-4 leading-relaxed">
        Check off documents you have assembled to ensure zero last-minute application discrepancies.
      </p>

      {/* Progress bar */}
      <div className="w-full bg-slate-800 h-1.5 rounded-full mb-4 overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${
            allCompleted ? "bg-emerald-500" : "bg-cyan-500"
          }`}
          style={{ width: `${(completedCount / documents.length) * 100}%` }}
        />
      </div>

      <div className="space-y-2">
        {documents.map((doc, idx) => {
          const isDone = !!checkedState[idx];
          return (
            <button
              key={idx}
              onClick={() => toggleCheck(idx)}
              className={`w-full text-left flex items-start gap-2.5 p-2.5 rounded-xl border transition-all text-xs ${
                isDone
                  ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-300"
                  : "bg-slate-800/40 border-slate-800/80 text-slate-300 hover:bg-slate-800/80"
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {isDone ? (
                  <CheckSquare className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Square className="w-4 h-4 text-slate-500" />
                )}
              </div>
              <span className={`leading-relaxed ${isDone ? "line-through opacity-85" : ""}`}>
                {doc}
              </span>
            </button>
          );
        })}
      </div>

      {allCompleted && (
        <div className="mt-4 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
          <Info className="w-4 h-4 shrink-0" />
          <span>All required documents assembled! You are ready to apply.</span>
        </div>
      )}
    </div>
  );
}
