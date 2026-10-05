"use client";

import React, { useState } from "react";
import {
  Calendar,
  Download,
  ExternalLink,
  ChevronDown,
  Check,
} from "lucide-react";
import { generateGoogleCalendarUrl } from "@/lib/calendar";

interface Props {
  applicationId?: string;
  recruitmentId?: string;
  title: string;
  description: string;
  startDate?: Date | string | null;
  endDate?: Date | string | null;
  location?: string;
  type?: "exam" | "deadline";
  compact?: boolean;
}

export function AddToCalendarButton({
  applicationId,
  recruitmentId,
  title,
  description,
  startDate,
  endDate,
  location,
  type = "exam",
  compact = false,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const start = startDate ? new Date(startDate) : new Date();
  const end = endDate ? new Date(endDate) : new Date(start.getTime() + 2 * 60 * 60 * 1000);

  const googleCalUrl = generateGoogleCalendarUrl({
    title,
    description,
    location,
    startDate: start,
    endDate: end,
  });

  const icsDownloadUrl = `/api/calendar/export?${
    applicationId
      ? `applicationId=${applicationId}&type=${type}`
      : `recruitmentId=${recruitmentId}&type=${type}`
  }`;

  const handleDownload = () => {
    setDownloaded(true);
    setTimeout(() => {
      setDownloaded(false);
      setIsOpen(false);
    }, 2000);
  };

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 font-semibold transition-all rounded-xl ${
          compact
            ? "px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
            : "px-3.5 py-2 text-xs bg-indigo-600/15 hover:bg-indigo-600/25 text-indigo-300 border border-indigo-500/30"
        }`}
        title="Add to personal calendar (.ics / Google Calendar)"
      >
        <Calendar className="w-3.5 h-3.5 text-indigo-400" />
        <span>Add to Calendar</span>
        <ChevronDown className="w-3 h-3 text-slate-400" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 bottom-full mb-2 sm:bottom-auto sm:top-full sm:mt-2 z-50 w-56 p-1.5 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl space-y-1 text-xs backdrop-blur-md animate-in fade-in zoom-in-95 duration-100">
            {/* Google Calendar Link */}
            <a
              href={googleCalUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-800 text-slate-200 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 flex items-center justify-center font-bold text-blue-400">
                  G
                </span>
                <span>Google Calendar</span>
              </div>
              <ExternalLink className="w-3 h-3 text-slate-500" />
            </a>

            {/* .ics Download Link */}
            <a
              href={icsDownloadUrl}
              download
              onClick={handleDownload}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-800 text-slate-200 transition-colors"
            >
              <div className="flex items-center gap-2">
                {downloaded ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Download className="w-3.5 h-3.5 text-indigo-400" />
                )}
                <span>{downloaded ? "Downloaded .ics" : "Apple / Outlook (.ics)"}</span>
              </div>
              <span className="text-[10px] font-mono text-slate-500">RFC 5545</span>
            </a>
          </div>
        </>
      )}
    </div>
  );
}
