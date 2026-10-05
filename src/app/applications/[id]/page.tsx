"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  FileText,
  Calendar,
  Clock,
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  Lock,
  AlertCircle,
  FileCheck2,
  Layers,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { ApplicationVaultModal } from "@/components/vault/ApplicationVaultModal";
import { ApplicationChecklistModal } from "@/components/checklists/ApplicationChecklistModal";

export default function ApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [application, setApplication] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showVaultModal, setShowVaultModal] = useState(false);
  const [showChecklistModal, setShowChecklistModal] = useState(false);

  useEffect(() => {
    async function loadApplication() {
      try {
        const res = await fetch("/api/applications");
        if (res.status === 401) {
          router.push(`/login?returnUrl=/applications/${id}`);
          return;
        }
        if (!res.ok) {
          throw new Error("Failed to load application");
        }
        const data = await res.json();
        const found = data.applications?.find((app: any) => app.id === id);
        if (!found) {
          setError("Application not found or you do not have permission to view it.");
        } else {
          setApplication(found);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load application");
      } finally {
        setLoading(false);
      }
    }
    loadApplication();
  }, [id, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="flex items-center gap-3 text-sm text-slate-400">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span>Verifying private application access...</span>
        </div>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-6 flex flex-col items-center justify-center">
        <div className="max-w-md w-full p-6 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-400 mx-auto flex items-center justify-center">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-semibold text-slate-100">Private Resource Access</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            {error || "This application tracking record is private to its authenticated applicant."}
          </p>
          <div className="pt-2 flex items-center justify-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
            >
              Sign In
            </Link>
            <Link
              href="/my-exams"
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium"
            >
              My Exams
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const rec = application.recruitment;
  const canonicalRecruitmentSlug = rec.slug || rec.id;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        <Breadcrumbs
          items={[
            { label: "My Exams", href: "/my-exams" },
            { label: rec.title, href: `/recruitments/${canonicalRecruitmentSlug}` },
            { label: "Application Tracking" },
          ]}
        />

        {/* Private Authorization Banner */}
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Authorized Private Workspace • Only visible to your account</span>
          </div>
          <span className="font-mono text-[11px] text-slate-500">ID: {application.id.slice(0, 10)}...</span>
        </div>

        {/* Header Hero */}
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/80 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-2">
              <span className="text-xs font-semibold text-blue-400 tracking-wider uppercase">
                {rec.organization?.name}
              </span>
              <h1 className="text-2xl font-bold text-slate-100">
                {rec.title}
              </h1>
              <div className="flex flex-wrap gap-2 text-xs pt-1">
                <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20 font-mono">
                  Reg No: {application.registrationNumber || "Not recorded"}
                </span>
                {application.rollNumber && (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-mono">
                    Roll No: {application.rollNumber}
                  </span>
                )}
                <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                  Status: {application.overallStatus}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Link
                href={`/recruitments/${canonicalRecruitmentSlug}`}
                className="px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 flex items-center gap-1.5 transition-colors"
              >
                <span>Official Notice</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
              <button
                onClick={() => setShowVaultModal(true)}
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white transition-colors"
              >
                Receipt Vault
              </button>
            </div>
          </div>
        </div>

        {/* Stages Timeline */}
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50 space-y-4">
          <h2 className="text-base font-semibold text-slate-200 flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-400" />
            Progression Across Recruitment Stages
          </h2>

          <div className="space-y-3 pt-2">
            {rec.stages && rec.stages.length > 0 ? (
              rec.stages.map((stg: any) => {
                const prog = application.stageProgress?.find((p: any) => p.stageId === stg.id);
                const isSelected = prog?.outcome === "SELECTED_FOR_NEXT" || prog?.outcome === "FINAL_SELECTED";

                return (
                  <div
                    key={stg.id}
                    className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-slate-200">
                        Stage {stg.stageOrder}: {stg.stageName}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Official Status: {stg.status} • Admit Card: {stg.admitCardStatus}
                      </div>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        isSelected
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : prog
                          ? "bg-blue-500/10 text-blue-300 border border-blue-500/20"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {prog?.status || "Pending"}
                    </span>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-slate-500">No examination stages published yet.</p>
            )}
          </div>
        </div>
      </div>

      {showVaultModal && (
        <ApplicationVaultModal
          recruitmentId={rec.id}
          recruitmentTitle={rec.title}
          isOpen={showVaultModal}
          onClose={() => setShowVaultModal(false)}
        />
      )}

      {showChecklistModal && (
        <ApplicationChecklistModal
          recruitmentId={rec.id}
          recruitmentTitle={rec.title}
          isOpen={showChecklistModal}
          onClose={() => setShowChecklistModal(false)}
        />
      )}
    </div>
  );
}
