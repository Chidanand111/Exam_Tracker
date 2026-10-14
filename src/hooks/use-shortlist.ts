import { useState, useEffect, useCallback } from "react";
import { ShortlistLifecycleState } from "@/types";

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

  const fetchShortlist = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const url = activeTab === "ALL" ? "/api/shortlist" : `/api/shortlist?state=${activeTab}`;
      const res = await fetch(url);
      const data = await res.json();
      if (res.ok && data.success) {
        setItems(data.items || []);
        if (data.counts) setCounts(data.counts);
      } else {
        setError(data.error || "Failed to load shortlist");
      }
    } catch (err: any) {
      setError(err?.message || "Network error loading shortlist");
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchShortlist();
  }, [fetchShortlist]);

  const removeItem = useCallback(
    async (recruitmentId: string) => {
      try {
        await fetch(`/api/shortlist?recruitmentId=${recruitmentId}`, {
          method: "DELETE",
        });
        setItems((prev) => prev.filter((i) => i.recruitmentId !== recruitmentId));
        fetchShortlist();
      } catch (err) {
        console.error("Failed to remove shortlist item", err);
      }
    },
    [fetchShortlist]
  );

  const updateState = useCallback(
    async (recruitmentId: string, newState: ShortlistLifecycleState) => {
      try {
        await fetch("/api/shortlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            recruitmentId,
            lifecycleState: newState,
          }),
        });
        fetchShortlist();
      } catch (err) {
        console.error("Failed to update shortlist state", err);
      }
    },
    [fetchShortlist]
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
