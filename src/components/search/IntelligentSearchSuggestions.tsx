"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Building2,
  GraduationCap,
  Layers,
  MapPin,
  TrendingUp,
  ArrowRight,
  Sparkles,
} from "lucide-react";

interface SuggestionItem {
  type: string;
  label: string;
  value: string;
  category: string;
}

interface Props {
  query: string;
  onSelectSuggestion: (value: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function IntelligentSearchSuggestions({
  query,
  onSelectSuggestion,
  isOpen,
  onClose,
}: Props) {
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search/suggestions?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data.suggestions || []);
        }
      } catch (err) {
        console.error("Suggestion fetch failed:", err);
      } finally {
        setLoading(false);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [query, isOpen]);

  // Handle arrow keys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen || suggestions.length === 0) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
      } else if (e.key === "Enter" && selectedIndex >= 0) {
        e.preventDefault();
        onSelectSuggestion(suggestions[selectedIndex].value);
        onClose();
      } else if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, suggestions, selectedIndex, onSelectSuggestion, onClose]);

  if (!isOpen || (suggestions.length === 0 && !loading)) return null;

  const getCategoryIcon = (type: string) => {
    switch (type) {
      case "organization":
        return <Building2 className="w-3.5 h-3.5 text-blue-400" />;
      case "qualification":
        return <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />;
      case "family":
        return <Layers className="w-3.5 h-3.5 text-purple-400" />;
      case "location":
        return <MapPin className="w-3.5 h-3.5 text-amber-400" />;
      default:
        return <Sparkles className="w-3.5 h-3.5 text-indigo-400" />;
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-30" onClick={onClose} />
      <div
        ref={containerRef}
        className="absolute left-0 right-0 top-full mt-1.5 z-40 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl animate-in fade-in zoom-in-95 duration-100"
      >
        <div className="p-2 border-b border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <span className="font-medium flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-blue-400" />
            Intelligent Search Suggestions
          </span>
          <span className="text-[10px] text-slate-500 font-mono">Use ↑↓ keys & Enter</span>
        </div>

        <div className="max-h-72 overflow-y-auto p-1.5 space-y-1">
          {loading && suggestions.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-500">
              Searching commissions & qualifications...
            </div>
          ) : (
            suggestions.map((item, idx) => {
              const isSelected = selectedIndex === idx;
              return (
                <div
                  key={`${item.type}-${item.value}-${idx}`}
                  onClick={() => {
                    onSelectSuggestion(item.value);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer text-xs transition-colors ${
                    isSelected
                      ? "bg-blue-600/20 text-white border border-blue-500/30"
                      : "text-slate-300 hover:bg-slate-800/60"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-1 rounded-lg bg-slate-950/80 border border-slate-800 shrink-0">
                      {getCategoryIcon(item.type)}
                    </div>
                    <span className="truncate font-medium">{item.label}</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                      {item.category}
                    </span>
                    <ArrowRight className="w-3 h-3 text-slate-500 opacity-60" />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}
