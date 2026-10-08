"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  GraduationCap,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Building2,
  TrendingUp,
  FileCheck2,
  BellRing,
  Clock,
  Layers,
  BookOpen,
} from "lucide-react";
import { RecruitmentItem } from "@/types";
import { RecruitmentCard } from "@/components/recruitments/RecruitmentCard";

export default function HomePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [recruitments, setRecruitments] = useState<RecruitmentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedRecruitments();
  }, []);

  const fetchFeaturedRecruitments = async () => {
    try {
      const res = await fetch("/api/recruitments?sort=newest");
      const data = await res.json();
      setRecruitments(data.recruitments || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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
    { label: "🎓 Career & Edu Bulletins", href: "/bulletins" },
    { label: "SSC Exams", query: "search=SSC" },
    { label: "Banking (IBPS/SBI)", query: "category=BANKING" },
    { label: "B.Tech Govt Jobs", query: "qualification=BTECH" },
    { label: "Jobs Above ₹50k", query: "salaryMin=50000" },
    { label: "Closing This Week", query: "sort=closing_soon" },
  ];

  const fresherRecruitments = recruitments.filter((r) => r.fresherEligible);
  const totalVacancies = recruitments.reduce((sum, r) => sum + (r.vacancies || 0), 0);

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 lg:pt-20 lg:pb-24 border-b border-slate-800/80 bg-gradient-to-b from-[#0e172a] via-[#090d16] to-[#090d16]">
        {/* Glow ambient background effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-blue-600/10 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[300px] h-[250px] bg-amber-500/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-[300px] h-[250px] bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          {/* Trust Banner Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/80 text-xs text-slate-300 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-white">Direct Official Source Monitoring</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-400">Zero Fabricated Data</span>
          </div>

          {/* Main Headline */}
          <div className="max-w-4xl mx-auto space-y-4">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.15]">
              Find Government Exams. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-emerald-400">
                Apply Officially. Track Every Stage.
              </span>
            </h1>
            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
              Designed specifically for graduates and freshers. Verified recruitment notifications, authentic salary scales, dynamic selection rounds, shift timings, and timely reminders.
            </p>
          </div>

          {/* Fast Global Search Box */}
          <div className="max-w-2xl mx-auto">
            <form
              onSubmit={handleSearchSubmit}
              className="p-1.5 rounded-2xl glass-panel bg-slate-900/90 border border-slate-700 shadow-2xl flex items-center gap-2"
            >
              <div className="pl-3 text-slate-400">
                <Search className="w-5 h-5 text-blue-400" />
              </div>
              <input
                type="text"
                placeholder='Search "graduate jobs", "SSC", "banking", "B.Tech", "freshers"...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-sm text-white placeholder-slate-400 focus:outline-none py-2 px-1"
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/30 shrink-0"
              >
                Search
              </button>
            </form>

            {/* Quick Filter Search Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-xs">
              <span className="text-slate-400 text-[11px] font-medium mr-1">Quick Filters:</span>
              {quickPills.map((pill, i) => (
                <Link
                  key={i}
                  href={pill.href || `/discover?${pill.query}`}
                  className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/70 text-slate-300 hover:text-white transition-colors"
                >
                  {pill.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Live Platform Stats */}
          <div className="pt-6 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center gap-2 text-blue-400 text-xs font-semibold mb-1">
                <Building2 className="w-4 h-4" />
                <span>Active Recruitments</span>
              </div>
              <div className="text-2xl font-bold text-white">{recruitments.length} Exams</div>
              <p className="text-[11px] text-slate-500 mt-0.5">Central & State Boards</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold mb-1">
                <GraduationCap className="w-4 h-4" />
                <span>Total Vacancies</span>
              </div>
              <div className="text-2xl font-bold text-emerald-400">
                {totalVacancies.toLocaleString()}+
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">Graduate & Fresher Posts</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold mb-1">
                <FileCheck2 className="w-4 h-4" />
                <span>Admit Cards Out</span>
              </div>
              <div className="text-2xl font-bold text-white">
                {recruitments.filter((r) => r.status === "ADMIT_CARD_OUT").length} Available
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">Official Direct Download</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center gap-2 text-purple-400 text-xs font-semibold mb-1">
                <Layers className="w-4 h-4" />
                <span>Dynamic Stages</span>
              </div>
              <div className="text-2xl font-bold text-white">Multi-Round</div>
              <p className="text-[11px] text-slate-500 mt-0.5">Tier 1/2, CBTs & DV</p>
            </div>
          </div>
        </div>
      </section>

      {/* Prominent Graduate Freshers Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-slate-800">
          <div>
            <div className="inline-flex items-center gap-1.5 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
              <GraduationCap className="w-4 h-4" />
              <span>Special Graduate Freshers Hub</span>
            </div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              Opportunities Requiring 0 Years Experience
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Curated recruitments specifically eligible for fresh graduates (B.A., B.Com., B.Sc., B.Tech, BCA, MCA, MBA)
            </p>
          </div>
          <Link
            href="/discover?fresher=true"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300 group"
          >
            <span>View All Freshers Opportunities</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 rounded-2xl bg-slate-900/60 animate-pulse border border-slate-800" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

      {/* How the Dynamic Progression Engine Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 rounded-3xl glass-panel bg-slate-900/80 border border-slate-800 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              A Complete System from Discovery to Final Appointment
            </h2>
            <p className="text-xs text-slate-400">
              Say goodbye to scattered PDFs and missed admit cards. Track every recruitment through its dynamic commission rounds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-slate-800/40 border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base">1. Apply Officially</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Click <strong>"Apply Officially"</strong> to go straight to the official government commission portal. Once submitted, click <strong>"I've Applied"</strong> to start tracking.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-800/40 border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base">2. Multiple Shifts & Admit Cards</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Govt exams span multiple days and shifts. Select your exact assigned slot (e.g. 14 Nov Shift 2, 2:30 PM), add your center, and receive tailored reporting reminders.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-800/40 border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base">3. Dynamic Next-Round Logic</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                When results are released, mark yourself <strong>"Selected for Next Stage"</strong> to unlock Round 2 (Tier 2 / Mains / Skill Test). Future stages stay locked until qualified.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Career Advisories & Educational Bulletins Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <BookOpen className="w-4 h-4" />
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                Career Advisories & Educational Bulletins
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Verified state & central student scholarships, free coaching schemes, bus pass concessions, and exam guidelines
            </p>
          </div>
          <Link
            href="/bulletins"
            className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 shrink-0"
          >
            <span>Explore all bulletins</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="rounded-2xl glass-panel bg-gradient-to-br from-slate-900 via-slate-900/80 to-[#0c182b] border border-cyan-500/20 p-5 flex flex-col justify-between hover:border-cyan-500/40 transition-all shadow-lg group">
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  🎓 Scholarship & Grant
                </span>
                <span className="text-[11px] text-amber-400 font-medium">Due 31 Oct 2026</span>
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-cyan-400 transition-colors mb-2">
                Aditya Birla Capital Scholarship Program 2026-27
              </h3>
              <div className="inline-block px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 text-xs font-semibold mb-3">
                Grant: Up to ₹60,000 / year
              </div>
              <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                Financial support for meritorious female students in Class 9-12, Polytechnic, Undergraduate (UG), and Postgraduate (PG) courses across India.
              </p>
            </div>
            <div className="pt-4 mt-3 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">Buddy4Study / ABCF</span>
              <Link
                href="/bulletins/aditya-birla-capital-scholarship-2026-27"
                className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                <span>Read & Apply</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="rounded-2xl glass-panel bg-gradient-to-br from-slate-900 via-slate-900/80 to-[#0c182b] border border-cyan-500/20 p-5 flex flex-col justify-between hover:border-cyan-500/40 transition-all shadow-lg group">
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  🎓 School Scholarship
                </span>
                <span className="text-[11px] text-amber-400 font-medium">Due 30 Oct 2026</span>
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-cyan-400 transition-colors mb-2">
                Valvoline Cummins Muskaan Scholarship Program 2.0
              </h3>
              <div className="inline-block px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 text-xs font-semibold mb-3">
                Grant: ₹12,000 Annual Assistance
              </div>
              <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                Direct financial grant for 9th to 12th standard students. Affirmative priority given to children of commercial vehicle drivers, mechanics, and daily wage earners.
              </p>
            </div>
            <div className="pt-4 mt-3 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">VCPL CSR Foundation</span>
              <Link
                href="/bulletins/muskaan-scholarship-program-2026-27"
                className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                <span>Read & Apply</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="rounded-2xl glass-panel bg-gradient-to-br from-slate-900 via-slate-900/80 to-[#0c182b] border border-cyan-500/20 p-5 flex flex-col justify-between hover:border-cyan-500/40 transition-all shadow-lg group">
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  💼 Free Coaching
                </span>
                <span className="text-[11px] text-emerald-400 font-medium">₹10,000/mo Stipend</span>
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-cyan-400 transition-colors mb-2">
                Karnataka Free Residential Competitive Exam Coaching
              </h3>
              <div className="inline-block px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 text-xs font-semibold mb-3">
                100% Free Coaching + Hostel
              </div>
              <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                Government of Karnataka provides free residential coaching for UPSC, KPSC (KAS), Banking, and SSC examinations with living stipend via entrance exam.
              </p>
            </div>
            <div className="pt-4 mt-3 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">Social Welfare & BCWD</span>
              <Link
                href="/bulletins/karnataka-free-residential-coaching-upsc-kas-banking-ssc"
                className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                <span>Read & Apply</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* All Recent Opportunities Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              All Active Government Recruitments
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Verified from official commission notifications (SSC, IBPS, Railways, PSUs)
            </p>
          </div>
          <Link
            href="/discover"
            className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1"
          >
            <span>Explore full catalog</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recruitments.map((recruitment) => (
            <RecruitmentCard
              key={recruitment.id}
              recruitment={recruitment}
              onAppliedSuccess={fetchFeaturedRecruitments}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
