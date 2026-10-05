"use client";

import React, { useState, useEffect } from "react";
import {
  Activity,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ExternalLink,
  RefreshCw,
  Search,
  ShieldAlert,
  Send,
  ArrowRight,
  FileText,
  Clock,
} from "lucide-react";

export function UrlHealthTab() {
  const [checks, setChecks] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, healthy: 0, broken: 0, redirects: 0 });
  const [loading, setLoading] = useState(true);
  const [testUrl, setTestUrl] = useState("https://ssc.gov.in/notice-cgl-2026.pdf");
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<any | null>(null);

  useEffect(() => {
    fetchHealthData();
  }, []);

  const fetchHealthData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/url-health");
      if (res.ok) {
        const data = await res.json();
        setChecks(data.checks || []);
        if (data.stats) setStats(data.stats);
      }
    } catch (err) {
      console.error("Failed to load URL health data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRunUrlTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testUrl.trim()) return;

    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/admin/url-health", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: testUrl.trim(),
          urlType: testUrl.toLowerCase().endsWith(".pdf") ? "OFFICIAL_NOTIFICATION" : "OFFICIAL_PORTAL",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setTestResult(data);
        fetchHealthData();
      } else {
        alert("Failed to execute URL health check");
      }
    } catch {
      alert("Error contacting URL health check service");
    } finally {
      setTesting(false);
    }
  };

  const getStatusBadge = (check: any) => {
    if (!check.isReachable) {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30 flex items-center gap-1">
          <XCircle className="w-3 h-3" />
          Unreachable
        </span>
      );
    }
    if (check.isRedirect) {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          {check.httpStatus} Redirect
        </span>
      );
    }
    if (check.httpStatus === 200) {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" />
          200 OK
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
        HTTP {check.httpStatus || "N/A"}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 block mb-1">Total Checked</span>
          <span className="text-2xl font-black text-white">{stats.total}</span>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 block mb-1">Healthy Portals</span>
          <span className="text-2xl font-black text-emerald-400">{stats.healthy}</span>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 block mb-1">Broken / Error</span>
          <span className="text-2xl font-black text-rose-400">{stats.broken}</span>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 block mb-1">Redirects Detected</span>
          <span className="text-2xl font-black text-amber-400">{stats.redirects}</span>
        </div>
      </div>

      {/* Manual URL Health Check Tool */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-400" />
            Validate Official Portal / Notification URL
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Tests connectivity, HTTP status code, PDF MIME accessibility, latency, and checks domain trust in the official registry.
          </p>
        </div>

        <form onSubmit={handleRunUrlTest} className="flex gap-2">
          <input
            type="url"
            value={testUrl}
            onChange={(e) => setTestUrl(e.target.value)}
            placeholder="https://ssc.gov.in/notice.pdf"
            className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
            required
          />
          <button
            type="submit"
            disabled={testing}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${testing ? "animate-spin" : ""}`} />
            {testing ? "Testing..." : "Test Health"}
          </button>
        </form>

        {/* Live Test Results Card */}
        {testResult && (
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white">Health Test Outcome</span>
              {testResult.check && getStatusBadge(testResult.check)}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-[11px]">
              <div>
                <span className="text-slate-500 block">HTTP Code:</span>
                <span className="text-slate-200">{testResult.check.httpStatus || "N/A"}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Latency:</span>
                <span className="text-blue-400">{testResult.check.latencyMs}ms</span>
              </div>
              <div>
                <span className="text-slate-500 block">PDF Accessible:</span>
                <span className={testResult.check.isPdfAccessible ? "text-emerald-400" : "text-slate-400"}>
                  {testResult.check.isPdfAccessible ? "✓ Verified PDF" : "No / HTML"}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Domain Trust:</span>
                <span
                  className={
                    testResult.domainCheck?.isVerified
                      ? "text-emerald-400"
                      : "text-amber-400"
                  }
                >
                  {testResult.domainCheck?.isVerified ? "✓ Verified Gov" : "Pending Registry"}
                </span>
              </div>
            </div>

            {testResult.check.redirectLocation && (
              <p className="text-[11px] text-amber-300 font-mono pt-1">
                Redirect Location: {testResult.check.redirectLocation}
              </p>
            )}

            {testResult.check.errorDetails && (
              <p className="text-[11px] text-rose-400 pt-1">
                Notice: {testResult.check.errorDetails}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Health Check History Table */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">Recent Health Inspections</h3>
          <button
            type="button"
            onClick={fetchHealthData}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
            title="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-500 text-xs">
            Loading URL health checks...
          </div>
        ) : checks.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-xs">
            No health checks recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/60 text-slate-400 text-[10px] uppercase font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">URL & Type</th>
                  <th className="py-2.5 px-3">Latency</th>
                  <th className="py-2.5 px-3">PDF</th>
                  <th className="py-2.5 px-3">Inspected At</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {checks.map((chk) => (
                  <tr key={chk.id} className="hover:bg-slate-800/40">
                    <td className="py-3 px-3">{getStatusBadge(chk)}</td>
                    <td className="py-3 px-3 max-w-xs truncate">
                      <span className="font-mono text-white block truncate">{chk.url}</span>
                      <span className="text-[10px] text-slate-500">{chk.urlType}</span>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-400">{chk.latencyMs}ms</td>
                    <td className="py-3 px-3">
                      {chk.isPdfAccessible ? (
                        <span className="text-[10px] font-mono text-emerald-400">PDF</span>
                      ) : (
                        <span className="text-[10px] font-mono text-slate-600">-</span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-400">
                      {new Date(chk.checkedAt).toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <a
                        href={chk.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 hover:text-blue-400 inline-block text-slate-400"
                        title="Open URL"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
