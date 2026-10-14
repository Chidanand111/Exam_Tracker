import { useState, useEffect, useCallback, useRef } from "react";
import { ShortlistLifecycleState } from "@/types";
import { apiClient, ApiClientError } from "@/lib/api-client";

export interface ShortlistItem {
  id: string;
  recruitmentId: string;
  userId: string;
  lifecycleState: ShortlistLifecycleState;
  priority: string;
  personalNotes?: string | null;
  targetPrepDays?: number | null;
  updatedAt: string;
  recruitment: any;
}

export function useShortlist(activeTab: string = "ALL") {
  const [items, setItems] = useState<ShortlistItem[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({
    ALL: 0,
    BOOKMARKED: 0,
    INTERESTED: 0,
    APPLIED: 0,
    COMPLETED: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchShortlist = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const data = await apiClient.shortlist.getAll(activeTab, {
        signal: controller.signal,
      });
      if (data.success) {
        setItems(data.items || []);
        if (data.counts) setCounts(data.counts);
      }
    } catch (err: any) {
      if (err.name === "AbortError" || (err instanceof ApiClientError && err.code === "TIMEOUT")) {
        return;
      }
      setError(err?.message || "Failed to load shortlist");
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchShortlist();
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchShortlist]);

  const removeItem = useCallback(
    async (recruitmentId: string) => {
      // Optimistic UI update: Remove immediately from local state
      const previousItems = [...items];
      setItems((prev) => prev.filter((i) => i.recruitmentId !== recruitmentId));

      try {
        await apiClient.shortlist.remove(recruitmentId);
        // Refresh counts in background
        fetchShortlist();
      } catch (err: any) {
        // Rollback on failure
        setItems(previousItems);
        setError(err?.message || "Failed to remove item. Restoring...");
      }
    },
    [items, fetchShortlist]
  );

  const updateState = useCallback(
    async (recruitmentId: string, newState: ShortlistLifecycleState) => {
      // Optimistic UI update
      const previousItems = [...items];
      setItems((prev) =>
        prev.map((i) =>
          i.recruitmentId === recruitmentId ? { ...i, lifecycleState: newState } : i
        )
      );

      try {
        await apiClient.shortlist.save({
          recruitmentId,
          lifecycleState: newState,
        });
        fetchShortlist();
      } catch (err: any) {
        // Rollback on failure
        setItems(previousItems);
        setError(err?.message || "Failed to update status. Restoring...");
      }
    },
    [items, fetchShortlist]
  );

  return {
    items,
    counts,
    loading,
    error,
    refresh: fetchShortlist,
    removeItem,
    updateState,
  };
}
