"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  ArrowRight,
  Building2,
  GraduationCap,
  FileCheck2,
  Layers,
  FileText,
  Clock,
  TrendingUp,
} from "lucide-react";
import { RecruitmentItem } from "@/types";
import { RecruitmentCard } from "@/components/recruitments/RecruitmentCard";
import { useRecruitments } from "@/hooks/use-recruitments";

export default function HomePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const {
    recruitments,
    loading,
    refresh: fetchFeaturedRecruitments,
  } = useRecruitments({ initialFilters: { sortBy: "newest" } });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/discover?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/discover");
    }
  };

  const quickPills = [
    { label: "Graduate Freshers", query: "fresher=true" },
    { label: "SSC Exams", query: "search=SSC" },
    { label: "Banking (IBPS / SBI)", query: "category=BANKING" },
    { label: "B.Tech Govt Jobs", query: "qualification=BTECH" },
    { label: "Salary ₹50k+", query: "salaryMin=50000" },
    { label: "Closing Soon", query: "sort=closing_soon" },
  ];

  const fresherRecruitments = recruitments.filter((r) => r.fresherEligible);
  const totalVacancies = recruitments.reduce((sum, r) => sum + (r.vacancies || 0), 0);

  return (
    <div className="page-sections">

      {/* ── Hero ── */}
      <section className="border-b border-[var(--border-subtle)] bg-[var(--bg-surface)] pt-10 pb-12 sm:pt-14 sm:pb-16">
        <div className="section-container">
          <div className="max-w-3xl mx-auto text-center space-y-6">

            {/* Trust signal */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-default)] text-xs text-[var(--text-secondary)]">
              <span className="w-2 h-2 rounded-full bg-[var(--semantic-success)] shrink-0" />
              <span className="font-medium text-[var(--text-primary)]">Official Source Monitoring</span>
              <span className="text-[var(--text-disabled)]">·</span>
              <span>No fabricated data</span>
            </div>

            {/* Headline */}
            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--text-primary)] tracking-tight leading-[1.15]">
                Discover Government Exams.{" "}
                <span className="text-[var(--accent-400)]">Track Every Stage.</span>
              </h1>
              <p className="text-base text-[var(--text-secondary)] max-w-xl mx-auto leading-relaxed">
                Verified recruitment notifications for Indian graduates and freshers — authentic salary scales, dynamic exam rounds, shift assignments, and timely deadline reminders.
              </p>
            </div>

            {/* Search */}
            <div className="max-w-xl mx-auto">
              <form
                onSubmit={handleSearchSubmit}
                className="flex items-center gap-2 p-1.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-default)] shadow-[var(--shadow-md)] focus-within:border-[var(--border-focus)] transition-colors"
              >
                <Search className="w-4 h-4 text-[var(--text-tertiary)] ml-2 shrink-0" />
                <input
                  type="search"
                  placeholder='Search "SSC CGL", "IBPS PO", "railway", "B.Tech"…'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none py-1.5 min-w-0"
                  aria-label="Search government recruitments"
                />
                <button
                  type="submit"
                  className="btn btn-primary btn-sm shrink-0"
                >
                  Search
                </button>
              </form>

              {/* Quick filter pills */}
              <div className="flex flex-wrap items-center gap-1.5 mt-3 justify-center">
                <span className="text-xs text-[var(--text-disabled)]">Quick:</span>
                {quickPills.map((pill, i) => (
                  <Link
                    key={i}
                    href={`/discover?${pill.query}`}
                    className="px-2.5 py-1 rounded-md bg-[var(--bg-elevated)] hover:bg-[var(--bg-subtle)] border border-[var(--border-default)] text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                  >
                    {pill.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Platform stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto mt-10">
            {[
              {
                icon: Building2,
                label: "Active Recruitments",
                value: loading ? "—" : `${recruitments.length}`,
                sub: "Central & State boards",
                color: "text-[var(--accent-400)]",
              },
              {
                icon: GraduationCap,
                label: "Total Vacancies",
                value: loading ? "—" : `${totalVacancies.toLocaleString("en-IN")}+`,
                sub: "Graduate & fresher posts",
                color: "text-[var(--semantic-success)]",
              },
              {
                icon: FileCheck2,
                label: "Admit Cards Out",
                value: loading ? "—" : `${recruitments.filter((r) => r.status === "ADMIT_CARD_OUT").length}`,
                sub: "Direct official download",
                color: "text-amber-400",
              },
              {
                icon: Layers,
                label: "Multi-Stage Exams",
                value: loading ? "—" : `${recruitments.filter((r) => r.stages?.length > 1).length}`,
                sub: "Tier 1 / 2, CBTs & DV",
                color: "text-purple-400",
              },
            ].map(({ icon: Icon, label, value, sub, color }) => (
              <div
                key={label}
                className="p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-default)] space-y-1"
              >
                <div className={`flex items-center gap-1.5 text-xs font-medium ${color}`}>
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{label}</span>
                </div>
                <div className="text-xl font-bold text-[var(--text-primary)]">{value}</div>
                <p className="text-xs text-[var(--text-tertiary)]">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Freshers section ── */}
      <section className="section-container space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[var(--border-subtle)]">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--semantic-success)] uppercase tracking-wider mb-1">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Graduate Freshers Hub</span>
            </div>
            <h2 className="text-xl font-semibold text-[var(--text-primary)] tracking-tight">
              Opportunities Requiring Zero Experience
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              Curated for fresh graduates: B.A., B.Com., B.Sc., B.Tech, BCA, MCA, MBA
            </p>
          </div>
          <Link
            href="/discover?fresher=true"
            className="inline-flex items-center gap-1 text-sm font-medium text-[var(--semantic-success)] hover:underline shrink-0"
          >
            View all freshers
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 rounded-xl bg-[var(--bg-elevated)] animate-pulse border border-[var(--border-subtle)]" />
            ))}
          </div>
        ) : fresherRecruitments.length === 0 ? (
          <div className="py-12 text-center">
            <GraduationCap className="w-8 h-8 text-[var(--text-disabled)] mx-auto mb-3" />
            <p className="text-sm text-[var(--text-secondary)]">No fresher recruitments found at this time.</p>
            <Link href="/discover" className="text-sm text-[var(--accent-400)] hover:underline mt-1 inline-block">
              Browse all recruitments →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {fresherRecruitments.slice(0, 3).map((recruitment) => (
              <RecruitmentCard
                key={recruitment.id}
                recruitment={recruitment}
                onAppliedSuccess={fetchFeaturedRecruitments}
              />
            ))}
          </div>
        )}
      </section>

      {/* ── How it works ── */}
      <section className="section-container">
        <div className="panel p-6 sm:p-8 space-y-6">
          <div className="max-w-lg">
            <h2 className="text-lg font-semibold text-[var(--text-primary)] tracking-tight">
              From Discovery to Final Appointment
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mt-1.5">
              Track every recruitment through its dynamic commission rounds — no more scattered PDFs or missed admit cards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                icon: FileCheck2,
                step: "1",
                title: "Apply Officially",
                body: 'Click "Apply Officially" to reach the official government portal. Once submitted, click "I\'ve Applied" to start tracking on your dashboard.',
              },
              {
                icon: Clock,
                step: "2",
                title: "Select Your Shift",
                body: "Government exams span multiple days and shifts. Select your assigned exam slot (e.g. 14 Nov Shift 2) and add your exam centre for tailored reminders.",
              },
              {
                icon: TrendingUp,
                step: "3",
                title: "Unlock Next Rounds",
                body: 'When results are released, mark yourself "Selected for Next Stage" to unlock Round 2 (Tier 2 / Mains / Skill Test). Future stages stay locked until qualified.',
              },
            ].map(({ icon: Icon, step, title, body }) => (
              <div key={step} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-lg bg-[var(--semantic-info-bg)] border border-[var(--semantic-info-border)] flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-[var(--accent-400)]" />
                  </div>
                  {step !== "3" && <div className="w-px flex-1 bg-[var(--border-subtle)] my-2 hidden md:block" />}
                </div>
                <div className="pb-4">
                  <div className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-1">
                    Step {step}
                  </div>
                  <h3 className="font-semibold text-[var(--text-primary)] text-sm mb-1">{title}</h3>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bulletins teaser ── */}
      <section className="section-container space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[var(--border-subtle)]">
          <div>
            <h2 className="text-xl font-semibold text-[var(--text-primary)] tracking-tight">
              Career Advisories & Bulletins
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              State & central scholarships, free coaching schemes, bus pass concessions, and exam guidelines.
            </p>
          </div>
          <Link
            href="/bulletins"
            className="inline-flex items-center gap-1 text-sm font-medium text-[var(--accent-400)] hover:underline shrink-0"
          >
            All bulletins
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Bulletin cards — these are seeded records; the links below point to real routes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            {
              category: "Scholarship & Grant",
              due: "31 Oct 2026",
              title: "Aditya Birla Capital Scholarship Program 2026–27",
              grant: "Up to ₹60,000 / year",
              body: "Financial support for meritorious female students in Class 9–12, Polytechnic, and UG/PG courses across India.",
              source: "Buddy4Study / ABCF",
              href: "/bulletins/aditya-birla-capital-scholarship-2026-27",
            },
            {
              category: "School Scholarship",
              due: "30 Oct 2026",
              title: "Valvoline Cummins Muskaan Scholarship 2.0",
              grant: "₹12,000 Annual Assistance",
              body: "Direct financial grant for 9th–12th standard students, with priority for children of commercial vehicle drivers and daily wage earners.",
              source: "VCPL CSR Foundation",
              href: "/bulletins/muskaan-scholarship-program-2026-27",
            },
            {
              category: "Free Coaching",
              due: "Ongoing",
              title: "Karnataka Free Residential Competitive Exam Coaching",
              grant: "₹10,000/mo Stipend + Hostel",
              body: "Government of Karnataka provides free residential coaching for UPSC, KPSC (KAS), Banking, and SSC examinations via entrance exam.",
              source: "Social Welfare & BCWD",
              href: "/bulletins/karnataka-free-residential-coaching-upsc-kas-banking-ssc",
            },
          ].map((b) => (
            <div
              key={b.href}
              className="card-interactive p-5 flex flex-col justify-between gap-4"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-xs font-medium px-2 py-0.5 rounded bg-[var(--bg-subtle)] text-[var(--text-secondary)] border border-[var(--border-default)]">
                    {b.category}
                  </span>
                  <span className="text-xs text-amber-400 font-medium">{b.due}</span>
                </div>
                <h3 className="font-semibold text-[var(--text-primary)] text-sm leading-snug">
                  {b.title}
                </h3>
                <div className="text-xs font-semibold text-[var(--semantic-success)]">{b.grant}</div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed line-clamp-3">
                  {b.body}
                </p>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-[var(--border-subtle)]">
                <span className="text-xs text-[var(--text-tertiary)]">{b.source}</span>
                <Link
                  href={b.href}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--accent-400)] hover:underline"
                >
                  Read & Apply
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── All active recruitments ── */}
      <section className="section-container space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[var(--border-subtle)]">
          <div>
            <h2 className="text-xl font-semibold text-[var(--text-primary)] tracking-tight">
              All Active Government Recruitments
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              Verified from official commission notifications (SSC, IBPS, Railways, PSUs)
            </p>
          </div>
          <Link
            href="/discover"
            className="inline-flex items-center gap-1 text-sm font-medium text-[var(--accent-400)] hover:underline shrink-0"
          >
            Browse full catalog
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-72 rounded-xl bg-[var(--bg-elevated)] animate-pulse border border-[var(--border-subtle)]" />
            ))}
          </div>
        ) : recruitments.length === 0 ? (
          <div className="py-16 text-center">
            <Building2 className="w-10 h-10 text-[var(--text-disabled)] mx-auto mb-3" />
            <p className="text-sm text-[var(--text-secondary)]">No recruitments found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {recruitments.map((recruitment) => (
              <RecruitmentCard
                key={recruitment.id}
                recruitment={recruitment}
                onAppliedSuccess={fetchFeaturedRecruitments}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
