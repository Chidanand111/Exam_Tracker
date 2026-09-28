"use client";

import React, { useState } from "react";
import {
  GraduationCap,
  ShieldCheck,
  Compass,
  ArrowRight,
  ArrowLeft,
  X,
  CheckCircle2,
  Lock,
  Sparkles,
  Info,
} from "lucide-react";
import { CandidateProfileData } from "@/types";

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (profile: CandidateProfileData) => void;
  initialProfile?: CandidateProfileData | null;
}

const QUALIFICATIONS = [
  { code: "ANY_GRADUATE", label: "Bachelor's Degree (Any Stream)" },
  { code: "BTECH", label: "B.Tech / B.E. (Engineering)" },
  { code: "BCOM", label: "B.Com. (Commerce & Accounts)" },
  { code: "BSC", label: "B.Sc. (Science / IT / Agriculture)" },
  { code: "BA", label: "B.A. (Arts & Humanities)" },
  { code: "BCA", label: "BCA (Computer Applications)" },
  { code: "MCA", label: "MCA / M.Sc. IT" },
  { code: "MBA", label: "MBA / Post Graduate in Management" },
  { code: "POST_GRADUATE", label: "Master's Degree (M.A./M.Sc./M.Com)" },
  { code: "DIPLOMA", label: "Polytechnic Diploma" },
];

const SECTOR_OPTIONS = [
  { id: "CENTRAL", label: "Central Ministries (SSC / UPSC / IB)" },
  { id: "STATE_PSC", label: "State PSCs (UP, Bihar, MH, KA, TN...)" },
  { id: "BANKING", label: "Banking & Finance (IBPS / SBI)" },
  { id: "REGULATORY", label: "Apex Regulatory (RBI / SEBI / NABARD)" },
  { id: "RAILWAY", label: "Indian Railways (RRB)" },
  { id: "DEFENCE", label: "Defence & Space (DRDO / ISRO / CDS)" },
  { id: "PSU", label: "Public Sector Undertakings (FCI / AAI)" },
];

const STATE_OPTIONS = [
  "All India",
  "Karnataka",
  "Uttar Pradesh",
  "Maharashtra",
  "Bihar",
  "Tamil Nadu",
  "Telangana",
  "Rajasthan",
  "Madhya Pradesh",
  "West Bengal",
  "Andhra Pradesh",
  "Delhi NCT",
  "Kerala",
];

