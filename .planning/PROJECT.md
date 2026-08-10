# AyurVerify

## What This Is

AyurVerify is an AI-powered medicinal plant and Ayurvedic raw-material identification and supply-chain verification platform. It allows different supply-chain participants (Collectors, Wholesalers, Distributors, Manufacturers, Experts, Admins) to register with unique Participant IDs, identify medicinal plants using YOLOv8n AI, create digital material batches with unique Batch IDs, transfer batches through the supply chain with accept/reject workflows, and track complete identification and verification history.

## Core Value

Every registered supply-chain participant gets a unique Participant ID, every identified material batch gets a unique Batch ID that remains constant throughout the material's journey, and the complete supply-chain traceability (identification + verification + transfer events) is visible to all authorized participants.

## Business Context

- **Customer**: Ayurvedic medicine supply chain participants (collectors, wholesalers, distributors, manufacturers)
- **Revenue model**: SIH prototype — not monetized yet
- **Success metric**: Complete supply-chain traceability demonstrated end-to-end (collector → manufacturer)
- **Strategy notes**: SIH (Smart India Hackathon) prototype

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] **AUTH-01**: User can register as a supply-chain participant (Collector, Wholesaler, Distributor, Manufacturer, Expert) with Full Name, Email, Password, Role, Organization Name, Location
- [ ] **AUTH-02**: Backend generates unique Participant ID (e.g., COL-0047, WHO-0124) — frontend must NOT generate IDs
- [ ] **AUTH-03**: User can log in with email/password and receive JWT token
- [ ] **AUTH-04**: Frontend maintains auth state (isAuthenticated, user, role, participantId, token) via AuthContext
- [ ] **AUTH-05**: Protected routes redirect unauthenticated users to /auth/login
- [ ] **AUTH-06**: Role-based access control — Collector, Wholesaler, Distributor, Manufacturer, Expert, Admin each see role-specific navigation
- [ ] **PROF-01**: User can view their profile showing Participant ID, Name, Organization, Role, Location, Email
- [ ] **DASH-01**: Role-specific dashboard showing relevant data (identifications, batches, transfers, verifications)
- [ ] **PRED-01**: Collector can upload/capture a material image for AI identification
- [ ] **PRED-02**: Frontend sends image to backend prediction API (multipart/form-data)
- [ ] **PRED-03**: Frontend displays AI prediction result (material name, scientific name, confidence, risk level, image quality)
- [ ] **PRED-04**: Frontend displays loading state during YOLO inference with progress steps
- [ ] **PRED-05**: If status is EXPERT_REVIEW_REQUIRED, frontend shows escalation UI with [Request Expert Review] button
- [ ] **BATCH-01**: Collector can create a digital batch from an eligible identification
- [ ] **BATCH-02**: Backend generates unique Batch ID (e.g., AYV-2026-00042) — frontend must NOT generate IDs
- [ ] **BATCH-03**: Batch digital passport page shows Batch ID, Material, Scientific Name, Current Owner, Original Collector, AI Confidence, Risk, Verification Status, Creation Date
- [ ] **BATCH-04**: Batch page shows supply-chain history timeline (Created → Transfer Requested → Transfer Accepted)
- [ ] **TRANS-01**: Batch owner can transfer batch to a specific registered participant
- [ ] **TRANS-02**: Recipient search by Participant ID or Organization Name with role filtering
- [ ] **TRANS-03**: Transfer creates TRANSFER_PENDING state — does NOT immediately change ownership
- [ ] **TRANS-04**: Recipient sees incoming transfer requests with batch details
- [ ] **TRANS-05**: Recipient can accept or reject incoming transfers
- [ ] **TRANS-06**: Accept updates current owner; Reject keeps batch with sender and records reason
- [ ] **TRANS-07**: Rejection recovery — sender sees rejection reason and can re-transfer
- [ ] **HIST-01**: History page shows both identification history and supply-chain history, visually distinguishable
- [ ] **QR-01**: Batch has QR code that encodes public batch URL
- [ ] **QR-02**: Public batch page shows limited non-sensitive info with login prompt
- [ ] **QR-03**: QR scanner supports camera scan, image upload, and manual Batch ID entry
- [ ] **EXP-01**: Expert can view pending reviews and submit decisions
- [ ] **ADMIN-01**: Admin can manage users, materials, predictions, batches, reviews, and view analytics
- [ ] **FORM-01**: All forms have validation (registration, login, transfer, rejection, batch creation)
- [ ] **ERR-01**: All API-connected pages handle loading, success, error, empty, unauthorized, forbidden, not found, network failure states
- [ ] **LOAD-01**: All action buttons have loading guards to prevent double-submits
- [ ] **PERF-01**: Image compression before upload (max 1280px, quality ≤ 0.8, target ≤ 500KB)
- [ ] **PERF-02**: Lazy loading of route components and QR scanner library
- [ ] **A11Y-01**: Accessibility requirements met (semantic HTML, ARIA, keyboard navigation, WCAG AA contrast)
- [ ] **TEST-01**: Unit tests (Vitest), integration tests (React Testing Library), E2E tests (Playwright)

