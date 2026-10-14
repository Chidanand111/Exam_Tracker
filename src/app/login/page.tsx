"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { LogIn, ShieldCheck, UserCheck } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(
    searchParams.get("error") === "admin_required"
      ? "Administrator privileges required. Please sign in with an authorized Officer account."
      : ""
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const endpoint = isRegistering ? "/api/auth/register" : "/api/auth/login";
      const payload = isRegistering ? { name, email, password } : { email, password };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Authentication failed");
      }

      const destination = returnUrl || (data.user?.role === "ADMIN" ? "/admin" : "/my-exams");
      router.push(destination);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail: string, demoPass: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: demoEmail, password: demoPass }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Demo login failed");
      
      const destination = returnUrl || (data.user?.role === "ADMIN" ? "/admin" : "/my-exams");
      router.push(destination);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Brand header */}
        <div className="text-center mb-8">
          <div className="inline-flex w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 via-blue-600 to-emerald-500 p-[1.5px] shadow-md mb-4">
            <div className="w-full h-full bg-[#07090f] rounded-[10px] flex items-center justify-center font-black text-white text-lg">
              BE
            </div>
          </div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
            {isRegistering ? "Create your account" : "Sign in to BharatExam"}
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1.5">
            Track government recruitment stages, shifts, and admit cards
          </p>
        </div>

        <div className="card-surface p-6 space-y-5">
          {/* 1-Click Demo Evaluation */}
          <div className="p-4 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-default)] space-y-2.5">
            <span className="text-xs font-semibold text-[var(--text-tertiary)] block text-center uppercase tracking-wider">
              Quick demo — no account needed
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDemoLogin("aspirant@bharatexam.in", "Aspirant@123")}
                className="p-2.5 rounded-lg bg-[var(--semantic-info-bg)] hover:bg-[rgba(59,130,246,0.18)] border border-[var(--semantic-info-border)] text-[var(--accent-400)] text-sm font-semibold flex flex-col items-center justify-center gap-1 transition-colors"
              >
                <UserCheck className="w-4 h-4" />
                <span>Aspirant</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin("admin@bharatexam.in", "Admin@123")}
                className="p-2.5 rounded-lg bg-[var(--semantic-warning-bg)] hover:bg-[rgba(245,158,11,0.18)] border border-[var(--semantic-warning-border)] text-amber-400 text-sm font-semibold flex flex-col items-center justify-center gap-1 transition-colors"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Admin</span>
              </button>
            </div>
          </div>

          {error && (
            <div role="alert" className="p-3 rounded-lg bg-[var(--semantic-danger-bg)] border border-[var(--semantic-danger-border)] text-sm text-[var(--semantic-danger)]">
              {error}
            </div>
          )}

          {/* Auth Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegistering && (
              <div>
                <label htmlFor="name" className="form-label">Full Name</label>
                <input
                  id="name"
                  type="text"
                  required
                  autoComplete="name"
                  placeholder="e.g. Ramesh Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="form-input"
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="form-label">Email address</label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                placeholder="e.g. aspirant@bharatexam.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
              />
            </div>

            <div>
              <label htmlFor="password" className="form-label">Password</label>
              <input
                id="password"
                type="password"
                required
                autoComplete={isRegistering ? "new-password" : "current-password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-lg w-full"
            >
              {loading ? "Processing…" : isRegistering ? "Create account" : "Sign in"}
            </button>
          </form>

          <div className="text-center pt-2 border-t border-[var(--border-subtle)] text-sm text-[var(--text-secondary)]">
            {isRegistering ? (
              <span>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => setIsRegistering(false)}
                  className="text-[var(--accent-400)] hover:underline font-semibold"
                >
                  Sign in
                </button>
              </span>
            ) : (
              <span>
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  onClick={() => setIsRegistering(true)}
                  className="text-[var(--accent-400)] hover:underline font-semibold"
                >
                  Create account
                </button>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-xs text-slate-500">
          Loading authentication...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