export function OnboardingModal({ isOpen, onClose, onSaved, initialProfile }: OnboardingModalProps) {
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState<Partial<CandidateProfileData>>({
    highestQualification: initialProfile?.highestQualification || "BTECH",
    degree: initialProfile?.degree || "B.Tech in Computer Science",
    branch: initialProfile?.branch || "Computer Science & Engineering",
    graduationYear: initialProfile?.graduationYear || 2025,
    percentage: initialProfile?.percentage || 74.5,
    dateOfBirth: initialProfile?.dateOfBirth ? initialProfile.dateOfBirth.slice(0, 10) : "2002-05-15",
    gender: initialProfile?.gender || "MALE",
    category: initialProfile?.category || "UR",
    isPwD: initialProfile?.isPwD || false,
    pwDType: initialProfile?.pwDType || "",
    isExServiceman: initialProfile?.isExServiceman || false,
    preferredStates: initialProfile?.preferredStates?.length ? initialProfile.preferredStates : ["All India", "Karnataka"],
    preferredCities: initialProfile?.preferredCities?.length ? initialProfile.preferredCities : ["Bengaluru", "New Delhi"],
    preferredDepartments: initialProfile?.preferredDepartments?.length ? initialProfile.preferredDepartments : ["Space/ISRO", "Central Secretariat", "Railways"],
    preferredSectors: initialProfile?.preferredSectors?.length ? initialProfile.preferredSectors : ["CENTRAL", "DEFENCE", "BANKING"],
    preferredJobTypes: initialProfile?.preferredJobTypes?.length ? initialProfile.preferredJobTypes : ["Technical/Engineering", "Administrative"],
    preferredMinSalary: initialProfile?.preferredMinSalary || 50000,
    willingToRelocate: initialProfile?.willingToRelocate ?? true,
    languagesKnown: initialProfile?.languagesKnown?.length ? initialProfile.languagesKnown : ["English", "Hindi", "Kannada"],
    skills: initialProfile?.skills?.length ? initialProfile.skills : ["Computer Proficiency", "Typing Speed 35 wpm"],
  });

  if (!isOpen) return null;

  const toggleArrayItem = (field: keyof CandidateProfileData, item: string) => {
    const list = (formData[field] as string[]) || [];
    if (list.includes(item)) {
      setFormData({ ...formData, [field]: list.filter((x) => x !== item) });
    } else {
      setFormData({ ...formData, [field]: [...list, item] });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok && data.profile) {
        onSaved(data.profile);
        onClose();
      } else {
        alert(data.error || "Failed to save profile");
      }
    } catch {
      alert("Network error while saving candidate profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl rounded-3xl glass-panel bg-slate-900 border border-slate-700 shadow-2xl p-6 sm:p-8 space-y-6 max-h-[92vh] overflow-y-auto">
        {/* Header & Steps Indicator */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Sparkles className="w-4 h-4" />
              </span>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Candidate Profile & Personalized Discovery
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
              <Lock className="w-3 h-3 text-emerald-400" />
              <span>Optional & Private. Tailors your match scores without altering official exam rules.</span>
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            title="Skip for now"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Progress Tracker */}
        <div className="flex items-center justify-between text-xs font-semibold px-2">
          <div className="flex items-center gap-2">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                step === 1 ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400"
              }`}
            >
              1
            </span>
            <span className={step === 1 ? "text-white" : "text-slate-500"}>Academics</span>
          </div>
          <div className="w-12 h-0.5 bg-slate-800" />
          <div className="flex items-center gap-2">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                step === 2 ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400"
              }`}
            >
              2
            </span>
            <span className={step === 2 ? "text-white" : "text-slate-500"}>Eligibility & Age</span>
          </div>
          <div className="w-12 h-0.5 bg-slate-800" />
          <div className="flex items-center gap-2">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                step === 3 ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400"
              }`}
            >
              3
            </span>
            <span className={step === 3 ? "text-white" : "text-slate-500"}>Preferences</span>
          </div>
        </div>

        {/* STEP 1: Academic Background */}
        {step === 1 && (
          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-bold mb-1.5 uppercase tracking-wider text-[11px]">
                Highest Educational Qualification
              </label>
              <select
                value={formData.highestQualification || "ANY_GRADUATE"}
                onChange={(e) => setFormData({ ...formData, highestQualification: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-blue-500 text-xs"
              >
                {QUALIFICATIONS.map((q) => (
                  <option key={q.code} value={q.code}>
                    {q.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Degree Title</label>
                <input
                  type="text"
                  placeholder="e.g. B.Tech in CSE / B.Com"
                  value={formData.degree || ""}
                  onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Branch / Stream / Major</label>
                <input
                  type="text"
                  placeholder="e.g. Computer Science / Civil / Finance"
                  value={formData.branch || ""}
                  onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Graduation Year</label>
                <input
                  type="number"
                  min="2010"
                  max="2030"
                  value={formData.graduationYear || 2025}
                  onChange={(e) => setFormData({ ...formData, graduationYear: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Percentage / CGPA</label>
                <input
                  type="number"
                  step="0.1"
                  min="30"
                  max="100"
                  placeholder="e.g. 74.5"
                  value={formData.percentage || ""}
                  onChange={(e) => setFormData({ ...formData, percentage: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Demographics, Category, Age Relaxations */}
        {step === 2 && (
          <div className="space-y-4 text-xs">
            <div className="p-3 rounded-2xl bg-blue-950/30 border border-blue-500/20 text-blue-300 text-[11px] flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <span>
                These fields enable <strong>automatic age relaxation calculations</strong> (+3 yrs OBC, +5 yrs SC/ST, +10 yrs PwD) and <strong>100% application fee waiver tags</strong> (women and reserved categories).
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={formData.dateOfBirth || ""}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Gender</label>
                <select
                  value={formData.gender || "MALE"}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs"
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female (Fee Exempt in Central Exams)</option>
                  <option value="TRANSGENDER">Transgender</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Reservation Category</label>
              <div className="grid grid-cols-5 gap-2">
                {(["UR", "OBC", "SC", "ST", "EWS"] as const).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setFormData({ ...formData, category: cat })}
                    className={`py-2 rounded-xl border text-center font-bold text-xs transition-colors ${
                      formData.category === cat
                        ? "bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-500/30"
                        : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isPwD || false}
                  onChange={(e) => setFormData({ ...formData, isPwD: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded bg-slate-900 border-slate-700"
                />
                <div>
                  <span className="font-semibold text-slate-200 block">Person with Benchmark Disability (PwD)</span>
                  <span className="text-[10px] text-slate-400">+10 yrs age relaxation eligible</span>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isExServiceman || false}
                  onChange={(e) => setFormData({ ...formData, isExServiceman: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded bg-slate-900 border-slate-700"
                />
                <div>
                  <span className="font-semibold text-slate-200 block">Ex-Serviceman (ESM)</span>
                  <span className="text-[10px] text-slate-400">Military deduction relaxation</span>
                </div>
              </label>
            </div>

            {/* Optional Physical & License Standards */}
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <span className="text-[11px] font-bold text-slate-300 block uppercase tracking-wider">
                Physical Standards & Driving License (Optional for Police / Defence / Special Exams)
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Height (cm)</label>
                  <input
                    type="number"
                    placeholder="e.g. 172"
                    value={formData.physicalHeightCm || ""}
                    onChange={(e) => setFormData({ ...formData, physicalHeightCm: parseFloat(e.target.value) || undefined })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Driving License</label>
                  <select
                    value={formData.hasDrivingLicense ? (formData.licenseType || "LMV") : "NONE"}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "NONE") {
                        setFormData({ ...formData, hasDrivingLicense: false, licenseType: undefined });
                      } else {
                        setFormData({ ...formData, hasDrivingLicense: true, licenseType: val });
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs"
                  >
                    <option value="NONE">No Driving License</option>
                    <option value="LMV">LMV (Light Motor Vehicle)</option>
                    <option value="HMV">HMV (Heavy Motor Vehicle)</option>
                    <option value="TWO_WHEELER">Two Wheeler Only</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Previous Attempts Used</label>
                  <input
                    type="number"
                    min="0"
                    max="15"
                    value={formData.attemptsCount ?? 0}
                    onChange={(e) => setFormData({ ...formData, attemptsCount: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Career Goals & Preferences */}
        {step === 3 && (
          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-bold mb-1.5 uppercase tracking-wider text-[11px]">
                Preferred Government Sectors
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {SECTOR_OPTIONS.map((sec) => {
                  const isChecked = formData.preferredSectors?.includes(sec.id);
                  return (
                    <button
                      key={sec.id}
                      type="button"
                      onClick={() => toggleArrayItem("preferredSectors", sec.id)}
                      className={`py-2 px-3 rounded-xl border text-left text-xs transition-colors flex items-center justify-between ${
                        isChecked
                          ? "bg-blue-600/20 border-blue-500 text-blue-300 font-semibold"
                          : "bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-800"
                      }`}
                    >
                      <span>{sec.label}</span>
                      {isChecked && <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1.5 uppercase tracking-wider text-[11px]">
                Preferred States / Locations
              </label>
              <div className="flex flex-wrap gap-1.5">
                {STATE_OPTIONS.map((st) => {
                  const isChecked = formData.preferredStates?.includes(st);
                  return (
                    <button
                      key={st}
                      type="button"
                      onClick={() => toggleArrayItem("preferredStates", st)}
                      className={`px-2.5 py-1 rounded-lg border text-xs transition-colors ${
                        isChecked
                          ? "bg-emerald-600 border-emerald-500 text-white font-semibold"
                          : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750"
                      }`}
                    >
                      {st}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Target Minimum In-Hand Salary (₹/month)
                </label>
                <input
                  type="number"
                  step="5000"
                  min="25000"
                  max="150000"
                  value={formData.preferredMinSalary || 50000}
                  onChange={(e) => setFormData({ ...formData, preferredMinSalary: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Relocation Flexibility
                </label>
                <select
                  value={formData.willingToRelocate ? "true" : "false"}
                  onChange={(e) => setFormData({ ...formData, willingToRelocate: e.target.value === "true" })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs"
                >
                  <option value="true">Willing to relocate anywhere in India</option>
                  <option value="false">Home state / Circle postings only</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <button
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-white transition-colors underline-offset-4 hover:underline"
          >
            Skip for now & browse standard catalog
          </button>

          <div className="flex items-center gap-2">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="flex items-center gap-1 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/30 transition-colors"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                disabled={saving}
                onClick={handleSave}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 transition-all disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                <span>{saving ? "Saving..." : "Save & Personalize My Feed"}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
