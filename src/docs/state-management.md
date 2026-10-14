# State Management Architecture & Conventions

This document outlines the state ownership rules, caching boundaries, and conventions implemented in BharatExam Tracker.

---

## 1. State Categories & Ownership

| State Category | Storage Location | Mechanism | Examples |
|---|---|---|---|
| **Local Component State** | React Component (`useState`, `useReducer`) | Ephemeral, component-scoped | Modal open/close, accordion toggles, dropdown active index |
| **URL & Navigation State** | Browser URL (`useSearchParams`, `useRouter`) | Single source of truth across page refreshes and link shares | Search keyword (`?search=`), category filter (`?category=`), active tab |
| **Server State & Cache** | Feature Hooks (`useRecruitments`, `useShortlist`) | Synchronized via `apiClient`, optimistic updates with rollback, `AbortController` cancellation | Active recruitments list, shortlisted applications, count badges |
| **Offline Cache** | `localStorage` | Versioned offline persistence (`bharat_exam_cached_recruitments_v1`) | Offline fallback when connectivity is severed (2G/3G resilience) |
| **Form State** | Controlled Form Components | Input state validated prior to API submission | Search forms, login/registration fields, personal schedule modal inputs |
| **Session & Auth State** | HTTP-Only Cookies + Server Context | Handled server-side (`getCurrentUser()`) | JWT session token (`bharat_exam_session`), user role |

---

## 2. Server State Rules & Invariants

1. **Keep Raw API Calls Out of Presentation Components:**
   * UI components must never call `fetch("/api/...")` directly.
   * Components consume feature hooks (e.g. `useRecruitments()`, `useShortlist()`) or invoke `apiClient.<domain>.<action>()`.
2. **Prevent Async Race Conditions with AbortController:**
   * When user inputs change rapidly (e.g. typing in search filters or toggling tabs), previous in-flight HTTP requests must be aborted using `controller.abort()`.
3. **Optimistic Updates with Automatic Rollback:**
   * When mutative actions occur (e.g., removing a shortlisted item or updating its lifecycle stage), update the local list immediately for instant user feedback.
   * Preserve a snapshot of previous items. If the network call fails, restore the previous state and present a non-blocking toast or error banner.
4. **Idempotent Retry Policy:**
   * Safe read (`GET`) operations are automatically retried up to 1 time with exponential backoff on transient network faults.
   * Mutative operations (`POST`, `PUT`, `DELETE`) are never retried blindly to avoid duplicate database operations.
