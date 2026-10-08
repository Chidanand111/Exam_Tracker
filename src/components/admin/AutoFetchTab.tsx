"use client";

import React, { useState, useEffect } from "react";
import {
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Globe,
  ExternalLink,
  Zap,
  Sparkles,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  Rss
} from "lucide-react";

interface AutoFetchTabProps {
  onRefreshAll?: () => void;
}

export function AutoFetchTab({ onRefreshAll }: AutoFetchTabProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [triggerResult, setTriggerResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/auto-fetch");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      } else {
        setErrorMsg("Failed to load auto-fetch configuration");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Network error loading auto-fetch");
    } finally {
      setLoading(false);
    }
  };

  const handleRunNow = async () => {
    setRunning(true);
    setTriggerResult(null);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/admin/auto-fetch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ force: true }),
      });
      const json = await res.json();
      if (res.ok) {
        setTriggerResult(json.result);
        loadStatus();
        if (onRefreshAll) onRefreshAll();
      } else {
        setErrorMsg(json.error || "Failed to trigger auto-fetch");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Execution failed");
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-950/40 via-indigo-950/30 to-slate-900 border border-blue-500/30 text-white space-y-4 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-blue-500/20">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
                <Clock className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>Automated Multi-Source Feed Ingestion</span>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Twice Daily (12h Cadence)
                  </span>
                </h2>
                <p className="text-xs text-slate-300 mt-0.5">
                  Crawls verified government recruitment portals and public career & education feeds automatically every 12 hours.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleRunNow}
            disabled={running}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition-all disabled:opacity-50 shrink-0"
          >
            <RefreshCw className={`w-4 h-4 ${running ? "animate-spin" : ""}`} />
            <span>{running ? "Fetching Across All Sites..." : "⚡ Run Auto-Fetch Now (All Sites)"}</span>
          </button>
        </div>

        {/* Schedule & Timing Matrix */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
              Automated Schedule
            </span>
            <div className="text-sm font-bold text-white">Twice Daily</div>
            <div className="text-[11px] text-blue-400 font-mono mt-0.5">0 6,18 * * * (Every 12h)</div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
              Target Run Windows
            </span>
            <div className="text-sm font-bold text-emerald-400">06:00 & 18:00 UTC</div>
            <div className="text-[11px] text-slate-400 mt-0.5">11:30 AM & 11:30 PM IST</div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
              Monitored Channels
            </span>
            <div className="text-sm font-bold text-white">
              {data?.monitoredSources ? data.monitoredSources.length : 7} Active Sites
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Gov Portals + Education Feed</div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
              Vercel Cron Integration
            </span>
            <div className="text-sm font-bold text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Configured & Active</span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono mt-0.5">/api/cron/auto-fetch</div>
          </div>
        </div>
      </div>

      {/* Real-time Execution Banner */}
      {triggerResult && (
        <div className="p-4 rounded-3xl bg-emerald-950/40 border border-emerald-500/30 text-white space-y-3 shadow-lg">
          <div className="flex items-center justify-between pb-2 border-b border-emerald-500/20">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="font-bold text-xs uppercase tracking-wider text-emerald-300">
                Auto-Fetch Synchronization Succeeded
              </span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
              {(triggerResult.durationMs / 1000).toFixed(2)}s execution
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Total Items Found</span>
              <span className="text-base font-extrabold text-white">{triggerResult.itemsFound}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">New Bulletins</span>
              <span className="text-base font-extrabold text-emerald-400">{triggerResult.newBulletins}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Recruitments Queued</span>
              <span className="text-base font-extrabold text-blue-400">{triggerResult.newRecruitments}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Existing Updated</span>
              <span className="text-base font-extrabold text-amber-400">{triggerResult.updatedCount}</span>
            </div>
          </div>

          {triggerResult.details && triggerResult.details.length > 0 && (
            <div className="space-y-1.5 pt-1">
              {triggerResult.details.map((d: any, idx: number) => (
                <div key={idx} className="text-[11px] text-slate-300 bg-slate-900/50 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
                  <span className="font-semibold text-slate-200">{d.source}</span>
                  <span className="text-slate-400">{d.message}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Monitored Portals Matrix */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-400" />
              <span>Channels & Websites Monitored Twice Daily</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Every 12 hours, the crawler polls RSS XML feeds and direct government boards to synchronize announcements
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30">
            {data?.monitoredSources?.length || 7} Sources Connected
          </span>
        </div>

        <div className="divide-y divide-slate-800/80">
          {(data?.monitoredSources || []).map((src: any, idx: number) => (
            <div key={idx} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-200">{src.name}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    {src.type}
                  </span>
                </div>
                <a
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline flex items-center gap-1 text-[11px]"
                >
                  <span>{src.url}</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>{src.cadence}</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Auto-Fetch Execution Logs */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>Recent Synchronization Execution Logs</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Audit log of scheduled cron triggers and administrative manual crawls
            </p>
          </div>
        </div>

        {(!data?.recentRuns || data.recentRuns.length === 0) ? (
          <div className="text-center py-8 text-xs text-slate-400">
            No execution logs recorded yet. Click &quot;Run Auto-Fetch Now&quot; to test the ingestion pipeline immediately.
          </div>
        ) : (
          <div className="space-y-3">
            {data.recentRuns.map((run: any, idx: number) => (
              <div
                key={run.runId || idx}
                className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-200">{new Date(run.startedAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                      {run.triggerType}
                    </span>
                  </div>

                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      run.status === "SUCCESS"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                        : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                    }`}
                  >
                    {run.status} ({(run.durationMs / 1000).toFixed(2)}s)
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-[11px] pt-1">
                  <div className="text-slate-400">
                    Items Found: <span className="text-white font-bold">{run.itemsFound}</span>
                  </div>
                  <div className="text-slate-400">
                    New Bulletins: <span className="text-emerald-400 font-bold">{run.newBulletins}</span>
                  </div>
                  <div className="text-slate-400">
                    Recruitments Queued: <span className="text-blue-400 font-bold">{run.newRecruitments}</span>
                  </div>
                </div>

                {run.summaryMessage && (
                  <p className="text-[11px] text-slate-400 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80 mt-1">
                    {run.summaryMessage}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
