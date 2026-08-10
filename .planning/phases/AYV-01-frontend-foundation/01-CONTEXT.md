# Phase 1: Frontend Foundation - Context

**Gathered:** 2026-08-10
**Status:** Ready for planning

<domain>
## Phase Boundary

Set up the complete React + Vite + Tailwind project foundation: project scaffolding, routing with all routes from the consolidated route map, centralized Axios API layer, common components, layout components, and state management (React Query + Context). This phase delivers the infrastructure that all subsequent phases build upon.

</domain>

<decisions>
## Implementation Decisions

### Project Scaffolding
- **D-01:** Use Vite with React template (`npm create vite@latest . -- --template react`) — **Reversibility:** reversible — standard Vite scaffold
- **D-02:** Use Tailwind CSS v3 with PostCSS configuration — **Reversibility:** reversible — standard Tailwind setup
- **D-03:** Use React Router v6 for routing — **Reversibility:** costly — all routes depend on this choice
- **D-04:** Use TanStack React Query v5 for server state — **Reversibility:** costly — all data fetching depends on this
- **D-05:** Use Axios for HTTP client with centralized instance — **Reversibility:** costly — all services depend on this
- **D-06:** Use Zod for form validation schemas — **Reversibility:** reversible — validation library choice
- **D-07:** Use React Context + useReducer for client state (AuthContext, UIContext, FilterContext) — **Reversibility:** costly — auth state management pattern

### Routing Structure
- **D-08:** All routes from Frontend.md Section 80 consolidated route map must be defined:
  - Public: `/`, `/auth/login`, `/auth/register`, `/public/batch/:batchId`
  - Authenticated: `/app/dashboard`, `/app/profile`, `/app/identify`, `/app/batches`, `/app/batches/:batchId`, `/app/incoming`, `/app/history`, `/app/verify/:batchId`, `/app/scan`
  - Expert: `/expert/dashboard`, `/expert/reviews`, `/expert/reviews/:reviewId`, `/expert/history`, `/expert/materials`
  - Admin: `/admin/dashboard`, `/admin/users`, `/admin/materials`, `/admin/predictions`, `/admin/batches`, `/admin/reviews`, `/admin/analytics`
- **D-09:** Use React.lazy() + Suspense for route-level code splitting — **Reversibility:** reversible — performance optimization
- **D-10:** Route guards: ProtectedRoute (requires isAuthenticated), RoleRoute (requires specific role) — **Reversibility:** costly — security pattern

### API Layer
- **D-11:** Centralized Axios instance in `src/services/api.js` with:
  - Base URL from `VITE_API_BASE_URL` env var (default: `http://localhost:8000/api/v1`)
  - Authorization header from JWT token
  - 401 handling (redirect to login)
  - 403 handling (show permission error)
  - Response interceptor for error mapping
- **D-12:** Service modules: authService, participantService, predictionService, materialService, batchService, transferService, expertService, dashboardService — **Reversibility:** costly — all API calls depend on this structure

### Component Structure
- **D-13:** Common components: Button (with loading guard), Modal (with ARIA), Badge, Loading, EmptyState, ErrorState, Pagination, Toast — **Reversibility:** reversible — component library structure
- **D-14:** Layout components: Navbar, Sidebar, Header, ProtectedRoute, RoleRoute — **Reversibility:** reversible — layout structure
- **D-15:** Use Tailwind CSS for all styling — no CSS-in-JS or CSS modules — **Reversibility:** costly — styling approach

### Error Handling
- **D-16:** Error message catalog mapping HTTP status codes to user-friendly messages (per Frontend.md Section 84) — **Reversibility:** reversible — error handling pattern
- **D-17:** Never show raw FastAPI errors or stack traces to users — log to console only — **Reversibility:** one-way — security requirement

### State Management
- **D-18:** Server state via React Query (useQuery for GET, useMutation for POST/PATCH) — **Reversibility:** costly — data fetching pattern
- **D-19:** Client state via Context: AuthContext (isAuthenticated, user, role, participantId, token, login, logout), UIContext (sidebarOpen, activeModal, toastMessages), FilterContext (activeFilters, sortOrder, page) — **Reversibility:** costly — state management pattern
- **D-20:** Do NOT store server responses in global client state — **Reversibility:** one-way — architectural rule

### Performance
- **D-21:** Lazy loading with React.lazy() + Suspense for all route components — **Reversibility:** reversible — performance optimization
- **D-22:** Use React.memo() for list items, useMemo() for derived data, useCallback() for event handlers — **Reversibility:** reversible — performance optimization

### Accessibility
- **D-23:** Semantic HTML throughout (button, a, form, label, nav, main, h1-h6, table) — **Reversibility:** one-way — accessibility requirement
- **D-24:** ARIA requirements: modals with role="dialog" + aria-modal="true", toasts with role="status"/"alert", loading with aria-busy — **Reversibility:** one-way — accessibility requirement
- **D-25:** Keyboard navigation: Tab reachable, visible focus, Escape closes modals, skip-to-content link — **Reversibility:** one-way — accessibility requirement
- **D-26:** Color contrast ≥ 4.5:1 (WCAG AA), risk levels with icon + text + color — **Reversibility:** one-way — accessibility requirement

### the agent's Discretion
- Exact Tailwind theme colors and font choices (use a clean, professional Ayurvedic/healthcare aesthetic)
- Exact component prop APIs and internal implementation details
- File/folder organization within the specified structure
- Package versions (use latest stable)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Frontend Specification
- `Frontend.md` §57 — API Service Structure (src/services/ layout)
- `Frontend.md` §58 — Axios (centralized instance, base URL, auth header, 401/403 handling)
- `Frontend.md` §62 — Component Structure (common/, layout/, prediction/, batch/, transfer/, dashboard/, expert/)
- `Frontend.md` §79 — State Management Strategy (React Query + Context)
- `Frontend.md` §80 — Consolidated Route Map (all routes with access control)
- `Frontend.md` §84 — Error Message Catalog (HTTP status → user message mapping)
- `Frontend.md` §87 — Loading Guards & Double-Submit Prevention
- `Frontend.md` §89 — Accessibility Requirements
- `Frontend.md` §90 — Performance Considerations

### Project Context
- `.planning/PROJECT.md` — Project context, constraints, and requirements
- `.planning/REQUIREMENTS.md` — v1 requirements with REQ-IDs
- `.planning/ROADMAP.md` — Phase 1 details and success criteria

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- No existing code — greenfield project

### Established Patterns
- No existing patterns — this phase establishes the foundation patterns

### Integration Points
- All subsequent phases (2-8) build on this phase's infrastructure
- Backend API at `http://localhost:8000/api/v1` (FastAPI)

</code_context>

<specifics>
## Specific Ideas

- The app should present as "one connected workflow, not unrelated pages" (Frontend.md §1)
- Participant ID vs Batch ID distinction must be visually clear throughout the UI
- The frontend should have a clean, professional healthcare/Ayurvedic aesthetic
- All action buttons must have loading guards (disabled while in-flight, spinner, prevent double-submits)
- No optimistic UI for ownership changes, transfer status, batch status, accept/reject

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 1-Frontend Foundation*
*Context gathered: 2026-08-10*