# BharatExam Tracker

> **Indian Government Exam & Recruitment Discovery + Personal Application Tracking Platform**  
> *Designed for Graduates, Freshers, and Aspirants with Dynamic Stage Progression & Official Source Integrity*

---

## 🌟 Overview

**BharatExam Tracker** is a production-ready web application built to help Indian graduates and freshers discover government exams, verify eligibility and pay scales, apply through official commission websites, track their applications through dynamic selection rounds, and receive timely alerts.

Unlike typical static job boards, BharatExam Tracker enforces **strict official data integrity** (zero fabricated data, direct `.gov.in` linking), generic arbitrary stages ($N$-stage pipelines like Tier 1 $\rightarrow$ Tier 2 $\rightarrow$ DV or CBT 1 $\rightarrow$ CBT 2 $\rightarrow$ CBAT), multiple shift management, and a dynamic qualification state machine.

---

## 🚀 Key Features

1. **Graduate & Fresher Discovery Hub**:
   - Tailored filters for **Any Graduate, B.A., B.Com., B.Sc., B.Tech, B.E., BCA, MCA, MBA**.
   - Prominent **Freshers Only (0 Years Experience Required)** filter.
   - Transparent sorting: Newly Released, Closing Soon, Highest Vacancies, and In-Hand Salary.
2. **Official Application Redirection**:
   - Prominent **"Apply Officially"** action that opens official commission portals (e.g. `ssc.gov.in`, `ibps.in`) in a new tab without disguising third-party URLs.
   - **"I've Applied"** button to track applications under My Exams.
3. **Generic Dynamic Stage Progression**:
   - Arbitrary $N$-stage pipelines (no hardcoded "prelims/mains").
   - Ordering governed by `stage.stageOrder` $\rightarrow$ `stage.stageOrder + 1`.
   - **Dynamic Unlock**: Selecting **"Selected for Next Stage"** unlocks Round 2 (e.g., Tier 2 / Mains / Skill Test) with new schedules and admit card alerts.
   - Selecting **"Not Selected"** gracefully marks the application unsuccessful without unlocking future rounds.
4. **Multiple Exam Dates & Shift Management**:
   - Supports exams spread across multiple dates with multiple shifts per day (Shift 1 Morning, Shift 2 Afternoon, Shift 3 Evening).
   - Aspirants can assign their personal assigned slot and exam center.
5. **Admit Card & Result Tracking**:
   - Instant status badges (🟢 Active, 🟡 Upcoming, 🔵 Updated, 🔴 Closed, ⚪ Not Announced).
   - Direct official admit card download buttons.
   - User result evaluation prompt (*"What is your result?"*).
6. **Official Source Monitoring & Change Detection**:
   - Automated source monitor covering SSC, UPSC, IBPS, Railways (RRB), ISRO, DRDO, and PSUs.
   - SHA-256 hash checks and Corrigendum detection (e.g. `appDeadline` extended, vacancies updated).
7. **AI Document Ingestion Pipeline**:
   - Ingestion workflow for official notification PDFs with strict distinction between **Explicit**, **Inferred**, and **Not Specified** information.
8. **Personal Reminders**:
   - Presets for 1 day before, 3 days before, 7 days before, or custom date/time.
9. **Application Preparation Checklist**:
   - Dynamic preparation checklists across 4 phases: *Before Applying*, *Document Prep*, *Application Form*, and *Post Submission*.
   - Universal defaults + 139 recruitment-tailored official checklist items + ability for aspirants to add personal custom checklist items.
10. **Application Reference & Receipt Vault**:
   - Secure private record for application numbers, registration numbers, roll numbers, portal IDs, payment references, transaction IDs, submission dates, PDFs, and receipts.
   - 1-click clipboard copy for all identifiers.
   - Strict non-governmental verification disclosure.
11. **Recruitment Comparison Workspace**:
   - Multi-opportunity side-by-side comparative matrix across 16 core attributes (eligibility, age brackets, experience, vacancies, pay scales, dates, shifts, stages, official portal links).
   - Strict adherence to neutral comparison (zero ranking scores or winner determinations).
12. **Saved Searches & Instant Presets**:
   - Save custom filter configurations (degrees, sectors, salaries, locations, fresher eligibility).
   - Fast presets for *Freshers ₹50k+*, *B.Tech Govt Jobs*, *Central Ministries*, and *Banking Opportunities*.
13. **New-Match Vacancy Discovery**:
   - Automated notification triggers alerting aspirants when new vacancies match their saved criteria without taking external actions.
14. **Bookmarking & 4-Stage Shortlisting**:
   - Dedicated `/shortlist` workspace tracking opportunities across `Bookmarked`, `Interested`, `Applied`, and `Completed`.
   - Clear segregation between bookmarks and actual submitted applications.
15. **17-Factor Transparent Eligibility Engine**:
   - Multi-tier compatibility classification (`Eligible`, `Potentially Eligible`, `Eligibility Unclear`, `Not Eligible`).
   - Detailed breakdown explaining degree, branch, age as on cut-off date, domicile, reservation, and fee relaxations with official notification clauses.

---

## 🛠 Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Lucide React
- **Backend**: Next.js Route Handlers & Server Logic
- **Database**: PostgreSQL (Hosted on Neon serverless database)
- **ORM**: Prisma Client with pooled connection (`pgbouncer=true`) and direct migration support
- **Auth**: Salted `bcryptjs` password hashing with HTTP-only JWT session cookies

---

## 📦 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/Chidanand111/Exam_Tracker.git
cd Exam_Tracker
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Fill in your database connection string and secret key.

### 4. Push database schema & seed authentic recruitments
```bash
npx prisma db push
node scripts/seed.mjs
```

### 5. Start the development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🚀 Vercel Deployment Configuration

When deploying on Vercel, ensure the following Environment Variables are configured in your Vercel Project Settings (**Settings** $\rightarrow$ **Environment Variables**):

| Key | Description | Example |
|---|---|---|
| `DATABASE_URL` | Neon pooled connection string with `pgbouncer=true` | `postgresql://user:pass@ep-xyz-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require&pgbouncer=true` |
| `DIRECT_URL` | Neon direct connection string (no pgbouncer) | `postgresql://user:pass@ep-xyz-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require` |
| `JWT_SECRET` | Secret key for JWT session cookies | `your-secure-secret-key` |
| `NEXT_PUBLIC_APP_URL` | Canonical public URL of your deployment | `https://exam-tracker-blue.vercel.app` |

---

## 👤 Pre-configured Demo Accounts

| Role | Email | Password | Pre-configured State |
|---|---|---|---|
| **Fresher Aspirant** | `aspirant@bharatexam.in` | `Aspirant@123` | Enrolled in SSC CGL 2026 (Tier 1 admit card out, Shift 2 slot assigned) & IBPS PO 2026 (Prelims result available to test qualification). |
| **Portal Officer (Admin)** | `admin@bharatexam.in` | `Admin@123` | Access to `/admin` to monitor sources, run crawler audits, review AI extractions, and broadcast corrigendums. |

*(Also accessible via 1-click buttons on the `/login` page).*

---

## 📜 Safety & Trust Policy
BharatExam Tracker acts as an independent discovery and stage tracking tool. All actual applications are submitted strictly on the official portals of respective commissions (`ssc.gov.in`, `ibps.in`, etc.). The platform never collects application fees or submits forms on behalf of candidates.
