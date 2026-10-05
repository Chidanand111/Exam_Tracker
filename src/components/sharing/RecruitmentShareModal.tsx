"use client";

import React, { useState } from "react";
import {
  X,
  Share2,
  Copy,
  Check,
  Smartphone,
  Mail,
  Send,
  ExternalLink,
  Shield,
  Building2,
  Calendar,
  Users,
} from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  recruitment: {
    id: string;
    slug?: string | null;
    title: string;
    organization?: { name: string } | null;
    vacancies?: number | null;
    appDeadline?: string | Date | null;
  };
}

export function RecruitmentShareModal({ isOpen, onClose, recruitment }: Props) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Strict enforcement: Canonical public URL ONLY, absolutely zero user/session parameters
  const origin =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://exam-tracker-blue.vercel.app";
  const cleanShareUrl = `${origin}/recruitments/${recruitment.slug || recruitment.id}`;

  const vacanciesText = recruitment.vacancies
    ? `${recruitment.vacancies.toLocaleString("en-IN")} vacancies`
    : "Multiple vacancies";
  const deadlineText = recruitment.appDeadline
    ? `Apply before ${new Date(recruitment.appDeadline).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })}`
    : "Applications active";

  const shareTitle = `${recruitment.title} | ${recruitment.organization?.name || "Govt Jobs"}`;
  const shareSummary = `📢 ${recruitment.title} - ${vacanciesText}. ${deadlineText}. Apply officially and track exam stages:`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(cleanShareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      setCopied(true);
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareSummary,
          url: cleanShareUrl,
        });
        onClose();
      } catch (err) {
        // User cancelled or share error
      }
    } else {
      handleCopyLink();
    }
  };

  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
    `${shareSummary}\n\n${cleanShareUrl}`
  )}`;

  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(
    cleanShareUrl
  )}&text=${encodeURIComponent(shareSummary)}`;

  const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(
    cleanShareUrl
  )}&text=${encodeURIComponent(
    `📢 ${recruitment.title} (${vacanciesText}). Apply officially on ${recruitment.organization?.name || "Govt Portal"}:`
  )}`;

  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
    cleanShareUrl
  )}`;

  const mailtoUrl = `mailto:?subject=${encodeURIComponent(
    shareTitle
  )}&body=${encodeURIComponent(
    `Hi,\n\nCheck out this government recruitment:\n\n${recruitment.title}\nOrganization: ${
      recruitment.organization?.name || "Govt Department"
    }\nVacancies: ${vacanciesText}\nDeadline: ${deadlineText}\n\nView details & apply officially:\n${cleanShareUrl}\n\nShared via BharatExam Tracker`
  )}`;

  const canNativeShare =
    typeof navigator !== "undefined" && typeof navigator.share === "function";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Share Recruitment</h3>
              <p className="text-xs text-slate-400">Public opportunity link</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Opportunity Preview Card */}
        <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
          <h4 className="text-sm font-medium text-white line-clamp-2">
            {recruitment.title}
          </h4>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
            {recruitment.organization && (
              <span className="flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-blue-400" />
                {recruitment.organization.name}
              </span>
            )}
            {recruitment.vacancies && (
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-emerald-400" />
                {recruitment.vacancies.toLocaleString("en-IN")} Posts
              </span>
            )}
            {recruitment.appDeadline && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                {new Date(recruitment.appDeadline).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                })}
              </span>
            )}
          </div>
        </div>

        {/* Clean URL Input + Copy Button */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-300">Clean Public Link</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={cleanShareUrl}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 font-mono focus:outline-none"
            />
            <button
              type="button"
              onClick={handleCopyLink}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                copied
                  ? "bg-emerald-600 text-white"
                  : "bg-blue-600 hover:bg-blue-500 text-white"
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy
                </>
              )}
            </button>
          </div>
        </div>

        {/* Direct Channels */}
        <div className="space-y-2">
          <span className="text-xs font-medium text-slate-400">Quick Share To:</span>
          <div className="grid grid-cols-2 gap-2.5">
            {/* WhatsApp */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-xs font-semibold transition-colors"
            >
              <span className="w-5 h-5 flex items-center justify-center font-bold text-sm">
                💬
              </span>
              WhatsApp
            </a>

            {/* Telegram */}
            <a
              href={telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 p-2.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/20 text-xs font-semibold transition-colors"
            >
              <Send className="w-4 h-4" />
              Telegram
            </a>

            {/* Twitter / X */}
            <a
              href={twitterUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors"
            >
              <span className="w-4 h-4 flex items-center justify-center font-bold text-xs">
                𝕏
              </span>
              Twitter / X
            </a>

            {/* LinkedIn */}
            <a
              href={linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 p-2.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 text-xs font-semibold transition-colors"
            >
              <span className="w-4 h-4 flex items-center justify-center font-bold text-xs">
                in
              </span>
              LinkedIn
            </a>

            {/* Email */}
            <a
              href={mailtoUrl}
              className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors"
            >
              <Mail className="w-4 h-4 text-slate-400" />
              Email
            </a>

            {/* Native Mobile Share */}
            {canNativeShare && (
              <button
                type="button"
                onClick={handleNativeShare}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 text-xs font-semibold transition-colors text-left"
              >
                <Smartphone className="w-4 h-4" />
                More Apps...
              </button>
            )}
          </div>
        </div>

        {/* Privacy Notice */}
        <div className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-400">
          <Shield className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <span>
            <strong>Privacy Protected:</strong> This link is strictly public and contains zero personal application data, registration IDs, notes, or user identifiers.
          </span>
        </div>
      </div>
    </div>
  );
}
