"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search, Compass, AlertCircle } from "lucide-react";
import { RecruitmentItem, FilterState } from "@/types";
import { FilterSidebar } from "@/components/recruitments/FilterSidebar";
import { RecruitmentCard } from "@/components/recruitments/RecruitmentCard";

function DiscoverContent() {
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<FilterState>({
    search: searchParams.get("search") || "",
    qualification: searchParams.get("qualification") || "ALL",
    fresherOnly: searchParams.get("fresher") === "true",
    experienceRequired: searchParams.get("experience") === "true",
    ageMax: searchParams.get("ageMax") ? parseInt(searchParams.get("ageMax")!) : undefined,
    salaryMin: searchParams.get("salaryMin") ? parseInt(searchParams.get("salaryMin")!) : undefined,
    category: searchParams.get("category") || "ALL",
    status: searchParams.get("status") || "ALL",
    sortBy: (searchParams.get("sort") as any) || "newest",
  });

  const [recruitments, setRecruitments] = useState<RecruitmentItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Sync state if URL query params change
  useEffect(() => {
    const qFresher = searchParams.get("fresher") === "true";
    const qSearch = searchParams.get("search") || "";
    const qCategory = searchParams.get("category") || "ALL";
    const qQual = searchParams.get("qualification") || "ALL";
    const qSalary = searchParams.get("salaryMin") ? parseInt(searchParams.get("salaryMin")!) : undefined;
    const qSort = (searchParams.get("sort") as any) || "newest";

    setFilters((prev) => ({
      ...prev,
      fresherOnly: qFresher,
      search: qSearch,
      category: qCategory,
      qualification: qQual,
      salaryMin: qSalary,
      sortBy: qSort,
    }));
  }, [searchParams]);

  useEffect(() => {
    fetchFiltered();
  }, [filters]);

  const fetchFiltered = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.set("search", filters.search);
      if (filters.qualification && filters.qualification !== "ALL")
        params.set("qualification", filters.qualification);
      if (filters.fresherOnly) params.set("fresher", "true");
      if (filters.experienceRequired) params.set("experience", "true");
      if (filters.ageMax) params.set("ageMax", filters.ageMax.toString());
      if (filters.salaryMin) params.set("salaryMin", filters.salaryMin.toString());
      if (filters.category && filters.category !== "ALL") params.set("category", filters.category);
      if (filters.status && filters.status !== "ALL") params.set("status", filters.status);
      params.set("sort", filters.sortBy);

      const res = await fetch(`/api/recruitments?${params.toString()}`);
      const data = await res.json();
      setRecruitments(data.recruitments || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFilters({
      search: "",
      qualification: "ALL",
      fresherOnly: false,
      experienceRequired: false,
      ageMax: undefined,
      salaryMin: undefined,
      category: "ALL",
      status: "ALL",
      sortBy: "newest",
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Title & Top Search Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-blue-400" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Government Exam Discovery
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Verified Indian recruitments with transparent eligibility, dynamic rounds, and official portal links
          </p>
        </div>

        {/* Inline Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search keywords, posts, boards..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 shadow-sm"
          />
        </div>
      </div>

      {/* Main Content: Sidebar + Cards Grid */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Filter Sidebar */}
        <FilterSidebar filters={filters} onChange={setFilters} onReset={handleReset} />

        {/* Results Area */}
        <div className="flex-1 space-y-4">
          {/* Active summary bar */}
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>
              Showing <strong className="text-white">{recruitments.length}</strong> verified opportunities
            </span>
            {filters.fresherOnly && (
              <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                Freshers (0 Yrs Exp) Filter Active
              </span>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-64 rounded-2xl bg-slate-900/60 animate-pulse border border-slate-800" />
              ))}
            </div>
          ) : recruitments.length === 0 ? (
            <div className="p-12 text-center rounded-2xl glass-panel border border-slate-800 space-y-3">
              <AlertCircle className="w-8 h-8 text-amber-400 mx-auto" />
              <h3 className="font-bold text-white text-base">No recruitments match your filters</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Try widening your salary range, selecting "All Qualifications", or clearing search terms.
              </p>
              <button
                onClick={handleReset}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {recruitments.map((recruitment) => (
                <RecruitmentCard
                  key={recruitment.id}
                  recruitment={recruitment}
                  onAppliedSuccess={fetchFiltered}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DiscoverPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading discovery...</div>}>
      <DiscoverContent />
    </Suspense>
  );
}
