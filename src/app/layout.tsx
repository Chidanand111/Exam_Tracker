import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

import OfflineBanner from "@/components/network/OfflineBanner";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "BharatExam Tracker | Indian Government Exam & Recruitment Discovery",
  description:
    "Discover verified government exams, understand exact eligibility and in-hand salary, apply through official commission websites, track dynamic exam stages, and get instant reminders.",
  manifest: "/manifest.json",
  themeColor: "#0f172a",
  keywords: [
    "Government Exams India",
    "SSC CGL 2026",
    "IBPS PO",
    "Railway RRB NTPC",
    "Graduate Fresher Govt Jobs",
    "Sarkari Result Official Tracker",
    "Exam Stage Progression",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans bg-[#090d16] text-slate-100 flex flex-col min-h-screen antialiased`}>
        {/* Skip to Main Content Link for Keyboard Accessibility */}
        <a href="#main-content" className="skip-to-content">
          Skip to main content
        </a>
        <OfflineBanner />
        <Navbar />
        <main id="main-content" tabIndex={-1} className="flex-1 w-full focus:outline-none">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
