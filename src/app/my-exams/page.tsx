"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  BookmarkCheck,
  Calendar,
  Clock,
  Download,
  Award,
  Bell,
  CheckCircle2,
  ExternalLink,
  MapPin,
  Sparkles,
  Layers,
  ArrowRight,
  TrendingUp,
  Lock,
  FileCheck2,
} from "lucide-react";
import { TrackedApplication, StageDetails } from "@/types";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { DynamicStageTimeline } from "@/components/stages/DynamicStageTimeline";
import { PersonalScheduleModal } from "@/components/dashboard/PersonalScheduleModal";
import { ResultModal } from "@/components/dashboard/ResultModal";
import { ReminderModal } from "@/components/dashboard/ReminderModal";
import { ApplicationVaultModal } from "@/components/vault/ApplicationVaultModal";
import { ApplicationChecklistModal } from "@/components/checklists/ApplicationChecklistModal";

export default function MyExamsDashboard() {
  const [applications, setApplications] = useState<TrackedApplication[]>([]);
  const [activeTab, setActiveTab] = useState<
    "ALL" | "UPCOMING" | "ADMIT_CARDS" | "RESULTS" | "NEXT_ROUND" | "COMPLETED"
  >("ALL");
  const [loading, setLoading] = useState(true);

  // Modals state
  const [selectedApp, setSelectedApp] = useState<TrackedApplication | null>(null);
  const [selectedStage, setSelectedStage] = useState<StageDetails | null>(null);
  const [vaultApp, setVaultApp] = useState<TrackedApplication | null>(null);
  const [checklistApp, setChecklistApp] = useState<TrackedApplication | null>(null);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/applications");
      const data = await res.json();
      if (res.ok) {
        setApplications(data.applications || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 5000);
  };

  // Filter based on active tab
  const filteredApps = applications.filter((app) => {
    const currentStage = app.recruitment.stages.find(
      (s) => s.stageOrder === app.currentStageOrder
    );
    const activeProgress = app.stageProgress.find((p) => p.stageId === currentStage?.id);

    if (activeTab === "ALL") return true;
    if (activeTab === "UPCOMING") {
      return (
        activeProgress?.examSchedule !== null ||
        currentStage?.status === "SCHEDULED" ||
        app.overallStatus === "APPLIED" ||
        app.overallStatus === "SELECTED_STAGE"
      );
    }
    if (activeTab === "ADMIT_CARDS") {
      return currentStage?.admitCardStatus === "RELEASED";
    }
    if (activeTab === "RESULTS") {
      return currentStage?.resultStatus === "RELEASED" && !activeProgress?.outcome;
    }
    if (activeTab === "NEXT_ROUND") {
      return app.currentStageOrder > 1 && app.overallStatus === "SELECTED_STAGE";
    }
    if (activeTab === "COMPLETED") {
      return (
        app.overallStatus === "FINAL_SELECTED" || app.overallStatus === "NOT_SELECTED"
      );
    }
    return true;
  });

  const admitCardsCount = applications.filter((app) => {
    const currentStage = app.recruitment.stages.find(
      (s) => s.stageOrder === app.currentStageOrder
    );
    return currentStage?.admitCardStatus === "RELEASED";
  }).length;

  const resultsCount = applications.filter((app) => {
    const currentStage = app.recruitment.stages.find(
      (s) => s.stageOrder === app.currentStageOrder
    );
    const progress = app.stageProgress.find((p) => p.stageId === currentStage?.id);
    return currentStage?.resultStatus === "RELEASED" && !progress?.outcome;
  }).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Toast banner */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 p-4 rounded-2xl bg-emerald-600 text-white text-xs font-semibold shadow-2xl shadow-emerald-500/40 border border-emerald-400 flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <BookmarkCheck className="w-6 h-6 text-blue-400" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              My Exams & Application Tracker
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Personal tracking dashboard for exam shifts, admit cards, dynamic round progression, and outcomes
          </p>
        </div>

        <Link
          href="/discover"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/30 transition-colors self-start md:self-center"
        >
          <span>Discover More Exams</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-xs font-semibold text-slate-400 block mb-1">
            Tracked Applications
          </span>
          <div className="text-2xl font-bold text-white">{applications.length}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Enrolled Aspirant</p>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30">
          <span className="text-xs font-semibold text-emerald-400 block mb-1">
            🎫 Admit Cards Available
          </span>
          <div className="text-2xl font-bold text-emerald-400">{admitCardsCount}</div>
          <p className="text-[11px] text-emerald-500/80 mt-0.5">Ready for Download</p>
        </div>

        <div className="p-4 rounded-2xl bg-blue-950/20 border border-blue-500/30">
          <span className="text-xs font-semibold text-blue-400 block mb-1">
            🎉 Results Declared
          </span>
          <div className="text-2xl font-bold text-blue-400">{resultsCount}</div>
          <p className="text-[11px] text-blue-500/80 mt-0.5">Awaiting Your Input</p>
        </div>

        <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/30">
          <span className="text-xs font-semibold text-purple-400 block mb-1">
            🎯 Next Rounds Unlocked
          </span>
          <div className="text-2xl font-bold text-purple-400">
            {applications.filter((a) => a.currentStageOrder > 1).length}
          </div>
          <p className="text-[11px] text-purple-500/80 mt-0.5">Tier 2 / Mains Active</p>
        </div>
      </div>

      {/* Dashboard Tabs */}
      <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-slate-800 text-xs">
        {[
          { id: "ALL", label: `All Applications (${applications.length})` },
          { id: "UPCOMING", label: "Upcoming Exams" },
          { id: "ADMIT_CARDS", label: `Admit Cards Available (${admitCardsCount})` },
          { id: "RESULTS", label: `Results Available (${resultsCount})` },
          { id: "NEXT_ROUND", label: "Next Round Active" },
          { id: "COMPLETED", label: "Completed" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3.5 py-2 rounded-xl font-semibold transition-all ${
              activeTab === tab.id
                ? "bg-blue-600 text-white shadow-sm shadow-blue-600/30"
                : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-60 rounded-3xl bg-slate-900/60 animate-pulse border border-slate-800" />
          ))}
        </div>
      ) : filteredApps.length === 0 ? (
        <div className="p-12 text-center rounded-3xl glass-panel border border-slate-800 space-y-4">
          <BookmarkCheck className="w-10 h-10 text-slate-500 mx-auto" />
          <h3 className="text-base font-bold text-white">No applications in this view</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            You haven't marked any applications matching this status yet. Browse exams to track them.
          </p>
          <Link
            href="/discover"
            className="inline-block px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
          >
            Browse Verified Exams
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredApps.map((app) => {
            const currentStage = app.recruitment.stages.find(
              (s) => s.stageOrder === app.currentStageOrder
            );
            const stageProgress = app.stageProgress.find((p) => p.stageId === currentStage?.id);
            const userSchedule = stageProgress?.examSchedule;

            return (
              <div
                key={app.id}
                className="glass-panel rounded-3xl p-6 sm:p-7 border border-slate-800 space-y-6 relative overflow-hidden"
              >
                {/* Top Row: Org, Title, Status & Registration */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        {app.recruitment.organization.shortName}
                      </span>
                      <span className="text-slate-600">•</span>
                      <span className="text-xs text-slate-400 font-medium">
                        Applied on {new Date(app.appliedDate).toLocaleDateString()}
                      </span>
                    </div>

                    <Link href={`/exams/${app.recruitment.id}`} className="hover:text-blue-400 transition-colors">
                      <h3 className="text-xl font-bold text-white tracking-tight">
                        {app.recruitment.title}
                      </h3>
                    </Link>

                    {app.registrationNumber && (
                      <p className="text-xs text-slate-400">
                        Reg No: <strong className="text-slate-200">{app.registrationNumber}</strong>
                        {app.rollNumber && <span> | Roll: <strong className="text-slate-200">{app.rollNumber}</strong></span>}
                      </p>
                    )}
                  </div>

                  {/* Status Pills */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                      ✓ Applied
                    </span>
                    <StatusBadge status={app.overallStatus} />
                  </div>
                </div>

                {/* Highlight Card: Current Stage Details & Assigned Exam Shift */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800/90 text-xs">
                  {/* Current Active Round */}
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                      Current Active Stage
                    </span>
                    <div className="text-sm font-bold text-white">
                      {currentStage?.stageName || `Round ${app.currentStageOrder}`}
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Selection Round {app.currentStageOrder} of {app.recruitment.stages.length}
                    </p>
                  </div>

                  {/* User Assigned Exam Shift */}
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-blue-400 block">
                      My Assigned Exam Shift
                    </span>
                    {userSchedule ? (
                      <div>
                        <div className="font-semibold text-white">
                          {new Date(userSchedule.examDate).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </div>
                        <div className="text-slate-300 text-[11px]">
                          {userSchedule.shiftName} • {userSchedule.examTime}
                        </div>
                        {userSchedule.examCenterName && (
                          <div className="text-slate-400 text-[10px] truncate max-w-xs mt-0.5">
                            📍 {userSchedule.examCenterName}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-slate-400">
                        <span>Not assigned yet</span>
                        {currentStage && (
                          <button
                            onClick={() => {
                              setSelectedApp(app);
                              setSelectedStage(currentStage);
                              setIsScheduleModalOpen(true);
                            }}
                            className="block text-blue-400 hover:underline font-semibold mt-1"
                          >
                            + Select Shift & Center
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Admit Card Status & Direct Action */}
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                      Official Admit Card
                    </span>
                    {currentStage?.admitCardStatus === "RELEASED" ? (
                      <div>
                        <span className="font-bold text-emerald-400 block">
                          🎫 Admit Card Available
                        </span>
                        <a
                          href={currentStage.admitCardUrl || app.recruitment.officialAdmitCardUrl || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 hover:underline mt-1"
                        >
                          <span>[Download Admit Card]</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    ) : (
                      <div className="text-slate-400">Not Announced Yet</div>
                    )}
                  </div>
                </div>

                {/* Dynamic Selection Timeline for Arbitrary Stages */}
                <DynamicStageTimeline
                  stages={app.recruitment.stages}
                  currentStageOrder={app.currentStageOrder}
                  userProgress={app.stageProgress}
                  isApplied={true}
                  onOpenScheduleModal={(stage) => {
                    setSelectedApp(app);
                    setSelectedStage(stage);
                    setIsScheduleModalOpen(true);
                  }}
                  onOpenResultModal={(stage) => {
                    setSelectedApp(app);
                    setSelectedStage(stage);
                    setIsResultModalOpen(true);
                  }}
                />

                {/* Bottom Action Buttons: Download Admit Card, View Details, Set Reminder, Record Result */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Download Admit Card Button */}
                    {currentStage?.admitCardStatus === "RELEASED" && (
                      <a
                        href={currentStage.admitCardUrl || app.recruitment.officialAdmitCardUrl || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm shadow-emerald-600/30 transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download Admit Card</span>
                      </a>
                    )}

                    {/* Check Result & Advance Round Button */}
                    {currentStage?.resultStatus === "RELEASED" && (
                      <button
                        onClick={() => {
                          setSelectedApp(app);
                          setSelectedStage(currentStage);
                          setIsResultModalOpen(true);
                        }}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-blue-600/30 transition-colors"
                      >
                        <Award className="w-3.5 h-3.5" />
                        <span>Record Result & Advance</span>
                      </button>
                    )}

                    {/* Preparation Checklist */}
                    <button
                      onClick={() => setChecklistApp(app)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600/15 hover:bg-blue-600/25 text-blue-300 text-xs font-semibold border border-blue-500/30 transition-colors"
                      title="View and check off preparation items"
                    >
                      <FileCheck2 className="w-3.5 h-3.5 text-blue-400" />
                      <span>Checklist</span>
                    </button>

                    {/* Application Vault */}
                    <button
                      onClick={() => setVaultApp(app)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 text-xs font-semibold border border-amber-500/30 transition-colors"
                      title="Record and view official registration credentials & receipts"
                    >
                      <Lock className="w-3.5 h-3.5 text-amber-400" />
                      <span>Vault</span>
                    </button>

                    {/* Set Reminder Button */}
                    <button
                      onClick={() => {
                        setSelectedApp(app);
                        setSelectedStage(currentStage || null);
                        setIsReminderModalOpen(true);
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 transition-colors"
                    >
                      <Bell className="w-3.5 h-3.5 text-amber-400" />
                      <span>Set Reminder</span>
                    </button>
                  </div>

                  <Link
                    href={`/exams/${app.recruitment.id}`}
                    className="inline-flex items-center gap-1 text-xs text-blue-400 hover:underline font-semibold"
                  >
                    <span>View Official Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      {selectedApp && selectedStage && (
        <>
          <PersonalScheduleModal
            isOpen={isScheduleModalOpen}
            onClose={() => setIsScheduleModalOpen(false)}
            stage={selectedStage}
            applicationId={selectedApp.id}
            initialData={
              selectedApp.stageProgress.find((p) => p.stageId === selectedStage.id)?.examSchedule
            }
            onSuccess={() => {
              showToast("Personal exam slot & center saved successfully!");
              fetchApplications();
            }}
          />

          <ResultModal
            isOpen={isResultModalOpen}
            onClose={() => setIsResultModalOpen(false)}
            stage={selectedStage}
            applicationId={selectedApp.id}
            onSuccess={(result) => {
              if (result.nextStageUnlocked) {
                showToast(`🎯 Qualified! Activated ${result.nextStageName} in your tracker.`);
              } else if (result.isFinalSelected) {
                showToast("🏆 Heartiest Congratulations! You are Final Selected!");
              } else {
                showToast("Stage marked as Not Selected. Application closed.");
              }
              fetchApplications();
            }}
          />

          <ReminderModal
            isOpen={isReminderModalOpen}
            onClose={() => setIsReminderModalOpen(false)}
            applicationId={selectedApp.id}
            stageId={selectedStage.id}
            defaultTitle={`Exam Reminder: ${selectedApp.recruitment.title}`}
            onSuccess={() => {
              showToast("Reminder created successfully!");
              fetchApplications();
            }}
          />
        </>
      )}

      {/* Vault Modal */}
      {vaultApp && (
        <ApplicationVaultModal
          isOpen={Boolean(vaultApp)}
          onClose={() => setVaultApp(null)}
          recruitmentId={vaultApp.recruitment.id}
          recruitmentTitle={vaultApp.recruitment.title}
          organizationName={vaultApp.recruitment.organization?.name}
          officialApplyUrl={vaultApp.recruitment.officialApplyUrl}
        />
      )}

      {/* Checklist Modal */}
      {checklistApp && (
        <ApplicationChecklistModal
          isOpen={Boolean(checklistApp)}
          onClose={() => setChecklistApp(null)}
          recruitmentId={checklistApp.recruitment.id}
          recruitmentTitle={checklistApp.recruitment.title}
          organizationName={checklistApp.recruitment.organization?.name}
          officialNotificationUrl={checklistApp.recruitment.officialNotificationUrl}
          officialApplyUrl={checklistApp.recruitment.officialApplyUrl}
        />
      )}
    </div>
  );
}
