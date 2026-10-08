"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Compass,
  GraduationCap,
  BookmarkCheck,
  Bell,
  ShieldCheck,
  Shield,
  LogIn,
  LogOut,
  User,
  ChevronDown,
  CheckCircle2,
  ExternalLink,
  Star,
  Scale,
  BookOpen,
} from "lucide-react";
import { UserSession } from "@/types";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UserSession | null>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  useEffect(() => {
    fetchUser();
    fetchNotifications();
  }, [pathname]);

  const fetchUser = async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      setUser(data.user);
    } catch {
      setUser(null);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      const data = await res.json();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch {
      // ignore
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setShowUserDropdown(false);
    router.push("/");
    router.refresh();
  };

  const handleQuickLogin = async (email: string, pass: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: pass }),
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setShowUserDropdown(false);
        router.refresh();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const markAllRead = async () => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAllRead: true }),
    });
    setUnreadCount(0);
  };

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-blue-600 to-emerald-500 p-[2px] shadow-lg shadow-blue-500/10">
              <div className="w-full h-full bg-[#0a0f1d] rounded-[10px] flex items-center justify-center">
                <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-white to-emerald-400 text-lg">
                  BE
                </span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-white text-lg tracking-tight group-hover:text-blue-400 transition-colors">
                  BharatExam
                </span>
                <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  Tracker
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block">
                Official Discovery & Stage Progression
              </p>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/discover"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === "/discover"
                  ? "bg-blue-600/15 text-blue-400 border border-blue-500/30"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>Discover</span>
            </Link>

            <Link
              href="/discover?fresher=true"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname.includes("fresher=true")
                  ? "bg-emerald-600/15 text-emerald-400 border border-emerald-500/30"
                  : "text-slate-300 hover:text-emerald-300 hover:bg-slate-800/60"
              }`}
            >
              <GraduationCap className="w-4 h-4 text-emerald-400" />
              <span>Graduate Freshers</span>
            </Link>

            <Link
              href="/bulletins"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname.startsWith("/bulletins")
                  ? "bg-cyan-600/15 text-cyan-400 border border-cyan-500/30"
                  : "text-slate-300 hover:text-cyan-300 hover:bg-slate-800/60"
              }`}
            >
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <span>Career Bulletins</span>
            </Link>

            <Link
              href="/shortlist"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === "/shortlist"
                  ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                  : "text-slate-300 hover:text-amber-300 hover:bg-slate-800/60"
              }`}
            >
              <Star className="w-4 h-4 text-amber-400" />
              <span>Shortlist</span>
            </Link>

            <Link
              href="/compare"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === "/compare"
                  ? "bg-indigo-600/15 text-indigo-400 border border-indigo-500/30"
                  : "text-slate-300 hover:text-indigo-300 hover:bg-slate-800/60"
              }`}
            >
              <Scale className="w-4 h-4 text-indigo-400" />
              <span>Compare</span>
            </Link>

            <Link
              href="/my-exams"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === "/my-exams"
                  ? "bg-blue-600/15 text-blue-400 border border-blue-500/30"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <BookmarkCheck className="w-4 h-4" />
              <span>My Exams</span>
            </Link>

            <Link
              href="/profile"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === "/profile"
                  ? "bg-purple-600/15 text-purple-400 border border-purple-500/30"
                  : "text-slate-300 hover:text-purple-300 hover:bg-slate-800/60"
              }`}
            >
              <User className="w-4 h-4 text-purple-400" />
              <span>Candidate Profile</span>
            </Link>

            {user?.role === "ADMIN" && (
              <Link
                href="/admin"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname.startsWith("/admin")
                    ? "bg-amber-600/15 text-amber-400 border border-amber-500/30"
                    : "text-slate-400 hover:text-amber-300 hover:bg-slate-800/60"
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Admin Console</span>
              </Link>
            )}
          </nav>

          {/* Right Action Icons & Auth Profile */}
          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  if (!showNotifications && unreadCount > 0) markAllRead();
                }}
                className="relative p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/70 transition-colors focus:outline-none"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-slate-900">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Popover */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl glass-panel bg-slate-900/95 border border-slate-700 shadow-2xl p-4 z-50">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-blue-400" />
                      <span className="font-semibold text-white text-sm">Notifications</span>
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllRead}
                        className="text-xs text-blue-400 hover:underline font-medium"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  <div className="mt-2 max-h-72 overflow-y-auto space-y-2">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-6">
                        No notifications yet.
                      </p>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`p-2.5 rounded-xl border text-xs transition-colors ${
                            n.isRead
                              ? "bg-slate-800/40 border-slate-800/60 text-slate-300"
                              : "bg-blue-950/30 border-blue-500/30 text-white"
                          }`}
                        >
                          <div className="font-semibold text-slate-200">{n.title}</div>
                          <p className="text-slate-400 mt-0.5 leading-relaxed">{n.message}</p>
                          {n.linkUrl && (
                            <Link
                              href={n.linkUrl}
                              onClick={() => setShowNotifications(false)}
                              className="inline-flex items-center gap-1 text-[11px] text-blue-400 hover:underline mt-1.5 font-medium"
                            >
                              <span>View details</span>
                              <ExternalLink className="w-3 h-3" />
                            </Link>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Dropdown / Switch */}
            <div className="relative">
              {user ? (
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-sm font-medium text-white transition-colors"
                >
                  <div className="w-6 h-6 rounded-full bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-300 text-xs font-bold">
                    {user.name[0]}
                  </div>
                  <span className="hidden sm:inline-block max-w-[120px] truncate">{user.name}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors shadow-sm shadow-blue-500/20"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Login</span>
                </Link>
              )}

              {/* User Dropdown Menu */}
              {showUserDropdown && user && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl glass-panel bg-slate-900/95 border border-slate-700 shadow-2xl p-3 z-50">
                  <div className="px-2 py-2 border-b border-slate-800">
                    <p className="font-semibold text-white text-sm truncate">{user.name}</p>
                    <p className="text-xs text-slate-400 truncate">{user.email}</p>
                    <span className="inline-block mt-1 text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      {user.role} Account
                    </span>
                  </div>

                  <div className="py-2 space-y-1">
                    <Link
                      href="/my-exams"
                      onClick={() => setShowUserDropdown(false)}
                      className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800"
                    >
                      <BookmarkCheck className="w-4 h-4 text-blue-400" />
                      <span>My Tracked Applications</span>
                    </Link>

                    <Link
                      href="/profile"
                      onClick={() => setShowUserDropdown(false)}
                      className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800"
                    >
                      <User className="w-4 h-4 text-purple-400" />
                      <span>Candidate Profile & Preferences</span>
                    </Link>

                    <Link
                      href="/bulletins"
                      onClick={() => setShowUserDropdown(false)}
                      className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800"
                    >
                      <BookOpen className="w-4 h-4 text-cyan-400" />
                      <span>Career & Educational Bulletins</span>
                    </Link>

                    <Link
                      href="/privacy-center"
                      onClick={() => setShowUserDropdown(false)}
                      className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800"
                    >
                      <Shield className="w-4 h-4 text-emerald-400" />
                      <span>Privacy Center & Data Export</span>
                    </Link>

                    {user.role === "ADMIN" && (
                      <Link
                        href="/admin"
                        onClick={() => setShowUserDropdown(false)}
                        className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-amber-400 hover:text-amber-300 hover:bg-slate-800"
                      >
                        <ShieldCheck className="w-4 h-4 text-amber-400" />
                        <span>Admin Console & Exam Publisher</span>
                      </Link>
                    )}

                    {/* Quick Demo Switchers */}
                    <div className="pt-2 border-t border-slate-800">
                      <p className="px-2 text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1">
                        Switch Demo Role
                      </p>
                      <button
                        onClick={() => handleQuickLogin("aspirant@bharatexam.in", "Aspirant@123")}
                        className="w-full text-left flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-slate-300 hover:bg-slate-800 hover:text-emerald-400"
                      >
                        <span>Aspirant (Fresher Demo)</span>
                        {user.email === "aspirant@bharatexam.in" && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        )}
                      </button>
                      <button
                        onClick={() => handleQuickLogin("admin@bharatexam.in", "Admin@123")}
                        className="w-full text-left flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-slate-300 hover:bg-slate-800 hover:text-amber-400"
                      >
                        <span>Admin (Officer Demo)</span>
                        {user.email === "admin@bharatexam.in" && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-rose-400 hover:bg-rose-500/10"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
