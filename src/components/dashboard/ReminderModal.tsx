"use client";

import React, { useState } from "react";
import { X, Bell, Calendar, Clock, Check } from "lucide-react";
import { ReminderType, ReminderPreset } from "@/types";

interface ReminderModalProps {
  applicationId?: string;
  stageId?: string;
  defaultTitle?: string;
  targetDate?: string | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ReminderModal({
  applicationId,
  stageId,
  defaultTitle = "Exam Reminder",
  targetDate,
  isOpen,
  onClose,
  onSuccess,
}: ReminderModalProps) {
  const [title, setTitle] = useState(defaultTitle);
  const [reminderType, setReminderType] = useState<ReminderType>("EXAM_DATE");
  const [preset, setPreset] = useState<ReminderPreset>("1_DAY_BEFORE");
  const [customDateTime, setCustomDateTime] = useState<string>("");
  const [channel, setChannel] = useState<"IN_APP" | "EMAIL" | "TELEGRAM">("IN_APP");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const calculateTarget = (): Date => {
    if (preset === "CUSTOM" && customDateTime) {
      return new Date(customDateTime);
    }
    const base = targetDate ? new Date(targetDate) : new Date();
    const d = new Date(base);
    if (preset === "7_DAYS_BEFORE") d.setDate(d.getDate() - 7);
    else if (preset === "3_DAYS_BEFORE") d.setDate(d.getDate() - 3);
    else if (preset === "1_DAY_BEFORE") d.setDate(d.getDate() - 1);
    return d;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const scheduledFor = calculateTarget();

      const res = await fetch("/api/reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId,
          stageId,
          reminderType,
          title,
          scheduledFor: scheduledFor.toISOString(),
          presetOption: preset,
          channel,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create reminder");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl glass-panel bg-slate-900 border border-slate-700 shadow-2xl p-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white">Set Exam Reminder</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Reminder Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Reminder Type</label>
            <select
              value={reminderType}
              onChange={(e) => setReminderType(e.target.value as ReminderType)}
              className="w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500"
            >
              <option value="EXAM_DATE">Exam Date</option>
              <option value="APP_DEADLINE">Application Deadline</option>
              <option value="REPORTING_TIME">Reporting Time / Travel</option>
              <option value="ADMIT_CARD">Admit Card Availability</option>
              <option value="RESULT">Result Declaration</option>
              <option value="CUSTOM">Custom Reminder</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Preset Time</label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { id: "1_DAY_BEFORE", label: "1 Day Before" },
                { id: "3_DAYS_BEFORE", label: "3 Days Before" },
                { id: "7_DAYS_BEFORE", label: "7 Days Before" },
                { id: "CUSTOM", label: "Custom Date/Time" },
              ].map((p) => (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => setPreset(p.id as ReminderPreset)}
                  className={`p-2 rounded-xl border text-left flex items-center justify-between ${
                    preset === p.id
                      ? "bg-amber-500/20 border-amber-500 text-amber-300 font-semibold"
                      : "bg-slate-800/50 border-slate-800 text-slate-400 hover:bg-slate-800"
                  }`}
                >
                  <span>{p.label}</span>
                  {preset === p.id && <Check className="w-3.5 h-3.5 text-amber-400" />}
                </button>
              ))}
            </div>
          </div>

          {preset === "CUSTOM" && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Custom Date & Time
              </label>
              <input
                type="datetime-local"
                required
                value={customDateTime}
                onChange={(e) => setCustomDateTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Notification Channel
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setChannel("IN_APP")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${
                  channel === "IN_APP"
                    ? "bg-blue-600/20 border-blue-500 text-blue-300"
                    : "bg-slate-800 border-slate-700 text-slate-400"
                }`}
              >
                In-App & Bell
              </button>
              <button
                type="button"
                onClick={() => setChannel("EMAIL")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${
                  channel === "EMAIL"
                    ? "bg-blue-600/20 border-blue-500 text-blue-300"
                    : "bg-slate-800 border-slate-700 text-slate-400"
                }`}
              >
                Email
              </button>
              <button
                type="button"
                onClick={() => setChannel("TELEGRAM")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${
                  channel === "TELEGRAM"
                    ? "bg-blue-600/20 border-blue-500 text-blue-300"
                    : "bg-slate-800 border-slate-700 text-slate-400"
                }`}
              >
                Telegram
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
              {error}
            </div>
          )}

          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-xs font-semibold text-white shadow-md shadow-amber-600/30 transition-colors disabled:opacity-50"
            >
              {loading ? "Saving..." : "Set Reminder"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
