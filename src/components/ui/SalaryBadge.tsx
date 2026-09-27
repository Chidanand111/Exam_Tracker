import React from "react";
import { IndianRupee } from "lucide-react";

interface SalaryBadgeProps {
  payScale?: string | null;
  inHandMin?: number | null;
  inHandMax?: number | null;
  className?: string;
}

export function SalaryBadge({ payScale, inHandMin, inHandMax, className = "" }: SalaryBadgeProps) {
  const formatInr = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const hasInHand = inHandMin || inHandMax;

  return (
    <div className={`inline-flex flex-col ${className}`}>
      {hasInHand ? (
        <div className="flex items-center text-emerald-400 font-semibold text-sm">
          <IndianRupee className="w-3.5 h-3.5 mr-0.5 text-emerald-400 shrink-0" />
          <span>
            {inHandMin && inHandMax
              ? `₹${formatInr(inHandMin)} - ₹${formatInr(inHandMax)} / mo`
              : inHandMin
              ? `₹${formatInr(inHandMin)}+ / mo`
              : `Up to ₹${formatInr(inHandMax!)} / mo`}
          </span>
          <span className="text-[10px] text-emerald-400/80 bg-emerald-950/60 px-1.5 py-0.5 rounded ml-1.5 font-normal">
            In-Hand Est.
          </span>
        </div>
      ) : (
        <div className="text-slate-300 text-xs font-medium">
          {payScale || "Pay Scale Not Specified"}
        </div>
      )}
      {payScale && hasInHand && (
        <span className="text-[11px] text-slate-400 truncate max-w-[240px]">
          {payScale}
        </span>
      )}
    </div>
  );
}
