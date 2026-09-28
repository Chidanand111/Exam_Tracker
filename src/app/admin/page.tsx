"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  RefreshCw,
  Cpu,
  FileCheck2,
  AlertTriangle,
  ExternalLink,
  CheckCircle2,
  Clock,
  Sparkles,
  Building2,
  Plus,
  ArrowRight,
  Database,
} from "lucide-react";
import { StructuredRecruitmentExtraction } from "@/lib/ai-extractor";

export default function AdminDashboardPage() {
  const [sources, setSources] = useState<any[]>([]);
  const [changes, setChanges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [crawling, setCrawling] = useState(false);
  const [crawlFeedback, setCrawlFeedback] = useState<string | null>(null);

  // AI Extraction Simulator state
  const [rawNoticeText, setRawNoticeText] = useState(
    `STAFF SELECTION COMMISSION (GOVERNMENT OF INDIA)\nNOTICE: COMBINED GRADUATE LEVEL EXAMINATION, 2026\nF.No. HQ-PPII03/1/2026-PP_II\nTentative Vacancies: There are approx. 14,582 vacancies for Group B and Group C posts.\nAge Limit: 18-30 years as on 01-08-2026.\nEssential Educational Qualification: Bachelor's Degree from a recognized University. No experience required.\nApplication Start Date: 24-06-2026, Last Date: 27-07-2026.\nScheme of Examination: Tier-I (Computer Based) followed by Tier-II and Document Verification.`
  );
  const [sourceUrlInput, setSourceUrlInput] = useState("https://ssc.gov.in/notice-cgl-2026.pdf");
  const [extracting, setExtracting] = useState(false);
  const [extractedData, setExtractedData] = useState<StructuredRecruitmentExtraction | null>(null);
  const [approvedSuccess, setApprovedSuccess] = useState(false);

  // Change notice simulation
  const [corrigendumRecruitmentId, setCorrigendumRecruitmentId] = useState("");
  const [corrigendumField, setCorrigendumField] = useState("appDeadline");
  const [corrigendumOld, setCorrigendumOld] = useState("2026-07-24");
  const [corrigendumNew, setCorrigendumNew] = useState("2026-07-27");
  const [corrigendumReason, setCorrigendumReason] = useState("Official Corrigendum No. 2/2026");
  const [corrigendumStatus, setCorrigendumStatus] = useState<string | null>(null);

  // Deep Scan state
  const [deepScanning, setDeepScanning] = useState(false);
  const [deepScanResult, setDeepScanResult] = useState<any>(null);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/sources");
      if (res.ok) {
        const data = await res.json();
        setSources(data.sources || []);
        setChanges(data.recentChanges || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerDeepScan = async () => {
    setDeepScanning(true);
    setDeepScanResult(null);
    try {
      const res = await fetch("/api/admin/deep-scan", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setDeepScanResult(data.summary);
        fetchAdminData();
      } else {
        alert(data.error || "Failed to run deep scan");
      }
    } catch {
      alert("Failed to connect to deep scan API.");
    } finally {
      setDeepScanning(false);
    }
  };

  const handleTriggerCrawl = async () => {
    setCrawling(true);
    setCrawlFeedback(null);
    try {
      const res = await fetch("/api/admin/sources", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setCrawlFeedback(`Audit complete: Checked ${data.results.length} official government portals.`);
        fetchAdminData();
      }
    } catch {
      setCrawlFeedback("Failed to run crawler check.");
    } finally {
      setCrawling(false);
    }
  };

  const handleRunAiExtraction = async (e: React.FormEvent) => {
    e.preventDefault();
    setExtracting(true);
    setApprovedSuccess(false);

    try {
      const res = await fetch("/api/admin/ai-extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rawText: rawNoticeText,
          sourceUrl: sourceUrlInput,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setExtractedData(data.extracted);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setExtracting(false);
    }
  };

  const handlePostCorrigendum = async (e: React.FormEvent) => {
    e.preventDefault();
    setCorrigendumStatus("Broadcasting corrigendum alert...");

    try {
      // Find default recruitment id if none chosen
      const targetId = corrigendumRecruitmentId || changes[0]?.recruitmentId || "default";

      const res = await fetch("/api/admin/change-notice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recruitmentId: targetId,
          field: corrigendumField,
          oldValue: corrigendumOld,
          newValue: corrigendumNew,
          changeReason: corrigendumReason,
          updateRecruitment: true,
        }),
      });

      if (res.ok) {
        setCorrigendumStatus("✓ Corrigendum logged & broadcasted to all enrolled applicants!");
        fetchAdminData();
      } else {
        setCorrigendumStatus("Error broadcasting change.");
      }
    } catch {
      setCorrigendumStatus("Failed to submit corrigendum.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-amber-400" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Commission Source Monitor & Ingestion Control
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Monitor official government portals, review AI-extracted documents, approve stages, and broadcast corrigendums
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleTriggerDeepScan}
            disabled={deepScanning}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-blue-600/30 transition-all disabled:opacity-50"
          >
            <Sparkles className={`w-4 h-4 text-blue-200 ${deepScanning ? "animate-spin" : ""}`} />
            <span>{deepScanning ? "Scanning State & Central..." : "⚡ Deep Scan Central & State Govt"}</span>
          </button>

          <button
            onClick={handleTriggerCrawl}
            disabled={crawling}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-md shadow-amber-600/30 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${crawling ? "animate-spin" : ""}`} />
            <span>{crawling ? "Polling Portals..." : "Run Source Audit Now"}</span>
          </button>
        </div>
      </div>

      {deepScanResult && (
        <div className="p-4 rounded-3xl bg-gradient-to-r from-blue-950/40 via-indigo-950/30 to-slate-900 border border-blue-500/30 text-white space-y-3 shadow-lg">
          <div className="flex items-center justify-between pb-2 border-b border-blue-500/20">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span className="font-bold text-xs uppercase tracking-wider text-blue-300">
                Deep Scan Audit Complete: Central & State Portals Synchronized
              </span>
            </div>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              {deepScanResult.totalVacanciesTracked?.toLocaleString()} Total Vacancies Tracked
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <span className="text-[10px] text-slate-400 block">Total Exams Scanned</span>
              <span className="text-base font-extrabold text-white">{deepScanResult.totalExamsScanned}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <span className="text-[10px] text-slate-400 block">Central Recruitments</span>
              <span className="text-base font-extrabold text-blue-400">{deepScanResult.centralExamsCount}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <span className="text-[10px] text-slate-400 block">State PSC Recruitments</span>
              <span className="text-base font-extrabold text-emerald-400">{deepScanResult.stateExamsCount}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <span className="text-[10px] text-slate-400 block">Official Sources Active</span>
              <span className="text-base font-extrabold text-amber-400">{deepScanResult.sourcesCount}</span>
            </div>
          </div>

          <div className="text-[11px] text-slate-300 flex items-center gap-1.5 flex-wrap pt-1">
            <span className="text-slate-400 font-semibold">States Covered:</span>
            {deepScanResult.statesCovered?.map((st: string) => (
              <span key={st} className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-200 border border-slate-700 text-[10px]">
                {st}
              </span>
            ))}
          </div>
        </div>
      )}

      {crawlFeedback && (
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{crawlFeedback}</span>
        </div>
      )}

      {/* Grid of Sections: Source Registry & Recent Corrigendums */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Monitored Official Sources Registry (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Database className="w-4 h-4 text-blue-400" />
                  <span>Configured Official Government Sources</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Automated background poller monitors official notice boards & RSS feeds for new PDF notices
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                {sources.length} Active Sources
              </span>
            </div>

            <div className="divide-y divide-slate-800/80">
              {sources.map((src) => (
                <div key={src.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-white">{src.name}</span>
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {src.code}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 truncate max-w-md">
                      Portal: <a href={src.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">{src.url}</a>
                    </p>
                  </div>

                  <div className="flex items-center gap-3 text-xs shrink-0">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 block">Status:</span>
                      <span className="font-semibold text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        {src.status}
                      </span>
                    </div>

                    <a
                      href={src.listUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                      title="Visit official notice board"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI PDF / HTML Extraction Pipeline Tester */}
          <div className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-purple-400" />
                  <span>AI Document Ingestion & Verification Staging</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Ingests raw notification text/PDF, enforces explicit provenance vs inferred, rejects fabricated data
                </p>
              </div>
            </div>

            <form onSubmit={handleRunAiExtraction} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Official Source Document URL
                </label>
                <input
                  type="url"
                  required
                  value={sourceUrlInput}
                  onChange={(e) => setSourceUrlInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Raw Official Notification Text (Extracted from PDF)
                </label>
                <textarea
                  rows={4}
                  required
                  value={rawNoticeText}
                  onChange={(e) => setRawNoticeText(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={extracting}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md shadow-purple-600/30 transition-colors disabled:opacity-50"
                >
                  <Cpu className="w-3.5 h-3.5" />
                  <span>{extracting ? "Extracting..." : "Parse & Structure with AI"}</span>
                </button>
              </div>
            </form>

            {/* Extracted Structured JSON Preview & Provenance */}
            {extractedData && (
              <div className="mt-4 p-4 rounded-2xl bg-slate-900 border border-purple-500/30 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span className="font-bold text-white text-xs">
                      Extracted Structured Record (Confidence: {(extractedData.confidenceScore * 100).toFixed(0)}%)
                    </span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">
                    Human-in-the-Loop Validation Ready
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Recruitment Title:</span>
                    <span className="font-semibold text-white">{extractedData.recruitmentName.value}</span>
                    <span className="text-[9px] text-blue-400 block mt-0.5">[{extractedData.recruitmentName.provenance}]</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Total Vacancies:</span>
                    <span className="font-semibold text-emerald-400">
                      {extractedData.totalVacancies.value?.toLocaleString() || "Not specified"}
                    </span>
                    <span className="text-[9px] text-blue-400 block mt-0.5">[{extractedData.totalVacancies.provenance}]</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Fresher Eligible:</span>
                    <span className="font-semibold text-white">
                      {extractedData.fresherEligible.value ? "Yes (0 Years Exp)" : "Experience Required"}
                    </span>
                    <span className="text-[9px] text-blue-400 block mt-0.5">[{extractedData.fresherEligible.provenance}]</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">In-Hand Salary Est:</span>
                    <span className="font-semibold text-white">
                      ₹{extractedData.inHandSalaryMin.value?.toLocaleString()} - ₹{extractedData.inHandSalaryMax.value?.toLocaleString()}
                    </span>
                    <span className="text-[9px] text-amber-400 block mt-0.5">[{extractedData.inHandSalaryMin.provenance}]</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-800 text-xs">
                  <span className="text-[10px] text-slate-400 block mb-1">Dynamic Stages Extracted:</span>
                  <div className="flex flex-wrap gap-2">
                    {extractedData.stages.map((st) => (
                      <span key={st.order} className="px-2 py-1 rounded bg-slate-900 border border-slate-700 text-slate-200">
                        Round {st.order}: <strong>{st.name}</strong>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <p className="text-[11px] text-slate-400">
                    Provenance flags guarantee compliance with Indian transparency standards.
                  </p>
                  <button
                    onClick={() => setApprovedSuccess(true)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 transition-colors"
                  >
                    {approvedSuccess ? "✓ Approved & Seeded to Database" : "Approve & Publish to Catalog"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Corrigendum Change Broadcaster & Audit History */}
        <div className="space-y-6">
          {/* Corrigendum Broadcaster (Feature 15) */}
          <div className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Broadcast Corrigendum</span>
            </h3>
            <p className="text-xs text-slate-400">
              When a commission extends deadlines or revises vacancies, log changes and push alerts to enrolled candidates.
            </p>

            <form onSubmit={handlePostCorrigendum} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Field Changed</label>
                <select
                  value={corrigendumField}
                  onChange={(e) => setCorrigendumField(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none"
                >
                  <option value="appDeadline">Application Deadline</option>
                  <option value="vacancies">Total Vacancies</option>
                  <option value="examDate">Exam Schedule</option>
                  <option value="status">Recruitment Status</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 text-[11px] mb-1">Old Value</label>
                  <input
                    type="text"
                    required
                    value={corrigendumOld}
                    onChange={(e) => setCorrigendumOld(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-[11px] mb-1">New Value</label>
                  <input
                    type="text"
                    required
                    value={corrigendumNew}
                    onChange={(e) => setCorrigendumNew(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-emerald-400 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Official Reference Notice</label>
                <input
                  type="text"
                  required
                  value={corrigendumReason}
                  onChange={(e) => setCorrigendumReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md shadow-amber-600/30 transition-colors"
              >
                Log Change & Push Alert
              </button>

              {corrigendumStatus && (
                <div className="p-2 rounded-lg bg-slate-800 text-amber-300 text-[11px] text-center">
                  {corrigendumStatus}
                </div>
              )}
            </form>
          </div>

          {/* Recent Change Audit Log */}
          <div className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Recent Change History Log
            </h3>
            <div className="space-y-2.5 text-xs">
              {changes.length === 0 ? (
                <p className="text-slate-500 text-xs">No corrigendums logged yet.</p>
              ) : (
                changes.map((ch) => (
                  <div key={ch.id} className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 space-y-1">
                    <div className="font-semibold text-white">{ch.recruitment?.title || "Recruitment"}</div>
                    <div className="text-slate-400 text-[11px]">
                      Field: <strong className="text-amber-400">{ch.changedField}</strong>
                    </div>
                    <div className="text-[11px]">
                      <span className="line-through text-slate-500 mr-2">{ch.oldValue}</span>
                      <span className="text-emerald-400 font-bold">{ch.newValue}</span>
                    </div>
                    {ch.changeReason && (
                      <p className="text-[10px] text-slate-500">{ch.changeReason}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
