"use client";

import React, { useState, useEffect } from "react";
import { Bookmark, Star, Check, ChevronDown, Sparkles } from "lucide-react";
import { ShortlistLifecycleState } from "@/types";

interface ShortlistButtonProps {
  recruitmentId: string;
  initialState?: ShortlistLifecycleState | null;
  onStateChange?: (state: ShortlistLifecycleState | null) => void;
  variant?: "icon" | "button" | "pill";
}

const LIFECYCLE_OPTIONS: {
  key: ShortlistLifecycleState;
  label: string;
  badgeClass: string;
  icon: string;
  description: string;
}[] = [
  {
    key: "BOOKMARKED",
    label: "Bookmarked",
    badgeClass: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    icon: "🔖",
    description: "Saved for future reference. Does NOT imply you have applied.",
  },
  {
    key: "INTERESTED",
    label: "Interested",
    badgeClass: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    icon: "⭐",
    description: "Actively considering and preparing documents to apply.",
  },
  {
    key: "APPLIED",
    label: "Applied",
    badgeClass: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    icon: "✓",
    description: "Officially submitted on the commission portal.",
  },
  {
    key: "COMPLETED",
    label: "Completed",
    badgeClass: "bg-slate-700/60 text-slate-300 border-slate-600",
    icon: "🏆",
    description: "Recruitment cycle or final result completed.",
  },
];

export function ShortlistButton({
  recruitmentId,
  initialState = null,
  onStateChange,
  variant = "button",
}: ShortlistButtonProps) {
  const [currentState, setCurrentState] = useState<ShortlistLifecycleState | null>(initialState);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setCurrentState(initialState);
  }, [initialState]);

  const handleSelectState = async (state: ShortlistLifecycleState | null) => {
    setShowDropdown(false);
    setLoading(true);

    try {
      if (state === null) {
        // Remove from shortlist
        await fetch(`/api/shortlist?recruitmentId=${recruitmentId}`, {
          method: "DELETE",
        });
        setCurrentState(null);
        if (onStateChange) onStateChange(null);
      } else {
        await fetch("/api/shortlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            recruitmentId,
            lifecycleState: state,
          }),
        });
        setCurrentState(state);
        if (onStateChange) onStateChange(state);
      }
    } catch (err) {
      console.error("Failed to update shortlist state", err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickToggle = () => {
    if (currentState) {
      handleSelectState(null);
    } else {
      handleSelectState("BOOKMARKED");
    }
  };

  const currentOption = LIFECYCLE_OPTIONS.find((o) => o.key === currentState);

  return (
    <div className="relative inline-flex items-center">
      {variant === "icon" ? (
        <button
          onClick={handleQuickToggle}
          disabled={loading}
          className={`p-2 rounded-lg transition-colors ${
            currentState
              ? "text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30"
              : "text-slate-400 hover:text-white hover:bg-slate-800"
          }`}
          title={currentState ? `Shortlisted as: ${currentState}` : "Bookmark Opportunity"}
        >
          <Star className={`w-4 h-4 ${currentState ? "fill-amber-400" : ""}`} />
        </button>
      ) : variant === "pill" ? (
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border transition-all ${
            currentOption
              ? currentOption.badgeClass
              : "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700"
          }`}
        >
          <span>{currentOption ? currentOption.icon : "🔖"}</span>
          <span>{currentOption ? currentOption.label : "Bookmark"}</span>
          <ChevronDown className="w-3 h-3 opacity-60" />
        </button>
      ) : (
        <div className="inline-flex rounded-lg border border-slate-700 overflow-hidden shadow-sm">
          <button
            onClick={handleQuickToggle}
            disabled={loading}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-colors ${
              currentState
                ? "bg-amber-500/20 text-amber-300 hover:bg-amber-500/30"
                : "bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${currentState ? "fill-amber-400 text-amber-400" : "text-slate-400"}`} />
            <span>{currentState ? currentOption?.label : "Bookmark"}</span>
          </button>

          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="px-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border-l border-slate-700 transition-colors"
            title="Change shortlist state"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* State Selector Dropdown */}
      {showDropdown && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowDropdown(false)}
          />
          <div className="absolute top-full right-0 mt-1.5 w-64 p-1.5 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
              Set Candidate Status
            </div>

            <div className="space-y-1 mt-1">
              {LIFECYCLE_OPTIONS.map((opt) => {
                const isSelected = currentState === opt.key;
                return (
                  <button
                    key={opt.key}
                    onClick={() => handleSelectState(opt.key)}
                    className={`w-full text-left p-2 rounded-lg text-xs transition-colors flex items-start gap-2.5 ${
                      isSelected
                        ? "bg-blue-600/20 border border-blue-500/30 text-white"
                        : "hover:bg-slate-800 text-slate-300 hover:text-white"
                    }`}
                  >
                    <span className="text-sm shrink-0">{opt.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-200">{opt.label}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-blue-400" />}
                      </div>
                      <p className="text-[10px] text-slate-400 leading-tight mt-0.5">
                        {opt.description}
                      </p>
                    </div>
                  </button>
                );
              })}

              {currentState && (
                <button
                  onClick={() => handleSelectState(null)}
                  className="w-full text-left p-2 text-xs text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors border-t border-slate-800 mt-1"
                >
                  Remove from Shortlist
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
