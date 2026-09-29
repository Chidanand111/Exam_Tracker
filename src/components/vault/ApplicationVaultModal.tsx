"use client";

import React, { useState, useEffect } from "react";
import {
  Lock,
  Copy,
  Check,
  FileText,
  Calendar,
  CreditCard,
  Hash,
  User,
  AlertTriangle,
  X,
  ExternalLink,
  Save,
  ShieldAlert,
  Info,
} from "lucide-react";

interface ApplicationVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  recruitmentId: string;
  recruitmentTitle: string;
  organizationName?: string;
  officialApplyUrl?: string | null;
}

export function ApplicationVaultModal({
  isOpen,
  onClose,
  recruitmentId,
  recruitmentTitle,
  organizationName,
  officialApplyUrl,
}: ApplicationVaultModalProps) {
  const [formData, setFormData] = useState({
    applicationNumber: "",
    registrationNumber: "",
    rollNumber: "",
    portalUserId: "",
    paymentReference: "",
    transactionId: "",
    submissionDate: "",
    applicationPdfUrl: "",
    paymentReceiptUrl: "",
    personalNotes: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (isOpen && recruitmentId) {
      fetchVaultRecord();
    }
  }, [isOpen, recruitmentId]);

  const fetchVaultRecord = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/vault?recruitmentId=${recruitmentId}`);
      const data = await res.json();
      if (data.success && data.vaultRecord) {
        const v = data.vaultRecord;
        setFormData({
          applicationNumber: v.applicationNumber || "",
          registrationNumber: v.registrationNumber || "",
          rollNumber: v.rollNumber || "",
          portalUserId: v.portalUserId || "",
          paymentReference: v.paymentReference || "",
          transactionId: v.transactionId || "",
          submissionDate: v.submissionDate ? v.submissionDate.split("T")[0] : "",
          applicationPdfUrl: v.applicationPdfUrl || "",
          paymentReceiptUrl: v.paymentReceiptUrl || "",
          personalNotes: v.personalNotes || "",
        });
      } else {
        // Reset if no record
        setFormData({
          applicationNumber: "",
          registrationNumber: "",
          rollNumber: "",
          portalUserId: "",
          paymentReference: "",
          transactionId: "",
          submissionDate: new Date().toISOString().split("T")[0],
          applicationPdfUrl: "",
          paymentReceiptUrl: "",
          personalNotes: "",
        });
      }
    } catch (e) {
      console.error("Failed to load vault record", e);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (key: string, value: string) => {
    if (!value) return;
    navigator.clipboard.writeText(value);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    try {
      const res = await fetch("/api/vault", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recruitmentId,
          ...formData,
        }),
      });

      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Failed to save vault record", err);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[92vh] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-amber-950/20 to-slate-900 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Lock className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Application Reference & Receipt Vault
              </h2>
            </div>
            <p className="text-sm font-medium text-slate-300">
              {recruitmentTitle}
            </p>
            {organizationName && (
              <p className="text-xs text-slate-400">{organizationName}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mandatory Non-Official Verification Disclaimer Banner */}
        <div className="px-5 py-3 bg-amber-950/30 border-b border-amber-500/20 flex items-start gap-2.5 text-xs text-amber-200">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold text-amber-300">Self-Reported Reference: </span>
            These values and receipts are stored privately for your personal records and convenience.{" "}
            <span className="underline decoration-amber-500/40">
              They are NOT verified against official government commission servers.
            </span>{" "}
            Always retain your authentic printouts and bank receipts.
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-3">
              <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm">Accessing encrypted local vault record...</p>
            </div>
          ) : (
            <>
              {/* Section 1: Identification Numbers */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5 text-blue-400" />
                  Official Registration Identifiers
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Application Number */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Application Sequence Number
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type="text"
                        placeholder="e.g. 202611098234"
                        value={formData.applicationNumber}
                        onChange={(e) =>
                          setFormData({ ...formData, applicationNumber: e.target.value })
                        }
                        className="w-full pl-3 pr-9 py-2 text-sm rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono"
                      />
                      {formData.applicationNumber && (
                        <button
                          type="button"
                          onClick={() => handleCopy("appNum", formData.applicationNumber)}
                          className="absolute right-2 text-slate-400 hover:text-white p-1 rounded hover:bg-slate-700"
                          title="Copy Application Number"
                        >
                          {copiedKey === "appNum" ? (
                            <Check className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Registration Number */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Registration / User ID
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type="text"
                        placeholder="e.g. REG-88401928"
                        value={formData.registrationNumber}
                        onChange={(e) =>
                          setFormData({ ...formData, registrationNumber: e.target.value })
                        }
                        className="w-full pl-3 pr-9 py-2 text-sm rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono"
                      />
                      {formData.registrationNumber && (
                        <button
                          type="button"
                          onClick={() => handleCopy("regNum", formData.registrationNumber)}
                          className="absolute right-2 text-slate-400 hover:text-white p-1 rounded hover:bg-slate-700"
                          title="Copy Registration Number"
                        >
                          {copiedKey === "regNum" ? (
                            <Check className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Roll Number */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Roll Number (Once Admit Card is released)
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type="text"
                        placeholder="e.g. 2404001924"
                        value={formData.rollNumber}
                        onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                        className="w-full pl-3 pr-9 py-2 text-sm rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono"
                      />
                      {formData.rollNumber && (
                        <button
                          type="button"
                          onClick={() => handleCopy("rollNum", formData.rollNumber)}
                          className="absolute right-2 text-slate-400 hover:text-white p-1 rounded hover:bg-slate-700"
                          title="Copy Roll Number"
                        >
                          {copiedKey === "rollNum" ? (
                            <Check className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Official Portal User ID */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Portal Login User ID
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type="text"
                        placeholder="e.g. candidate_chida_01"
                        value={formData.portalUserId}
                        onChange={(e) => setFormData({ ...formData, portalUserId: e.target.value })}
                        className="w-full pl-3 pr-9 py-2 text-sm rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                      />
                      {formData.portalUserId && (
                        <button
                          type="button"
                          onClick={() => handleCopy("portalId", formData.portalUserId)}
                          className="absolute right-2 text-slate-400 hover:text-white p-1 rounded hover:bg-slate-700"
                          title="Copy Portal User ID"
                        >
                          {copiedKey === "portalId" ? (
                            <Check className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Fee & Payment Reference */}
              <div className="pt-2 border-t border-slate-800">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                  Fee Payment & Submission Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  {/* Payment Reference */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Payment Reference / Challan No.
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. SBI-CH-992144"
                      value={formData.paymentReference}
                      onChange={(e) =>
                        setFormData({ ...formData, paymentReference: e.target.value })
                      }
                      className="w-full px-3 py-2 text-sm rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>

                  {/* Transaction ID */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Bank Transaction ID
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. TXN994018290"
                      value={formData.transactionId}
                      onChange={(e) => setFormData({ ...formData, transactionId: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>

                  {/* Submission Date */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Submission Date
                    </label>
                    <input
                      type="date"
                      value={formData.submissionDate}
                      onChange={(e) => setFormData({ ...formData, submissionDate: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Document Links & Notes */}
              <div className="pt-2 border-t border-slate-800 space-y-3.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-purple-400" />
                  Document Reference & Personal Notes
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Submitted Application Form URL/Path */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Submitted Application PDF Link / File Reference
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Google Drive link or file:///C:/docs/ssc_cgl_app.pdf"
                      value={formData.applicationPdfUrl}
                      onChange={(e) =>
                        setFormData({ ...formData, applicationPdfUrl: e.target.value })
                      }
                      className="w-full px-3 py-2 text-xs rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>

                  {/* Payment Receipt Link/Path */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Payment Receipt Link / File Reference
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Google Drive link or file:///C:/docs/receipt.pdf"
                      value={formData.paymentReceiptUrl}
                      onChange={(e) =>
                        setFormData({ ...formData, paymentReceiptUrl: e.target.value })
                      }
                      className="w-full px-3 py-2 text-xs rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>
                </div>

                {/* Personal Notes */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Personal Notes (Security questions, selected center, post preferences)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Preferred exam city: Bengaluru (Zone 1). Security question answer recorded in password manager."
                    value={formData.personalNotes}
                    onChange={(e) => setFormData({ ...formData, personalNotes: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {officialApplyUrl && (
                <a
                  href={officialApplyUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
                >
                  <span>Commission Portal</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
              {saveSuccess && (
                <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1 animate-in fade-in">
                  <Check className="w-4 h-4" />
                  Credentials saved to Vault!
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              >
                Close
              </button>

              <button
                type="submit"
                disabled={saving || loading}
                className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 disabled:opacity-50 transition-colors shadow-lg shadow-amber-500/10"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? "Encrypting & Saving..." : "Save to Vault"}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
