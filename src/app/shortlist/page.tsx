"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Bookmark,
  Star,
  CheckCircle2,
  Clock,
  Calendar,
  IndianRupee,
  Building2,
  ExternalLink,
  Trash2,
  FileCheck2,
  Lock,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Info,
  Filter,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { ApplicationChecklistModal } from "@/components/checklists/ApplicationChecklistModal";
import { ApplicationVaultModal } from "@/components/vault/ApplicationVaultModal";
import { ShortlistButton } from "@/components/shortlist/ShortlistButton";
import { ShortlistLifecycleState } from "@/types";

export default function ShortlistPage() {
  const [items, setItems] = useState<any[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({
    ALL: 0,
    BOOKMARKED: 0,
    INTERESTED: 0,
    APPLIED: 0,
    COMPLETED: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("ALL");

  // Modals state
  const [checklistModalRec, setChecklistModalRec] = useState<{
    id: string;
    title: string;
    orgName?: string;
    notificationUrl?: string | null;
    applyUrl?: string | null;
  } | null>(null);

  const [vaultModalRec, setVaultModalRec] = useState<{
    id: string;
    title: string;
    orgName?: string;
    applyUrl?: string | null;
  } | null>(null);

  useEffect(() => {
    fetchShortlist();
  }, [activeTab]);

  const fetchShortlist = async () => {
    setLoading(true);
    try {
      const url =
        activeTab === "ALL"
          ? "/api/shortlist"
          : `/api/shortlist?state=${activeTab}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setItems(data.items || []);
        if (data.counts) setCounts(data.counts);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (recruitmentId: string) => {
    try {
      await fetch(`/api/shortlist?recruitmentId=${recruitmentId}`, {
        method: "DELETE",
      });
      setItems((prev) => prev.filter((i) => i.recruitmentId !== recruitmentId));
      fetchShortlist();
    } catch (e) {
      console.error(e);
    }
  };

  const handleStateChange = async (
    recruitmentId: string,
    newState: ShortlistLifecycleState
  ) => {
    try {
      await fetch("/api/shortlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recruitmentId,
          lifecycleState: newState,
        }),
      });
      fetchShortlist();
    } catch (e) {
      console.error(e);
    }
  };

  const TABS = [
    { key: "ALL", label: "All Opportunities", icon: Bookmark },
    { key: "BOOKMARKED", label: "Bookmarked", icon: Star, desc: "Exploratory tracking (Not Applied)" },
    { key: "INTERESTED", label: "Interested", icon: Sparkles, desc: "Preparing to apply" },
    { key: "APPLIED", label: "Applied", icon: FileCheck2, desc: "Submitted on commission portal" },
    { key: "COMPLETED", label: "Completed", icon: CheckCircle2, desc: "Cycle concluded" },
  ];

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Bookmark className="w-5 h-5" />
              </span>
              <h1 className="text-2xl font-bold tracking-tight text-white">
                Candidate Shortlist & Lifecycle Tracker
              </h1>
            </div>
            <p className="text-xs text-slate-400">
              Bookmark exams to research and prepare without registering yourself as an applicant
            </p>
          </div>

          <Link
            href="/discover"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-lg transition-colors"
          >
            <span>+ Discover More Exams</span>
          </Link>
        </div>

        {/* Strict Compliance Notice Banner */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 flex items-start gap-3">
          <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-semibold text-white">Bookmarking Independence: </span>
            Adding an exam to your Bookmarked or Interested list is strictly a personal planning tool and{" "}
            <span className="text-amber-300 font-medium">
              does NOT imply that you have officially submitted an application
            </span>{" "}
            with the respective government recruitment board. When you apply on the official portal, transition the status to &quot;Applied&quot; and record your credentials in the Vault.
          </div>
        </div>

        {/* Lifecycle Tabs */}
        <div className="border-b border-slate-800 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {TABS.map((tab) => {
            const isSelected = activeTab === tab.key;
            const count = counts[tab.key] || 0;
            const TabIcon = tab.icon;

            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`py-3 px-4 text-xs font-semibold whitespace-nowrap border-b-2 flex items-center gap-2 transition-all ${
                  isSelected
                    ? "border-blue-500 text-blue-400 bg-blue-500/5"
                    : "border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700"
                }`}
              >
                <TabIcon className="w-4 h-4" />
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                    isSelected
                      ? "bg-blue-500/20 text-blue-300"
                      : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center text-slate-400 gap-3">
            <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm">Loading your shortlisted recruitments...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="py-20 text-center rounded-2xl border border-slate-800 bg-slate-900/40 p-8 space-y-4">
            <Star className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-white">No Recruitments in this List</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              You haven&apos;t marked any recruitments under &quot;{TABS.find((t) => t.key === activeTab)?.label}&quot;. Browse government recruitments and click the Star or Bookmark button to track them here.
            </p>
            <Link
              href="/discover"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-lg transition-colors"
            >
              Explore Discovery
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {items.map((item) => {
              const rec = item.recruitment;
              if (!rec) return null;

              const deadlineDate = rec.appDeadline ? new Date(rec.appDeadline) : null;
              const isPastDeadline = deadlineDate ? deadlineDate < new Date() : false;

              return (
                <div
                  key={item.id}
                  className="rounded-2xl border border-slate-800 bg-slate-900/60 hover:border-slate-700/80 p-5 flex flex-col justify-between space-y-4 shadow-xl backdrop-blur-sm transition-all"
                >
                  {/* Top Bar: Org + Lifecycle State Dropdown */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        {rec.organization?.shortName || "GOVT"}
                      </span>

                      <div className="flex items-center gap-1.5">
                        <select
                          value={item.lifecycleState}
                          onChange={(e) =>
                            handleStateChange(
                              item.recruitmentId,
                              e.target.value as ShortlistLifecycleState
                            )
                          }
                          className="px-2 py-1 text-[11px] font-semibold rounded-lg bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none focus:border-blue-500"
                        >
                          <option value="BOOKMARKED">🔖 Bookmarked</option>
                          <option value="INTERESTED">⭐ Interested</option>
                          <option value="APPLIED">✓ Applied</option>
                          <option value="COMPLETED">🏆 Completed</option>
                        </select>

                        <button
                          onClick={() => handleRemove(item.recruitmentId)}
                          className="p-1 text-slate-500 hover:text-rose-400 rounded hover:bg-slate-800 transition-colors"
                          title="Remove from shortlist"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Title */}
                    <Link
                      href={`/exams/${rec.id}`}
                      className="text-base font-bold text-white hover:text-blue-400 transition-colors line-clamp-2 leading-snug"
                    >
                      {rec.title}
                    </Link>

                    {/* Meta Badges */}
                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 pt-1">
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <IndianRupee className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="truncate">
                          {rec.inHandSalaryMin && rec.inHandSalaryMax
                            ? `₹${rec.inHandSalaryMin.toLocaleString()} - ₹${rec.inHandSalaryMax.toLocaleString()}`
                            : rec.payScale || "Govt Scale"}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-slate-400">
                        <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span className={`truncate ${isPastDeadline ? "text-rose-400" : ""}`}>
                          {deadlineDate
                            ? `${isPastDeadline ? "Closed" : "Ends"} ${deadlineDate.toLocaleDateString("en-IN")}`
                            : "Closing Soon"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-3 border-t border-slate-800/80 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      {/* Preparation Checklist Action */}
                      <button
                        onClick={() =>
                          setChecklistModalRec({
                            id: rec.id,
                            title: rec.title,
                            orgName: rec.organization?.name,
                            notificationUrl: rec.officialNotificationUrl,
                            applyUrl: rec.officialApplyUrl,
                          })
                        }
                        className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg text-xs font-semibold bg-blue-600/15 hover:bg-blue-600/25 text-blue-300 border border-blue-500/30 transition-colors"
                      >
                        <FileCheck2 className="w-3.5 h-3.5 text-blue-400" />
                        <span>Checklist</span>
                      </button>

                      {/* Application Vault Action */}
                      <button
                        onClick={() =>
                          setVaultModalRec({
                            id: rec.id,
                            title: rec.title,
                            orgName: rec.organization?.name,
                            applyUrl: rec.officialApplyUrl,
                          })
                        }
                        className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg text-xs font-semibold bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 transition-colors"
                      >
                        <Lock className="w-3.5 h-3.5 text-amber-400" />
                        <span>Vault</span>
                      </button>
                    </div>

                    {/* Official Portal Link */}
                    {rec.officialApplyUrl && (
                      <a
                        href={rec.officialApplyUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full py-1.5 px-3 rounded-lg text-xs font-medium text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 border border-slate-700/80 flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <span>Official Apply Portal</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Checklist Modal */}
      {checklistModalRec && (
        <ApplicationChecklistModal
          isOpen={Boolean(checklistModalRec)}
          onClose={() => setChecklistModalRec(null)}
          recruitmentId={checklistModalRec.id}
          recruitmentTitle={checklistModalRec.title}
          organizationName={checklistModalRec.orgName}
          officialNotificationUrl={checklistModalRec.notificationUrl}
          officialApplyUrl={checklistModalRec.applyUrl}
        />
      )}

      {/* Vault Modal */}
      {vaultModalRec && (
        <ApplicationVaultModal
          isOpen={Boolean(vaultModalRec)}
          onClose={() => setVaultModalRec(null)}
          recruitmentId={vaultModalRec.id}
          recruitmentTitle={vaultModalRec.title}
          organizationName={vaultModalRec.orgName}
          officialApplyUrl={vaultModalRec.applyUrl}
        />
      )}
    </div>
  );
}
