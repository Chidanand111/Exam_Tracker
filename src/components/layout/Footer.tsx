import React from "react";
import Link from "next/link";
import { ShieldCheck, ExternalLink, AlertTriangle, FileText, CheckCircle } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-[#070b14] mt-20 text-xs text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Column 1: Brand & Mission */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-base">BharatExam Tracker</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Official Integrity Standard
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-lg">
              Dedicated discovery, stage progression tracking, and personal reminder platform designed specifically for graduates, freshers, and government recruitment aspirants in India.
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-400 pt-2">
              <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                Verified Official Portals Only
              </span>
              <span className="flex items-center gap-1.5 text-blue-400 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                No Data Fabrication
              </span>
            </div>
          </div>

          {/* Column 2: Official Sources Portals */}
          <div>
            <h4 className="text-slate-200 font-semibold text-xs tracking-wider uppercase mb-3">
              Official Government Portals
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="https://ssc.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-400 flex items-center gap-1.5"
                >
                  <span>Staff Selection Commission (SSC)</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a
                  href="https://ibps.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-400 flex items-center gap-1.5"
                >
                  <span>Institute of Banking Personnel (IBPS)</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a
                  href="https://upsc.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-400 flex items-center gap-1.5"
                >
                  <span>Union Public Service Commission (UPSC)</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a
                  href="https://indianrailways.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-400 flex items-center gap-1.5"
                >
                  <span>Railway Recruitment Boards (RRB)</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Trust & Quick Links */}
          <div>
            <h4 className="text-slate-200 font-semibold text-xs tracking-wider uppercase mb-3">
              Platform Sections
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/discover" className="hover:text-blue-400">
                  Exam Discovery Hub
                </Link>
              </li>
              <li>
                <Link href="/discover?fresher=true" className="hover:text-emerald-400">
                  Graduate Freshers Hub
                </Link>
              </li>
              <li>
                <Link href="/my-exams" className="hover:text-blue-400">
                  My Tracked Applications
                </Link>
              </li>
              <li>
                <Link href="/help" className="hover:text-blue-400">
                  Support & Help Center
                </Link>
              </li>
              <li>
                <Link href="/trust" className="hover:text-emerald-400">
                  Trust & Transparency Policy
                </Link>
              </li>
              <li>
                <Link href="/privacy-center" className="hover:text-purple-400">
                  Privacy Center & Vault
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-amber-400">
                  Official Source Monitoring
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Mandatory Official Application Disclosure Banner */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-semibold text-slate-300">Public Service & Safety Disclaimer: </span>
            BharatExam Tracker provides discovery and progression tools. All actual applications are submitted strictly on the official portals of respective commissions (e.g., ssc.gov.in, ibps.in, upsc.gov.in). This platform never collects application fees or submits forms on behalf of candidates. Information is kept synchronized with official notifications and corrigendums.
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500">
          <p>© 2026 BharatExam Tracker. Built for Indian Graduates & Freshers.</p>
          <p className="mt-2 sm:mt-0">Last Verified from Official Sources: Today, 2026</p>
        </div>
      </div>
    </footer>
  );
}
