"use client";

import React, { useState } from "react";
import { X, Calendar, Clock, MapPin, Check } from "lucide-react";
import { StageDetails, ShiftSlot } from "@/types";

interface PersonalScheduleModalProps {
  stage: StageDetails;
  applicationId: string;
  initialData?: any;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function PersonalScheduleModal({
  stage,
  applicationId,
  initialData,
  isOpen,
  onClose,
  onSuccess,
}: PersonalScheduleModalProps) {
  const [selectedSlotId, setSelectedSlotId] = useState<string>(
    initialData?.selectedScheduleId || ""
  );
  const [examDate, setExamDate] = useState<string>(
    initialData?.examDate ? new Date(initialData.examDate).toISOString().split("T")[0] : ""
  );
  const [shiftName, setShiftName] = useState<string>(initialData?.shiftName || "");
  const [examTime, setExamTime] = useState<string>(initialData?.examTime || "");
  const [reportingTime, setReportingTime] = useState<string>(initialData?.reportingTime || "");
  const [examCenterName, setExamCenterName] = useState<string>(initialData?.examCenterName || "");
  const [centerAddress, setCenterAddress] = useState<string>(initialData?.centerAddress || "");
  const [notes, setNotes] = useState<string>(initialData?.notes || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSelectOfficialSlot = (slot: ShiftSlot) => {
    setSelectedSlotId(slot.id);
    setExamDate(new Date(slot.examDate).toISOString().split("T")[0]);
    setShiftName(slot.shiftName);
    setExamTime(`${slot.startTime} - ${slot.endTime}`);
    setReportingTime(slot.reportingTime || "");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!examDate || !shiftName || !examTime) {
      setError("Please specify the exam date, shift name, and exam time.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/applications/${applicationId}/personal-schedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stageId: stage.id,
          selectedScheduleId: selectedSlotId || null,
          examDate,
          shiftName,
          examTime,
          reportingTime,
          examCenterName,
          centerAddress,
          notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save personal schedule");
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
      <div className="relative w-full max-w-lg rounded-2xl glass-panel bg-slate-900 border border-slate-700 shadow-2xl p-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white">Assign Personal Exam Shift</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {stage.stageName} • Select from official shifts or enter custom details
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSave} className="mt-4 space-y-4 max-h-[75vh] overflow-y-auto pr-1">
          {/* Quick Select from Official Schedule */}
          {stage.schedules && stage.schedules.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Official Commission Shifts Available
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {stage.schedules.map((slot) => {
                  const isSelected = selectedSlotId === slot.id;
                  const formattedDate = new Date(slot.examDate).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                  });

                  return (
                    <button
                      type="button"
                      key={slot.id}
                      onClick={() => handleSelectOfficialSlot(slot)}
                      className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                        isSelected
                          ? "bg-blue-600/20 border-blue-500 text-white ring-1 ring-blue-500"
                          : "bg-slate-800/40 border-slate-800 text-slate-300 hover:bg-slate-800"
                      }`}
                    >
                      <div className="flex items-center justify-between font-semibold">
                        <span>{formattedDate}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-blue-400" />}
                      </div>
                      <div className="text-slate-400 text-[11px] mt-0.5">
                        {slot.shiftName} ({slot.startTime})
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Detailed Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Assigned Exam Date *
              </label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Shift / Session *
              </label>
              <input
                type="text"
                placeholder="e.g. Shift 2 (Afternoon)"
                required
                value={shiftName}
                onChange={(e) => setShiftName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Exam Time *
              </label>
              <input
                type="text"
                placeholder="e.g. 02:30 PM - 03:30 PM"
                required
                value={examTime}
                onChange={(e) => setExamTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Reporting Time
              </label>
              <input
                type="text"
                placeholder="e.g. 01:00 PM"
                value={reportingTime}
                onChange={(e) => setReportingTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Exam Center Name
            </label>
            <input
              type="text"
              placeholder="e.g. iON Digital Zone iDZ 2, Sector 62"
              value={examCenterName}
              onChange={(e) => setExamCenterName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Center Address
            </label>
            <textarea
              rows={2}
              placeholder="e.g. C-56/1, Institutional Area, Sector 62, Noida, UP"
              value={centerAddress}
              onChange={(e) => setCenterAddress(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Personal Notes & Travel Instructions
            </label>
            <input
              type="text"
              placeholder="e.g. Reach by 12:45 PM. Carry original Aadhaar & 2 photos."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white shadow-md shadow-blue-600/30 transition-colors disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save My Exam Schedule"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
