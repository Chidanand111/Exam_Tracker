# BharatExam Tracker

> **Indian Government Exam & Recruitment Discovery + Personal Application Tracking Platform**  
> *Engineered for Graduates, Freshers, and Aspirants with Dynamic Stage Progression & Official Source Integrity*

---

## 🌟 Overview

**BharatExam Tracker** is a production-grade web application engineered to help Indian graduates and freshers discover government exams, verify eligibility and pay scales, apply through official commission websites, track their applications through dynamic selection rounds, and receive timely alerts.

Unlike typical static job boards, BharatExam Tracker enforces **strict official data integrity** (zero fabricated data, direct `.gov.in` linking), generic arbitrary stages ($N$-stage pipelines like Tier 1 $\rightarrow$ Tier 2 $\rightarrow$ DV or CBT 1 $\rightarrow$ CBT 2 $\rightarrow$ CBAT), multiple shift management, and a dynamic qualification state machine.

---

## 🏗️ Architecture Overview

The platform is structured with strict separation between presentation, domain logic, data persistence, and error resilience:

```
src/
├── app/                  # Next.js App Router (pages, layouts, error boundaries, API routes)
│   ├── error.tsx         # Root error boundary with digest tracking and recovery
│   └── not-found.tsx     # Custom 404 page
├── components/           # Presentation UI components grouped by domain (admin, vault, checklists)
├── config/               # Centralized runtime environment validation (env.ts)
├── docs/                 # State management and disaster recovery architecture
├── hooks/                # Custom React hooks with request cancellation and optimistic rollbacks
├── lib/                  # Shared domain engines (eligibility, profile matching, auth, apiClient)
├── server/               # Backend architecture
│   ├── repositories/     # Prisma data access queries (recruitment, shortlist)
│   ├── services/         # Domain services and coordination
│   └── utils/            # api-handler.ts with centralized error logging and secret redaction
├── types/                # Central TypeScript definitions and models
└── validators/           # Runtime request validators and schema assertions
```

For in-depth architectural details, see:
- 📖 [docs/architecture.md](docs/architecture.md) — Layered architecture, data flow, and separation of concerns.
- 📖 [docs/development.md](docs/development.md) — Engineering standards, naming conventions, and contribution rules.
- 📖 [docs/api.md](docs/api.md) — API endpoint contracts, authentication, error formats, and request examples.
- 📖 [docs/environment.md](docs/environment.md) — Environment variables, sensitivity scopes, and local setup.

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

## 🛠 Prerequisites

- **Node.js**: `v18.18.0` or higher (LTS recommended)
- **npm**: `v9.0.0` or higher
- **PostgreSQL**: `v14` or higher (or cloud provider like Neon DB)

---

## 📦 Installation & Setup

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
Copy the template configuration:
```bash
cp .env.example .env
```
Fill in your database connection string and secure JWT secret key. See [docs/environment.md](docs/environment.md) for variable definitions.

### 4. Push database schema & seed authentic recruitments
```bash
npx prisma db push
node scripts/seed.mjs
```

---

## ⚙️ Development & Production Commands

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts local Next.js development server at `http://localhost:3000` |
| `npm run build` | Generates Prisma client and compiles optimized production build |
| `npm start` | Runs the compiled production build |
| `npm run lint` | Runs Next.js ESLint checks |
| `npm test` | Runs the automated test suite once via Vitest |
| `npm run test:watch` | Runs Vitest in interactive watch mode |
| `npx tsc --noEmit` | Validates TypeScript types across the entire project |
| `npm run db:push` | Pushes schema changes directly to the PostgreSQL database |
| `npm run db:seed` | Seeds database with authentic Indian government recruitment data |

---

## 🧪 Verification & Quality Checks

Run all verification gates before pushing code:

```bash
# 1. Type Check
npx tsc --noEmit

# 2. Linting
npm run lint

# 3. Unit & Integration Tests
npm test

# 4. Production Build
npm run build
```

---

## 👤 Pre-configured Demo Accounts

| Role | Email | Password | Pre-configured State |
| :--- | :--- | :--- | :--- |
| **Fresher Aspirant** | `aspirant@bharatexam.in` | `Aspirant@123` | Enrolled in SSC CGL 2026 (Tier 1 admit card out, Shift 2 slot assigned) & IBPS PO 2026 (Prelims result available to test qualification). |
| **Portal Officer (Admin)** | `admin@bharatexam.in` | `Admin@123` | Access to `/admin` to monitor sources, run crawler audits, review AI extractions, and broadcast corrigendums. |

*(Also accessible via 1-click buttons on the `/login` page).*

---

## 📜 Safety & Trust Policy
BharatExam Tracker acts as an independent discovery and stage tracking tool. All actual applications are submitted strictly on the official portals of respective commissions (`ssc.gov.in`, `ibps.in`, etc.). The platform never collects application fees or submits forms on behalf of candidates.
