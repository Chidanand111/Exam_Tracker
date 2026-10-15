# Environment Configuration & Security Guide — BharatExam Tracker

## 1. Environment Variable Reference

This table defines all environment variables supported by BharatExam Tracker, including their sensitivity, scope, and validation behavior:

| Variable | Scope | Required | Default (Dev) | Description |
| :--- | :--- | :--- | :--- | :--- |
| `DATABASE_URL` | **Server-Only** | **Yes** | *None* | Connection string for PostgreSQL database. In production, use a pooled connection string with `?sslmode=require&pgbouncer=true`. |
| `DIRECT_URL` | **Server-Only** | Optional | *None* | Non-pooled direct PostgreSQL connection string, used for Prisma schema migrations. |
| `JWT_SECRET` | **Server-Only** | **Yes** | `bharat-exam-tracker-dev-fallback-key` (dev only) | Secret key used to sign and verify session JWTs. Must be $\ge 32$ random characters in production. |
| `CRON_SECRET` | **Server-Only** | Optional | *None* | Bearer token required to trigger automated crawler/feed endpoints via external cron services. |
| `NODE_ENV` | System | Auto | `development` | Set by Next.js / Node.js runtime (`development`, `production`, `test`). |
| `NEXT_PUBLIC_APP_URL` | **Public (Client & Server)** | No | `http://localhost:3000` | Canonical origin URL used for generating absolute links, sitemaps, and open-graph metadata. |

---

## 2. Security Boundaries & Invariants

1. **Client Isolation**:
   - Variables **without** the `NEXT_PUBLIC_` prefix are strictly stripped from client JavaScript bundles during the Next.js compilation step.
   - Any attempt to access `process.env.DATABASE_URL` or `process.env.JWT_SECRET` in a client component will evaluate to `undefined`.
2. **Startup Invariant Validation**:
   - `src/config/env.ts` runs validation on application startup.
   - In production mode, if `DATABASE_URL` or `JWT_SECRET` are missing or set to insecure defaults, `validateServerConfig()` throws a fatal initialization error to prevent booting in an insecure state.

---

## 3. Safe Local Development Setup

To configure your local development environment without exposing production secrets:

1. Copy the template:
   ```bash
   cp .env.example .env
   ```

2. Configure a local or development PostgreSQL database:
   ```env
   # Local PostgreSQL instance or free Neon development branch
   DATABASE_URL="postgresql://<user>:<password>@localhost:5432/bharat_exam_dev?schema=public"
   DIRECT_URL="postgresql://<user>:<password>@localhost:5432/bharat_exam_dev?schema=public"

   # Development JWT secret
   JWT_SECRET="local-development-secret-key-32-chars-minimum"

   # Local app URL
   NEXT_PUBLIC_APP_URL="http://localhost:3000"

   # Optional cron token for testing scrapers locally
   CRON_SECRET="local-test-cron-secret"
   ```

3. Initialize schema and database:
   ```bash
   npx prisma db push
   node scripts/seed.mjs
   ```

4. Verify configuration:
   ```bash
   npm test
   npm run dev
   ```
