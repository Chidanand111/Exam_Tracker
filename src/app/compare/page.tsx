"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Scale,
  ArrowLeft,
  X,
  Plus,
  ExternalLink,
  ShieldAlert,
  Info,
  Building2,
  Calendar,
  Briefcase,
  GraduationCap,
  IndianRupee,
  Layers,
  CheckCircle2,
  FileText,
  Clock,
  MapPin,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { ShortlistButton } from "@/components/shortlist/ShortlistButton";

function CompareWorkspaceContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const rawIds = searchParams.get("ids") || "";

  const [recruitmentIds, setRecruitmentIds] = useState<string[]>(
    rawIds ? rawIds.split(",").filter(Boolean) : []
  );
  const [data, setData] = useState<{
    recruitments: any[];
    attributes: Array<{
      key: string;
      label: string;
      category: string;
      values: Record<string, any>;
    }>;
    disclaimer: string;
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [allAvailableRecruitments, setAllAvailableRecruitments] = useState<any[]>([]);
  const [selectedToAdd, setSelectedToAdd] = useState("");

  useEffect(() => {
    if (rawIds) {
      const ids = rawIds.split(",").filter(Boolean);
      setRecruitmentIds(ids);
      fetchComparison(ids);
    } else {
      setLoading(false);
    }
    fetchAvailableList();
  }, [rawIds]);

  const fetchComparison = async (ids: string[]) => {
    if (ids.length === 0) {
      setData(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/recruitments/compare?ids=${ids.join(",")}`);
      const result = await res.json();
      if (result.success) {
        setData(result);
      } else {
        setData(null);
      }
    } catch (e) {
      console.error("Comparison load error", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableList = async () => {
    try {
      const res = await fetch("/api/recruitments?limit=100");
      const result = await res.json();
      if (result.recruitments) {
        setAllAvailableRecruitments(result.recruitments);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRemove = (idToRemove: string) => {
    const updated = recruitmentIds.filter((id) => id !== idToRemove);
    setRecruitmentIds(updated);
    if (updated.length > 0) {
      router.push(`/compare?ids=${updated.join(",")}`);
    } else {
      router.push("/discover");
    }
  };

  const handleAddRecruitment = (idToAdd: string) => {
    if (!idToAdd || recruitmentIds.includes(idToAdd)) return;
    if (recruitmentIds.length >= 4) {
      alert("You can compare up to 4 recruitments side-by-side.");
      return;
    }
    const updated = [...recruitmentIds, idToAdd];
    setRecruitmentIds(updated);
    setSelectedToAdd("");
    router.push(`/compare?ids=${updated.join(",")}`);
  };

  const CATEGORY_SECTIONS = [
    { key: "OVERVIEW", title: "Recruitment Overview", icon: Building2 },
    { key: "ELIGIBILITY", title: "Eligibility & Age Criteria", icon: GraduationCap },
    { key: "COMPENSATION", title: "Salary, Pay Scale & Fees", icon: IndianRupee },
    { key: "DATES", title: "Deadlines, Exams & Location", icon: Calendar },
    { key: "PROCESS", title: "Selection Process & Portals", icon: Layers },
  ];

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Navigation & Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link
              href="/discover"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white mb-2 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Discovery</span>
            </Link>
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Scale className="w-5 h-5" />
              </span>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white">
                  Recruitment Comparison Workspace
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  Side-by-side comparative analysis of qualifications, salaries, age criteria, and official stages
                </p>
              </div>
            </div>
          </div>

          {/* Add Another Recruitment to Workspace */}
          {recruitmentIds.length < 4 && (
            <div className="flex items-center gap-2">
              <select
                value={selectedToAdd}
                onChange={(e) => setSelectedToAdd(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-blue-500 max-w-[260px] truncate"
              >
                <option value="">+ Add exam to compare...</option>
                {allAvailableRecruitments
                  .filter((r) => !recruitmentIds.includes(r.id))
                  .map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.organization?.shortName || "GOVT"} — {r.title}
                    </option>
                  ))}
              </select>

              <button
                onClick={() => handleAddRecruitment(selectedToAdd)}
                disabled={!selectedToAdd}
                className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-40 transition-colors"
              >
                Add
              </button>
            </div>
          )}
        </div>

        {/* Mandatory Neutral Non-Ranking Disclaimer */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 flex items-start gap-3">
          <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-semibold text-white">Objective Comparative Analysis: </span>
            This workspace provides an objective, side-by-side comparison of published recruitment terms.{" "}
            <span className="text-amber-300 font-medium">
              BharatExam Tracker does not produce an overall winner, score, or ranking.
            </span>{" "}
            The purpose is to empower candidates to transparently evaluate requirements, benefits, and fit for their individual qualifications.
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center text-slate-400 gap-3">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm">Synthesizing side-by-side comparison data...</p>
          </div>
        ) : !data || data.recruitments.length === 0 ? (
          <div className="py-20 text-center rounded-2xl border border-slate-800 bg-slate-900/40 p-8 space-y-4">
            <Scale className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-white">No Recruitments Selected</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Select at least 2 government recruitments from the Discovery page using the &quot;Compare&quot; option to view their comparative breakdown here.
            </p>
            <Link
              href="/discover"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-lg transition-colors"
            >
              Browse Open Opportunities
            </Link>
          </div>
        ) : (
          /* Side-by-Side Comparison Table */
          <div className="border border-slate-800 rounded-2xl bg-slate-900/60 overflow-hidden shadow-2xl backdrop-blur-md">
            
            {/* Header Row: Exam Cards */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/90">
                    <th className="p-4 w-1/4 min-w-[200px] text-xs font-bold uppercase tracking-wider text-slate-400 border-r border-slate-800">
                      Comparison Metric
                    </th>
                    {data.recruitments.map((rec) => (
                      <th
                        key={rec.id}
                        className="p-4 w-1/4 min-w-[240px] align-top border-r border-slate-800 last:border-r-0"
                      >
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                              {rec.organization?.shortName || "GOVT"}
                            </span>
                            <button
                              onClick={() => handleRemove(rec.id)}
                              className="text-slate-500 hover:text-rose-400 p-1 rounded-lg hover:bg-slate-800 transition-colors"
                              title="Remove from comparison"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <Link
                            href={`/exams/${rec.id}`}
                            className="text-sm font-bold text-white hover:text-blue-400 transition-colors line-clamp-2 block leading-snug"
                          >
                            {rec.title}
                          </Link>

                          <div className="pt-1 flex items-center justify-between gap-2">
                            <ShortlistButton recruitmentId={rec.id} variant="pill" />
                            <Link
                              href={`/exams/${rec.id}`}
                              className="text-[11px] font-medium text-blue-400 hover:underline inline-flex items-center gap-1"
                            >
                              <span>Details</span>
                              <ExternalLink className="w-3 h-3" />
                            </Link>
                          </div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>

                {/* Sectioned Rows */}
                <tbody className="divide-y divide-slate-800/80 text-xs">
                  {CATEGORY_SECTIONS.map((section) => {
                    const sectionAttributes = data.attributes.filter(
                      (attr) => attr.category === section.key
                    );
                    if (sectionAttributes.length === 0) return null;

                    const SectionIcon = section.icon;

                    return (
                      <React.Fragment key={section.key}>
                        {/* Section Header Row */}
                        <tr className="bg-slate-950/60 font-bold text-slate-300">
                          <td
                            colSpan={data.recruitments.length + 1}
                            className="px-4 py-2.5 text-xs text-blue-300 uppercase tracking-wider flex items-center gap-2"
                          >
                            <SectionIcon className="w-3.5 h-3.5 text-blue-400" />
                            <span>{section.title}</span>
                          </td>
                        </tr>

                        {/* Metric Rows */}
                        {sectionAttributes.map((attr) => (
                          <tr
                            key={attr.key}
                            className="hover:bg-slate-800/30 transition-colors"
                          >
                            <td className="p-3.5 font-semibold text-slate-300 border-r border-slate-800/80 bg-slate-900/40">
                              {attr.label}
                            </td>
                            {data.recruitments.map((rec) => {
                              const val = attr.values[rec.id];
                              const isLink =
                                typeof val === "string" &&
                                (val.startsWith("http://") || val.startsWith("https://"));

                              return (
                                <td
                                  key={rec.id}
                                  className="p-3.5 text-slate-200 border-r border-slate-800/80 last:border-r-0 leading-relaxed"
                                >
                                  {isLink ? (
                                    <a
                                      href={val}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 hover:underline font-medium"
                                    >
                                      <span>Official Portal</span>
                                      <ExternalLink className="w-3 h-3" />
                                    </a>
                                  ) : (
                                    <span>{val ?? "—"}</span>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Bottom Actions */}
            <div className="p-4 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>Comparing {data.recruitments.length} opportunities</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => router.push("/discover")}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                >
                  Explore More Exams
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#070b14] flex items-center justify-center text-white">Loading workspace...</div>}>
      <CompareWorkspaceContent />
    </Suspense>
  );
}
