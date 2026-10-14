"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCcw, Home, Compass } from "lucide-react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalErrorBoundary({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error securely for diagnostics
    console.error("[Unhandled Application Error]:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full p-6 sm:p-8 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)] shadow-[var(--shadow-lg)] text-center space-y-6">
        <div className="w-14 h-14 rounded-2xl bg-[var(--semantic-error-bg)] border border-[var(--semantic-error-border)] text-[var(--semantic-error)] flex items-center justify-center mx-auto">
          <AlertTriangle className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-bold text-[var(--text-primary)]">
            Something went wrong
          </h1>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            An unexpected error occurred while processing this page. Our team has been notified. You can retry the action or return to the home screen.
          </p>
          {error.digest && (
            <p className="text-[10px] text-[var(--text-disabled)] font-mono">
              Error ID: {error.digest}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto btn btn-primary btn-sm flex items-center justify-center gap-2"
          >
            <RefreshCcw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>

          <Link
            href="/"
            className="w-full sm:w-auto btn btn-secondary btn-sm flex items-center justify-center gap-2"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Go Home</span>
          </Link>
        </div>

        <div className="pt-4 border-t border-[var(--border-subtle)] text-xs text-[var(--text-tertiary)] flex items-center justify-center gap-4">
          <Link href="/discover" className="hover:text-[var(--accent-400)] transition-colors flex items-center gap-1">
            <Compass className="w-3 h-3" />
            <span>Discover Exams</span>
          </Link>
          <span>•</span>
          <Link href="/help" className="hover:text-[var(--accent-400)] transition-colors">
            Help Center
          </Link>
        </div>
      </div>
    </div>
  );
}
