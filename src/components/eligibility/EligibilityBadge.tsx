"use client";

import React from "react";
import { CheckCircle2, AlertCircle, HelpCircle, XCircle } from "lucide-react";
import { EligibilityDeterminationStatus } from "@/types";

interface EligibilityBadgeProps {
  status: EligibilityDeterminationStatus;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
}

export function EligibilityBadge({
  status,
  size = "md",
  showIcon = true,
}: EligibilityBadgeProps) {
  const configs: Record<
    EligibilityDeterminationStatus,
    {
      label: string;
      icon: any;
      bg: string;
      text: string;
      border: string;
      dot: string;
    }
  > = {
    ELIGIBLE: {
      label: "Eligible",
      icon: CheckCircle2,
      bg: "bg-emerald-500/15",
      text: "text-emerald-400",
      border: "border-emerald-500/30",
      dot: "bg-emerald-400",
    },
    POTENTIALLY_ELIGIBLE: {
      label: "Potentially eligible",
      icon: AlertCircle,
      bg: "bg-sky-500/15",
      text: "text-sky-300",
      border: "border-sky-500/30",
      dot: "bg-sky-400",
    },
    ELIGIBILITY_UNCLEAR: {
      label: "Eligibility unclear",
      icon: HelpCircle,
      bg: "bg-amber-500/15",
      text: "text-amber-300",
      border: "border-amber-500/30",
      dot: "bg-amber-400",
    },
    NOT_ELIGIBLE: {
      label: "Not eligible",
      icon: XCircle,
      bg: "bg-rose-500/15",
      text: "text-rose-400",
      border: "border-rose-500/30",
      dot: "bg-rose-400",
    },
  };

  const current = configs[status] || configs.ELIGIBILITY_UNCLEAR;
  const Icon = current.icon;

  const sizeClasses = {
    sm: "text-[10px] px-2 py-0.5 gap-1",
    md: "text-xs px-2.5 py-1 gap-1.5",
    lg: "text-sm px-3.5 py-1.5 gap-2 font-bold",
  }[size];

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-3.5 h-3.5",
    lg: "w-4 h-4",
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold border ${current.bg} ${current.text} ${current.border} ${sizeClasses} shadow-sm backdrop-blur-sm`}
    >
      {showIcon && <Icon className={`${iconSizes} shrink-0`} />}
      <span>{current.label}</span>
    </span>
  );
}
