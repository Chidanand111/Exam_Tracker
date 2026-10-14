# Developer Guide & Contribution Standards — BharatExam Tracker

## 1. Naming Conventions

To maintain consistency across the codebase, follow these established naming patterns:

| Artifact | Convention | Example |
| :--- | :--- | :--- |
| **React Components** | PascalCase | `ApplicationVaultModal.tsx`, `RecruitmentCard.tsx` |
| **Custom Hooks** | camelCase prefixed with `use` | `useRecruitments.ts`, `useShortlist.ts` |
| **API Route Handlers** | Next.js App Router standard | `src/app/api/shortlist/route.ts` |
| **Domain Services** | camelCase with `.service.ts` | `recruitment.service.ts`, `shortlist.service.ts` |
| **Repositories** | camelCase with `.repository.ts` | `recruitment.repository.ts`, `shortlist.repository.ts` |
| **Validators** | camelCase with `.validator.ts` | `shortlist.validator.ts` |
| **Unit Test Suites** | camelCase with `.test.ts` | `api-handler.test.ts`, `profile-matcher.test.ts` |
| **TypeScript Types & Interfaces** | PascalCase | `Recruitment`, `UserSession`, `StageProgressionResult` |
| **CSS Utility Classes** | Tailwind kebab-case | `bg-card`, `text-primary`, `border-border` |

---

## 2. Folder and Component Organization

```
src/
├── app/                  # Next.js App Router (pages, layouts, error boundaries, routes)
│   ├── api/              # HTTP Route Handlers
│   ├── error.tsx         # Root error boundary
│   └── not-found.tsx     # Custom 404 page
├── components/           # Reusable UI components grouped by business domain
│   ├── admin/            # Admin review queue, crawler logs, audit records
│   ├── checklists/       # Dynamic preparation checklist modals
│   ├── discovery/        # Filter bars, search input, card grids
│   ├── layout/           # Navbar, footer, navigation shells
│   ├── notes/            # Personal notes drawer
│   └── vault/            # Document and application identifier vault
├── config/               # Environment variables and system configuration (env.ts)
├── hooks/                # Custom state and data fetching hooks
├── lib/                  # Shared libraries, engines, and utilities
├── server/               # Backend architecture
│   ├── repositories/     # Prisma data access queries
│   ├── services/         # Core business logic and coordination
│   └── utils/            # api-handler.ts, response formatters
├── types/                # Central TypeScript definitions and models
└── validators/           # Runtime request validators and schema assertions
```

### Component Guidelines
- **Pure & Focused**: Each component should have a single responsibility.
- **No Direct Fetching in Presentation**: Never use raw `fetch()` or `axios` inside JSX markup. Use custom hooks located in `src/hooks/`.
- **Accessibility**: Provide meaningful `aria-label` attributes for icon-only buttons, descriptive alt texts, and maintain clean keyboard navigation.

---

## 3. Business Logic and Service Patterns

- **Separation of Concerns**: Business rules must live in `src/server/services/` or domain engines in `src/lib/`.
- **Repository Pattern**: Never write direct `prisma.<model>` queries inside route handlers. Delegate to the corresponding repository in `src/server/repositories/`.
- **Dependency Inversion**: Services depend on repository abstractions, facilitating deterministic unit testing without database locks.

Example Service Pattern:
```typescript
export class ShortlistService {
  static async toggleShortlist(userId: string, recruitmentId: string): Promise<ToggleResult> {
    const existing = await ShortlistRepository.findByUserAndRecruitment(userId, recruitmentId);
    if (existing) {
      await ShortlistRepository.delete(existing.id);
      return { shortlisted: false };
    }
    await ShortlistRepository.create(userId, recruitmentId);
    return { shortlisted: true };
  }
}
```

---

## 4. Error-Handling Conventions

### Backend
1. **Always wrap route handlers** with `withErrorHandler`:
   ```typescript
   export const POST = withErrorHandler(async (req: NextRequest) => {
     // Handlers throw typed errors; withErrorHandler formats them automatically
   });
   ```
2. **Throw typed operational errors**:
   - `ValidationError(message, details)` $\rightarrow$ HTTP 400
   - `UnauthorizedError(message)` $\rightarrow$ HTTP 401
   - `NotFoundError(message)` $\rightarrow$ HTTP 404
   - `AppError(message, status, code)` $\rightarrow$ Custom operational status
3. **Unexpected exceptions** are treated as fatal 500s. The error message and stack trace are logged to server stderr and redacted from the client response.

### Frontend
1. **Use `ApiClientError`**: The centralized `apiClient` parses API responses into typed errors.
2. **Catch & Recover**: Catch errors in custom hooks, update reactive `error` state, and provide actionable user notifications.
3. **Preserve User Input**: During form or network failures, never wipe form fields or cancel unsaved user text.

---

## 5. State-Management Rules

Refer to [`src/docs/state-management.md`](file:///c:/Users/chida/Desktop/EXAM%20Tracker/src/docs/state-management.md) for full taxonomy:
- **Local Component State**: Transient UI flags (open modals, active tab).
- **Server Cache**: Managed in hooks with `AbortController` cancellation for in-flight requests.
- **Optimistic State with Rollback**: Immediately reflect user actions (such as bookmark toggles) in UI state while tracking in-flight operations. If the network call fails, automatically roll back to the snapshot.
- **URL Search Parameters**: Canonical source of truth for sharable filters (e.g., `?category=engineering&salary=50000`).

---

## 6. Testing Standards & Contribution Guidelines

### Running Tests
```bash
# Run full unit test suite once
npm test

# Run tests in interactive watch mode
npm run test:watch
```

### Standards for New Code
1. **New API Endpoints**: Must have an accompanying test in `tests/unit/` testing both 200 success and 400/401/404/500 failure paths.
2. **Domain Logic & Algorithms**: Any age calculation, eligibility rule, or string parser must have 100% test coverage over boundary conditions.
3. **Type Safety**: Avoid using `any`. Use strict TypeScript interfaces defined in `src/types/index.ts`.
4. **Before Submitting a PR / Commit**:
   ```bash
   npx tsc --noEmit      # Must pass with 0 errors
   npm run lint          # Must pass with 0 errors
   npm test              # All test suites must pass
   npm run build         # Must compile successfully
   ```
