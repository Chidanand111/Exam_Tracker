"use client";

import React, { useState } from "react";
import { History, X, CheckCircle, ArrowRight, GitCommit, FileText, User } from "lucide-react";

export interface VersionItem {
  id: string;
  versionNumber: number;
  changeSummary: string;
  snapshotJson: string;
  changedFields?: any;
  author?: string | null;
  publishedAt: Date | string;
}

interface VersionHistoryModalProps {
  recruitmentTitle: string;
  versions: VersionItem[];
  isOpen: boolean;
  onClose: () => void;
}

export function VersionHistoryModal({
  recruitmentTitle,
  versions,
  isOpen,
  onClose,
}: VersionHistoryModalProps) {
  const [selectedVersion, setSelectedVersion] = useState<VersionItem | null>(
    versions && versions.length > 0 ? versions[0] : null
  );

  if (!isOpen) return null;

  let parsedSnapshot: Record<string, any> = {};
  if (selectedVersion) {
    try {
      parsedSnapshot = JSON.parse(selectedVersion.snapshotJson);
    } catch {
      parsedSnapshot = { raw: selectedVersion.snapshotJson };
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-3xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-100">
                Official Version History & Corrigendum Audit Log
              </h3>
              <p className="text-xs text-slate-400 truncate max-w-md">
                {recruitmentTitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-slate-800">
          {/* Versions List */}
          <div className="md:col-span-5 p-4 space-y-2 bg-slate-950/40">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-1">
              Recorded Releases ({versions.length})
            </span>
            <div className="space-y-1.5 mt-2">
              {versions.map((ver) => {
                const isSelected = selectedVersion?.id === ver.id;
                return (
                  <button
                    key={ver.id}
                    onClick={() => setSelectedVersion(ver)}
                    className={`w-full text-left p-3 rounded-xl border text-xs transition-all ${
                      isSelected
                        ? "bg-blue-600/15 border-blue-500/60 text-blue-200 shadow-sm"
                        : "bg-slate-900/60 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between font-semibold mb-1">
                      <span className="flex items-center gap-1.5">
                        <GitCommit className="w-3.5 h-3.5 text-blue-400" />
                        Version {ver.versionNumber}.0
                      </span>
                      <span className="text-[10px] text-slate-500 font-normal">
                        {new Date(ver.publishedAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <p className="text-[11px] opacity-80 line-clamp-2 leading-relaxed">
                      {ver.changeSummary}
                    </p>
                    {ver.changedFields && Array.isArray(ver.changedFields) && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {ver.changedFields.map((field: string, idx: number) => (
                          <span
                            key={idx}
                            className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono"
                          >
                            Δ {field}
                          </span>
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Version Details / Snapshot Diff */}
          <div className="md:col-span-7 p-5 space-y-4">
            {selectedVersion ? (
              <>
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                      <span>Version {selectedVersion.versionNumber}.0 Release Details</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Official Gazette Verified
                      </span>
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Published on{" "}
                      {new Date(selectedVersion.publishedAt).toLocaleDateString("en-IN", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2 text-xs">
                  <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-blue-400" />
                    Notice Corrigendum Summary:
                  </span>
                  <p className="text-slate-300 leading-relaxed">
                    {selectedVersion.changeSummary}
                  </p>
                  {selectedVersion.author && (
                    <div className="text-[11px] text-slate-500 flex items-center gap-1 pt-1 border-t border-slate-800/80">
                      <User className="w-3 h-3" /> Verified by: {selectedVersion.author}
                    </div>
                  )}
                </div>

                <div className="space-y-2 text-xs">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Snapshot Values at this Release
                  </span>
                  <div className="p-3.5 rounded-xl bg-slate-950 font-mono text-[11px] text-slate-300 border border-slate-800/80 space-y-1.5 overflow-x-auto">
                    {Object.entries(parsedSnapshot).map(([key, val]) => (
                      <div key={key} className="flex items-start justify-between py-1 border-b border-slate-900 last:border-0">
                        <span className="text-slate-400">{key}:</span>
                        <span className="text-emerald-400 font-semibold max-w-xs truncate text-right">
                          {val !== null && val !== undefined ? String(val) : "Not Specified"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="p-8 text-center text-xs text-slate-500">
                Select a version from the left panel to inspect the historical snapshot.
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40 flex items-center justify-between text-xs text-slate-400">
          <span>BharatExam Tracker maintains immutable version logs for all official recruitment corrigendums.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
