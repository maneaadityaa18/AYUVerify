# Requirements: AyurVerify

**Defined:** 2026-08-10
**Core Value:** Every registered supply-chain participant gets a unique Participant ID, every identified material batch gets a unique Batch ID that remains constant throughout the material's journey, and the complete supply-chain traceability (identification + verification + transfer events) is visible to all authorized participants.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Authentication & Registration

- [ ] **AUTH-01**: User can register as a supply-chain participant (Collector, Wholesaler, Distributor, Manufacturer, Expert) with Full Name, Email, Password, Role, Organization Name, Location
- [ ] **AUTH-02**: Backend generates unique Participant ID (e.g., COL-0047, WHO-0124) — frontend must NOT generate IDs
- [ ] **AUTH-03**: User can log in with email/password and receive JWT token
- [ ] **AUTH-04**: Frontend maintains auth state (isAuthenticated, user, role, participantId, token) via AuthContext
- [ ] **AUTH-05**: Protected routes redirect unauthenticated users to /auth/login
- [ ] **AUTH-06**: Role-based access control — Collector, Wholesaler, Distributor, Manufacturer, Expert, Admin each see role-specific navigation
- [ ] **AUTH-07**: Registration success screen displays Participant ID prominently with "Save this ID" message
- [ ] **AUTH-08**: Admin role is NOT publicly selectable during registration

### Profile & Dashboard

- [ ] **PROF-01**: User can view their profile showing Participant ID, Name, Organization, Role, Location, Email
- [ ] **DASH-01**: Role-specific dashboard showing relevant data (identifications, batches, transfers, verifications)
- [ ] **DASH-02**: Dashboard data comes from backend API (GET /api/v1/dashboard/summary) — frontend does not calculate supply-chain ownership

### AI Identification

- [ ] **PRED-01**: Collector can upload/capture a material image for AI identification
- [ ] **PRED-02**: Frontend sends image to backend prediction API (multipart/form-data)
- [ ] **PRED-03**: Frontend displays AI prediction result (material name, scientific name, confidence, risk level, image quality)
- [ ] **PRED-04**: Frontend displays loading state during YOLO inference with progress steps and dimmed image preview
- [ ] **PRED-05**: If status is EXPERT_REVIEW_REQUIRED, frontend shows escalation UI with [Request Expert Review] button
- [ ] **PRED-06**: Frontend does NOT decide risk rules — only displays riskLevel, status, confidence from backend
- [ ] **PRED-07**: Image compression before upload (max 1280px, quality ≤ 0.8, target ≤ 500KB)

### Batch & Digital Passport

- [ ] **BATCH-01**: Collector can create a digital batch from an eligible identification
- [ ] **BATCH-02**: Backend generates unique Batch ID (e.g., AYV-2026-00042) — frontend must NOT generate IDs
- [ ] **BATCH-03**: Batch digital passport page shows Batch ID, Material, Scientific Name, Current Owner, Original Collector, AI Confidence, Risk, Verification Status, Creation Date
- [ ] **BATCH-04**: Batch page shows supply-chain history timeline (Created → Transfer Requested → Transfer Accepted)
- [ ] **BATCH-05**: Batch ID remains the same throughout the entire supply chain

### Supply-Chain Transfer

- [ ] **TRANS-01**: Batch owner can transfer batch to a specific registered participant
- [ ] **TRANS-02**: Recipient search by Participant ID or Organization Name with role filtering
- [ ] **TRANS-03**: Transfer creates TRANSFER_PENDING state — does NOT immediately change ownership
- [ ] **TRANS-04**: Recipient sees incoming transfer requests with batch details
- [ ] **TRANS-05**: Recipient can accept or reject incoming transfers
- [ ] **TRANS-06**: Accept updates current owner; Reject keeps batch with sender and records reason
- [ ] **TRANS-07**: Rejection recovery — sender sees rejection reason and can re-transfer
- [ ] **TRANS-08**: Transfer history is stored as history events and displayed in timeline

### History & Traceability

- [ ] **HIST-01**: History page shows both identification history and supply-chain history, visually distinguishable
- [ ] **HIST-02**: All list pages support pagination (10/25/50 per page), sorting, and filtering

### QR Code

