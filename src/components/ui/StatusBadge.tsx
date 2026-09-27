import React from "react";
import { CheckCircle2, Clock, Info, XCircle, AlertCircle } from "lucide-react";

interface StatusBadgeProps {
  status: string;
  className?: string;
  size?: "sm" | "md";
}

export function StatusBadge({ status, className = "", size = "md" }: StatusBadgeProps) {
  const s = status.toUpperCase();

  let colorClass = "status-pill-unannounced";
  let icon = <Info className={size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5"} />;
  let label = status;

  if (s === "ACTIVE" || s === "AVAILABLE" || s === "SELECTED_FOR_NEXT" || s === "RELEASED" || s === "FINAL_SELECTED") {
    colorClass = "status-pill-active";
    icon = <CheckCircle2 className={size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5"} />;
    label = s === "RELEASED" ? "Available" : s === "SELECTED_FOR_NEXT" ? "Selected for Next Round" : s === "FINAL_SELECTED" ? "Final Selected" : "Active / Open";
  } else if (s === "CLOSING_SOON" || s === "UPCOMING" || s === "SCHEDULED" || s === "EXAM_SCHEDULED" || s === "PENDING") {
    colorClass = "status-pill-upcoming";
    icon = <Clock className={size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5"} />;
    label = s === "CLOSING_SOON" ? "Closing Soon" : s === "UPCOMING" ? "Upcoming" : s === "EXAM_SCHEDULED" ? "Exam Scheduled" : s === "PENDING" ? "In Progress" : "Scheduled";
  } else if (s === "ADMIT_CARD_OUT" || s === "ADMIT_CARD_AVAILABLE") {
    colorClass = "status-pill-active ring-1 ring-emerald-400/40";
    icon = <CheckCircle2 className={size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5"} />;
    label = "🎫 Admit Card Released";
  } else if (s === "RESULT_OUT" || s === "RESULT_AVAILABLE") {
    colorClass = "status-pill-update ring-1 ring-blue-400/40";
    icon = <AlertCircle className={size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5"} />;
    label = "🎉 Result Declared";
  } else if (s === "NOT_SELECTED" || s === "CLOSED" || s === "CANCELLED") {
    colorClass = "status-pill-closed";
    icon = <XCircle className={size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5"} />;
    label = s === "NOT_SELECTED" ? "Not Selected" : s === "CANCELLED" ? "Cancelled" : "Closed";
  } else if (s === "NOT_ANNOUNCED") {
    colorClass = "status-pill-unannounced";
    icon = <Clock className={size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5"} />;
    label = "Not Announced";
  }

  const sizeClass = size === "sm" ? "text-xs px-2 py-0.5" : "text-xs font-medium px-2.5 py-1";

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full ${sizeClass} ${colorClass} ${className}`}>
      {icon}
      <span>{label}</span>
    </span>
  );
}
