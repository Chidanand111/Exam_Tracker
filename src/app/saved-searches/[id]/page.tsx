"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Search, Loader2 } from "lucide-react";

export default function SavedSearchDeepLinkPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function resolveSavedSearch() {
      try {
        const res = await fetch("/api/saved-searches");
        if (res.status === 401) {
          router.push(`/login?returnUrl=/saved-searches/${id}`);
          return;
        }
        if (!res.ok) {
          throw new Error("Failed to load saved search");
        }
        const data = await res.json();
        const found = data.searches?.find((s: any) => s.id === id);

        if (!found) {
          setError("Saved search not found or belongs to another user.");
          return;
        }

        // Parse filters and redirect to /discover with parameters
        let parsedFilters: Record<string, any> = {};
        try {
          parsedFilters = JSON.parse(found.filtersJson);
        } catch {
          // empty
        }

        const queryParams = new URLSearchParams();
        if (found.searchQuery) queryParams.set("search", found.searchQuery);
        if (parsedFilters.category) queryParams.set("category", parsedFilters.category);
        if (parsedFilters.qualification) queryParams.set("qualification", parsedFilters.qualification);
        if (parsedFilters.state) queryParams.set("state", parsedFilters.state);
        if (parsedFilters.fresherEligible) queryParams.set("fresher", "true");

        router.replace(`/discover?${queryParams.toString()}`);
      } catch (err: any) {
        setError(err.message || "Failed to resolve saved search");
      }
    }

    resolveSavedSearch();
  }, [id, router]);

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full p-6 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-4">
          <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-400 mx-auto flex items-center justify-center">
            <Search className="w-5 h-5" />
          </div>
          <h2 className="text-base font-semibold text-slate-100">Saved Search Link</h2>
          <p className="text-xs text-slate-400">{error}</p>
          <Link
            href="/discover"
            className="inline-block px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
          >
            Go to Discovery Hub
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
      <div className="flex items-center gap-3 text-xs text-slate-400">
        <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
        <span>Loading saved search criteria...</span>
      </div>
    </div>
  );
}
