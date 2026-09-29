"use client";

import React, { useState, useEffect } from "react";
import {
  CheckSquare,
  Square,
  Plus,
  Trash2,
  X,
  FileText,
  AlertCircle,
  Clock,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { ChecklistStageCategory } from "@/types";

interface ChecklistItem {
  id: string;
  userChecklistId?: string | null;
  title: string;
  description?: string | null;
  stageCategory: ChecklistStageCategory;
  itemOrder: number;
  isRequired: boolean;
  isDefault: boolean;
  isCustom: boolean;
  isCompleted: boolean;
  completedAt?: string | null;
  notes?: string | null;
}

interface ApplicationChecklistModalProps {
  isOpen: boolean;
  onClose: () => void;
  recruitmentId: string;
  recruitmentTitle: string;
  organizationName?: string;
  officialNotificationUrl?: string | null;
  officialApplyUrl?: string | null;
}

const CATEGORY_LABELS: Record<ChecklistStageCategory, { label: string; icon: string }> = {
  BEFORE_APPLYING: { label: "Before Applying", icon: "📋" },
  DOCUMENT_PREP: { label: "Document Prep", icon: "📁" },
  APPLICATION_FORM: { label: "Application Form", icon: "✍️" },
  POST_SUBMISSION: { label: "Post-Submission & Vault", icon: "🔐" },
};

export function ApplicationChecklistModal({
  isOpen,
  onClose,
  recruitmentId,
  recruitmentTitle,
  organizationName,
  officialNotificationUrl,
  officialApplyUrl,
}: ApplicationChecklistModalProps) {
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [showAddCustom, setShowAddCustom] = useState(false);
  const [customTitle, setCustomTitle] = useState("");
  const [customCategory, setCustomCategory] = useState<ChecklistStageCategory>("BEFORE_APPLYING");
  const [submittingCustom, setSubmittingCustom] = useState(false);
  const [expandedNotes, setExpandedNotes] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (isOpen && recruitmentId) {
      fetchChecklist();
    }
  }, [isOpen, recruitmentId]);

  const fetchChecklist = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/checklists?recruitmentId=${recruitmentId}`);
      const data = await res.json();
      if (data.success) {
        setItems(data.items || []);
      }
    } catch (e) {
      console.error("Failed to load checklist", e);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (item: ChecklistItem) => {
    const nextCompleted = !item.isCompleted;

    // Optimistic UI update
    setItems((prev) =>
      prev.map((i) =>
        i.id === item.id
          ? {
              ...i,
              isCompleted: nextCompleted,
              completedAt: nextCompleted ? new Date().toISOString() : null,
            }
          : i
      )
    );

    try {
      await fetch("/api/checklists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recruitmentId,
          templateItemId: item.isCustom ? null : item.id,
          title: item.title,
          stageCategory: item.stageCategory,
          isCompleted: nextCompleted,
          isCustom: item.isCustom,
        }),
      });
    } catch (err) {
      console.error("Error toggling checklist item", err);
      // Revert on error
      fetchChecklist();
    }
  };

  const handleAddCustomItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim()) return;

    setSubmittingCustom(true);
    try {
      const res = await fetch("/api/checklists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recruitmentId,
          title: customTitle.trim(),
          stageCategory: customCategory,
          isCompleted: false,
          isCustom: true,
        }),
      });

      if (res.ok) {
        setCustomTitle("");
        setShowAddCustom(false);
        fetchChecklist();
      }
    } catch (err) {
      console.error("Failed to add custom item", err);
    } finally {
      setSubmittingCustom(false);
    }
  };

  const handleDeleteCustomItem = async (id: string) => {
    try {
      await fetch(`/api/checklists?id=${id}`, { method: "DELETE" });
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch (err) {
      console.error("Failed to delete item", err);
    }
  };

  if (!isOpen) return null;

  const total = items.length;
  const completed = items.filter((i) => i.isCompleted).length;
  const progressPercent = total > 0 ? Math.round((completed / total) * 100) : 0;

  const filteredItems = items.filter((item) => {
    if (activeTab === "ALL") return true;
    return item.stageCategory === activeTab;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-blue-950/40 to-slate-900 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <CheckSquare className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Application Preparation Checklist
              </h2>
            </div>
            <p className="text-sm font-medium text-slate-300">
              {recruitmentTitle}
            </p>
            {organizationName && (
              <p className="text-xs text-slate-400">{organizationName}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress & Quick Links Bar */}
        <div className="px-6 py-3.5 bg-slate-900/90 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
          <div className="flex-1 min-w-[220px]">
            <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
              <span className="text-slate-300">Preparation Readiness</span>
              <span className={`${progressPercent === 100 ? "text-emerald-400" : "text-blue-400"}`}>
                {completed} of {total} items ({progressPercent}%)
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  progressPercent === 100
                    ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                    : "bg-gradient-to-r from-blue-500 to-indigo-500"
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {officialNotificationUrl && (
              <a
                href={officialNotificationUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
              >
                <FileText className="w-3.5 h-3.5 text-amber-400" />
                <span>Notice PDF</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            )}
            {officialApplyUrl && (
              <a
                href={officialApplyUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 transition-colors"
              >
                <span>Apply Portal</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>

        {/* Category Tabs */}
        <div className="px-6 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center gap-1.5 overflow-x-auto text-xs no-scrollbar">
          <button
            onClick={() => setActiveTab("ALL")}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
              activeTab === "ALL"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            All Items ({items.length})
          </button>
          {(Object.keys(CATEGORY_LABELS) as ChecklistStageCategory[]).map((cat) => {
            const count = items.filter((i) => i.stageCategory === cat).length;
            const isSelected = activeTab === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveTab(cat)}
                className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                }`}
              >
                <span>{CATEGORY_LABELS[cat].icon}</span>
                <span>{CATEGORY_LABELS[cat].label}</span>
                <span className="text-[10px] opacity-75">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-3">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm">Loading recruitment preparation checklist...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="py-10 text-center text-slate-400">
              <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-500" />
              <p className="text-sm font-medium">No checklist items in this category.</p>
            </div>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.id}
                className={`p-3.5 rounded-xl border transition-all ${
                  item.isCompleted
                    ? "bg-slate-800/30 border-emerald-500/30 text-slate-300"
                    : "bg-slate-800/60 border-slate-700/80 hover:border-slate-600 text-slate-100"
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Checkbox */}
                  <button
                    onClick={() => handleToggle(item)}
                    className="mt-0.5 text-blue-400 hover:text-blue-300 focus:outline-none transition-colors"
                  >
                    {item.isCompleted ? (
                      <CheckSquare className="w-5 h-5 text-emerald-400 fill-emerald-500/20" />
                    ) : (
                      <Square className="w-5 h-5 text-slate-500 hover:text-slate-400" />
                    )}
                  </button>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-sm font-semibold ${
                          item.isCompleted
                            ? "line-through text-slate-400 font-normal"
                            : "text-white"
                        }`}
                      >
                        {item.title}
                      </span>
                      {item.isRequired && !item.isCompleted && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          Mandatory
                        </span>
                      )}
                      {item.isCustom && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                          Personal Item
                        </span>
                      )}
                      <span className="text-[10px] text-slate-400 px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700">
                        {CATEGORY_LABELS[item.stageCategory]?.label || item.stageCategory}
                      </span>
                    </div>

                    {item.description && (
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        {item.description}
                      </p>
                    )}

                    {item.completedAt && (
                      <p className="text-[11px] text-emerald-400/80 mt-1 flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3" />
                        Completed on {new Date(item.completedAt).toLocaleDateString("en-IN")}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  {item.isCustom && (
                    <button
                      onClick={() => handleDeleteCustomItem(item.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-700/50 transition-colors"
                      title="Delete personal item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}

          {/* Add Personal Item Drawer/Section */}
          {showAddCustom ? (
            <form
              onSubmit={handleAddCustomItem}
              className="p-4 rounded-xl border border-purple-500/30 bg-purple-950/20 space-y-3 animate-in fade-in duration-150"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                  <Plus className="w-4 h-4" />
                  Add Personal Preparation Item
                </span>
                <button
                  type="button"
                  onClick={() => setShowAddCustom(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <input
                  type="text"
                  placeholder="e.g. Get 2 passport photos printed in glossy finish"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  autoFocus
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value as ChecklistStageCategory)}
                  className="px-3 py-1.5 text-xs rounded-lg bg-slate-800 border border-slate-700 text-slate-300 focus:outline-none focus:border-purple-500"
                >
                  <option value="BEFORE_APPLYING">Before Applying</option>
                  <option value="DOCUMENT_PREP">Document Prep</option>
                  <option value="APPLICATION_FORM">Application Form</option>
                  <option value="POST_SUBMISSION">Post-Submission & Vault</option>
                </select>

                <button
                  type="submit"
                  disabled={submittingCustom || !customTitle.trim()}
                  className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-purple-600 hover:bg-purple-500 text-white disabled:opacity-50 transition-colors shadow-sm"
                >
                  {submittingCustom ? "Adding..." : "Add to Checklist"}
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setShowAddCustom(true)}
              className="w-full py-2.5 px-4 rounded-xl border border-dashed border-slate-700 hover:border-slate-500 text-slate-400 hover:text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors hover:bg-slate-800/40"
            >
              <Plus className="w-4 h-4" />
              <span>Add Personal Preparation Item</span>
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            <span>Preparation items auto-save with your candidate account.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors"
          >
            Close Checklist
          </button>
        </div>
      </div>
    </div>
  );
}
