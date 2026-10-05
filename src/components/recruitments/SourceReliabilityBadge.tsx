import React from "react";
import { ShieldCheck, Search, Clock, AlertTriangle, RefreshCw, Archive, CheckCircle2 } from "lucide-react";

export interface SourceReliabilityBadgeProps {
  state?: string;
  note?: string | null;
  verifiedAt?: Date | string | null;
  organizationName?: string;
  sourceUrl?: string;
  compact?: boolean;
}

export function SourceReliabilityBadge({
  state = "VERIFIED_OFFICIAL",
  note,
  verifiedAt,
  organizationName,
  sourceUrl,
  compact = false,
}: SourceReliabilityBadgeProps) {
  const getBadgeConfig = () => {
    switch (state) {
      case "VERIFIED_OFFICIAL":
        return {
          icon: ShieldCheck,
          label: "Source verified: Official recruitment notification",
          badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
          iconColor: "text-emerald-400",
          subtext: "Validated directly against the official gazette notification.",
        };
      case "OFFICIAL_SOURCE_FOUND":
        return {
          icon: Search,
          label: "Official notification identified: Verification in progress",
          badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/30",
          iconColor: "text-blue-400",
          subtext: "Commission source located. Undergoing automated parser checks.",
        };
      case "PENDING_REVIEW":
        return {
          icon: Clock,
          label: "Notification update pending editorial verification",
          badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/30",
          iconColor: "text-amber-400",
          subtext: "New corrigendum or addendum detected; awaiting editorial approval.",
        };
      case "CONFLICTING_INFORMATION":
        return {
          icon: AlertTriangle,
          label: "Conflicting official notices detected: Verification required",
          badgeColor: "bg-rose-500/10 text-rose-400 border-rose-500/30",
          iconColor: "text-rose-400",
          subtext: "Discrepancy detected across commission channels (see conflict advisory).",
        };
      case "OUTDATED":
        return {
          icon: RefreshCw,
          label: "Information may be outdated: Waiting for commission update",
          badgeColor: "bg-slate-500/10 text-slate-300 border-slate-500/30",
          iconColor: "text-slate-400",
          subtext: "Notification calendar may have shifted. Verification refresh pending.",
        };
      case "ARCHIVED":
        return {
          icon: Archive,
          label: "Official archive: Recruitment cycle completed",
          badgeColor: "bg-purple-500/10 text-purple-300 border-purple-500/30",
          iconColor: "text-purple-400",
          subtext: "Historical reference record preserved for syllabus and cutoff analysis.",
        };
      default:
        return {
          icon: CheckCircle2,
          label: "Source verified: Official recruitment notification",
          badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
          iconColor: "text-emerald-400",
          subtext: "Validated directly against the official gazette notification.",
        };
    }
  };

  const config = getBadgeConfig();
  const Icon = config.icon;

  if (compact) {
    return (
      <span
        title={note || config.subtext}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.badgeColor}`}
      >
        <Icon className={`w-3.5 h-3.5 shrink-0 ${config.iconColor}`} />
        <span>{config.label}</span>
      </span>
    );
  }

  const formattedDate = verifiedAt
    ? new Date(verifiedAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Recently verified";

  return (
    <div
      className={`p-3.5 rounded-xl border ${config.badgeColor} flex flex-col sm:flex-row sm:items-center justify-between gap-2.5`}
    >
      <div className="flex items-start sm:items-center gap-2.5">
        <div className="p-1.5 rounded-lg bg-slate-900/60 shrink-0 mt-0.5 sm:mt-0">
          <Icon className={`w-4 h-4 ${config.iconColor}`} />
        </div>
        <div>
          <div className="text-xs font-semibold flex items-center gap-2">
            <span>{config.label}</span>
          </div>
          <p className="text-[11px] opacity-80 mt-0.5">
            {note || config.subtext} {organizationName ? `• ${organizationName}` : ""}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 text-[11px] opacity-75 shrink-0 self-end sm:self-center">
        <span>Verified: {formattedDate}</span>
        {sourceUrl && (
          <a
            href={sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:opacity-100 text-blue-400"
          >
            Official Portal
          </a>
        )}
      </div>
    </div>
  );
}
