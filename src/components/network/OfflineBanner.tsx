"use client";

import { useState, useEffect } from "react";
import { WifiOff, Wifi, Clock, RefreshCw } from "lucide-react";
import { getCachedRecruitments } from "@/lib/network";

export default function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);
  const [justReconnected, setJustReconnected] = useState(false);
  const [cacheTimestamp, setCacheTimestamp] = useState<string | null>(null);

  useEffect(() => {
    // Check initial online status
    if (typeof window !== "undefined") {
      setIsOffline(!navigator.onLine);

      const cached = getCachedRecruitments<any>();
      if (cached) {
        setCacheTimestamp(cached.formattedTime);
      }

      // Register Service Worker for PWA & offline support
      if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
        navigator.serviceWorker
          .register("/sw.js")
          .then(() => console.log("Service Worker registered successfully"))
          .catch((err) => console.warn("Service Worker registration failed:", err));
      }
    }

    const handleOffline = () => {
      setIsOffline(true);
      setJustReconnected(false);
      const cached = getCachedRecruitments<any>();
      if (cached) {
        setCacheTimestamp(cached.formattedTime);
      }
    };

    const handleOnline = () => {
      setIsOffline(false);
      setJustReconnected(true);
      setTimeout(() => setJustReconnected(false), 5000);
    };

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  if (justReconnected) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="bg-emerald-600 text-white px-4 py-2 text-xs font-semibold flex items-center justify-center gap-2 shadow-md animate-fade-in"
      >
        <Wifi className="w-4 h-4" />
        <span>Internet connection restored. Live official synchronization is active.</span>
      </div>
    );
  }

  if (!isOffline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="bg-amber-950/90 border-b border-amber-600/50 text-amber-200 px-4 py-2.5 text-xs font-medium flex flex-wrap items-center justify-between gap-2 shadow-lg backdrop-blur-sm"
    >
      <div className="flex items-center gap-2">
        <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />
        <span>
          <strong className="font-bold text-amber-300">Offline Mode:</strong> Network is unavailable. Displaying cached recruitment records.
        </span>
      </div>

      <div className="flex items-center gap-3 text-[11px] text-amber-300/80">
        {cacheTimestamp && (
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" /> Cached on {cacheTimestamp}
          </span>
        )}
        <button
          onClick={() => window.location.reload()}
          className="flex items-center gap-1 px-2 py-0.5 rounded bg-amber-900/60 hover:bg-amber-900 border border-amber-700/60 text-white transition-colors"
        >
          <RefreshCw className="w-3 h-3" /> Retry Connection
        </button>
      </div>
    </div>
  );
}
