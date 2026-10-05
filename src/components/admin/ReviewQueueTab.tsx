"use client";

import React, { useState, useEffect } from "react";
import {
  ListChecks,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  Building2,
  ArrowRight,
  Filter,
  RefreshCw,
  Search,
  ShieldAlert,
  Sparkles,
} from "lucide-react";

export function ReviewQueueTab() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("PENDING");
  const [severityFilter, setSeverityFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [actionType, setActionType] = useState<"APPROVED" | "REJECTED">("APPROVED");
  const [overrideValue, setOverrideValue] = useState("");
  const [justification, setJustification] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchReviewQueue();
  }, [statusFilter, severityFilter, typeFilter]);

  const fetchReviewQueue = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      if (severityFilter !== "ALL") params.set("severity", severityFilter);
      if (typeFilter !== "ALL") params.set("itemType", typeFilter);

      const res = await fetch(`/api/admin/review-queue?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
      }
    } catch (err) {
      console.error("Failed to fetch review queue:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenActionModal = (item: any, action: "APPROVED" | "REJECTED") => {
    setSelectedItem(item);
    setActionType(action);
    setOverrideValue(item.proposedValue || item.currentValue || "");
    setJustification(
      action === "APPROVED"
        ? `Verified against official notification: ${item.sourceDocument || "Source PDF"} (Page ${item.pageNumber || "N/A"})`
        : "Rejected: Inconsistent with official commission notification guidelines."
    );
  };

  const handleExecuteReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    if (!justification.trim() || justification.trim().length < 5) {
      alert("Please provide a thorough justification for this administrative decision.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/review-queue/${selectedItem.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: actionType,
          resolutionNotes: justification,
          overrideValue: actionType === "APPROVED" ? overrideValue : undefined,
        }),
      });

      if (res.ok) {
        setSelectedItem(null);
        fetchReviewQueue();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to process review action");
      }
    } catch {
      alert("Error submitting review decision");
    } finally {
      setSubmitting(false);
    }
  };

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case "CRITICAL":
        return "bg-rose-500/10 text-rose-400 border-rose-500/30";
      case "HIGH":
        return "bg-amber-500/10 text-amber-400 border-amber-500/30";
      case "MEDIUM":
        return "bg-blue-500/10 text-blue-400 border-blue-500/30";
      default:
        return "bg-slate-800 text-slate-400 border-slate-700";
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Controls & Metrics */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <ListChecks className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white">Granular Human Review Queue</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Validate low-confidence AI extractions, broken official URLs, ambiguous eligibility, and conflicting deadlines field-by-field.
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="PENDING">Status: Pending ({items.filter(i => i.status === "PENDING").length})</option>
            <option value="APPROVED">Status: Approved</option>
            <option value="REJECTED">Status: Rejected</option>
            <option value="ALL">Status: All</option>
          </select>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Issue Types</option>
            <option value="LOW_CONFIDENCE_FIELD">Low Confidence</option>
            <option value="CONFLICTING_DATES">Conflicting Dates</option>
            <option value="BROKEN_OFFICIAL_URL">Broken Official URL</option>
            <option value="AMBIGUOUS_ELIGIBILITY">Ambiguous Eligibility</option>
            <option value="SUSPECTED_DUPLICATE">Suspected Duplicate</option>
          </select>

          <button
            type="button"
            onClick={fetchReviewQueue}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-colors"
            title="Refresh Queue"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Queue Items List */}
      {loading ? (
        <div className="py-16 text-center text-slate-500 text-xs flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />
          Loading review queue items...
        </div>
      ) : items.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/60 border border-slate-800 text-slate-400 space-y-2">
          <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto opacity-70" />
          <h3 className="text-sm font-semibold text-white">Review Queue is Clear!</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No uncertain data items match your selected filters. Extracted recruitment fields and official URLs are currently verified.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4"
            >
              {/* Item Details */}
              <div className="space-y-2 min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getSeverityBadge(
                      item.severity
                    )}`}
                  >
                    {item.severity}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    {item.itemType}
                  </span>
                  <span className="text-xs font-semibold text-white">
                    {item.fieldLabel || item.fieldName}
                  </span>
                  {item.recruitment && (
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Building2 className="w-3 h-3 text-blue-400" />
                      {item.recruitment.organization?.shortName || item.recruitment.title}
                    </span>
                  )}
                </div>

                {/* Diff Comparison */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80">
                    <span className="text-[10px] uppercase font-semibold text-slate-500 block mb-0.5">
                      Current Value / In Database
                    </span>
                    <p className="text-slate-300 font-mono break-all line-clamp-2">
                      {item.currentValue || "<Empty / Not Specified>"}
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-indigo-950/20 border border-indigo-500/20">
                    <span className="text-[10px] uppercase font-semibold text-indigo-400 block mb-0.5">
                      Proposed / Extracted Value
                    </span>
                    <p className="text-indigo-200 font-mono break-all line-clamp-2">
                      {item.proposedValue || "<None>"}
                    </p>
                  </div>
                </div>

                {/* Source citation hint */}
                {(item.sourceDocument || item.pageNumber || item.notes) && (
                  <div className="flex items-center gap-3 text-[11px] text-slate-400 flex-wrap">
                    {item.sourceDocument && (
                      <span className="flex items-center gap-1 text-slate-300">
                        <FileText className="w-3 h-3 text-blue-400" />
                        {item.sourceDocument}
                      </span>
                    )}
                    {item.pageNumber && (
                      <span className="font-mono text-blue-400">
                        Page {item.pageNumber}
                      </span>
                    )}
                    {item.notes && (
                      <span className="text-slate-400 italic">
                        Note: {item.notes}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-end lg:self-center shrink-0">
                {item.status === "PENDING" ? (
                  <>
                    <button
                      type="button"
                      onClick={() => handleOpenActionModal(item, "APPROVED")}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Approve Field
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenActionModal(item, "REJECTED")}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-300 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Reject
                    </button>
                  </>
                ) : (
                  <span
                    className={`px-3 py-1 rounded-xl text-xs font-semibold border ${
                      item.status === "APPROVED"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                    }`}
                  >
                    {item.status} ({item.reviewerEmail?.split("@")[0] || "Admin"})
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Field Review & Audit Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                {actionType === "APPROVED" ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-400" />
                )}
                {actionType === "APPROVED" ? "Approve Extracted Field" : "Reject Extracted Field"}
              </h3>
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleExecuteReview} className="space-y-4">
              <div>
                <span className="text-xs font-medium text-slate-400 block mb-1">
                  Target Field: <strong className="text-white">{selectedItem.fieldLabel || selectedItem.fieldName}</strong>
                </span>
                <span className="text-xs text-slate-500 block">
                  Recruitment: {selectedItem.recruitment?.title || "N/A"}
                </span>
              </div>

              {actionType === "APPROVED" && (
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">
                    Approved Field Value (Editable before commit)
                  </label>
                  <input
                    type="text"
                    value={overrideValue}
                    onChange={(e) => setOverrideValue(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">
                  Mandatory Administrative Justification (Logged to Immutable Audit)
                </label>
                <textarea
                  rows={3}
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                  placeholder="Enter reason or reference clause justifying this approval/rejection..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`px-4 py-2 rounded-xl text-xs font-bold text-white shadow-md transition-colors ${
                    actionType === "APPROVED"
                      ? "bg-emerald-600 hover:bg-emerald-500"
                      : "bg-rose-600 hover:bg-rose-500"
                  } disabled:opacity-50`}
                >
                  {submitting ? "Recording Audit..." : `Confirm ${actionType}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
