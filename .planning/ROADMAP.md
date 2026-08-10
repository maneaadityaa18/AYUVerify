# Roadmap: AyurVerify

## Overview

AyurVerify is an AI-powered medicinal plant identification and supply-chain verification platform. The frontend is built in 8 phases following the development order specified in Frontend.md Section 73. Starting from the React + Vite foundation, we build up through authentication, dashboards, AI identification, batch management, supply-chain transfers, QR codes, and finally expert/admin features.

## Phases

- [ ] **Phase 1: Frontend Foundation** - React + Vite + Tailwind + Routing + Axios + Layouts
- [ ] **Phase 2: Auth & Registration** - Registration, Participant ID, Login, AuthContext, Protected Routes, Role-Based Navigation
- [ ] **Phase 3: Dashboard & Profile** - Role-specific Dashboard, Profile, Participant Identity
- [ ] **Phase 4: AI Identification** - Image Upload, Prediction, Risk Result, Material Information
- [ ] **Phase 5: Batch & Digital Passport** - Batch Creation, Batch Details, Digital Passport
- [ ] **Phase 6: Supply-Chain Transfer** - Participant Search, Transfer Request, Incoming Transfers, Accept/Reject
- [ ] **Phase 7: Timeline & QR** - Supply Chain Timeline, Transfer History, QR Code
- [ ] **Phase 8: Expert & Admin** - Expert Review, Analytics, Admin

## Phase Details

### Phase 1: Frontend Foundation
**Goal**: Set up the complete React + Vite + Tailwind project with routing, Axios API layer, component structure, and state management foundation
**Depends on**: Nothing (first phase)
**Requirements**: ERR-01, ERR-02, ERR-03, ERR-04, LOAD-01, LOAD-02, PERF-01, PERF-04, A11Y-01, A11Y-02, A11Y-03, A11Y-04, A11Y-05
**Success Criteria** (what must be TRUE):
  1. React + Vite + Tailwind project runs with `npm run dev`
  2. All routes from the consolidated route map (Section 80) are defined with React Router
  3. Centralized Axios instance exists with base URL, Authorization header, 401/403 handling
  4. Common components exist (Button with loading guard, Modal, Badge, Loading, EmptyState, ErrorState, Pagination, Toast)
  5. Layout components exist (Navbar, Sidebar, Header, ProtectedRoute, RoleRoute)
  6. React Query + Context state management is set up
  7. Error message catalog maps HTTP status codes to user-friendly messages
  8. Lazy loading with React.lazy() + Suspense is configured
**Plans**: 4 plans

Plans:
- [ ] 01-01: Scaffold React + Vite + Tailwind project with dependencies
- [ ] 01-02: Set up routing with all routes from consolidated route map
- [ ] 01-03: Create centralized Axios API layer and service structure
- [ ] 01-04: Build common components, layout components, and state management

### Phase 2: Auth & Registration
**Goal**: Implement complete authentication flow — registration with Participant ID display, login with JWT, AuthContext, protected routes, and role-based navigation
**Depends on**: Phase 1
**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05, AUTH-06, AUTH-07, AUTH-08, FORM-01, FORM-02, FORM-06
**Success Criteria** (what must be TRUE):
  1. User can register as Collector, Wholesaler, Distributor, Manufacturer, or Expert with all required fields
  2. Registration success screen displays the backend-generated Participant ID prominently
  3. User can log in with email/password and receive JWT token
  4. AuthContext maintains isAuthenticated, user, role, participantId, token
  5. Protected routes redirect unauthenticated users to /auth/login
  6. Role-based navigation shows different menus for each role
  7. Admin role is NOT selectable during registration
  8. Registration and login forms validate per Section 81 rules
**Plans**: 3 plans

Plans:
- [ ] 02-01: Build registration page with form validation and Participant ID success screen
- [ ] 02-02: Build login page with JWT handling and AuthContext
- [ ] 02-03: Implement protected routes, role-based navigation, and auth services

### Phase 3: Dashboard & Profile
**Goal**: Implement role-specific dashboards and participant profile/identity pages
**Depends on**: Phase 2
**Requirements**: PROF-01, DASH-01, DASH-02
**Success Criteria** (what must be TRUE):
  1. User can view their profile showing Participant ID, Name, Organization, Role, Location, Email
  2. Dashboard shows role-specific data from backend API
  3. Collector dashboard shows: My Identifications, My Batches, Pending Transfers, Completed Transfers
  4. Wholesaler dashboard shows: Incoming Transfers, Received Batches, Pending Verification, Outgoing Transfers
  5. Distributor dashboard shows: Incoming Transfers, Current Batches, Outgoing Transfers
  6. Manufacturer dashboard shows: Incoming Materials, Verified Batches, Rejected Batches
  7. Dashboard data comes from GET /api/v1/dashboard/summary — frontend does not calculate ownership
**Plans**: 2 plans

Plans:
- [ ] 03-01: Build profile page with participant identity display
- [ ] 03-02: Build role-specific dashboard with stat cards and recent activity

### Phase 4: AI Identification
**Goal**: Implement the AI identification flow — image upload/capture, prediction API call, loading states, risk result display, and expert escalation
**Depends on**: Phase 3
**Requirements**: PRED-01, PRED-02, PRED-03, PRED-04, PRED-05, PRED-06, PRED-07
**Success Criteria** (what must be TRUE):
  1. Collector can upload or capture a material image
  2. Image is compressed before upload (max 1280px, quality ≤ 0.8, target ≤ 500KB)
  3. Frontend sends image to POST /api/v1/predictions as multipart/form-data
  4. Loading state shows dimmed image preview, progress bar, and step messages
  5. Result displays material name, scientific name, confidence, risk level, image quality
  6. If status is EXPERT_REVIEW_REQUIRED, shows escalation UI with [Request Expert Review] button
  7. Frontend does NOT decide risk rules — only displays backend response
