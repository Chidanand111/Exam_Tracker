"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Search, Compass, AlertCircle, Sparkles, User, Settings2, CheckCircle2, WifiOff, Archive, BookOpen, ArrowRight } from "lucide-react";
import { RecruitmentItem, FilterState, CandidateProfileData } from "@/types";
import { FilterSidebar } from "@/components/recruitments/FilterSidebar";
import { RecruitmentCard } from "@/components/recruitments/RecruitmentCard";
import { OnboardingModal } from "@/components/profile/OnboardingModal";
import { evaluateRecruitmentMatch } from "@/lib/profile-matcher";
import { SavedSearchesBar } from "@/components/discover/SavedSearchesBar";
import { fetchWithRetry, saveCachedRecruitments, getCachedRecruitments } from "@/lib/network";
import { RecruitmentCardSkeleton } from "@/components/ui/Skeleton";
import { IntelligentSearchSuggestions } from "@/components/search/IntelligentSearchSuggestions";
import { InterpretedQueryBadges } from "@/components/search/InterpretedQueryBadges";
import { parseNaturalLanguageQuery, InterpretedFilter } from "@/lib/search-query-parser";
import { ComparisonFloatingBar } from "@/components/compare/ComparisonFloatingBar";

function DiscoverContent() {
  const searchParams = useSearchParams();

  const [candidateProfile, setCandidateProfile] = useState<CandidateProfileData | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [profileMatchSort, setProfileMatchSort] = useState(false);
  const [profileBannerDismissed, setProfileBannerDismissed] = useState(false);

  const [filters, setFilters] = useState<FilterState>({
    search: searchParams.get("search") || "",
    qualification: searchParams.get("qualification") || "ALL",
    fresherOnly: searchParams.get("fresher") === "true",
    experienceRequired: searchParams.get("experience") === "true",
    ageMax: searchParams.get("ageMax") ? parseInt(searchParams.get("ageMax")!) : undefined,
    salaryMin: searchParams.get("salaryMin") ? parseInt(searchParams.get("salaryMin")!) : undefined,
    category: searchParams.get("category") || "ALL",
    stateLocation: searchParams.get("stateLocation") || "ALL",
    status: searchParams.get("status") || "ALL",
    sortBy: (searchParams.get("sort") as any) || "newest",
  });

  const [includeArchived, setIncludeArchived] = useState(false);
  const [lifecycleStage, setLifecycleStage] = useState("ALL");
  const [recruitments, setRecruitments] = useState<RecruitmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUsingCache, setIsUsingCache] = useState(false);
  const [cacheTimestamp, setCacheTimestamp] = useState<string | null>(null);
  const [selectedToCompare, setSelectedToCompare] = useState<
    Array<{ id: string; title: string; organizationName?: string }>
  >([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [interpretedFilters, setInterpretedFilters] = useState<InterpretedFilter[]>([]);

  const handleSearchChange = (rawText: string) => {
    setFilters((prev) => ({ ...prev, search: rawText }));

    // Natural Language Query Understanding (Requirement 69)
    if (rawText.length > 5) {
      const parsed = parseNaturalLanguageQuery(rawText);
      if (parsed.filters.length > 0) {
        setInterpretedFilters(parsed.filters);
        setFilters((prev) => ({
          ...prev,
          search: parsed.cleanQuery || prev.search,
          qualification: parsed.params.qualification || prev.qualification,
          stateLocation: parsed.params.location || prev.stateLocation,
          fresherOnly: parsed.params.fresher !== undefined ? parsed.params.fresher : prev.fresherOnly,
          category: parsed.params.category || prev.category,
          salaryMin: parsed.params.minSalary || prev.salaryMin,
        }));
      }
    }
  };

  const handleSelectSuggestion = (suggestionValue: string) => {
    handleSearchChange(suggestionValue);
    setShowSuggestions(false);
  };

  const handleRemoveInterpretedFilter = (key: string) => {
    setInterpretedFilters((prev) => prev.filter((f) => f.key !== key));
    setFilters((prev) => {
      const next = { ...prev };
      if (key === "qualification") next.qualification = "ALL";
      if (key === "location") next.stateLocation = "ALL";
      if (key === "fresher") next.fresherOnly = false;
      if (key === "category") next.category = "ALL";
      if (key === "minSalary") next.salaryMin = undefined;
      if (key === "closingSoon") next.status = "ALL";
      return next;
    });
  };

  const handleToggleCompare = (rec: RecruitmentItem) => {
    setSelectedToCompare((prev) => {
      const exists = prev.some((r) => r.id === rec.id);
      if (exists) {
        return prev.filter((r) => r.id !== rec.id);
      }
      if (prev.length >= 4) {
        alert("You can select up to 4 recruitments for side-by-side comparison.");
        return prev;
      }
      return [
        ...prev,
        {
          id: rec.id,
          title: rec.title,
          organizationName: rec.organization?.shortName,
        },
      ];
    });
  };

  const handleApplySavedSearch = (search: {
    query: string;
    filters: Partial<FilterState>;
    sortBy?: string;
  }) => {
    setFilters((prev) => ({
      ...prev,
      search: search.query ?? "",
      qualification: search.filters.qualification || "ALL",
      fresherOnly: search.filters.fresherOnly ?? false,
      experienceRequired: search.filters.experienceRequired ?? false,
      salaryMin: search.filters.salaryMin,
      ageMax: search.filters.ageMax,
      category: search.filters.category || "ALL",
      stateLocation: search.filters.stateLocation || "ALL",
      status: search.filters.status || "ALL",
      sortBy: (search.sortBy as any) || "newest",
    }));
  };

  // Sync state if URL query params change
  useEffect(() => {
    const qFresher = searchParams.get("fresher") === "true";
    const qSearch = searchParams.get("search") || "";
    const qCategory = searchParams.get("category") || "ALL";
    const qState = searchParams.get("stateLocation") || "ALL";
    const qQual = searchParams.get("qualification") || "ALL";
    const qSalary = searchParams.get("salaryMin") ? parseInt(searchParams.get("salaryMin")!) : undefined;
    const qSort = (searchParams.get("sort") as any) || "newest";

    setFilters((prev) => ({
      ...prev,
      fresherOnly: qFresher,
      search: qSearch,
      category: qCategory,
      stateLocation: qState,
      qualification: qQual,
      salaryMin: qSalary,
      sortBy: qSort,
    }));
  }, [searchParams]);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/profile");
      const data = await res.json();
      if (data.profile) {
        setCandidateProfile(data.profile);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchFiltered();
  }, [filters, includeArchived, lifecycleStage]);

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
      if (filters.stateLocation && filters.stateLocation !== "ALL") params.set("stateLocation", filters.stateLocation);
      if (filters.status && filters.status !== "ALL") params.set("status", filters.status);
      if (includeArchived) params.set("includeArchived", "true");
      if (lifecycleStage && lifecycleStage !== "ALL") params.set("lifecycle", lifecycleStage);
      params.set("sort", filters.sortBy);

      const res = await fetchWithRetry(`/api/recruitments?${params.toString()}`, {}, 3, 800);
      const data = await res.json();
      const recs = data.recruitments || [];
      setRecruitments(recs);
      setIsUsingCache(false);
      // Cache fresh data for offline use
      saveCachedRecruitments(recs);
    } catch (err) {
      console.warn("Network fetch failed, attempting to read from offline cache:", err);
      const cached = getCachedRecruitments<RecruitmentItem[]>();
      if (cached && cached.data) {
        setRecruitments(cached.data);
        setIsUsingCache(true);
        setCacheTimestamp(cached.formattedTime);
      }
    } finally {
      setLoading(false);
    }
  };

  const displayedRecruitments = React.useMemo(() => {
    if (!profileMatchSort || !candidateProfile) return recruitments;
    return [...recruitments].sort((a, b) => {
      const scoreA = evaluateRecruitmentMatch(a, candidateProfile).score;
      const scoreB = evaluateRecruitmentMatch(b, candidateProfile).score;
      return scoreB - scoreA;
    });
  }, [recruitments, profileMatchSort, candidateProfile]);

  const handleReset = () => {
    setFilters({
      search: "",
      qualification: "ALL",
      fresherOnly: false,
      experienceRequired: false,
      ageMax: undefined,
      salaryMin: undefined,
      category: "ALL",
      stateLocation: "ALL",
      status: "ALL",
      sortBy: "newest",
    });
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", "/discover");
    }
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

        {/* Inline Search Input with Intelligent Suggestions (Requirement 68) */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search e.g. B.Tech jobs in Karnataka..."
            value={filters.search}
            onFocus={() => setShowSuggestions(true)}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 shadow-sm"
          />
          <IntelligentSearchSuggestions
            query={filters.search}
            isOpen={showSuggestions}
            onClose={() => setShowSuggestions(false)}
            onSelectSuggestion={handleSelectSuggestion}
          />
        </div>
      </div>

      {/* Career Advisories & Educational Bulletins Spotlight Banner */}
      <div className="p-3.5 sm:p-4 rounded-2xl glass-panel bg-gradient-to-r from-cyan-950/40 via-blue-950/30 to-slate-900 border border-cyan-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-white">Career Advisories & Educational Bulletins:</span>
              <span className="text-[10px] font-semibold text-emerald-300 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/20">
                🎓 Scholarships up to ₹60,000
              </span>
              <span className="text-[10px] font-semibold text-cyan-300 bg-cyan-500/15 px-2 py-0.5 rounded-full border border-cyan-500/20">
                📢 KEA & Exam Day Advisories
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Access verified student scholarships, bus pass concessions, free competitive exam coaching, and mandatory hall ticket dress code rules.
            </p>
          </div>
        </div>

        <Link
          href="/bulletins"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 transition-all shrink-0 self-start sm:self-auto"
        >
          <span>Explore Bulletins</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Interpreted Natural Language Query Badges (Requirement 69) */}
      {interpretedFilters.length > 0 && (
        <InterpretedQueryBadges
          filters={interpretedFilters}
          onRemoveFilter={handleRemoveInterpretedFilter}
          onClearAll={() => setInterpretedFilters([])}
        />
      )}

      {/* Candidate Personalization Banners */}
      {candidateProfile && candidateProfile.isCompleted ? (
        <div className="p-4 rounded-2xl glass-panel bg-gradient-to-r from-blue-950/40 via-purple-950/30 to-slate-900 border border-purple-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-white">Personalized for your profile:</span>
                <span className="text-[11px] font-semibold text-blue-300 bg-blue-500/15 px-2 py-0.5 rounded-full border border-blue-500/20">
                  {candidateProfile.degree || candidateProfile.highestQualification}
                </span>
                <span className="text-[11px] font-semibold text-purple-300 bg-purple-500/15 px-2 py-0.5 rounded-full border border-purple-500/20">
                  {candidateProfile.category} Category
                </span>
                {candidateProfile.gender === "FEMALE" && (
                  <span className="text-[11px] font-semibold text-emerald-300 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    🎉 100% Fee Waiver Active
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Eligibility factors & relaxations are matched directly against official vacancy circulars without altering official data.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setProfileMatchSort(!profileMatchSort)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1.5 ${
                profileMatchSort
                  ? "bg-purple-600 border-purple-500 text-white shadow-md shadow-purple-600/30"
                  : "bg-slate-800/80 border-slate-700 text-slate-300 hover:text-white"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-300" />
              <span>{profileMatchSort ? "✓ Ranked by Best Match" : "Rank by Best Match"}</span>
            </button>

            <button
              onClick={() => setShowOnboarding(true)}
              className="px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-colors flex items-center gap-1"
            >
              <Settings2 className="w-3.5 h-3.5" />
              <span>Edit Profile</span>
            </button>
          </div>
        </div>
      ) : !profileBannerDismissed ? (
        <div className="p-4 rounded-2xl glass-panel bg-gradient-to-r from-blue-950/30 via-slate-900 to-slate-900 border border-blue-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 shrink-0">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white flex items-center gap-2">
                <span>Personalize Exam Discovery with an Optional Candidate Profile</span>
                <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                  Optional & Private
                </span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Set your qualification, category, and date of birth to receive automatic age relaxation tags (+3y OBC / +5y SC/ST) and 100% fee waiver tags.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setProfileBannerDismissed(true)}
              className="text-xs text-slate-400 hover:text-slate-300 px-2 py-1"
            >
              Skip for now
            </button>

            <button
              onClick={() => setShowOnboarding(true)}
              className="px-4 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/30 transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-200" />
              <span>Set Up Candidate Profile</span>
            </button>
          </div>
        </div>
      ) : null}

      {/* Saved Searches & Quick Filters Bar */}
      <SavedSearchesBar
        currentFilters={filters}
        onApplySavedSearch={handleApplySavedSearch}
      />

      {/* Main Content: Sidebar + Cards Grid */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Filter Sidebar */}
        <FilterSidebar filters={filters} onChange={setFilters} onReset={handleReset} />

        {/* Results Area */}
        <div className="flex-1 space-y-4">
          {/* Offline Cache Indicator Alert Banner */}
          {isUsingCache && (
            <div
              role="status"
              aria-live="polite"
              className="p-3.5 bg-amber-950/40 border border-amber-600/40 rounded-xl flex items-center justify-between text-xs text-amber-200"
            >
              <div className="flex items-center gap-2">
                <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  <strong>Offline Cache Active:</strong> Displaying cached recruitment opportunities saved on {cacheTimestamp}. Live vacancy updates and official notifications will refresh once internet is restored.
                </span>
              </div>
            </div>
          )}

          {/* Active summary bar & Lifecycle controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400 px-1 bg-slate-900/40 p-2.5 rounded-xl border border-slate-800">
            <div>
              Showing <strong className="text-white">{displayedRecruitments.length}</strong> opportunities
              {profileMatchSort && <span className="text-purple-400 ml-1 font-semibold">(Ranked by profile match)</span>}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Lifecycle Stage Filter */}
              <select
                aria-label="Filter by lifecycle stage"
                value={lifecycleStage}
                onChange={(e) => setLifecycleStage(e.target.value)}
                className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-[11px] text-slate-200 focus:outline-none"
              >
                <option value="ALL">All Lifecycle Stages</option>
                <option value="APPLICATIONS_OPEN">Applications Open</option>
                <option value="EXAMINATION_PROCESS">Examination Process</option>
                <option value="SELECTION_PROCESS">Selection Process</option>
                <option value="COMPLETED">Completed</option>
                <option value="ARCHIVED">Archived Cycles</option>
              </select>

              {/* Archive Toggle */}
              <button
                type="button"
                onClick={() => setIncludeArchived(!includeArchived)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors flex items-center gap-1.5 ${
                  includeArchived
                    ? "bg-purple-600/20 border-purple-500 text-purple-300"
                    : "bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200"
                }`}
                title="Include completed historical recruitment cycles preserved for syllabus and cutoff reference"
              >
                <Archive className="w-3 h-3 text-purple-400" />
                <span>{includeArchived ? "Archived: Included" : "Include Archived"}</span>
              </button>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[1, 2, 3, 4].map((i) => (
                <RecruitmentCardSkeleton key={i} />
              ))}
            </div>
          ) : displayedRecruitments.length === 0 ? (
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
              {displayedRecruitments.map((recruitment) => (
                <RecruitmentCard
                  key={recruitment.id}
                  recruitment={recruitment}
                  candidateProfile={candidateProfile}
                  onAppliedSuccess={fetchFiltered}
                  onOpenProfile={() => setShowOnboarding(true)}
                  isSelectedForCompare={selectedToCompare.some((r) => r.id === recruitment.id)}
                  onToggleCompare={() => handleToggleCompare(recruitment)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Floating Comparison Drawer Bar */}
      <ComparisonFloatingBar
        selectedRecruitments={selectedToCompare}
        onRemove={(id: string) => setSelectedToCompare((prev) => prev.filter((r) => r.id !== id))}
        onClear={() => setSelectedToCompare([])}
      />

      {/* Onboarding Wizard Modal */}
      <OnboardingModal
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onSaved={(p) => {
          setCandidateProfile(p);
          setShowOnboarding(false);
        }}
        initialProfile={candidateProfile}
      />
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
