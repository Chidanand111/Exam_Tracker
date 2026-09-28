"use client";

import React from "react";
import { Filter, RotateCcw, GraduationCap, Check } from "lucide-react";
import { FilterState } from "@/types";

interface FilterSidebarProps {
  filters: FilterState;
  onChange: (newFilters: FilterState) => void;
  onReset: () => void;
}

const QUALIFICATIONS = [
  { id: "ALL", label: "All Qualifications" },
  { id: "ANY_GRADUATE", label: "Any Graduate" },
  { id: "BTECH", label: "B.Tech" },
  { id: "BE", label: "B.E." },
  { id: "BCOM", label: "B.Com." },
  { id: "BSC", label: "B.Sc." },
  { id: "BA", label: "B.A." },
  { id: "BCA", label: "BCA" },
  { id: "MCA", label: "MCA" },
  { id: "MBA", label: "MBA" },
];

const SECTORS = [
  { id: "ALL", label: "All Sectors & Boards" },
  { id: "CENTRAL", label: "Central Ministries (SSC/UPSC/IB)" },
  { id: "STATE_PSC", label: "🏛️ State PSCs (UP, Bihar, MH, KA...)" },
  { id: "BANKING", label: "Banking & Finance (IBPS/SBI)" },
  { id: "REGULATORY", label: "Apex Regulatory (RBI/SEBI/NABARD)" },
  { id: "RAILWAY", label: "Indian Railways (RRB)" },
  { id: "DEFENCE", label: "Defence & Space (DRDO/ISRO/CDS)" },
  { id: "PSU", label: "Public Sector Undertakings (FCI/AAI)" },
];

const STATES = [
  { id: "ALL", label: "All Locations (Central & States)" },
  { id: "All India", label: "🇮🇳 All India (Central Recruitments)" },
  { id: "Uttar Pradesh", label: "Uttar Pradesh (UPPSC)" },
  { id: "Bihar", label: "Bihar (BPSC)" },
  { id: "Maharashtra", label: "Maharashtra (MPSC)" },
  { id: "Karnataka", label: "Karnataka (KPSC)" },
  { id: "Tamil Nadu", label: "Tamil Nadu (TNPSC)" },
  { id: "Telangana", label: "Telangana (TGPSC)" },
  { id: "Rajasthan", label: "Rajasthan (RPSC)" },
  { id: "Madhya Pradesh", label: "Madhya Pradesh (MPPSC)" },
  { id: "West Bengal", label: "West Bengal (WBPSC)" },
  { id: "Andhra Pradesh", label: "Andhra Pradesh (APPSC)" },
  { id: "Delhi NCT", label: "Delhi NCT (DSSSB)" },
  { id: "Kerala", label: "Kerala (Kerala PSC)" },
];

const STATUSES = [
  { id: "ALL", label: "All Statuses" },
  { id: "ACTIVE", label: "Active / Open" },
  { id: "CLOSING_SOON", label: "Closing Soon (Next 7 Days)" },
  { id: "ADMIT_CARD_OUT", label: "🎫 Admit Card Released" },
  { id: "RESULT_OUT", label: "🎉 Result Declared" },
];

export function FilterSidebar({ filters, onChange, onReset }: FilterSidebarProps) {
  const update = (partial: Partial<FilterState>) => {
    onChange({ ...filters, ...partial });
  };

  return (
    <aside className="w-full lg:w-72 glass-panel rounded-2xl p-5 border border-slate-800 space-y-6 shrink-0 h-fit">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-blue-400" />
          <h3 className="font-bold text-white text-sm">Filters & Criteria</h3>
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white transition-colors"
          title="Reset all filters"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* Prominent Fresher Toggle */}
      <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-950/40 to-slate-900 border border-emerald-500/30">
        <label className="flex items-center justify-between cursor-pointer">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-emerald-400" />
            <div>
              <span className="text-xs font-bold text-emerald-300 block">
                Graduate Freshers Only
              </span>
              <span className="text-[10px] text-slate-400">
                0 years experience required
              </span>
            </div>
          </div>
          <input
            type="checkbox"
            checked={filters.fresherOnly}
            onChange={(e) => update({ fresherOnly: e.target.checked })}
            className="w-4 h-4 text-emerald-500 rounded border-slate-700 bg-slate-800 focus:ring-emerald-500"
          />
        </label>
      </div>

      {/* Qualification Filter */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
          Degree / Qualification
        </label>
        <div className="flex flex-wrap gap-1.5">
          {QUALIFICATIONS.map((q) => {
            const isSelected = filters.qualification === q.id;
            return (
              <button
                key={q.id}
                type="button"
                onClick={() => update({ qualification: q.id })}
                className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                  isSelected
                    ? "bg-blue-600 border-blue-500 text-white font-semibold shadow-sm shadow-blue-500/30"
                    : "bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800"
                }`}
              >
                {q.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Age Limit Filter */}
      <div>
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="font-bold uppercase tracking-wider text-slate-300">Max Age Limit</span>
          <span className="text-blue-400 font-semibold">
            {filters.ageMax ? `Up to ${filters.ageMax} yrs` : "Any age"}
          </span>
        </div>
        <input
          type="range"
          min="20"
          max="38"
          step="1"
          value={filters.ageMax || 38}
          onChange={(e) => update({ ageMax: parseInt(e.target.value) })}
          className="w-full accent-blue-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-slate-500 mt-1">
          <span>20 yrs</span>
          <span>28 yrs</span>
          <span>35+ yrs</span>
        </div>
      </div>

      {/* Minimum In-Hand Salary */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
          Min In-Hand Salary
        </label>
        <div className="grid grid-cols-2 gap-1.5 text-xs">
          {[
            { label: "Any Salary", val: undefined },
            { label: "₹35,000+", val: 35000 },
            { label: "₹50,000+", val: 50000 },
            { label: "₹70,000+", val: 70000 },
          ].map((s, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => update({ salaryMin: s.val })}
              className={`py-1.5 px-2 rounded-lg border text-center transition-all ${
                filters.salaryMin === s.val
                  ? "bg-emerald-600/20 border-emerald-500 text-emerald-300 font-bold"
                  : "bg-slate-800/40 border-slate-800 text-slate-400 hover:bg-slate-800"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* State / Region Filter */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
          State / Location
        </label>
        <select
          value={filters.stateLocation || "ALL"}
          onChange={(e) => update({ stateLocation: e.target.value })}
          className="w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500"
        >
          {STATES.map((st) => (
            <option key={st.id} value={st.id}>
              {st.label}
            </option>
          ))}
        </select>
      </div>

      {/* Government Sector / Category */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
          Govt Sector / Board
        </label>
        <select
          value={filters.category}
          onChange={(e) => update({ category: e.target.value })}
          className="w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500"
        >
          {SECTORS.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {/* Recruitment Status */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
          Recruitment Status
        </label>
        <select
          value={filters.status}
          onChange={(e) => update({ status: e.target.value })}
          className="w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500"
        >
          {STATUSES.map((st) => (
            <option key={st.id} value={st.id}>
              {st.label}
            </option>
          ))}
        </select>
      </div>

      {/* Sort By */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
          Sort Opportunities By
        </label>
        <select
          value={filters.sortBy}
          onChange={(e) => update({ sortBy: e.target.value as any })}
          className="w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500"
        >
          <option value="newest">Newly Released</option>
          <option value="closing_soon">Closing Soon</option>
          <option value="vacancies">Highest Vacancies</option>
          <option value="salary">Highest In-Hand Salary</option>
        </select>
      </div>
    </aside>
  );
}
