import Link from "next/link";
import { Compass, GraduationCap, Home, Search, BookOpen } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full p-6 sm:p-8 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)] shadow-[var(--shadow-lg)] text-center space-y-6">
        <div className="space-y-2">
          <div className="text-4xl font-extrabold text-[var(--accent-400)] tracking-tight">
            404
          </div>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">
            Page Not Found
          </h1>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            The exam notification, bulletin, or page you were looking for could not be found or may have been archived.
          </p>
        </div>

        <div className="space-y-2 pt-2 text-left">
          <span className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider block">
            Popular Destinations
          </span>
          <div className="space-y-1.5">
            <Link
              href="/discover"
              className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--bg-surface)] hover:bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] transition-colors group"
            >
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-[var(--accent-400)]" />
                <span className="font-medium">Exam Discovery Hub</span>
              </div>
              <span className="text-[var(--text-tertiary)] group-hover:text-[var(--accent-400)] transition-colors">→</span>
            </Link>

            <Link
              href="/discover?fresher=true"
              className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--bg-surface)] hover:bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] transition-colors group"
            >
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-[var(--semantic-success)]" />
                <span className="font-medium">Graduate Freshers (0 Yrs Exp)</span>
              </div>
              <span className="text-[var(--text-tertiary)] group-hover:text-[var(--semantic-success)] transition-colors">→</span>
            </Link>

            <Link
              href="/bulletins"
              className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--bg-surface)] hover:bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] transition-colors group"
            >
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-cyan-400" />
                <span className="font-medium">Career & Education Bulletins</span>
              </div>
              <span className="text-[var(--text-tertiary)] group-hover:text-cyan-400 transition-colors">→</span>
            </Link>
          </div>
        </div>

        <div className="pt-2">
          <Link
            href="/"
            className="btn btn-secondary btn-sm w-full flex items-center justify-center gap-2"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Return to Homepage</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
