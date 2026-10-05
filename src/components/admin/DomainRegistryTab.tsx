"use client";

import React, { useState, useEffect } from "react";
import {
  Globe,
  Plus,
  ShieldCheck,
  ShieldAlert,
  Building2,
  RefreshCw,
  Search,
  CheckCircle2,
  XCircle,
  ExternalLink,
} from "lucide-react";

export function DomainRegistryTab() {
  const [domains, setDomains] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  // Form state
  const [orgName, setOrgName] = useState("");
  const [domainStr, setDomainStr] = useState("");
  const [allowedSubdomains, setAllowedSubdomains] = useState("*");
  const [sourceType, setSourceType] = useState("CENTRAL_GOV");
  const [trustStatus, setTrustStatus] = useState("OFFICIAL_GOV");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchDomains();
  }, []);

  const fetchDomains = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/domains");
      if (res.ok) {
        const data = await res.json();
        setDomains(data.domains || []);
      }
    } catch (err) {
      console.error("Failed to load official domains:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgName.trim() || !domainStr.trim()) return;

    setSubmitting(true);
    try {
      const subs = allowedSubdomains
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await fetch("/api/admin/domains", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationName: orgName.trim(),
          domain: domainStr.trim(),
          allowedSubdomains: subs,
          sourceType,
          trustStatus,
          notes,
        }),
      });

      if (res.ok) {
        setShowAddModal(false);
        setOrgName("");
        setDomainStr("");
        setAllowedSubdomains("*");
        setNotes("");
        fetchDomains();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to register domain");
      }
    } catch {
      alert("Error contacting domain registry");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredDomains = domains.filter((d) => {
    if (!search) return true;
    const q = search.toLowerCase();
    const org = (d.orgName || d.organizationName || "").toLowerCase();
    return (
      d.domain.toLowerCase().includes(q) ||
      org.includes(q) ||
      (d.sourceType || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-bold text-white">Official Government Domain Registry</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Whitelist and verify official domains (ssc.gov.in, upsc.gov.in, ibps.in) to prevent phishing, unofficial redirects, and suspicious external URLs.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            Register Domain
          </button>
          <button
            type="button"
            onClick={fetchDomains}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700"
            title="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter domains or organizations (e.g. ssc, ibps, central)..."
          className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Domains Grid */}
      {loading ? (
        <div className="py-16 text-center text-slate-500 text-xs">
          Loading official domain registry...
        </div>
      ) : filteredDomains.length === 0 ? (
        <div className="p-8 text-center text-slate-400 text-xs bg-slate-900 rounded-2xl border border-slate-800">
          No domains matched your search.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDomains.map((d) => (
            <div
              key={d.id}
              className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-blue-400" />
                    {d.orgName || d.organizationName}
                  </h4>
                  <a
                    href={`https://${d.domain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-mono text-blue-400 hover:underline flex items-center gap-1 mt-0.5"
                  >
                    {d.domain}
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>

                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                    d.trustStatus === "VERIFIED_GOV"
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                  }`}
                >
                  {d.trustStatus === "VERIFIED_GOV"
                    ? "Official Gov"
                    : d.trustStatus === "TRUSTED_VENDOR"
                    ? "Trusted Vendor"
                    : d.trustStatus || "Pending"}
                </span>
              </div>

              <div className="space-y-1 text-[11px] text-slate-400 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500">Source Type:</span>
                  <span className="text-slate-300">{d.sourceType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Allowed Subdomains:</span>
                  <span className="text-blue-300">
                    {typeof d.allowedSubdomains === "string"
                      ? d.allowedSubdomains
                      : d.allowedSubdomains?.join(", ") || "*"}
                  </span>
                </div>
              </div>

              {d.notes && (
                <p className="text-[11px] text-slate-500 italic border-t border-slate-800/80 pt-2">
                  {d.notes}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Register Domain Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-400" />
                Register Official Government Domain
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRegisterDomain} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Commission / Organization Name
                </label>
                <input
                  type="text"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder="e.g. Staff Selection Commission"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Domain (e.g. ssc.gov.in)
                </label>
                <input
                  type="text"
                  value={domainStr}
                  onChange={(e) => setDomainStr(e.target.value)}
                  placeholder="ssc.gov.in"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Allowed Subdomains (comma separated, * for wildcard)
                </label>
                <input
                  type="text"
                  value={allowedSubdomains}
                  onChange={(e) => setAllowedSubdomains(e.target.value)}
                  placeholder="*, sscer, sscwr"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">
                    Source Type
                  </label>
                  <select
                    value={sourceType}
                    onChange={(e) => setSourceType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="CENTRAL_GOV">Central Govt</option>
                    <option value="STATE_PSC">State PSC</option>
                    <option value="BANKING_EXAM_AGENCY">Banking Agency</option>
                    <option value="PSU_RECRUITMENT">PSU Recruitment</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">
                    Trust Status
                  </label>
                  <select
                    value={trustStatus}
                    onChange={(e) => setTrustStatus(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="OFFICIAL_GOV">Official Gov</option>
                    <option value="TRUSTED_VENDOR">Trusted Vendor (TCS/iON)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Notes
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Official portal for central recruitment notices..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md transition-colors disabled:opacity-50"
                >
                  {submitting ? "Registering..." : "Add to Registry"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
