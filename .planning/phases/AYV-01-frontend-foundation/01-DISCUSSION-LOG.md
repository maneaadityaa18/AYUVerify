# Phase 1: Frontend Foundation - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-08-10
**Phase:** 1-Frontend Foundation
**Areas discussed:** Project Scaffolding, Routing Structure, API Layer, Component Structure, Error Handling, State Management, Performance, Accessibility

---

## Project Scaffolding

| Option | Description | Selected |
|--------|-------------|----------|
| Vite + React | Standard Vite scaffold with React template | ✓ |
| Tailwind CSS v3 | PostCSS configuration for utility-first styling | ✓ |
| React Router v6 | Standard routing library | ✓ |
| TanStack React Query v5 | Server state management | ✓ |
| Axios | Centralized HTTP client | ✓ |
| Zod | Form validation schemas | ✓ |
| Context + useReducer | Client state management | ✓ |

**User's choice:** Auto-selected (--auto mode) — all recommended defaults per Frontend.md specification
**Notes:** All choices follow Frontend.md Sections 57-58, 62, 79

---

## Routing Structure

| Option | Description | Selected |
|--------|-------------|----------|
| Full route map | All routes from Frontend.md Section 80 | ✓ |
| React.lazy() + Suspense | Route-level code splitting | ✓ |
| ProtectedRoute + RoleRoute | Route guards for auth and role-based access | ✓ |

**User's choice:** Auto-selected (--auto mode) — all recommended defaults per Frontend.md specification
**Notes:** Routes defined per Section 80 consolidated route map

---

## API Layer

| Option | Description | Selected |
|--------|-------------|----------|
| Centralized Axios instance | Base URL, auth header, 401/403 handling | ✓ |
| Service modules | authService, participantService, predictionService, materialService, batchService, transferService, expertService, dashboardService | ✓ |

**User's choice:** Auto-selected (--auto mode) — all recommended defaults per Frontend.md specification
**Notes:** Per Frontend.md Sections 57-58

---

## Component Structure

| Option | Description | Selected |
|--------|-------------|----------|
| Common components | Button, Modal, Badge, Loading, EmptyState, ErrorState, Pagination, Toast | ✓ |
| Layout components | Navbar, Sidebar, Header, ProtectedRoute, RoleRoute | ✓ |
| Tailwind CSS only | No CSS-in-JS or CSS modules | ✓ |

**User's choice:** Auto-selected (--auto mode) — all recommended defaults per Frontend.md specification
**Notes:** Per Frontend.md Section 62

---

## Error Handling

| Option | Description | Selected |
|--------|-------------|----------|
| Error message catalog | HTTP status → user-friendly message mapping | ✓ |
| No raw errors | Never show FastAPI errors/stack traces to users | ✓ |

**User's choice:** Auto-selected (--auto mode) — all recommended defaults per Frontend.md specification
**Notes:** Per Frontend.md Section 84

---

## State Management

| Option | Description | Selected |
|--------|-------------|----------|
| React Query for server state | useQuery/useMutation for all API data | ✓ |
| Context for client state | AuthContext, UIContext, FilterContext | ✓ |
| No server data in global state | Server responses stay in React Query cache | ✓ |

**User's choice:** Auto-selected (--auto mode) — all recommended defaults per Frontend.md specification
**Notes:** Per Frontend.md Section 79

---

## Performance

| Option | Description | Selected |
|--------|-------------|----------|
| Lazy loading | React.lazy() + Suspense for routes | ✓ |
| React.memo/useMemo/useCallback | Performance optimizations | ✓ |

**User's choice:** Auto-selected (--auto mode) — all recommended defaults per Frontend.md specification
**Notes:** Per Frontend.md Section 90

---

## Accessibility

| Option | Description | Selected |
|--------|-------------|----------|
| Semantic HTML | button, a, form, label, nav, main, h1-h6, table | ✓ |
| ARIA requirements | Modals, toasts, loading states | ✓ |
| Keyboard navigation | Tab, focus, Escape, skip-to-content | ✓ |
| WCAG AA contrast | ≥ 4.5:1, risk levels with icon + text + color | ✓ |

**User's choice:** Auto-selected (--auto mode) — all recommended defaults per Frontend.md specification
**Notes:** Per Frontend.md Section 89

---

## the agent's Discretion

- Exact Tailwind theme colors and font choices (clean, professional Ayurvedic/healthcare aesthetic)
- Exact component prop APIs and internal implementation details
- File/folder organization within the specified structure
- Package versions (use latest stable)

## Deferred Ideas

None — discussion stayed within phase scope