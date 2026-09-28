"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  User,
  GraduationCap,
  ShieldCheck,
  Compass,
  CheckCircle2,
  Lock,
  Sparkles,
  ArrowRight,
  Info,
  Calendar,
  Building2,
  MapPin,
  Briefcase,
  Languages,
  Award,
  AlertCircle,
} from "lucide-react";
import { CandidateProfileData } from "@/types";

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

const SECTORS = [
  { id: "CENTRAL", label: "Central Ministries (SSC / UPSC / IB)" },
  { id: "STATE_PSC", label: "State PSCs (UP, Bihar, MH, KA, TN...)" },
  { id: "BANKING", label: "Banking & Finance (IBPS / SBI)" },
  { id: "REGULATORY", label: "Apex Regulatory (RBI / SEBI / NABARD)" },
  { id: "RAILWAY", label: "Indian Railways (RRB)" },
  { id: "DEFENCE", label: "Defence & Space (DRDO / ISRO / CDS)" },
  { id: "PSU", label: "Public Sector Undertakings (FCI / AAI)" },
];

const STATES = [
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

export default function CandidateProfilePage() {
  const [profile, setProfile] = useState<CandidateProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetchProfileAndUser();
  }, []);

  const fetchProfileAndUser = async () => {
    setLoading(true);
    try {
      const [userRes, profileRes] = await Promise.all([
        fetch("/api/auth/me"),
        fetch("/api/profile"),
      ]);

      const userData = await userRes.json();
      setUser(userData.user);

      const profileData = await profileRes.json();
      if (profileData.profile) {
        setProfile(profileData.profile);
      } else {
        // Default initialized state
        setProfile({
          highestQualification: "BTECH",
          degree: "B.Tech in Computer Science",
          branch: "Computer Science & Engineering",
          graduationYear: 2025,
          percentage: 75.0,
          dateOfBirth: "2002-05-15",
          gender: "MALE",
          category: "UR",
          isPwD: false,
          isExServiceman: false,
          preferredStates: ["All India", "Karnataka"],
          preferredCities: ["Bengaluru", "New Delhi"],
          preferredDepartments: ["Space/ISRO", "Central Secretariat", "Railways"],
          preferredSectors: ["CENTRAL", "DEFENCE", "BANKING"],
          preferredJobTypes: ["Technical/Engineering", "Administrative"],
          preferredMinSalary: 50000,
          willingToRelocate: true,
          languagesKnown: ["English", "Hindi", "Kannada"],
          skills: ["Computer Literacy", "Technical Aptitude"],
          isCompleted: false,
          isPrivate: true,
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    setSaveSuccess(false);

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });

      const data = await res.json();
      if (res.ok) {
        setProfile(data.profile);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 4000);
      } else {
        alert(data.error || "Failed to update profile");
      }
    } catch {
      alert("Network error updating candidate profile");
    } finally {
      setSaving(false);
    }
  };

  const toggleSector = (secId: string) => {
    if (!profile) return;
    const current = profile.preferredSectors || [];
    if (current.includes(secId)) {
      setProfile({ ...profile, preferredSectors: current.filter((x) => x !== secId) });
    } else {
      setProfile({ ...profile, preferredSectors: [...current, secId] });
    }
  };

  const toggleState = (stName: string) => {
    if (!profile) return;
    const current = profile.preferredStates || [];
    if (current.includes(stName)) {
      setProfile({ ...profile, preferredStates: current.filter((x) => x !== stName) });
    } else {
      setProfile({ ...profile, preferredStates: [...current, stName] });
    }
  };

  // Calculate age derived from DOB
  let calculatedAge: number | null = null;
  if (profile?.dateOfBirth) {
    const dob = new Date(profile.dateOfBirth);
    const now = new Date();
    let age = now.getFullYear() - dob.getFullYear();
    const m = now.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) age--;
    calculatedAge = age;
  }

  // Calculate age relaxation
  let ageRelaxation = 0;
  if (profile?.category === "SC" || profile?.category === "ST") ageRelaxation += 5;
  if (profile?.category === "OBC") ageRelaxation += 3;
  if (profile?.isPwD) ageRelaxation += 10;
  if (profile?.isExServiceman) ageRelaxation += 3;

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 text-center text-xs text-slate-400">
        Loading candidate profile...
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <User className="w-6 h-6 text-blue-400" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Personalized Candidate Profile
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Configure your academic qualifications, reservation category, and preferences to receive transparent eligibility badges.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/discover"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Discover Exams</span>
          </Link>

          <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1.5 rounded-xl border border-emerald-500/20">
            <Lock className="w-3 h-3 text-emerald-400" />
            <span>Private & Encrypted</span>
          </span>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Candidate profile saved successfully! Your personalized match indicators are updated.</span>
        </div>
      )}

      {/* Summary Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">
            Calculated Age
          </span>
          <span className="text-xl font-extrabold text-white">
            {calculatedAge !== null ? `${calculatedAge} yrs` : "Not specified"}
          </span>
          <span className="text-[10px] text-slate-500 block">Based on DOB</span>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">
            Reservation Tier
          </span>
          <span className="text-xl font-extrabold text-blue-400">
            {profile?.category || "UR"}
          </span>
          <span className="text-[10px] text-slate-500 block">
            {ageRelaxation > 0 ? `+${ageRelaxation} yrs age relaxation` : "General age limit"}
          </span>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">
            Fee Exemption Status
          </span>
          <span className="text-xl font-extrabold text-emerald-400">
            {profile?.gender === "FEMALE" || profile?.category === "SC" || profile?.category === "ST" || profile?.isPwD
              ? "100% Free"
              : "Standard"}
          </span>
          <span className="text-[10px] text-slate-500 block">On Central SSC/UPSC Exams</span>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">
            Target Min In-Hand
          </span>
          <span className="text-xl font-extrabold text-amber-400">
            ₹{(profile?.preferredMinSalary || 50000).toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-500 block">Monthly goal</span>
        </div>
      </div>

      {/* Main Profile Editor Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Academic Credentials */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-800">
            <GraduationCap className="w-4 h-4 text-blue-400" />
            <span>Academic Qualifications & Discipline</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Highest Qualification</label>
              <select
                value={profile?.highestQualification || "ANY_GRADUATE"}
                onChange={(e) => setProfile({ ...profile!, highestQualification: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-blue-500 text-xs"
              >
                {QUALIFICATIONS.map((q) => (
                  <option key={q.code} value={q.code}>
                    {q.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Degree Title</label>
              <input
                type="text"
                placeholder="e.g. B.Tech Computer Science / B.Com"
                value={profile?.degree || ""}
                onChange={(e) => setProfile({ ...profile!, degree: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Branch / Stream / Specialization</label>
              <input
                type="text"
                placeholder="e.g. Electronics / Civil / Accounts"
                value={profile?.branch || ""}
                onChange={(e) => setProfile({ ...profile!, branch: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Graduation Year</label>
                <input
                  type="number"
                  min="2010"
                  max="2030"
                  value={profile?.graduationYear || 2025}
                  onChange={(e) => setProfile({ ...profile!, graduationYear: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Percentage / CGPA</label>
                <input
                  type="number"
                  step="0.1"
                  min="30"
                  max="100"
                  placeholder="e.g. 74.5"
                  value={profile?.percentage || ""}
                  onChange={(e) => setProfile({ ...profile!, percentage: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Demographics & Eligibility Relaxations */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Demographics & Eligibility Factors</span>
            </h2>
            <span className="text-[10px] text-slate-400 flex items-center gap-1">
              <Lock className="w-3 h-3 text-emerald-400" />
              <span>Never shared with recruiters or external systems</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Date of Birth</label>
              <input
                type="date"
                value={profile?.dateOfBirth ? profile.dateOfBirth.slice(0, 10) : ""}
                onChange={(e) => setProfile({ ...profile!, dateOfBirth: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Gender</label>
              <select
                value={profile?.gender || "MALE"}
                onChange={(e) => setProfile({ ...profile!, gender: e.target.value as any })}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs"
              >
                <option value="MALE">Male</option>
                <option value="FEMALE">Female (Fee Waiver Eligible)</option>
                <option value="TRANSGENDER">Transgender</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Reservation Category</label>
              <select
                value={profile?.category || "UR"}
                onChange={(e) => setProfile({ ...profile!, category: e.target.value as any })}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-bold text-blue-400"
              >
                <option value="UR">Unreserved (UR / General)</option>
                <option value="OBC">OBC (+3 yrs Age Relaxation)</option>
                <option value="SC">SC (+5 yrs Age Relaxation + Fee Exempt)</option>
                <option value="ST">ST (+5 yrs Age Relaxation + Fee Exempt)</option>
                <option value="EWS">EWS (Economically Weaker Section)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs">
            <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 cursor-pointer">
              <input
                type="checkbox"
                checked={profile?.isPwD || false}
                onChange={(e) => setProfile({ ...profile!, isPwD: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded bg-slate-900 border-slate-700"
              />
              <div>
                <span className="font-semibold text-slate-200 block">Person with Benchmark Disability (PwD)</span>
                <span className="text-[10px] text-slate-400">+10 yrs age relaxation across Central & State exams</span>
              </div>
            </label>

            <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 cursor-pointer">
              <input
                type="checkbox"
                checked={profile?.isExServiceman || false}
                onChange={(e) => setProfile({ ...profile!, isExServiceman: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded bg-slate-900 border-slate-700"
              />
              <div>
                <span className="font-semibold text-slate-200 block">Ex-Serviceman (ESM)</span>
                <span className="text-[10px] text-slate-400">Military service deduction + 3 yrs</span>
              </div>
            </label>
          </div>

          {/* Special & Technical Eligibility Criteria (Optional) */}
          <div className="pt-3 border-t border-slate-800 space-y-3">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Physical Standards, Driving License & Exam Attempts (Optional)
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Height (cm)</label>
                <input
                  type="number"
                  placeholder="e.g. 172"
                  value={profile?.physicalHeightCm || ""}
                  onChange={(e) => setProfile({ ...profile!, physicalHeightCm: parseFloat(e.target.value) || undefined })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs"
                />
                <span className="text-[10px] text-slate-500">Police/Defence criteria</span>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Driving License</label>
                <select
                  value={profile?.hasDrivingLicense ? (profile.licenseType || "LMV") : "NONE"}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "NONE") {
                      setProfile({ ...profile!, hasDrivingLicense: false, licenseType: undefined });
                    } else {
                      setProfile({ ...profile!, hasDrivingLicense: true, licenseType: val });
                    }
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs"
                >
                  <option value="NONE">No Driving License</option>
                  <option value="LMV">LMV (Light Motor Vehicle)</option>
                  <option value="HMV">HMV (Heavy Transport)</option>
                  <option value="TWO_WHEELER">Two Wheeler</option>
                </select>
                <span className="text-[10px] text-slate-500">Transport/Constable</span>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Previous Attempts Used</label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={profile?.attemptsCount ?? 0}
                  onChange={(e) => setProfile({ ...profile!, attemptsCount: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs"
                />
                <span className="text-[10px] text-slate-500">UPSC/State attempt ceiling</span>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nationality</label>
                <input
                  type="text"
                  value={profile?.nationality || "Citizen of India"}
                  onChange={(e) => setProfile({ ...profile!, nationality: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs"
                />
                <span className="text-[10px] text-slate-500">Citizenship clause</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Sector & Location Preferences */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-800">
            <Briefcase className="w-4 h-4 text-purple-400" />
            <span>Target Government Sectors & Location Preferences</span>
          </h2>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">Target Government Sectors</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {SECTORS.map((sec) => {
                  const isChecked = profile?.preferredSectors?.includes(sec.id);
                  return (
                    <button
                      key={sec.id}
                      type="button"
                      onClick={() => toggleSector(sec.id)}
                      className={`p-2.5 rounded-xl border text-left text-xs transition-colors flex items-center justify-between ${
                        isChecked
                          ? "bg-purple-600/20 border-purple-500 text-purple-300 font-semibold"
                          : "bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-800"
                      }`}
                    >
                      <span>{sec.label}</span>
                      {isChecked && <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">Preferred States / Locations</label>
              <div className="flex flex-wrap gap-1.5">
                {STATES.map((st) => {
                  const isChecked = profile?.preferredStates?.includes(st);
                  return (
                    <button
                      key={st}
                      type="button"
                      onClick={() => toggleState(st)}
                      className={`px-3 py-1 rounded-lg border text-xs transition-colors ${
                        isChecked
                          ? "bg-blue-600 border-blue-500 text-white font-semibold"
                          : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750"
                      }`}
                    >
                      {st}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Target Minimum In-Hand Salary (₹/month)
                </label>
                <input
                  type="number"
                  step="5000"
                  min="25000"
                  max="150000"
                  value={profile?.preferredMinSalary || 50000}
                  onChange={(e) => setProfile({ ...profile!, preferredMinSalary: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Relocation Flexibility</label>
                <select
                  value={profile?.willingToRelocate ? "true" : "false"}
                  onChange={(e) => setProfile({ ...profile!, willingToRelocate: e.target.value === "true" })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs"
                >
                  <option value="true">Willing to relocate anywhere in India</option>
                  <option value="false">Home state / Circle postings only</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <p className="text-[11px] text-slate-400">
            Official government recruitment records remain unaltered. Matches are computed strictly for your convenience.
          </p>

          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-blue-600/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-blue-200" />
            <span>{saving ? "Saving Changes..." : "Save Candidate Profile"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
