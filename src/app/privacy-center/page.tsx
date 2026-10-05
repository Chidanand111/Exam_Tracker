"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Shield,
  Download,
  Trash2,
  FileSpreadsheet,
  FileCode,
  FileText,
  AlertTriangle,
  Lock,
  EyeOff,
  Bell,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  Printer,
  Smartphone,
  Send,
  BarChart2,
} from "lucide-react";

interface AccountSummary {
  userId: string;
  email: string;
  name: string;
  trackedApplications: number;
  vaultDocumentCredentials: number;
  privateNotes: number;
  customChecklists: number;
  shortlistedOpportunities: number;
  hasProfile: boolean;
}

interface PrivacySettings {
  profileVisibility: string;
  storeDocumentsInVault: boolean;
  allowPersonalizedDiscovery: boolean;
  emailNotifications: boolean;
  inAppNotifications: boolean;
  smsAlerts: boolean;
  telegramAlerts: boolean;
  analyticsParticipation: boolean;
  communicationPreference: string;
}

export default function PrivacyCenterPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"privacy" | "export" | "delete">("privacy");
  const [loading, setLoading] = useState(true);
  const [accountSummary, setAccountSummary] = useState<AccountSummary | null>(null);
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    profileVisibility: "PRIVATE",
    storeDocumentsInVault: true,
    allowPersonalizedDiscovery: true,
    emailNotifications: false,
    inAppNotifications: true,
    smsAlerts: false,
    telegramAlerts: false,
    analyticsParticipation: false,
    communicationPreference: "IN_APP_ONLY",
  });
  const [savingPrivacy, setSavingPrivacy] = useState(false);
  const [privacySuccess, setPrivacySuccess] = useState(false);
  const [exportLoading, setExportLoading] = useState<string | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleteReason, setDeleteReason] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [printData, setPrintData] = useState<any | null>(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [accRes, privRes] = await Promise.all([
        fetch("/api/user/account"),
        fetch("/api/user/privacy"),
      ]);

      if (accRes.status === 401 || privRes.status === 401) {
        router.push("/login?redirect=/privacy-center");
        return;
      }

      if (accRes.ok) {
        const accData = await accRes.json();
        setAccountSummary(accData.accountSummary);
      }

      if (privRes.ok) {
        const privData = await privRes.json();
        setPrivacySettings(privData.privacySettings);
      }
    } catch (err) {
      console.error("Failed to load privacy center data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePrivacy = async () => {
    setSavingPrivacy(true);
    setPrivacySuccess(false);
    try {
      const res = await fetch("/api/user/privacy", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(privacySettings),
      });

      if (res.ok) {
        setPrivacySuccess(true);
        setTimeout(() => setPrivacySuccess(false), 4000);
      }
    } catch (err) {
      console.error("Failed to save privacy settings:", err);
    } finally {
      setSavingPrivacy(false);
    }
  };

  const handleExportData = async (format: "csv" | "json" | "pdf") => {
    setExportLoading(format);
    try {
      if (format === "csv" || format === "json") {
        window.location.href = `/api/user/export?format=${format}`;
      } else {
        // PDF Summary mode
        const res = await fetch("/api/user/export?format=pdf");
        if (res.ok) {
          const data = await res.json();
          setPrintData(data.exportData);
          setTimeout(() => {
            window.print();
          }, 500);
        }
      }
    } catch (err) {
      console.error("Export error:", err);
    } finally {
      setExportLoading(null);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE MY ACCOUNT PERMANENTLY") {
      setDeleteError("Please type the exact confirmation phrase to proceed.");
      return;
    }

    setIsDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch("/api/user/account", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: deleteReason }),
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to delete account");
      }

      alert("Your account and all associated personal data have been permanently removed.");
      window.location.href = "/";
    } catch (err: any) {
      setDeleteError(err.message || "Failed to complete account deletion.");
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="h-10 w-64 bg-slate-800 rounded-xl animate-pulse" />
          <div className="h-64 bg-slate-900 border border-slate-800 rounded-2xl animate-pulse" />
        </div>
      </main>
    );
  }

  return (
    <main id="main-content" className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 mb-1">
              <Shield className="w-4 h-4" />
              <span>Data Rights & Sovereignty</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Privacy Center & Data Portability
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
              Control your personal recruitment tracking privacy, export your application dossiers, or permanently purge your account data.
            </p>
          </div>

          <div className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2 text-xs text-slate-300">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Privacy By Default Active</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 gap-2">
          <button
            onClick={() => setActiveTab("privacy")}
            className={`px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === "privacy"
                ? "border-emerald-500 text-emerald-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Lock className="w-4 h-4" />
            Privacy Controls
          </button>
          <button
            onClick={() => setActiveTab("export")}
            className={`px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === "export"
                ? "border-emerald-500 text-emerald-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Download className="w-4 h-4" />
            Data Export (CSV / JSON / PDF)
          </button>
          <button
            onClick={() => setActiveTab("delete")}
            className={`px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === "delete"
                ? "border-red-500 text-red-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Trash2 className="w-4 h-4" />
            Account Deletion & Purge
          </button>
        </div>

        {/* Tab 1: Privacy Controls */}
        {activeTab === "privacy" && (
          <div className="space-y-6">
            {privacySuccess && (
              <div className="p-4 bg-emerald-950/40 border border-emerald-500/40 rounded-xl flex items-center gap-3 text-xs text-emerald-300">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>Your privacy preferences have been updated and saved successfully.</span>
              </div>
            )}

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <EyeOff className="w-4 h-4 text-emerald-400" />
                  Candidate Profile Visibility
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Controls how your qualification and background details are accessed for eligibility assessments.
                </p>
                <div className="mt-3 grid sm:grid-cols-2 gap-3">
                  <label
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                      privacySettings.profileVisibility === "PRIVATE"
                        ? "bg-emerald-950/20 border-emerald-500/50"
                        : "bg-slate-800/40 border-slate-700/60 hover:border-slate-600"
                    }`}
                  >
                    <input
                      type="radio"
                      name="profileVisibility"
                      checked={privacySettings.profileVisibility === "PRIVATE"}
                      onChange={() =>
                        setPrivacySettings({ ...privacySettings, profileVisibility: "PRIVATE" })
                      }
                      className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                    />
                    <div>
                      <span className="text-xs font-bold text-white block">Strictly Private (Recommended)</span>
                      <span className="text-[11px] text-slate-400">
                        Profile details are visible only to you. Eligibility calculations run client-side or in your private session.
                      </span>
                    </div>
                  </label>

                  <label
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                      privacySettings.profileVisibility === "ANONYMOUS_MATCH"
                        ? "bg-emerald-950/20 border-emerald-500/50"
                        : "bg-slate-800/40 border-slate-700/60 hover:border-slate-600"
                    }`}
                  >
                    <input
                      type="radio"
                      name="profileVisibility"
                      checked={privacySettings.profileVisibility === "ANONYMOUS_MATCH"}
                      onChange={() =>
                        setPrivacySettings({
                          ...privacySettings,
                          profileVisibility: "ANONYMOUS_MATCH",
                        })
                      }
                      className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                    />
                    <div>
                      <span className="text-xs font-bold text-white block">Anonymized Match Matching</span>
                      <span className="text-[11px] text-slate-400">
                        Allows anonymous matching of state and degrees for new vacancy alerts without storing personal identifiers.
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Granular Preferences */}
              <div className="pt-4 border-t border-slate-800 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Granular Permissions & Data Retention
                </h3>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-slate-800/40 rounded-xl border border-slate-800">
                    <div>
                      <span className="text-xs font-bold text-white block">Document & Vault Reference Storage</span>
                      <span className="text-[11px] text-slate-400">
                        Securely store application numbers, registration keys, and payment IDs in your private vault.
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={privacySettings.storeDocumentsInVault}
                      onChange={(e) =>
                        setPrivacySettings({
                          ...privacySettings,
                          storeDocumentsInVault: e.target.checked,
                        })
                      }
                      className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-emerald-600 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-800/40 rounded-xl border border-slate-800">
                    <div>
                      <span className="text-xs font-bold text-white block">Personalized Opportunity Discovery</span>
                      <span className="text-[11px] text-slate-400">
                        Filter and tailor recommendations according to your degree and age preferences.
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={privacySettings.allowPersonalizedDiscovery}
                      onChange={(e) =>
                        setPrivacySettings({
                          ...privacySettings,
                          allowPersonalizedDiscovery: e.target.checked,
                        })
                      }
                      className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-emerald-600 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-800/40 rounded-xl border border-slate-800">
                    <div>
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <BarChart2 className="w-3.5 h-3.5 text-slate-400" />
                        Anonymous Analytics Participation
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Share aggregated usage patterns to help improve platform accessibility (strictly opt-in; disabled by default).
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={privacySettings.analyticsParticipation}
                      onChange={(e) =>
                        setPrivacySettings({
                          ...privacySettings,
                          analyticsParticipation: e.target.checked,
                        })
                      }
                      className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-emerald-600 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Notification & Communication Preferences */}
              <div className="pt-4 border-t border-slate-800 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5" /> Communication Preferences
                </h3>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="flex items-center justify-between p-3 bg-slate-800/40 rounded-xl border border-slate-800">
                    <div>
                      <span className="text-xs font-bold text-white block">In-App Alerts</span>
                      <span className="text-[11px] text-slate-400">Dashboard admit card and deadline updates.</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={privacySettings.inAppNotifications}
                      onChange={(e) =>
                        setPrivacySettings({
                          ...privacySettings,
                          inAppNotifications: e.target.checked,
                        })
                      }
                      className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-emerald-600 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-800/40 rounded-xl border border-slate-800">
                    <div>
                      <span className="text-xs font-bold text-white block">Email Notifications</span>
                      <span className="text-[11px] text-slate-400">Important shift reminders via email (Opt-in).</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={privacySettings.emailNotifications}
                      onChange={(e) =>
                        setPrivacySettings({
                          ...privacySettings,
                          emailNotifications: e.target.checked,
                        })
                      }
                      className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-emerald-600 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  onClick={handleSavePrivacy}
                  disabled={savingPrivacy}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-50"
                >
                  {savingPrivacy ? "Saving Changes..." : "Save Privacy Preferences"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Data Portability & Export */}
        {activeTab === "export" && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Download className="w-4 h-4 text-emerald-400" />
                  Export Your Personal Tracking Dossier
                </h2>
                <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                  Download an official copy of your personal recruitment timeline, including applied posts, reference numbers, assigned exam shifts, center locations, preparation checklists, and private notes.
                </p>
              </div>

              {/* Account Data Overview */}
              {accountSummary && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-800/40 rounded-xl border border-slate-800 text-center">
                  <div>
                    <span className="text-xl font-extrabold text-white">
                      {accountSummary.trackedApplications}
                    </span>
                    <span className="text-[11px] text-slate-400 block mt-0.5">Applications</span>
                  </div>
                  <div>
                    <span className="text-xl font-extrabold text-white">
                      {accountSummary.vaultDocumentCredentials}
                    </span>
                    <span className="text-[11px] text-slate-400 block mt-0.5">Vault Records</span>
                  </div>
                  <div>
                    <span className="text-xl font-extrabold text-white">
                      {accountSummary.privateNotes}
                    </span>
                    <span className="text-[11px] text-slate-400 block mt-0.5">Private Notes</span>
                  </div>
                  <div>
                    <span className="text-xl font-extrabold text-white">
                      {accountSummary.customChecklists}
                    </span>
                    <span className="text-[11px] text-slate-400 block mt-0.5">Checklist Tasks</span>
                  </div>
                </div>
              )}

              {/* Export Formats */}
              <div className="grid sm:grid-cols-3 gap-4 pt-2">
                {/* CSV */}
                <div className="p-5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
                      <FileSpreadsheet className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-bold text-white">Spreadsheet (CSV)</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Tabular format ideal for Excel, Google Sheets, or custom application tracking spreadsheets.
                    </p>
                  </div>
                  <button
                    onClick={() => handleExportData("csv")}
                    disabled={exportLoading === "csv"}
                    className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-md"
                  >
                    <Download className="w-3.5 h-3.5" />
                    {exportLoading === "csv" ? "Preparing CSV..." : "Download CSV"}
                  </button>
                </div>

                {/* JSON */}
                <div className="p-5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-3">
                      <FileCode className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-bold text-white">Structured (JSON)</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Complete machine-readable portable JSON archive of all your tracking data, progress, and settings.
                    </p>
                  </div>
                  <button
                    onClick={() => handleExportData("json")}
                    disabled={exportLoading === "json"}
                    className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-md"
                  >
                    <Download className="w-3.5 h-3.5" />
                    {exportLoading === "json" ? "Preparing JSON..." : "Download JSON"}
                  </button>
                </div>

                {/* PDF Summary */}
                <div className="p-5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-3">
                      <Printer className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-bold text-white">Printable Summary</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      A clean printable document summary formatted for saving to PDF or physical examination filing.
                    </p>
                  </div>
                  <button
                    onClick={() => handleExportData("pdf")}
                    disabled={exportLoading === "pdf"}
                    className="w-full py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-md"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    {exportLoading === "pdf" ? "Formatting..." : "Print / Save PDF"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Account Deletion */}
        {activeTab === "delete" && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-red-500/30 rounded-2xl p-6 space-y-6 shadow-xl">
              <div>
                <h2 className="text-base font-bold text-red-400 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  Irreversible Account Deletion & Data Purge
                </h2>
                <p className="text-xs text-slate-300 mt-1">
                  Once executed, all of your candidate tracking records, shift selections, vault credentials, and private notes will be permanently destroyed.
                </p>
              </div>

              {/* Deletion Scope Warning */}
              <div className="p-4 bg-red-950/30 border border-red-900/50 rounded-xl space-y-2">
                <span className="text-xs font-bold text-red-300 block">
                  The following data will be permanently erased:
                </span>
                <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                  <li>All tracked applications, round progressions, and assigned exam shifts</li>
                  <li>All private application numbers, registration numbers, and vault entries</li>
                  <li>All personal preparation checklists and custom tasks</li>
                  <li>All private recruitment notes and pinned reminders</li>
                  <li>Candidate profile details, qualifications, and saved search preferences</li>
                </ul>
              </div>

              {deleteError && (
                <div className="p-3 bg-red-950/60 border border-red-800 rounded-xl flex items-center gap-2 text-xs text-red-300">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{deleteError}</span>
                </div>
              )}

              {/* Confirmation input */}
              <div className="space-y-3 pt-2">
                <label className="text-xs text-slate-300 block font-medium">
                  Optional: Tell us why you are leaving
                </label>
                <input
                  type="text"
                  placeholder="e.g., Selected in exam, closing account"
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                />

                <label className="text-xs text-slate-300 block font-medium pt-2">
                  To confirm permanent deletion, type:{" "}
                  <code className="text-red-400 font-mono font-bold bg-slate-950 px-1 py-0.5 rounded border border-red-900">
                    DELETE MY ACCOUNT PERMANENTLY
                  </code>
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="DELETE MY ACCOUNT PERMANENTLY"
                  className="w-full px-3 py-2 bg-slate-950 border border-red-900/60 rounded-lg text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleDeleteAccount}
                  disabled={
                    deleteConfirmText !== "DELETE MY ACCOUNT PERMANENTLY" || isDeleting
                  }
                  className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-600/30 transition-all disabled:opacity-40"
                >
                  {isDeleting ? "Erasing Data..." : "Permanently Delete My Account"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Hidden Printable Docket for PDF / Print Output */}
      {printData && (
        <div className="hidden print:block print:fixed print:inset-0 print:bg-white print:text-black print:p-8 print:z-[99999]">
          <div className="border-b-2 border-black pb-4 mb-6">
            <h1 className="text-2xl font-bold">BharatExam Tracker - Personal Application Dossier</h1>
            <p className="text-sm text-gray-600">
              Candidate: {printData.exportMetadata.candidateName} ({printData.exportMetadata.candidateEmail}) | Exported: {new Date().toLocaleDateString("en-IN")}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Note: This dossier contains candidate self-reported application records. It does not replace official appointment letters.
            </p>
          </div>

          <h2 className="text-lg font-bold mb-3">Tracked Applications & Exam Schedules</h2>
          <table className="w-full border-collapse border border-gray-400 text-xs mb-6">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-400 p-2 text-left">Recruitment</th>
                <th className="border border-gray-400 p-2 text-left">Organization</th>
                <th className="border border-gray-400 p-2 text-left">Application #</th>
                <th className="border border-gray-400 p-2 text-left">Status</th>
                <th className="border border-gray-400 p-2 text-left">Assigned Exam Date & Shift</th>
                <th className="border border-gray-400 p-2 text-left">Center</th>
              </tr>
            </thead>
            <tbody>
              {printData.applications.map((app: any, idx: number) => {
                const shift = typeof app.personalExamSchedule === "object" ? app.personalExamSchedule : null;
                return (
                  <tr key={idx}>
                    <td className="border border-gray-400 p-2 font-medium">{app.recruitmentTitle}</td>
                    <td className="border border-gray-400 p-2">{app.organization}</td>
                    <td className="border border-gray-400 p-2 font-mono">{app.applicationNumber}</td>
                    <td className="border border-gray-400 p-2">{app.status}</td>
                    <td className="border border-gray-400 p-2">
                      {shift ? `${shift.date} (${shift.shiftName})` : "TBA"}
                    </td>
                    <td className="border border-gray-400 p-2">{shift?.center || "TBA"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
