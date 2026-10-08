"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  BookOpen,
  GraduationCap,
  Sparkles,
  Search,
  ExternalLink,
  Calendar,
  Award,
  Users,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileText,
  Bus,
  School,
  ChevronRight,
  Clock,
  ArrowRight
} from "lucide-react";

interface CareerBulletinItem {
  id: string;
  title: string;
  slug: string;
  category: string;
  summary: string;
  content: string;
  targetAudience: string | null;
  benefits: string | null;
  deadline: string | null;
  officialLink: string | null;
  officialPortalName: string | null;
  eligibilitySummary: string | null;
  documentsRequired: string | null;
  tags: string | null;
  isFeatured: boolean;
  publishedAt: string;
}

const CATEGORIES = [
  { key: "ALL", label: "All Bulletins", icon: BookOpen },
  { key: "SCHOLARSHIP", label: "🎓 Scholarships & Grants", icon: GraduationCap },
  { key: "EXAM_ADVISORY", label: "📢 Exam & OMR Advisories", icon: ShieldCheck },
  { key: "FREE_COACHING", label: "💼 Free Coaching & Bootcamps", icon: School },
  { key: "DOCUMENTATION_GUIDE", label: "📄 e-KYC & Document Guides", icon: FileText },
  { key: "STUDENT_AID", label: "🚌 Student Travel & Welfare", icon: Bus },
];

function BulletinsContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "ALL";

  const [bulletins, setBulletins] = useState<CareerBulletinItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);

  useEffect(() => {
    fetchBulletins();
  }, [selectedCategory]);

  const fetchBulletins = async () => {
    setLoading(true);
    try {
      const url = new URL("/api/bulletins", window.location.origin);
      if (selectedCategory !== "ALL") {
        url.searchParams.set("category", selectedCategory);
      }
      const res = await fetch(url.toString());
      const data = await res.json();
      setBulletins(data.bulletins || []);
    } catch (err) {
      console.error("Failed to load bulletins", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredBulletins = bulletins.filter((b) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      b.title.toLowerCase().includes(q) ||
      b.summary.toLowerCase().includes(q) ||
      (b.benefits && b.benefits.toLowerCase().includes(q)) ||
      (b.targetAudience && b.targetAudience.toLowerCase().includes(q)) ||
      (b.tags && b.tags.toLowerCase().includes(q))
    );
  });

  const featuredItems = bulletins.filter((b) => b.isFeatured);

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case "SCHOLARSHIP":
        return {
          label: "Scholarship & Grant",
          className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        };
      case "EXAM_ADVISORY":
        return {
          label: "Exam & Gate Advisory",
          className: "bg-amber-500/10 text-amber-400 border-amber-500/20",
        };
      case "FREE_COACHING":
        return {
          label: "Free Coaching & Training",
          className: "bg-purple-500/10 text-purple-400 border-purple-500/20",
        };
      case "DOCUMENTATION_GUIDE":
        return {
          label: "Document & e-KYC Guide",
          className: "bg-blue-500/10 text-blue-400 border-blue-500/20",
        };
      case "STUDENT_AID":
        return {
          label: "Travel Concession & Aid",
          className: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
        };
      default:
        return {
          label: "Career Bulletin",
          className: "bg-slate-500/10 text-slate-400 border-slate-500/20",
        };
    }
  };

  return (
    <div className="min-tx-screen pb-20">
      {/* Top Header Banner */}
      <section className="relative overflow-hidden border-b border-slate-800 bg-gradient-to-b from-slate-900 via-[#0b1329] to-[#070d1d] py-12 md:py-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(6,182,212,0.12),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.08),transparent_50%)]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Public Career Advisories & Educational Resources</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              State & Central <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-emerald-400">
                Career Advisories & Educational Bulletins
              </span>
            </h1>

            <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed">
              Verified public notifications, educational scholarship programs, mandatory exam-day instructions, free competitive exam coaching schemes, and student documentation guidelines.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-slate-400">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>100% Verified Official & CSR Portals</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60">
                <Award className="w-4 h-4 text-amber-400" />
                <span>Up to ₹60,000 Financial Grants</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span>Zero Misinformation / No Private Agents</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Search & Category Tabs */}
        <div className="space-y-4 mb-8">
          {/* Search Box */}
          <div className="relative max-w-xl">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search scholarships, KEA dress code, free coaching, bus pass..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500 transition-all shadow-inner"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isActive = selectedCategory === cat.key;
              return (
                <button
                  key={cat.key}
                  onClick={() => setSelectedCategory(cat.key)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-600/20 border border-cyan-400/30"
                      : "bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Featured Spotlight (Only shown on 'ALL' category when no search query) */}
        {selectedCategory === "ALL" && !search && featuredItems.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h2 className="text-lg font-bold text-white tracking-tight">
                Featured Highlights & Direct Grants
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {featuredItems.slice(0, 3).map((item) => {
                const badge = getCategoryBadge(item.category);
                return (
                  <div
                    key={item.id}
                    className="relative rounded-2xl glass-panel bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-slate-800/40 border border-cyan-500/20 p-5 flex flex-col justify-between hover:border-cyan-500/40 transition-all shadow-xl group"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span
                          className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${badge.className}`}
                        >
                          {badge.label}
                        </span>
                        {item.deadline && (
                          <span className="flex items-center gap-1 text-[11px] text-amber-400 font-medium">
                            <Clock className="w-3 h-3" />
                            <span>
                              Due {new Date(item.deadline).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                            </span>
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-white group-hover:text-cyan-400 transition-colors line-clamp-2 mb-2">
                        {item.title}
                      </h3>

                      {item.benefits && (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-3">
                          <Award className="w-3.5 h-3.5 shrink-0" />
                          <span className="line-clamp-1">{item.benefits}</span>
                        </div>
                      )}

                      <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed mb-4">
                        {item.summary}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                      <span className="text-[11px] text-slate-500">
                        {item.officialPortalName || "Verified Portal"}
                      </span>
                      <Link
                        href={`/bulletins/${item.slug}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
                      >
                        <span>View Details</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* All Bulletins List / Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white tracking-tight">
              {selectedCategory === "ALL"
                ? "All Active Advisories & Bulletins"
                : CATEGORIES.find((c) => c.key === selectedCategory)?.label}
            </h2>
            <span className="text-xs text-slate-400">
              Showing {filteredBulletins.length} publication{filteredBulletins.length !== 1 ? "s" : ""}
            </span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-3 animate-pulse"
                >
                  <div className="w-28 h-5 bg-slate-800 rounded-full" />
                  <div className="w-3/4 h-6 bg-slate-800 rounded-lg" />
                  <div className="w-full h-12 bg-slate-800/50 rounded-lg" />
                  <div className="w-1/2 h-4 bg-slate-800 rounded" />
                </div>
              ))}
            </div>
          ) : filteredBulletins.length === 0 ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-12 text-center max-w-md mx-auto my-8">
              <BookOpen className="w-10 h-10 text-slate-500 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-white">No bulletins found</h3>
              <p className="text-xs text-slate-400 mt-1">
                Try adjusting your search query or selecting a different category tab.
              </p>
              <button
                onClick={() => {
                  setSearch("");
                  setSelectedCategory("ALL");
                }}
                className="mt-4 px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-colors"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredBulletins.map((bulletin) => {
                const badge = getCategoryBadge(bulletin.category);
                return (
                  <div
                    key={bulletin.id}
                    className="rounded-2xl glass-panel bg-slate-900/70 border border-slate-800 p-5 hover:border-slate-700 hover:bg-slate-900/90 transition-all flex flex-col justify-between group shadow-lg"
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                        <span
                          className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${badge.className}`}
                        >
                          {badge.label}
                        </span>

                        {bulletin.deadline ? (
                          <div className="flex items-center gap-1 text-[11px] text-amber-400 font-medium bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                            <Calendar className="w-3 h-3" />
                            <span>
                              Deadline: {new Date(bulletin.deadline).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>Ongoing Advisory</span>
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-cyan-400 transition-colors mb-2 leading-snug">
                        <Link href={`/bulletins/${bulletin.slug}`}>{bulletin.title}</Link>
                      </h3>

                      {/* Benefits & Audience Tags */}
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        {bulletin.benefits && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-xs font-semibold">
                            <Award className="w-3 h-3 shrink-0" />
                            <span className="truncate max-w-[280px]">{bulletin.benefits}</span>
                          </span>
                        )}

                        {bulletin.targetAudience && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[11px]">
                            <Users className="w-3 h-3" />
                            <span className="truncate max-w-[200px]">{bulletin.targetAudience}</span>
                          </span>
                        )}
                      </div>

                      {/* Summary */}
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4 line-clamp-3">
                        {bulletin.summary}
                      </p>
                    </div>

                    {/* Bottom Actions */}
                    <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                        <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                        <span className="truncate max-w-[150px] sm:max-w-[200px]">
                          {bulletin.officialPortalName || "Verified Government Channel"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {bulletin.officialLink && (
                          <a
                            href={bulletin.officialLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                            title="Open Official Portal"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}

                        <Link
                          href={`/bulletins/${bulletin.slug}`}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 text-xs font-semibold transition-all"
                        >
                          <span>Read Guide</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Educational Advisory Highlights / FAQ Box */}
        <div className="mt-14 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <School className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                Public Career Guidance & Candidate FAQs
              </h3>
              <p className="text-xs text-slate-400">
                Official pointers to help candidates prevent application rejection and maximize financial aid.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs text-slate-300">
            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800">
              <h4 className="font-semibold text-white mb-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>NPCI Aadhaar DBT Seeding</span>
              </h4>
              <p className="text-slate-400 leading-relaxed">
                Ensure your bank account is mapped on the NPCI server, not merely KYC-linked. Check your status at myaadhaar.uidai.gov.in under 'Bank Seeding Status' to avoid scholarship disbursement failure.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800">
              <h4 className="font-semibold text-white mb-2 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Strict Examination Dress Code</span>
              </h4>
              <p className="text-slate-400 leading-relaxed">
                KEA and state examination boards mandate half-sleeve clothing and flat slippers. Shoes, boots, full-sleeve shirts, and metallic accessories result in gate debarment.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800">
              <h4 className="font-semibold text-white mb-2 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-cyan-400" />
                <span>Free Competitive Exam Coaching</span>
              </h4>
              <p className="text-slate-400 leading-relaxed">
                Karnataka Social Welfare & BCWD provide 100% free residential coaching for UPSC, KAS, SSC, and Banking exams with up to ₹10,000/month stipend through an annual state entrance test.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BulletinsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin" />
        </div>
      }
    >
      <BulletinsContent />
    </Suspense>
  );
}
