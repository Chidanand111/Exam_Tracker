import React from "react";
import Link from "next/link";
import { ShieldCheck, ExternalLink, AlertTriangle, CheckCircle } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] mt-auto text-sm text-[var(--text-tertiary)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">

          {/* Brand & Mission */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[var(--text-primary)] text-base">BharatExam Tracker</span>
            </div>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed max-w-lg">
              Discovery, stage progression tracking, and personal reminder platform for graduates, freshers, and government recruitment aspirants across India.
            </p>
            <div className="flex items-center gap-4 text-xs pt-1">
              <span className="flex items-center gap-1.5 text-[var(--semantic-success)] font-medium">
                <CheckCircle className="w-3.5 h-3.5" />
                Verified Official Portals Only
              </span>
              <span className="flex items-center gap-1.5 text-[var(--accent-400)] font-medium">
                <ShieldCheck className="w-3.5 h-3.5" />
                No Data Fabrication
              </span>
            </div>
          </div>

          {/* Official Portals */}
          <div>
            <h4 className="text-[var(--text-secondary)] font-semibold text-xs uppercase tracking-wider mb-3">
              Official Portals
            </h4>
            <ul className="space-y-2 text-sm">
              {[
                { label: "Staff Selection Commission (SSC)", href: "https://ssc.gov.in" },
                { label: "IBPS — Banking Personnel", href: "https://ibps.in" },
                { label: "Union Public Service Commission", href: "https://upsc.gov.in" },
                { label: "Railway Recruitment Boards", href: "https://indianrailways.gov.in" },
              ].map(({ label, href }) => (
                <li key={href}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 hover:text-[var(--accent-400)] transition-colors"
                  >
                    {label}
                    <ExternalLink className="w-3 h-3 text-[var(--text-disabled)] shrink-0" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="text-[var(--text-secondary)] font-semibold text-xs uppercase tracking-wider mb-3">
              Platform
            </h4>
            <ul className="space-y-2 text-sm">
              {[
                { label: "Exam Discovery", href: "/discover" },
                { label: "Graduate Freshers", href: "/discover?fresher=true" },
                { label: "My Tracked Exams", href: "/my-exams" },
                { label: "Career Bulletins", href: "/bulletins" },
                { label: "Help & Support", href: "/help" },
                { label: "Trust & Transparency", href: "/trust" },
                { label: "Privacy Center", href: "/privacy-center" },
              ].map(({ label, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="hover:text-[var(--text-primary)] transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Disclosure */}
        <div className="p-4 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-default)] text-xs text-[var(--text-secondary)] flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-semibold text-[var(--text-primary)]">Disclaimer: </span>
            BharatExam Tracker provides discovery and progression tools only. All actual applications are submitted on official portals (ssc.gov.in, ibps.in, upsc.gov.in, etc.). This platform never collects application fees or submits forms on behalf of candidates.
          </div>
        </div>

        <div className="mt-6 pt-5 border-t border-[var(--border-subtle)] flex flex-col sm:flex-row items-center justify-between text-xs text-[var(--text-disabled)] gap-2">
          <p>© 2026 BharatExam Tracker. Built for Indian graduates & freshers.</p>
          <p>Data sourced from official commission notifications</p>
        </div>
      </div>
    </footer>
  );
}
