import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "BharatExam Tracker | Indian Government Exam & Recruitment Discovery",
  description:
    "Discover verified government exams, understand exact eligibility and in-hand salary, apply through official commission websites, track dynamic exam stages, and get instant reminders.",
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
        <Navbar />
        <main className="flex-1 w-full">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