- [ ] **QR-01**: Batch has QR code that encodes public batch URL
- [ ] **QR-02**: Public batch page shows limited non-sensitive info with login prompt
- [ ] **QR-03**: QR scanner supports camera scan, image upload, and manual Batch ID entry
- [ ] **QR-04**: QR code contains only batch reference, NOT the full report or sensitive data

### Expert & Admin

- [ ] **EXP-01**: Expert can view pending reviews and submit decisions
- [ ] **EXP-02**: Expert has dedicated routes (/expert/*) with role-based access
- [ ] **ADMIN-01**: Admin can manage users, materials, predictions, batches, reviews, and view analytics
- [ ] **ADMIN-02**: Admin has dedicated routes (/admin/*) with role-based access

### Forms & Validation

- [ ] **FORM-01**: Registration form validates: Full Name (2-100 chars), Email (valid format), Password (min 8 chars, 1 letter + 1 number), Role (valid enum), Organization Name (2-150 chars), Location (2-150 chars)
- [ ] **FORM-02**: Login form validates: Email (valid format), Password (non-empty)
- [ ] **FORM-03**: Transfer form validates: Recipient (valid participant ID), Note (max 500 chars)
- [ ] **FORM-04**: Rejection form validates: Reason (min 5 chars, max 500 chars)
- [ ] **FORM-05**: Batch creation form validates: Source Location (2-150 chars), Notes (max 1000 chars)
- [ ] **FORM-06**: Validation on blur and submit with inline field errors

### Error Handling & Loading

- [ ] **ERR-01**: All API-connected pages handle loading, success, error, empty, unauthorized, forbidden, not found, network failure states
- [ ] **ERR-02**: HTTP status codes map to user-friendly messages (400, 401, 403, 404, 409, 422, 429, 500, 502/503/504, network failure)
- [ ] **ERR-03**: Backend error codes map to friendly messages (BATCH_NOT_TRANSFERABLE, RECIPIENT_NOT_FOUND, etc.)
- [ ] **ERR-04**: Never show raw FastAPI errors, stack traces, or JSON to the user
- [ ] **LOAD-01**: All action buttons have loading guards to prevent double-submits
- [ ] **LOAD-02**: No optimistic UI for ownership changes, transfer status, batch status, accept/reject

### Performance & Accessibility

- [ ] **PERF-01**: Lazy loading of route components with React.lazy() + Suspense
- [ ] **PERF-02**: Lazy-load QR scanner library only when /app/scan is opened
- [ ] **PERF-03**: Debounce recipient search input by 300ms
- [ ] **PERF-04**: Use React.memo() for list items, useMemo() for derived data, useCallback() for event handlers
- [ ] **A11Y-01**: Semantic HTML (button, a, form, label, nav, main, h1-h6, table)
- [ ] **A11Y-02**: ARIA requirements (modals with role="dialog", toasts with role="status"/"alert", loading with aria-busy)
- [ ] **A11Y-03**: Keyboard navigation (Tab reachable, visible focus, Escape closes modals, skip-to-content link)
- [ ] **A11Y-04**: Color contrast ≥ 4.5:1 (WCAG AA), risk levels with icon + text + color
- [ ] **A11Y-05**: All inputs have visible labels, error messages linked via aria-describedby

### Testing

- [ ] **TEST-01**: Unit tests with Vitest (services 80%, utils 80%, components 70%)
- [ ] **TEST-02**: Integration tests with React Testing Library (registration, login, transfer, accept flows)
- [ ] **TEST-03**: E2E tests with Playwright (collector registers → identifies → creates batch → transfers → wholesaler accepts)

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Notifications

- **NOTF-01**: Real-time WebSocket notifications for incoming transfers
- **NOTF-02**: Email notifications for transfer events

### Advanced Features

- **ADV-01**: Email verification after registration
- **ADV-02**: Password reset via email link
- **ADV-03**: OAuth login (Google, GitHub)
- **ADV-04**: 2FA authentication

## Out of Scope

| Feature | Reason |
|---------|--------|
| Real-time WebSocket notifications | Polling/manual refresh is acceptable for SIH prototype (Frontend.md Section 66) |
| Frontend generation of Participant IDs | Backend must generate these (Frontend.md Section 7) |
| Frontend generation of Batch IDs | Backend must generate these (Frontend.md Section 22) |
| Frontend risk calculation | Backend Risk Engine decides final risk/status (Frontend.md Section 20) |
| Direct MongoDB connection from frontend | Must go through FastAPI backend (Frontend.md Section 1) |
| YOLO inference in frontend | Must be backend-only (Frontend.md Section 1) |
| Admin role publicly selectable | Should not be publicly available (Frontend.md Section 4) |
| Email verification | Not specified in Frontend.md |
| Password reset | Not specified in Frontend.md |
| Mobile app | Web-first, SIH prototype |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 | Phase 2 | Pending |
| AUTH-02 | Phase 2 | Pending |
| AUTH-03 | Phase 2 | Pending |
| AUTH-04 | Phase 2 | Pending |
| AUTH-05 | Phase 2 | Pending |
| AUTH-06 | Phase 2 | Pending |
| AUTH-07 | Phase 2 | Pending |
| AUTH-08 | Phase 2 | Pending |
| PROF-01 | Phase 3 | Pending |
| DASH-01 | Phase 3 | Pending |
| DASH-02 | Phase 3 | Pending |
| PRED-01 | Phase 4 | Pending |
| PRED-02 | Phase 4 | Pending |
| PRED-03 | Phase 4 | Pending |
| PRED-04 | Phase 4 | Pending |
| PRED-05 | Phase 4 | Pending |
| PRED-06 | Phase 4 | Pending |
| PRED-07 | Phase 4 | Pending |
| BATCH-01 | Phase 5 | Pending |
| BATCH-02 | Phase 5 | Pending |
| BATCH-03 | Phase 5 | Pending |
| BATCH-04 | Phase 5 | Pending |
| BATCH-05 | Phase 5 | Pending |
| TRANS-01 | Phase 6 | Pending |
| TRANS-02 | Phase 6 | Pending |
| TRANS-03 | Phase 6 | Pending |
| TRANS-04 | Phase 6 | Pending |
| TRANS-05 | Phase 6 | Pending |
| TRANS-06 | Phase 6 | Pending |
| TRANS-07 | Phase 6 | Pending |
| TRANS-08 | Phase 6 | Pending |
| HIST-01 | Phase 7 | Pending |
| HIST-02 | Phase 7 | Pending |
| QR-01 | Phase 7 | Pending |
| QR-02 | Phase 7 | Pending |
| QR-03 | Phase 7 | Pending |
| QR-04 | Phase 7 | Pending |
| EXP-01 | Phase 8 | Pending |
| EXP-02 | Phase 8 | Pending |
| ADMIN-01 | Phase 8 | Pending |
| ADMIN-02 | Phase 8 | Pending |
| FORM-01 | Phase 2 | Pending |
| FORM-02 | Phase 2 | Pending |
| FORM-03 | Phase 6 | Pending |
| FORM-04 | Phase 6 | Pending |
| FORM-05 | Phase 5 | Pending |
| FORM-06 | Phase 2 | Pending |
| ERR-01 | Phase 1 | Pending |
| ERR-02 | Phase 1 | Pending |
| ERR-03 | Phase 1 | Pending |
| ERR-04 | Phase 1 | Pending |
| LOAD-01 | Phase 1 | Pending |
| LOAD-02 | Phase 1 | Pending |
| PERF-01 | Phase 1 | Pending |
| PERF-02 | Phase 7 | Pending |
| PERF-03 | Phase 6 | Pending |
| PERF-04 | Phase 1 | Pending |
| A11Y-01 | Phase 1 | Pending |
| A11Y-02 | Phase 1 | Pending |
| A11Y-03 | Phase 1 | Pending |
| A11Y-04 | Phase 1 | Pending |
| A11Y-05 | Phase 1 | Pending |
| TEST-01 | Phase 8 | Pending |
| TEST-02 | Phase 8 | Pending |
| TEST-03 | Phase 8 | Pending |

**Coverage:**
- v1 requirements: 68 total
- Mapped to phases: 68
- Unmapped: 0 ✓

---
*Requirements defined: 2026-08-10*
*Last updated: 2026-08-10 after initial definition*