### Out of Scope

- Real-time WebSocket notifications — polling/manual refresh is acceptable for prototype
- Frontend generation of Participant IDs or Batch IDs — backend must generate these
- Frontend risk calculation — backend Risk Engine decides final risk/status
- Direct MongoDB connection from frontend — must go through FastAPI backend
- YOLO inference in frontend — must be backend-only
- Admin role publicly selectable during registration — should not be publicly available
- Email verification and password reset — not specified in Frontend.md

## Context

- **Frontend**: React.js + Vite + Tailwind CSS
- **Backend**: FastAPI + Python
- **Database**: MongoDB Atlas
- **AI**: YOLOv8n
- **State Management**: TanStack React Query (server state) + React Context/useReducer (client state)
- **HTTP**: Axios with centralized instance
- **Validation**: Zod or Yup
- **Testing**: Vitest + React Testing Library + Playwright
- **QR**: qrcode library for generation, html5-qrcode for scanning
- The frontend must communicate with the FastAPI backend and must never directly communicate with MongoDB or the YOLO model
- The most important concept: Participant ID identifies who owns/handles a batch; Batch ID identifies what physical batch is being tracked. These must never be confused.
- The Batch ID remains the same throughout the entire supply chain
- Frontend role restrictions are only UI restrictions — backend must enforce authorization
- The frontend should present the application as one connected workflow, not unrelated pages

## Constraints

- **Tech stack**: React.js + Vite + Tailwind CSS — specified in Frontend.md
- **Backend dependency**: Frontend must use FastAPI backend API — never direct DB or YOLO access
- **ID generation**: Participant IDs and Batch IDs must come from backend — never generated on frontend
- **Risk rules**: Frontend must NOT decide risk rules — backend Risk Engine decides
- **API contract**: Frontend must use actual backend contract — never invent API responses
- **Security**: Never show raw FastAPI errors or stack traces to users
- **Timeline**: SIH prototype — build in 8 phases as specified in Frontend.md Section 73

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| React + Vite + Tailwind | Specified in Frontend.md | — Pending |
| TanStack React Query for server state | Specified in Frontend.md Section 79 | — Pending |
| React Context + useReducer for client state | Specified in Frontend.md Section 79 | — Pending |
| Axios centralized API layer | Specified in Frontend.md Section 58 | — Pending |
| Zod/Yup for validation | Specified in Frontend.md Section 81 | — Pending |
| 8-phase development order | Specified in Frontend.md Section 73 | — Pending |
| No optimistic UI for ownership/transfer changes | Specified in Frontend.md Section 87 | — Pending |
| Polling for notifications (no WebSocket) | Specified in Frontend.md Section 66 | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `$gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `$gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-08-10 after initialization*