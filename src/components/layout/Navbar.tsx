"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Compass,
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
  BookOpen,
  Menu,
  X,
  GraduationCap,
} from "lucide-react";
import { UserSession } from "@/types";

// Primary navigation links — capped at 5 for clarity
const PRIMARY_NAV = [
  { href: "/discover", label: "Discover", match: (p: string) => p === "/discover" || p.startsWith("/discover") },
  { href: "/discover?fresher=true", label: "For Freshers", match: (p: string) => false },
  { href: "/bulletins", label: "Bulletins", match: (p: string) => p.startsWith("/bulletins") },
  { href: "/my-exams", label: "My Exams", match: (p: string) => p === "/my-exams" },
  { href: "/shortlist", label: "Shortlist", match: (p: string) => p === "/shortlist" },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UserSession | null>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const userDropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchUser();
    fetchNotifications();
  }, [pathname]);

  // Close dropdowns on route change
  useEffect(() => {
    setShowNotifications(false);
    setShowUserDropdown(false);
    setMobileOpen(false);
  }, [pathname]);

  // Close mobile drawer on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileOpen(false);
        setShowNotifications(false);
        setShowUserDropdown(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Prevent body scroll when mobile nav is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (userDropRef.current && !userDropRef.current.contains(e.target as Node)) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
      // silent
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
    <>
      <header className="app-header sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">

            {/* ── Logo ── */}
            <Link href="/" className="flex items-center gap-2.5 group shrink-0">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 via-blue-600 to-emerald-500 p-[1.5px] shadow-sm">
                <div className="w-full h-full bg-[#07090f] rounded-[7px] flex items-center justify-center">
                  <span className="font-black text-white text-sm tracking-tight">BE</span>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-[var(--text-primary)] text-sm leading-none group-hover:text-[var(--accent-400)] transition-colors">
                  BharatExam
                </span>
                <span className="text-[10px] text-[var(--text-tertiary)] leading-none mt-0.5 hidden sm:block">
                  Tracker
                </span>
              </div>
            </Link>

            {/* ── Primary navigation (desktop) ── */}
            <nav className="hidden md:flex items-center gap-0.5" aria-label="Main navigation">
              {PRIMARY_NAV.map((item) => {
                const isActive = item.match(pathname);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`nav-link ${isActive ? "active" : ""}`}
                  >
                    {item.label}
                  </Link>
                );
              })}
              {user?.role === "ADMIN" && (
                <Link
                  href="/admin"
                  className={`nav-link ${pathname.startsWith("/admin") ? "active" : ""}`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Admin
                </Link>
              )}
            </nav>

            {/* ── Right controls ── */}
            <div className="flex items-center gap-2">

              {/* Notification bell */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => {
                    setShowNotifications(!showNotifications);
                    setShowUserDropdown(false);
                    if (!showNotifications && unreadCount > 0) markAllRead();
                  }}
                  className="relative p-2 rounded-md text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition-colors"
                  aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
                  aria-expanded={showNotifications}
                  aria-haspopup="true"
                >
                  <Bell className="w-4.5 h-4.5" style={{ width: "18px", height: "18px" }} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[var(--semantic-danger)] text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-[var(--bg-base)]">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div
                    role="dialog"
                    aria-label="Notifications"
                    className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl glass-panel border border-[var(--border-default)] shadow-[var(--shadow-lg)] p-4 z-50"
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
                      <span className="font-semibold text-[var(--text-primary)] text-sm">Notifications</span>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllRead}
                          className="text-xs text-[var(--accent-400)] hover:text-[var(--accent-500)] font-medium transition-colors"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="mt-2 max-h-72 overflow-y-auto space-y-1.5">
                      {notifications.length === 0 ? (
                        <p className="text-sm text-[var(--text-tertiary)] text-center py-8">
                          No notifications yet.
                        </p>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            className={`p-3 rounded-lg border text-sm transition-colors ${
                              n.isRead
                                ? "bg-[var(--bg-surface)] border-[var(--border-subtle)] text-[var(--text-secondary)]"
                                : "bg-[var(--semantic-info-bg)] border-[var(--semantic-info-border)] text-[var(--text-primary)]"
                            }`}
                          >
                            <div className="font-medium text-[var(--text-primary)]">{n.title}</div>
                            <p className="text-[var(--text-secondary)] mt-0.5 text-xs leading-relaxed">{n.message}</p>
                            {n.linkUrl && (
                              <Link
                                href={n.linkUrl}
                                onClick={() => setShowNotifications(false)}
                                className="inline-flex items-center gap-1 text-xs text-[var(--accent-400)] hover:underline mt-1.5 font-medium"
                              >
                                View details
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

              {/* User menu */}
              <div className="relative" ref={userDropRef}>
                {user ? (
                  <button
                    onClick={() => {
                      setShowUserDropdown(!showUserDropdown);
                      setShowNotifications(false);
                    }}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[var(--bg-subtle)] hover:bg-[var(--bg-overlay)] border border-[var(--border-default)] text-sm font-medium text-[var(--text-primary)] transition-colors"
                    aria-expanded={showUserDropdown}
                    aria-haspopup="true"
                  >
                    <div className="w-6 h-6 rounded-full bg-[var(--accent-900)] border border-[var(--accent-700)] flex items-center justify-center text-[var(--accent-400)] text-xs font-bold shrink-0">
                      {user.name[0]?.toUpperCase()}
                    </div>
                    <span className="hidden sm:block max-w-[100px] truncate text-sm">{user.name}</span>
                    <ChevronDown className="w-3 h-3 text-[var(--text-tertiary)] shrink-0" />
                  </button>
                ) : (
                  <Link
                    href="/login"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--accent-600)] hover:bg-[var(--accent-500)] text-white text-sm font-medium transition-colors"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Sign in</span>
                  </Link>
                )}

                {showUserDropdown && user && (
                  <div
                    role="menu"
                    className="absolute right-0 mt-2 w-60 rounded-xl glass-panel border border-[var(--border-default)] shadow-[var(--shadow-lg)] p-2 z-50"
                  >
                    {/* Account info */}
                    <div className="px-2.5 py-2.5 border-b border-[var(--border-subtle)] mb-1.5">
                      <p className="font-semibold text-[var(--text-primary)] text-sm truncate">{user.name}</p>
                      <p className="text-xs text-[var(--text-tertiary)] truncate">{user.email}</p>
                      <span className="inline-block mt-1.5 text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-[var(--semantic-info-bg)] text-[var(--accent-400)] border border-[var(--semantic-info-border)]">
                        {user.role}
                      </span>
                    </div>

                    {/* Menu items */}
                    <div className="space-y-0.5">
                      {[
                        { href: "/my-exams", icon: BookmarkCheck, label: "My Tracked Applications" },
                        { href: "/profile", icon: User, label: "Candidate Profile" },
                        { href: "/bulletins", icon: BookOpen, label: "Career Bulletins" },
                        { href: "/shortlist", icon: GraduationCap, label: "Shortlisted Exams" },
                        { href: "/privacy-center", icon: Shield, label: "Privacy Center" },
                      ].map(({ href, icon: Icon, label }) => (
                        <Link
                          key={href}
                          href={href}
                          role="menuitem"
                          onClick={() => setShowUserDropdown(false)}
                          className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition-colors"
                        >
                          <Icon className="w-3.5 h-3.5 shrink-0" />
                          {label}
                        </Link>
                      ))}

                      {user.role === "ADMIN" && (
                        <Link
                          href="/admin"
                          role="menuitem"
                          onClick={() => setShowUserDropdown(false)}
                          className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-sm text-amber-400 hover:text-amber-300 hover:bg-[var(--bg-subtle)] transition-colors font-medium"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                          Admin Console
                        </Link>
                      )}
                    </div>

                    {/* Demo role switcher */}
                    <div className="mt-1.5 pt-1.5 border-t border-[var(--border-subtle)] space-y-0.5">
                      <p className="px-2.5 text-[10px] uppercase tracking-widest text-[var(--text-disabled)] font-semibold mb-1">
                        Demo Roles
                      </p>
                      {[
                        { email: "aspirant@bharatexam.in", pass: "Aspirant@123", label: "Aspirant (Fresher)" },
                        { email: "admin@bharatexam.in", pass: "Admin@123", label: "Admin (Officer)" },
                      ].map(({ email, pass, label }) => (
                        <button
                          key={email}
                          onClick={() => handleQuickLogin(email, pass)}
                          role="menuitem"
                          className="w-full text-left flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)] transition-colors"
                        >
                          <span>{label}</span>
                          {user.email === email && <CheckCircle2 className="w-3.5 h-3.5 text-[var(--semantic-success)]" />}
                        </button>
                      ))}
                    </div>

                    {/* Sign out */}
                    <div className="mt-1.5 pt-1.5 border-t border-[var(--border-subtle)]">
                      <button
                        onClick={handleLogout}
                        role="menuitem"
                        className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-sm text-[var(--semantic-danger)] hover:bg-[var(--semantic-danger-bg)] transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile menu toggle */}
              <button
                className="md:hidden p-2 rounded-md text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition-colors"
                onClick={() => setMobileOpen(true)}
                aria-label="Open navigation menu"
                aria-expanded={mobileOpen}
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── Mobile navigation drawer ── */}
      {mobileOpen && (
        <>
          {/* Overlay */}
          <div
            className="mobile-nav-overlay"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer */}
          <div
            className="mobile-nav-drawer open"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
          >
            {/* Drawer header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-subtle)]">
              <Link href="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-500 via-blue-600 to-emerald-500 p-[1.5px]">
                  <div className="w-full h-full bg-[#07090f] rounded-[6px] flex items-center justify-center">
                    <span className="font-black text-white text-xs">BE</span>
                  </div>
                </div>
                <span className="font-bold text-[var(--text-primary)] text-sm">BharatExam</span>
              </Link>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-2 rounded-md text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition-colors"
                aria-label="Close navigation menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Nav links */}
            <nav className="flex-1 px-3 py-4 space-y-0.5" aria-label="Mobile navigation">
              {PRIMARY_NAV.map((item) => {
                const isActive = item.match(pathname);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-[var(--semantic-info-bg)] text-[var(--accent-400)] border border-[var(--semantic-info-border)]"
                        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
              {user?.role === "ADMIN" && (
                <Link
                  href="/admin"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-amber-400 hover:bg-[var(--bg-subtle)] transition-colors"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Admin Console
                </Link>
              )}
            </nav>

            {/* Auth footer */}
            <div className="px-3 pb-6 border-t border-[var(--border-subtle)] pt-4">
              {user ? (
                <div className="space-y-1">
                  <div className="px-3 py-2 text-sm">
                    <p className="font-medium text-[var(--text-primary)]">{user.name}</p>
                    <p className="text-xs text-[var(--text-tertiary)]">{user.email}</p>
                  </div>
                  <button
                    onClick={() => { setMobileOpen(false); handleLogout(); }}
                    className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-[var(--semantic-danger)] hover:bg-[var(--semantic-danger-bg)] transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[var(--accent-600)] hover:bg-[var(--accent-500)] text-white text-sm font-medium transition-colors w-full"
                >
                  <LogIn className="w-4 h-4" />
                  Sign in
                </Link>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
