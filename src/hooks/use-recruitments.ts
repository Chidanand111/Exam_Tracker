import { useState, useEffect, useCallback, useRef } from "react";
import { RecruitmentItem, FilterState } from "@/types";
import { apiClient, ApiClientError } from "@/lib/api-client";

export interface UseRecruitmentsOptions {
  initialFilters?: Partial<FilterState>;
  autoFetch?: boolean;
}

export function useRecruitments(options: UseRecruitmentsOptions = {}) {
  const { initialFilters = {}, autoFetch = true } = options;
  const [recruitments, setRecruitments] = useState<RecruitmentItem[]>([]);
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState<string | null>(null);

  // AbortController ref to cancel stale requests on filter changes
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchRecruitments = useCallback(
    async (overrideFilters?: Partial<FilterState>) => {
      // Cancel previous in-flight request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const controller = new AbortController();
      abortControllerRef.current = controller;

      setLoading(true);
      setError(null);

      try {
        const activeFilters = { ...initialFilters, ...overrideFilters };
        const response = await apiClient.recruitments.getAll(activeFilters, {
          signal: controller.signal,
        });
        setRecruitments(response.recruitments || []);
      } catch (err: any) {
        // If aborted, ignore
        if (err.name === "AbortError" || (err instanceof ApiClientError && err.code === "TIMEOUT")) {
          return;
        }
        setError(err.message || "Failed to load recruitments");
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
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchRecruitments, autoFetch]);

  return {
    recruitments,
    loading,
    error,
    refresh: fetchRecruitments,
  };
}
