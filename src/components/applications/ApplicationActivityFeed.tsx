"use client";

import React from "react";
import {
  Clock,
  CheckCircle2,
  Calendar,
  FileText,
  Award,
  AlertCircle,
  HelpCircle,
  FileCheck2,
  ArrowUpRight,
  UserCheck,
  Tag,
} from "lucide-react";
import { formatDateIndian, formatTimeIST } from "@/lib/date-locale";

export interface ActivityItem {
  id: string;
  activityType: string;
  title: string;
  description?: string | null;
  timestamp: string | Date;
}

interface Props {
  activities?: ActivityItem[];
  recruitmentTitle?: string;
}

export function ApplicationActivityFeed({ activities = [], recruitmentTitle }: Props) {
  if (!activities || activities.length === 0) {
    return (
      <div className="p-5 text-center rounded-2xl bg-slate-950/60 border border-slate-800 text-slate-400 space-y-1">
        <Clock className="w-6 h-6 text-slate-500 mx-auto" />
        <p className="text-xs font-medium text-slate-300">No Personal Interactions Recorded Yet</p>
        <p className="text-[11px] text-slate-500">
          Your interaction milestones (application submission, personal exam schedules, results checked) will appear here.
        </p>
      </div>
    );
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "APPLICATION_CREATED":
        return <FileCheck2 className="w-3.5 h-3.5 text-blue-400" />;
      case "EXAM_SCHEDULE_ADDED":
        return <Calendar className="w-3.5 h-3.5 text-purple-400" />;
      case "NEXT_STAGE_ACTIVATED":
      case "FINAL_SELECTED":
        return <Award className="w-3.5 h-3.5 text-emerald-400" />;
      case "NOT_SELECTED":
        return <AlertCircle className="w-3.5 h-3.5 text-rose-400" />;
      case "RESULT_CHECKED":
        return <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />;
      case "CALENDAR_EXPORTED":
        return <ArrowUpRight className="w-3.5 h-3.5 text-sky-400" />;
      default:
        return <Tag className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between pb-1 border-b border-slate-800">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-300">
          <Clock className="w-3.5 h-3.5 text-blue-400" />
          <span>Application Activity History</span>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
          {activities.length} Events
        </span>
      </div>

      <p className="text-[11px] text-slate-400 leading-relaxed">
        Personal interaction ledger for this recruitment. Distinct from official commission announcements.
      </p>

      {/* Activity Timeline List */}
      <div className="relative pl-6 space-y-4 border-l border-slate-800/80 my-2">
        {activities.map((item) => {
          const dateStr = formatDateIndian(item.timestamp);
          const timeStr = formatTimeIST(item.timestamp);

          return (
            <div key={item.id} className="relative group">
              {/* Timeline marker */}
              <div className="absolute -left-[31px] top-1 w-6 h-6 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center shadow-sm group-hover:border-blue-500/50 transition-colors">
                {getActivityIcon(item.activityType)}
              </div>

              {/* Event Content */}
              <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800/80 hover:border-slate-700 transition-all space-y-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="text-xs font-semibold text-white">
                    {item.title}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {dateStr} • {timeStr}
                  </span>
                </div>

                {item.description && (
                  <p className="text-[11px] text-slate-300/90 leading-relaxed font-sans">
                    {item.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
