"use client";

import React, { useState, useEffect } from "react";
import {
  Shield,
  Search,
  Lock,
  Clock,
  User,
  Filter,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  FileCheck2,
  AlertCircle,
} from "lucide-react";

export function AuditLogsTab() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("ALL");
  const [entityFilter, setEntityFilter] = useState("ALL");
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  useEffect(() => {
    fetchLogs();
  }, [actionFilter, entityFilter]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (actionFilter !== "ALL") params.set("action", actionFilter);
      if (entityFilter !== "ALL") params.set("entityType", entityFilter);
      if (search) params.set("search", search);

      const res = await fetch(`/api/admin/audit-logs?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
      }
    } catch (err) {
      console.error("Failed to load audit logs:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLogs();
  };

  const formatJsonPreview = (val: string | null) => {
    if (!val) return "<None>";
    try {
      const parsed = JSON.parse(val);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return val;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Search Bar */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-bold text-white">Immutable Administrative Audit Log</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Tamper-evident, permanent audit trail recording all administrative changes, approvals, justifications, and entity state transitions.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Shield className="w-3.5 h-3.5" />
              Append-Only Protection Active
            </span>
          </div>
        </div>

        {/* Search & Filter Controls */}
        <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by justification, admin email, action..."
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Actions</option>
            <option value="REVIEW_ITEM_APPROVED">Approved Field</option>
            <option value="REVIEW_ITEM_REJECTED">Rejected Field</option>
            <option value="REGISTER_OFFICIAL_DOMAIN">Registered Domain</option>
            <option value="UPDATE_OFFICIAL_DOMAIN">Updated Domain</option>
            <option value="CORRIGENDUM_BROADCAST">Corrigendum Broadcast</option>
          </select>

          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Entity Types</option>
            <option value="ReviewQueueItem">ReviewQueueItem</option>
            <option value="Recruitment">Recruitment</option>
            <option value="OfficialDomain">OfficialDomain</option>
            <option value="InformationConflict">InformationConflict</option>
          </select>

          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
          >
            Filter Logs
          </button>

          <button
            type="button"
            onClick={fetchLogs}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-colors"
            title="Refresh Logs"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </form>
      </div>

      {/* Logs Table / List */}
      {loading ? (
        <div className="py-16 text-center text-slate-500 text-xs flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
          Loading immutable audit records...
        </div>
      ) : logs.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/60 border border-slate-800 text-slate-400 space-y-2">
          <FileCheck2 className="w-10 h-10 text-slate-500 mx-auto" />
          <h3 className="text-sm font-semibold text-white">No Audit Records Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No administrative modifications match your search and filter criteria.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => {
            const isExpanded = expandedLogId === log.id;
            return (
              <div
                key={log.id}
                className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden transition-all"
              >
                {/* Summary Row */}
                <div
                  onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                  className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 cursor-pointer hover:bg-slate-800/40"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        {log.action}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                        {log.entityType} ({log.entityId?.substring(0, 8)}...)
                      </span>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <User className="w-3 h-3 text-slate-500" />
                        {log.adminEmail}
                      </span>
                    </div>

                    <p className="text-xs text-slate-200 font-medium">
                      Justification: &ldquo;{log.reason || log.justification || "Recorded by Admin"}&rdquo;
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-end md:self-center text-xs text-slate-400">
                    <span className="flex items-center gap-1 font-mono text-[11px]">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {new Date(log.timestamp).toLocaleString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </div>

                {/* Expanded Diff Viewer */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-2 border-t border-slate-800/80 bg-slate-950/60 space-y-3">
                    <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider block">
                      State Transition (Previous vs New)
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                        <span className="text-[10px] font-bold text-rose-400 uppercase block mb-1">
                          Previous State
                        </span>
                        <pre className="text-slate-300 text-[11px] overflow-x-auto whitespace-pre-wrap">
                          {formatJsonPreview(log.previousValue)}
                        </pre>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                        <span className="text-[10px] font-bold text-emerald-400 uppercase block mb-1">
                          Committed New State
                        </span>
                        <pre className="text-emerald-200 text-[11px] overflow-x-auto whitespace-pre-wrap">
                          {formatJsonPreview(log.newValue)}
                        </pre>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                      <span>Log UUID: {log.id}</span>
                      {log.ipAddress && <span>Client IP: {log.ipAddress}</span>}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