**Plans**: 3 plans

Plans:
- [ ] 04-01: Build image uploader with browse + camera capture and compression
- [ ] 04-02: Build prediction service and loading overlay with progress steps
- [ ] 04-03: Build prediction result display with risk card and expert escalation

### Phase 5: Batch & Digital Passport
**Goal**: Implement batch creation from eligible identifications and the batch digital passport page
**Depends on**: Phase 4
**Requirements**: BATCH-01, BATCH-02, BATCH-03, BATCH-04, BATCH-05, FORM-05
**Success Criteria** (what must be TRUE):
  1. Collector can create a digital batch from an eligible identification
  2. Backend generates the Batch ID — frontend displays it, never generates it
  3. Batch creation form validates source location and notes
  4. Batch digital passport page shows Batch ID, Material, Scientific Name, Current Owner, Original Collector, AI Confidence, Risk, Verification Status, Creation Date
  5. Batch page shows supply-chain history timeline
  6. Batch ID remains the same throughout the supply chain
**Plans**: 3 plans

Plans:
- [ ] 05-01: Build batch creation modal with form validation
- [ ] 05-02: Build batch details page (digital passport)
- [ ] 05-03: Build batch service and batch list page

### Phase 6: Supply-Chain Transfer
**Goal**: Implement the complete transfer workflow — recipient search, transfer request, incoming transfers, accept/reject, and rejection recovery
**Depends on**: Phase 5
**Requirements**: TRANS-01, TRANS-02, TRANS-03, TRANS-04, TRANS-05, TRANS-06, TRANS-07, TRANS-08, FORM-03, FORM-04, PERF-03
**Success Criteria** (what must be TRUE):
  1. Batch owner can transfer batch to a specific registered participant
  2. Recipient search by Participant ID or Organization Name with role filtering, debounced 300ms
  3. Transfer creates TRANSFER_PENDING state — does NOT immediately change ownership
  4. Recipient sees incoming transfer requests with batch details
  5. Recipient can accept or reject incoming transfers
  6. Accept updates current owner; Reject keeps batch with sender and records reason
  7. Sender sees rejection reason and can re-transfer
  8. All action buttons have loading guards to prevent double-submits
**Plans**: 4 plans

Plans:
- [ ] 06-01: Build recipient search component with role filtering and debounce
- [ ] 06-02: Build transfer modal and transfer service
- [ ] 06-03: Build incoming transfers page with accept/reject
- [ ] 06-04: Build rejection recovery UI and transfer history display

### Phase 7: Timeline & QR
**Goal**: Implement supply-chain timeline visualization, transfer history, and QR code integration
**Depends on**: Phase 6
**Requirements**: HIST-01, HIST-02, QR-01, QR-02, QR-03, QR-04, PERF-02
**Success Criteria** (what must be TRUE):
  1. History page shows both identification history and supply-chain history, visually distinguishable
  2. All list pages support pagination (10/25/50 per page), sorting, and filtering
  3. Batch has QR code that encodes public batch URL
  4. Public batch page shows limited non-sensitive info with login prompt
  5. QR scanner supports camera scan, image upload, and manual Batch ID entry
  6. QR code contains only batch reference, NOT the full report or sensitive data
  7. QR scanner library is lazy-loaded only when /app/scan is opened
**Plans**: 3 plans

Plans:
- [ ] 07-01: Build history page with identification and supply-chain sections
- [ ] 07-02: Build QR code generation and public batch page
- [ ] 07-03: Build QR scanner page with camera, upload, and manual entry

### Phase 8: Expert & Admin
**Goal**: Implement expert review workflow, admin management pages, analytics, and complete testing suite
**Depends on**: Phase 7
**Requirements**: EXP-01, EXP-02, ADMIN-01, ADMIN-02, TEST-01, TEST-02, TEST-03
**Success Criteria** (what must be TRUE):
  1. Expert can view pending reviews and submit decisions
  2. Expert has dedicated routes (/expert/*) with role-based access
  3. Admin can manage users, materials, predictions, batches, reviews, and view analytics
  4. Admin has dedicated routes (/admin/*) with role-based access
  5. Unit tests with Vitest cover services (80%), utils (80%), components (70%)
  6. Integration tests with React Testing Library cover registration, login, transfer, accept flows
  7. E2E tests with Playwright cover complete user journeys
**Plans**: 3 plans

Plans:
- [ ] 08-01: Build expert review pages (dashboard, reviews, review details, history, materials)
- [ ] 08-02: Build admin pages (dashboard, users, materials, predictions, batches, reviews, analytics)
- [ ] 08-03: Write unit, integration, and E2E tests

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Frontend Foundation | 0/4 | Not started | - |
| 2. Auth & Registration | 0/3 | Not started | - |
| 3. Dashboard & Profile | 0/2 | Not started | - |
| 4. AI Identification | 0/3 | Not started | - |
| 5. Batch & Digital Passport | 0/3 | Not started | - |
| 6. Supply-Chain Transfer | 0/4 | Not started | - |
| 7. Timeline & QR | 0/3 | Not started | - |
| 8. Expert & Admin | 0/3 | Not started | - |