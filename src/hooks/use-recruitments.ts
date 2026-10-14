import { useState, useEffect, useCallback } from "react";
import { RecruitmentItem, FilterState } from "@/types";

export interface UseRecruitmentsOptions {
  initialFilters?: Partial<FilterState>;
  autoFetch?: boolean;
}

export function useRecruitments(options: UseRecruitmentsOptions = {}) {
  const { initialFilters = {}, autoFetch = true } = options;
  const [recruitments, setRecruitments] = useState<RecruitmentItem[]>([]);
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState<string | null>(null);

  const fetchRecruitments = useCallback(
    async (overrideFilters?: Partial<FilterState>) => {
      setLoading(true);
      setError(null);
      try {
        const activeFilters = { ...initialFilters, ...overrideFilters };
        const params = new URLSearchParams();

        if (activeFilters.search) params.set("search", activeFilters.search);
        if (activeFilters.qualification && activeFilters.qualification !== "ALL") {
          params.set("qualification", activeFilters.qualification);
        }
        if (activeFilters.fresherOnly) params.set("fresher", "true");
        if (activeFilters.experienceRequired) params.set("experience", "true");
        if (activeFilters.ageMax) params.set("ageMax", String(activeFilters.ageMax));
        if (activeFilters.salaryMin) params.set("salaryMin", String(activeFilters.salaryMin));
        if (activeFilters.category && activeFilters.category !== "ALL") {
          params.set("category", activeFilters.category);
        }
        if (activeFilters.stateLocation && activeFilters.stateLocation !== "ALL") {
          params.set("stateLocation", activeFilters.stateLocation);
        }
        if (activeFilters.status && activeFilters.status !== "ALL") {
          params.set("status", activeFilters.status);
        }
        if (activeFilters.sortBy) params.set("sort", activeFilters.sortBy);

        const res = await fetch(`/api/recruitments?${params.toString()}`);
        const data = await res.json();
        if (res.ok) {
          setRecruitments(data.recruitments || []);
        } else {
          setError(data.error || "Failed to load recruitments");
        }
      } catch (err: any) {
        setError(err?.message || "Network error loading recruitments");
      } finally {
        setLoading(false);
      }
    },
    [initialFilters]
  );

  useEffect(() => {
    if (autoFetch) {
      fetchRecruitments();
    }
  }, [fetchRecruitments, autoFetch]);

  return {
    recruitments,
    loading,
    error,
    refresh: fetchRecruitments,
  };
}
