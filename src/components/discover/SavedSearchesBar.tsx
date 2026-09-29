"use client";

import React, { useState, useEffect } from "react";
import {
  Bookmark,
  Plus,
  Trash2,
  Bell,
  BellOff,
  Sparkles,
  Search,
  Check,
  X,
  RefreshCw,
  SlidersHorizontal,
} from "lucide-react";
import { FilterState, SavedSearchData } from "@/types";

interface SavedSearchesBarProps {
  currentFilters: FilterState;
  onApplySavedSearch: (search: { query: string; filters: Partial<FilterState>; sortBy?: string }) => void;
}

const PRESET_POPULAR_SEARCHES = [
  {
    name: "Graduate Freshers",
    query: "",
    filters: { fresherOnly: true, qualification: "ANY_GRADUATE" },
    sortBy: "newest",
  },
  {
    name: "B.Tech Govt Jobs",
    query: "Engineer",
    filters: { qualification: "BTECH" },
    sortBy: "salary",
  },
  {
    name: "Freshers + ₹50,000+",
    query: "",
    filters: { fresherOnly: true, salaryMin: 50000 },
    sortBy: "salary",
  },
  {
    name: "Banking & Finance",
    query: "Bank",
    filters: { category: "BANKING" },
    sortBy: "closing_soon",
  },
  {
    name: "Central Graduate (SSC / UPSC)",
    query: "",
    filters: { category: "CENTRAL", qualification: "ANY_GRADUATE" },
    sortBy: "newest",
  },
];

export function SavedSearchesBar({
  currentFilters,
  onApplySavedSearch,
}: SavedSearchesBarProps) {
  const [savedSearches, setSavedSearches] = useState<SavedSearchData[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [searchName, setSearchName] = useState("");
  const [notifyMatches, setNotifyMatches] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchSavedSearches();
  }, []);

  const fetchSavedSearches = async () => {
    try {
      const res = await fetch("/api/saved-searches");
      const data = await res.json();
      if (data.success) {
        setSavedSearches(data.savedSearches || []);
      }
    } catch {
      // User may not be logged in
    }
  };

  const handleSaveSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchName.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/saved-searches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: searchName.trim(),
          searchQuery: currentFilters.search || null,
          filters: {
            qualification: currentFilters.qualification,
            fresherOnly: currentFilters.fresherOnly,
            salaryMin: currentFilters.salaryMin,
            ageMax: currentFilters.ageMax,
            category: currentFilters.category,
            stateLocation: currentFilters.stateLocation,
            status: currentFilters.status,
          },
          sortPreference: currentFilters.sortBy,
          notifyNewMatches: notifyMatches,
        }),
      });

      if (res.ok) {
        setSearchName("");
        setShowSaveDialog(false);
        fetchSavedSearches();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSearch = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await fetch(`/api/saved-searches?id=${id}`, { method: "DELETE" });
      setSavedSearches((prev) => prev.filter((s) => s.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const handleScanNewMatches = async () => {
    setScanning(true);
    setScanMessage(null);
    try {
      const res = await fetch("/api/saved-searches/scan-matches", {
        method: "POST",
      });
      const data = await res.json();
      if (data.success) {
        setScanMessage(data.message);
        setTimeout(() => setScanMessage(null), 5000);
        fetchSavedSearches();
      }
    } catch {
      setScanMessage("Scan completed.");
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="w-full mb-5 space-y-2.5">
      {/* Search presets and user saved searches */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 overflow-x-auto py-1 no-scrollbar flex-1 min-w-[280px]">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 shrink-0 flex items-center gap-1">
            <Bookmark className="w-3.5 h-3.5 text-blue-400" />
            Quick Searches:
          </span>

          {/* User's custom saved searches */}
          {savedSearches.map((s) => (
            <div
              key={s.id}
              onClick={() =>
                onApplySavedSearch({
                  query: s.searchQuery || "",
                  filters: s.filters || {},
                  sortBy: s.sortPreference,
                })
              }
              className="group inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-900/40 to-indigo-900/40 hover:from-blue-800/50 hover:to-indigo-800/50 text-blue-200 border border-blue-500/40 cursor-pointer transition-all shadow-sm shrink-0"
            >
              <span>⭐</span>
              <span>{s.name}</span>
              {s.lastMatchedCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-blue-500/20 text-[10px] text-blue-300 font-mono">
                  {s.lastMatchedCount}
                </span>
              )}
              <button
                onClick={(e) => handleDeleteSearch(s.id, e)}
                className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-400 ml-0.5 p-0.5 transition-opacity"
                title="Delete saved search"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}

          {/* Platform preset searches */}
          {PRESET_POPULAR_SEARCHES.map((preset) => (
            <button
              key={preset.name}
              onClick={() =>
                onApplySavedSearch({
                  query: preset.query,
                  filters: preset.filters as any,
                  sortBy: preset.sortBy,
                })
              }
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-slate-700/80 transition-colors shrink-0"
            >
              <span>{preset.name}</span>
            </button>
          ))}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {savedSearches.length > 0 && (
            <button
              onClick={handleScanNewMatches}
              disabled={scanning}
              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg bg-emerald-600/15 hover:bg-emerald-600/25 text-emerald-400 border border-emerald-500/30 transition-colors"
              title="Check for newly published recruitments matching your saved searches"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${scanning ? "animate-spin" : ""}`} />
              <span>{scanning ? "Scanning..." : "Check New Matches"}</span>
            </button>
          )}

          <button
            onClick={() => setShowSaveDialog(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Save Search</span>
          </button>
        </div>
      </div>

      {/* Match scan alert banner */}
      {scanMessage && (
        <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-200 flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>{scanMessage}</span>
          </div>
          <button onClick={() => setScanMessage(null)} className="text-emerald-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Save Search Modal */}
      {showSaveDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-5 shadow-2xl space-y-4 text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-lg bg-blue-500/10 text-blue-400">
                  <Bookmark className="w-4 h-4" />
                </span>
                <h3 className="font-bold text-white text-base">Save Current Search</h3>
              </div>
              <button
                onClick={() => setShowSaveDialog(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSearch} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Search Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Graduate jobs in Karnataka, B.Tech 50k+"
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  autoFocus
                />
              </div>

              <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/60 text-xs text-slate-300 space-y-1">
                <p className="font-semibold text-slate-200">Preserved Configuration:</p>
                <p className="text-slate-400">
                  Query: {currentFilters.search ? `"${currentFilters.search}"` : "All recruitments"} •
                  Degree: {currentFilters.qualification || "Any"} •
                  Freshers Only: {currentFilters.fresherOnly ? "Yes" : "No"} •
                  Min Salary: {currentFilters.salaryMin ? `₹${currentFilters.salaryMin.toLocaleString()}` : "Any"}
                </p>
              </div>

              <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={notifyMatches}
                  onChange={(e) => setNotifyMatches(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-800 text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <span>Notify me when newly released exams match this search</span>
              </label>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowSaveDialog(false)}
                  className="px-4 py-2 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !searchName.trim()}
                  className="px-4 py-2 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50 transition-colors"
                >
                  {loading ? "Saving..." : "Save Search"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
