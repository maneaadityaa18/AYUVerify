# AyurVerify — Frontend Specification

> **Document:** `FRONTEND.md`
>
> **Project:** AyurVerify
>
> **Purpose:** Complete frontend architecture, UI/UX specification, page structure, component structure, API integration, user flows, state handling, and backend connection points.
>
> **Primary frontend stack:** React.js + Vite + Tailwind CSS
>
> **Backend:** FastAPI
>
> **Database:** MongoDB Atlas
>
> **AI:** YOLOv8n through FastAPI
>
> **Important:** This document defines how the frontend should behave and communicate with the backend. The frontend must NOT implement AI prediction logic itself.

---

# 1. Frontend Purpose

The AyurVerify frontend is a responsive web application that provides a simple interface for:

* Identifying medicinal plants/raw materials
* Uploading or capturing images
* Viewing AI predictions
* Understanding confidence and risk
* Viewing medicinal-material information
* Requesting expert verification
* Creating and managing batches
* Tracking supply-chain movement
* Viewing verification history
* Allowing experts to review uncertain cases
* Providing dashboards for different user roles

The frontend is the **presentation and interaction layer**.

The backend remains responsible for:

* Authentication
* Authorization
* AI inference
* Risk calculation
* Knowledge retrieval
* Batch operations
* Expert review
* Database operations

---

# 2. Core Frontend Principle

The frontend should NOT contain business-critical logic.

For example:

### ❌ Wrong

```text
React
 ↓
Calculate whether confidence is safe
 ↓
Decide VERIFIED
```

### ✅ Correct

```text
React
 ↓
POST /predictions
 ↓
FastAPI
 ↓
YOLO
 ↓
Risk Engine
 ↓
MongoDB / Knowledge
 ↓
FastAPI response
 ↓
React displays result
```

The frontend only displays the backend's authoritative result.

---

# 3. Technology Stack

## Core

```text
React.js
Vite
JavaScript / JSX
Tailwind CSS
```

## Routing

```text
React Router
```

## API Communication

```text
Axios
```

## Charts

```text
Recharts
```

## Icons

Use a lightweight icon library such as:

```text
Lucide React
```

## State

For the prototype:

```text
React Context
+
useState
+
useEffect
```

Do NOT introduce Redux unless the application actually requires it.

---

# 4. Frontend Architecture

Recommended structure:

```text
frontend/
│
├── src/
│   │
│   ├── main.jsx
│   ├── App.jsx
│   │
│   ├── assets/
│   │
│   ├── components/
│   │   ├── common/
│   │   ├── layout/
│   │   ├── prediction/
│   │   ├── batch/
│   │   ├── supply-chain/
│   │   ├── expert/
│   │   └── dashboard/
│   │
│   ├── pages/
│   │   ├── public/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── prediction/
│   │   ├── batches/
│   │   ├── supply-chain/
│   │   ├── expert/
│   │   └── admin/
│   │
│   ├── layouts/
│   │   ├── PublicLayout.jsx
│   │   └── DashboardLayout.jsx
│   │
│   ├── services/
│   │   ├── api.js
│   │   ├── authService.js
│   │   ├── predictionService.js
│   │   ├── materialService.js
│   │   ├── batchService.js
│   │   └── expertService.js
│   │
│   ├── context/
│   │   └── AuthContext.jsx
│   │
│   ├── hooks/
│   │
│   ├── utils/
│   │
│   ├── routes/
│   │   └── AppRoutes.jsx
│   │
│   └── styles/
│
├── public/
├── .env
├── package.json
└── README.md
```

---

# 5. Application Layout

There are two major frontend layouts.

## Public Layout

Used for:

* Landing page
* About
* How it works
* Login
* Register

Example:

```text
┌──────────────────────────────────────────┐
│ Logo     Home  How It Works  About Login │
├──────────────────────────────────────────┤
│                                          │
│              PAGE CONTENT                │
│                                          │
└──────────────────────────────────────────┘
```

---

# 6. Dashboard Layout

Used after login.

```text
┌──────────────┬───────────────────────────────┐
│              │ Header                        │
│  SIDEBAR     ├───────────────────────────────┤
│              │                               │
│ Dashboard    │                               │
│ Identify     │        PAGE CONTENT           │
│ Batches      │                               │
│ History      │                               │
│ Supply Chain │                               │
│              │                               │
│ Settings     │                               │
└──────────────┴───────────────────────────────┘
```

Sidebar items should change according to the user's role.

---

# 7. Visual Design Direction

The application should feel like a **professional healthcare/Ayurvedic supply-chain platform**, not a generic AI demo.

Desired visual characteristics:

* Clean
* Professional
* Trustworthy
* Modern
* Minimal
* Nature-inspired
* Good readability
* Strong information hierarchy
* Responsive
* Accessible

Avoid:

* Excessive neon
* Overuse of gradients
* Gaming-style UI
* Excessive glassmorphism
* Too many animations
* Fake futuristic AI effects

Animations should be subtle and purposeful.

---

# 8. Color Philosophy

The exact palette can be adjusted during implementation, but the design should generally communicate:

```text
Primary:
Natural / botanical / trustworthy

Success:
Verified / safe

Warning:
Needs attention

Danger:
High risk / rejected

Neutral:
Information / system state
```

Do not rely only on color.

For example:

```text
🟢 VERIFIED
🟡 CAUTION
🔴 EXPERT REVIEW
```

should include text/icons in addition to color.

---

# 9. Responsive Design

The application must work on:

```text
Desktop
Laptop
Tablet
Mobile
```

The most important mobile flow is:

```text
Login
 ↓
Dashboard
 ↓
Capture/upload image
 ↓
Prediction
 ↓
Result
```

A collector should be able to use the identification workflow from a phone.

---

# 10. Route Structure

Recommended routes:

```text
/
 /about
 /how-it-works

/auth/login
/auth/register

/app/dashboard
/app/identify
/app/history
/app/batches
/app/batches/:id
/app/supply-chain

/expert/reviews
/expert/reviews/:id

/admin
/admin/materials
/admin/users
```

The exact route names may change, but the functionality should remain.

---

# 11. Authentication Flow

## Login Page

Fields:

```text
Email
Password
```

Actions:

```text
Login
Register
Forgot password (optional for prototype)
```

---

## Backend Connection

When user clicks:

```text
LOGIN
```

Frontend calls:

```http
POST /api/v1/auth/login
```

Request:

```json
{
  "email": "user@example.com",
  "password": "password"
}
```

Backend returns an authentication token and user information.

Example:

```json
{
  "access_token": "...",
  "token_type": "bearer",
  "user": {
    "id": "...",
    "name": "User",
    "role": "COLLECTOR"
  }
}
```

---

# 12. Authentication State

After successful login:

```text
Backend
 ↓
JWT
 ↓
Frontend AuthContext
 ↓
Store authentication state
 ↓
Redirect to dashboard
```

The frontend should maintain:

```text
isAuthenticated
user
role
token
```

Do not expose the JWT unnecessarily in the UI.

---

# 13. Protected Routes

Pages under `/app/*` require authentication.

Example:

```text
Unauthenticated user
        ↓
/app/dashboard
        ↓
Redirect
        ↓
/auth/login
```

---

# 14. Role-Based UI

The frontend should display navigation based on role.

Example:

## Collector

```text
Dashboard
Identify Material
My Batches
Verification History
Profile
```

## Wholesaler

```text
Dashboard
Verify Batch
Received Batches
Supply Chain
History
Profile
```

## Distributor

```text
Dashboard
Received Batches
Transfer Batch
Supply Chain
History
```

## Manufacturer

```text
Dashboard
Incoming Materials
Verify Batch
Supply Chain
History
```

## Expert

```text
Dashboard
Pending Reviews
Review History
Materials
Profile
```

## Admin

```text
Dashboard
Users
Materials
Predictions
Batches
Expert Reviews
System Analytics
```

---

# 15. IMPORTANT — Frontend Role Security

Hiding a button is NOT security.

Example:

```text
Frontend:
Hide Expert Review button from Collector
```

is only UI behavior.

The backend must also reject:

```text
Collector
 ↓
PATCH /api/v1/expert/reviews/123
```

The frontend should assume backend authorization is authoritative.

---

# 16. Landing Page

Route:

```text
/
```

Purpose:

Explain the problem and solution quickly.

Sections:

### Hero

Example structure:

```text
AI-Powered Identification
for Medicinal Plants & Ayurvedic Raw Materials

Identify. Verify. Trace.

[Try Identification]
[How It Works]
```

---

### Problem Section

Explain:

* Misidentification
* Similar-looking materials
* Adulteration/substitution risk
* Supply-chain verification challenges

---

### Solution Section

```text
Image
 ↓
AI Identification
 ↓
Risk Assessment
 ↓
Expert Verification
 ↓
Supply Chain Traceability
```

---

### Features

Cards:

```text
AI Identification
Risk Assessment
Expert Review
Batch Verification
Supply Chain Tracking
Verification History
```

---

### How It Works

Use a visual step flow:

```text
01 Upload
02 Analyze
03 Verify
04 Track
```

---

### CTA

```text
Start Identification
```

---

# 17. Dashboard

Route:

```text
/app/dashboard
```

The dashboard changes based on role.

For a collector:

```text
Welcome, User

┌──────────────┐
│ Identified   │
│ 24           │
└──────────────┘

┌──────────────┐
│ Batches      │
│ 8            │
└──────────────┘

┌──────────────┐
│ Pending      │
│ 2            │
└──────────────┘
```

Recent activity:

```text
Recent Identifications
Recent Batches
Pending Reviews
```

---

# 18. Dashboard Backend Connection

Dashboard should call:

```http
GET /api/v1/dashboard/summary
```

Example response:

```json
{
  "total_identifications": 24,
  "total_batches": 8,
  "pending_reviews": 2,
  "verified_batches": 6,
  "high_risk_cases": 1
}
```

Frontend maps this data into cards.

Do NOT hard-code dashboard numbers in the final implementation.

---

# 19. Identification Page

Route:

```text
/app/identify
```

This is one of the most important pages.

The page should have:

```text
Upload / Capture
        ↓
Preview
        ↓
Analyze
        ↓
Loading
        ↓
Prediction Result
```

---

# 20. Image Upload UI

Display:

```text
┌─────────────────────────────────┐
│                                 │
│        Upload Image             │
│                                 │
│    Drag & Drop / Browse         │
│                                 │
│       📷 Capture Image          │
│                                 │
└─────────────────────────────────┘
```

Allowed image formats should be determined by backend-supported formats.

Frontend should still perform basic validation before uploading.

---

# 21. Image Preview

After selecting an image:

```text
┌───────────────────────┐
│                       │
│      IMAGE            │
│                       │
└───────────────────────┘

Image: sample.jpg

[Change Image]

[Analyze Material]
```

Do not automatically send the image merely because it was selected unless explicitly designed that way.

The user should understand when analysis begins.

---

# 22. Prediction API Connection

When user clicks:

```text
ANALYZE MATERIAL
```

Frontend sends:

```http
POST /api/v1/predictions
```

Use:

```text
multipart/form-data
```

Example:

```text
image = selected file
```

Axios handles the request.

---

# 23. Prediction Loading State

While backend is processing:

```text
Analyzing sample...

Checking image quality
Analyzing visual characteristics
Running AI model
Assessing risk
Preparing verification result
```

Do not show fake percentage progress unless the backend actually provides progress information.

Use an indeterminate loading animation instead.

---

# 24. Prediction Result Page

After successful API response:

```text
┌───────────────────────────────────────────┐
│ AI Identification                         │
│                                           │
│ Ashwagandha Root                          │
│ Confidence: 94%                           │
│                                           │
│ 🟢 LOW RISK                               │
│                                           │
│ Image Quality: Good                       │
└───────────────────────────────────────────┘
```

---

# 25. Detection Visualization

If YOLO returns bounding boxes, overlay them on the uploaded image.

Example:

```text
┌─────────────────────────────┐
│        IMAGE                │
│                             │
│   ┌──────────────────┐      │
│   │ Ashwagandha 94%  │      │
│   └──────────────────┘      │
│                             │
└─────────────────────────────┘
```

The bounding box should come from the backend's actual coordinates.

Do not invent bounding boxes on the frontend.

---

# 26. Prediction Details

Show:

```text
Predicted Material
Scientific Name
Confidence
Image Quality
Risk Level
Detection Count
Timestamp
```

Example:

```text
Material:
Ashwagandha Root

Scientific Name:
Withania somnifera

Confidence:
94%

Risk:
LOW

Image Quality:
GOOD
```

---

# 27. Knowledge Information Panel

Below prediction:

```text
About This Material
```

Display information returned by:

```http
GET /api/v1/materials/{id}
```

or included in the prediction response.

Possible sections:

```text
Scientific Name
Common Names
Material Type
Description
Morphological Characteristics
Known Similar Materials
Known Substitutes
Known Adulterants
Reference Sources
```

---

# 28. Risk Result

Example:

```text
┌─────────────────────────────┐
│ 🟢 LOW RISK                 │
│                             │
│ AI confidence is high and   │
│ image quality is good.      │
│                             │
│ Recommendation:             │
│ Continue with verification. │
└─────────────────────────────┘
```

---

# 29. Medium-Risk Result

Example:

```text
🟡 CAUTION

Identification confidence is moderate.

Recommended action:

• Capture another image
• Use a different angle
• Request expert verification
```

The exact recommendation should ideally come from backend response data.

---

# 30. High-Risk Result

Example:

```text
🔴 EXPERT REVIEW REQUIRED

The AI could not confidently identify this material.

Possible predictions:

Material A — 54%
Material B — 38%

Recommended:
Request expert verification.
```

Primary CTA:

```text
[Request Expert Review]
```

---

# 31. Expert Review Connection

When user requests expert review:

```http
POST /api/v1/expert/reviews
```

Request may contain:

```json
{
  "identificationId": "...",
  "reasonForFlag": "Low confidence prediction"
}
```

Backend creates the review.

Frontend then displays:

```text
✓ Expert review requested

Review ID: ...
Status: Pending
```

---

# 32. Batch Creation

After a suitable identification:

```text
[Create Batch]
```

opens a batch creation form.

Fields:

```text
Material
Quantity (optional if supported)
Source
Location
Notes
```

The backend should determine the final batch ID.

Frontend sends:

```http
POST /api/v1/batches
```

Example:

```json
{
  "material": "Ashwagandha Root",
  "identificationId": "...",
  "sourceNode": "Collector",
  "location": "...",
  "notes": "..."
}
```

---

# 33. Batch Creation Result

After success:

```text
Batch Created Successfully

Batch ID
AYV-2026-00001

Material
Ashwagandha Root

Status
AI IDENTIFIED / VERIFIED / PENDING REVIEW
```

Primary action:

```text
[View Batch]
```

---

# 34. Batch Details Page

Route:

```text
/app/batches/:id
```

Display:

```text
Batch ID
Material
Current Owner
Current Status
Created Date
Risk Level
AI Identification
Verification Status
```

---

# 35. Verification History

Show a timeline.

Example:

```text
● 10 Aug 2026
  Created by Collector
  AI identification completed

● 10 Aug 2026
  Verified by Wholesaler

● 11 Aug 2026
  Transferred to Distributor

● 12 Aug 2026
  Received by Manufacturer
```

This data comes from:

```http
GET /api/v1/batches/{id}/history
```

The frontend should render the timeline dynamically.

---

# 36. Supply Chain Page

Route:

```text
/app/supply-chain
```

Visualize:

```text
Collector
   │
   ▼
Wholesaler
   │
   ▼
Distributor
   │
   ▼
Manufacturer
```

Each node should show:

```text
Actor
Organization
Status
Timestamp
```

If a batch is currently at a node, visually highlight it.

---

# 37. Batch Verification

For a wholesaler/distributor/manufacturer:

```text
[Verify Batch]
```

opens a verification interface.

The user enters/scans:

```text
Batch ID
```

Frontend calls:

```http
GET /api/v1/batches/{id}
```

Then displays:

```text
Material
AI result
Risk
Previous verification
Current owner
History
```

Then:

```text
[Confirm Verification]
```

calls:

```http
POST /api/v1/batches/{id}/verify
```

---

# 38. Batch Transfer

When a role is allowed to transfer a batch:

```text
[Transfer Batch]
```

Form:

```text
Destination Role
Destination Organization
Optional Note
```

Backend:

```http
POST /api/v1/batches/{id}/transfer
```

The backend should validate whether the current user is allowed to transfer that batch.

---

# 39. History Page

Route:

```text
/app/history
```

Display previous identifications.

Example table:

```text
Date
Material
Confidence
Risk
Status
Batch
Action
```

Clicking a row opens:

```text
Prediction Details
```

Backend:

```http
GET /api/v1/predictions/history
```

---

# 40. Expert Dashboard

Route:

```text
/expert/reviews
```

The expert should see:

```text
Pending Reviews: 8

┌──────────────────────────────────────────┐
│ Material A                               │
│ Confidence: 51%                          │
│ Risk: HIGH                               │
│ Submitted: 10 Aug 2026                   │
│                                          │
│ [Review Case]                            │
└──────────────────────────────────────────┘
```

Backend:

```http
GET /api/v1/expert/reviews/pending
```

---

# 41. Expert Review Page

Route:

```text
/expert/reviews/:id
```

Display:

```text
Original Image
AI Prediction
Confidence
Alternative Predictions
Image Quality
Material Information
Batch Information
Previous Verification History
```

Then expert actions:

```text
[Approve]
[Reject]
[Request New Sample]
```

Comments field:

```text
Expert Comments
```

---

# 42. Expert Decision API

When expert submits decision:

```http
PATCH /api/v1/expert/reviews/{id}
```

Example:

```json
{
  "decision": "APPROVED",
  "comments": "Visual characteristics are consistent with the predicted material."
}
```

Backend updates the review and related status.

Frontend displays the returned authoritative status.

---

# 43. Admin Dashboard

Admin should have access to:

```text
Users
Materials
Identifications
Batches
Expert Reviews
Analytics
```

Admin UI should remain simple for the prototype.

---

# 44. Materials Management

Admin can:

```text
View materials
Add material
Edit material
View material details
```

Material form:

```text
Material Name
Scientific Name
Material Type
Common Names
Description
Morphological Features
Known Substitutes
Known Adulterants
Reference Sources
```

Backend:

```http
GET    /api/v1/materials
POST   /api/v1/materials
PATCH  /api/v1/materials/{id}
```

---

# 45. API Service Layer

Do NOT call Axios directly everywhere.

Create service files.

Example:

```text
services/
├── api.js
├── authService.js
├── predictionService.js
├── materialService.js
├── batchService.js
└── expertService.js
```

---

# 46. Axios Configuration

Create one central Axios instance.

Responsibilities:

```text
Base URL
Authentication headers
Request handling
Response handling
Error handling
```

Example environment variable:

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

Production value should come from deployment environment.

Never hard-code production URLs throughout components.

---

# 47. API Flow Example — Identification

This is the MOST IMPORTANT frontend/backend flow.

```text
USER
 │
 │ Selects image
 ▼
React Identify Page
 │
 │ POST multipart/form-data
 ▼
Axios
 │
 ▼
FastAPI /predictions
 │
 ├── Validate image
 │
 ├── Image quality
 │
 ├── YOLOv8n
 │
 ├── Risk Engine
 │
 ├── Material Knowledge
 │
 └── MongoDB
 │
 ▼
JSON Response
 │
 ▼
Axios
 │
 ▼
React State
 │
 ▼
Prediction Result UI
```

The frontend should NOT directly access:

```text
YOLO
MongoDB
Python
```

The frontend communicates with the backend API only.

---

# 48. API Flow Example — Authentication

```text
Login Form
    ↓
React
    ↓
Axios
    ↓
POST /auth/login
    ↓
FastAPI
    ↓
MongoDB
    ↓
JWT Response
    ↓
AuthContext
    ↓
Dashboard
```

---

# 49. API Flow Example — Batch

```text
Prediction Result
       ↓
Create Batch
       ↓
React Form
       ↓
POST /batches
       ↓
FastAPI
       ↓
Validate User
       ↓
Create Batch
       ↓
MongoDB
       ↓
Return Batch
       ↓
React
       ↓
Batch Details Page
```

---

# 50. API Flow Example — Expert Review

```text
Low Confidence Prediction
          ↓
User clicks:
Request Expert Review
          ↓
POST /expert/reviews
          ↓
FastAPI
          ↓
MongoDB
          ↓
Review Created
          ↓
Expert Dashboard
          ↓
GET /expert/reviews/pending
          ↓
Expert Opens Case
          ↓
PATCH /expert/reviews/{id}
          ↓
Decision Saved
          ↓
Frontend Displays Final Status
```

---

# 51. Global UI States

Every API-connected page should handle:

## Loading

```text
Loading...
```

Use skeletons/spinners where appropriate.

---

## Success

```text
✓ Operation completed successfully
```

---

## Error

```text
Something went wrong.

Please try again.
```

Do not show raw backend stack traces.

---

## Empty

Example:

```text
No verification history yet.
```

---

# 52. Network Error

If backend is unavailable:

```text
Unable to connect to AyurVerify server.

Please check your connection and try again.
```

Do not crash the entire application.

---

# 53. Authentication Expiry

If backend returns:

```text
401 Unauthorized
```

frontend should:

```text
Clear invalid authentication state
 ↓
Redirect to login
 ↓
Show:
"Your session has expired. Please log in again."
```

---

# 54. Permission Error

If backend returns:

```text
403 Forbidden
```

show:

```text
You do not have permission to perform this action.
```

Do not simply hide the error.

---

# 55. 404 Handling

If a batch or prediction doesn't exist:

```text
Batch not found.
```

Provide:

```text
[Back to Batches]
```

---

# 56. Frontend Component Principles

Components should be reusable.

Examples:

```text
Button
Card
Modal
Badge
StatusBadge
ConfidenceBar
RiskBadge
DataTable
Timeline
ImageUploader
PredictionCard
MaterialInfoCard
BatchCard
```

Avoid duplicating the same UI code across pages.

---

# 57. Prediction Components

Recommended:

```text
prediction/
├── ImageUploader.jsx
├── ImagePreview.jsx
├── PredictionCard.jsx
├── DetectionOverlay.jsx
├── ConfidenceDisplay.jsx
├── RiskCard.jsx
├── MaterialInfo.jsx
└── ExpertReviewCTA.jsx
```

---

# 58. Batch Components

```text
batch/
├── BatchCard.jsx
├── BatchStatus.jsx
├── BatchDetails.jsx
├── BatchTimeline.jsx
├── CreateBatchModal.jsx
└── TransferBatchModal.jsx
```

---

# 59. Dashboard Components

```text
dashboard/
├── StatCard.jsx
├── RecentActivity.jsx
├── RiskOverview.jsx
├── BatchOverview.jsx
└── DashboardChart.jsx
```

---

# 60. Status System

Use consistent statuses.

Example:

```text
AI_IDENTIFIED
CAUTION
EXPERT_REVIEW_REQUIRED
EXPERT_APPROVED
EXPERT_REJECTED
VERIFIED
TRANSFERRED
```

Frontend should map backend statuses to human-readable labels.

Example:

```text
EXPERT_REVIEW_REQUIRED
        ↓
Expert Review Required
```

Do not duplicate business rules in multiple components.

Create a central status configuration.

---

# 61. Risk Display

Use a reusable risk component.

```text
LOW
MEDIUM
HIGH
```

Example:

```text
LOW
94% confidence
```

```text
MEDIUM
72% confidence
```

```text
HIGH
54% confidence
```

The frontend should display the risk value received from the backend.

---

# 62. Confidence Display

Confidence can be represented with:

```text
Percentage
Progress bar
Badge
```

Example:

```text
Confidence
94%

██████████████████░░
```

Do not imply that confidence equals probability of authenticity.

Use wording such as:

> AI model confidence

---

# 63. Image Capture

Where browser support allows:

```text
Capture Image
```

can use a mobile camera input.

The frontend should gracefully fall back to:

```text
Upload from device
```

if camera capture is unavailable.

---

# 64. Accessibility

The frontend should include:

* Semantic HTML
* Keyboard navigation
* Visible focus states
* Proper labels
* Accessible buttons
* Alt text for meaningful images
* Sufficient text contrast
* Avoid color-only status communication

---

# 65. Performance

Avoid unnecessary API calls.

For example:

Do not call:

```text
GET /materials
```

every time a component re-renders.

Use appropriate React state/effect patterns.

Images should be previewed locally before upload.

Do not send unnecessarily huge files.

---

# 66. Security Rules

Never place:

```text
MongoDB credentials
JWT secret
Backend secrets
AI model credentials
Private API keys
```

inside frontend code.

Remember:

```text
VITE_* variables
```

are exposed to the browser.

Only public configuration belongs there.

---

# 67. Frontend Environment

Development:

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

Production:

```env
VITE_API_BASE_URL=<deployed-backend-url>/api/v1
```

Do not hard-code URLs.

---

# 68. Frontend Error Boundaries

The application should have a global error boundary where appropriate.

If an unexpected component error occurs:

```text
Something went wrong.

[Return to Dashboard]
```

The entire application should not become unusable because one component failed.

---

# 69. Demo Mode

A demo mode may be created only if explicitly required.

If demo/mock data is used:

```text
DEMO DATA
```

must be clearly distinguishable from real AI predictions.

Never mix fake predictions into real model metrics.

---

# 70. SIH Demo Priority

The frontend should prioritize these flows for the live demonstration:

## Flow 1 — AI Identification

```text
Login
 ↓
Dashboard
 ↓
Identify Material
 ↓
Upload Image
 ↓
Analyze
 ↓
AI Result
 ↓
Risk Result
```

---

## Flow 2 — Expert Escalation

```text
Low-confidence result
 ↓
Request Expert Review
 ↓
Expert Dashboard
 ↓
Review Case
 ↓
Approve / Reject / Request New Sample
```

---

## Flow 3 — Supply Chain

```text
Create Batch
 ↓
Wholesaler
 ↓
Verify
 ↓
Distributor
 ↓
Transfer
 ↓
Manufacturer
 ↓
View Complete History
```

These three flows demonstrate the core value of the project.

---

# 71. Complete Frontend User Journey

```text
                         LANDING PAGE
                              │
                              ▼
                         LOGIN / REGISTER
                              │
                              ▼
                          DASHBOARD
                              │
               ┌──────────────┼──────────────┐
               │              │              │
               ▼              ▼              ▼
           IDENTIFY         BATCHES       HISTORY
               │              │
               ▼              │
         UPLOAD IMAGE         │
               │              │
               ▼              │
         IMAGE PREVIEW        │
               │              │
               ▼              │
            ANALYZE           │
               │              │
               ▼              │
        FASTAPI PREDICTION    │
               │              │
               ▼              │
          YOLOv8n              │
               │              │
               ▼              │
        RISK ENGINE            │
               │              │
        ┌──────┴──────┐       │
        ▼             ▼       │
     LOW/MEDIUM      HIGH     │
        │             │       │
        ▼             ▼       │
   CREATE BATCH    EXPERT     │
        │          REVIEW     │
        │             │       │
        └──────┬──────┘       │
               ▼              │
             BATCH ◄──────────┘
               │
               ▼
        SUPPLY CHAIN
               │
      ┌────────┼─────────┐
      ▼        ▼         ▼
 Wholesaler Distributor Manufacturer
      │        │         │
      └────────┼─────────┘
               ▼
      VERIFICATION HISTORY
```

---

# 72. Backend ↔ Frontend Responsibility Map

This section is extremely important.

| Feature                | Frontend | Backend                     |
| ---------------------- | -------- | --------------------------- |
| Login UI               | ✅        | Authentication              |
| Registration UI        | ✅        | User creation               |
| JWT storage/state      | ✅        | Token generation/validation |
| Role-based navigation  | ✅        | Role authorization          |
| Image selection        | ✅        | —                           |
| Image preview          | ✅        | —                           |
| Image validation       | Basic    | Final validation            |
| YOLO inference         | ❌        | ✅                           |
| Confidence calculation | ❌        | ✅                           |
| Risk calculation       | ❌        | ✅                           |
| Material knowledge     | Display  | Store/retrieve              |
| Expert review UI       | ✅        | Review logic                |
| Batch creation UI      | ✅        | Batch creation              |
| Batch ID generation    | ❌        | ✅                           |
| Supply-chain transfer  | UI       | Authorization + update      |
| Verification history   | Display  | Store/retrieve              |
| Dashboard charts       | Render   | Provide data                |
| MongoDB                | ❌        | ✅                           |

---

# 73. Golden Rule for API Integration

Whenever implementing a frontend feature, explicitly identify:

```text
1. Which user action starts the flow?
2. Which API endpoint is called?
3. What request data is sent?
4. What response is expected?
5. What loading state is shown?
6. What success state is shown?
7. What error state is shown?
8. Where does the user go next?
```

Example:

```text
USER:
Clicks "Analyze"

API:
POST /api/v1/predictions

REQUEST:
multipart/form-data image

BACKEND:
Validate → YOLO → Risk → Knowledge

RESPONSE:
Prediction object

FRONTEND:
Show result

NEXT:
Create Batch / Request Expert Review
```

Every major feature should follow this pattern.

---

# 74. Development Order

Build the frontend in this order:

## Phase 1 — Foundation

```text
React + Vite
Tailwind
Routing
Global styles
Axios
Layouts
```

---

## Phase 2 — Authentication

```text
Login
Register
AuthContext
Protected routes
Role-based navigation
```

Backend connection:

```text
POST /auth/login
POST /auth/register
GET /auth/me
```

---

## Phase 3 — Dashboard

```text
Dashboard layout
Sidebar
Header
Stats
Recent activity
```

Backend:

```text
GET /dashboard/summary
```

---

## Phase 4 — Identification

```text
Image upload
Preview
Camera capture
Analyze button
Loading state
Prediction result
Risk result
Material information
```

Backend:

```text
POST /predictions
GET /materials/{id}
```

---

## Phase 5 — Expert Review

```text
Request review
Expert dashboard
Review page
Decision UI
```

Backend:

```text
POST /expert/reviews
GET /expert/reviews/pending
PATCH /expert/reviews/{id}
```

---

## Phase 6 — Batches

```text
Create batch
Batch list
Batch details
Batch status
Verification
```

Backend:

```text
POST /batches
GET /batches
GET /batches/{id}
POST /batches/{id}/verify
```

---

## Phase 7 — Supply Chain

```text
Transfer UI
Supply chain timeline
Current owner
Verification history
```

Backend:

```text
POST /batches/{id}/transfer
GET /batches/{id}/history
```

---

## Phase 8 — Analytics

```text
Charts
Risk statistics
Batch statistics
Identification statistics
```

Backend:

```text
GET /dashboard/identifications
GET /dashboard/batches
GET /dashboard/risk-statistics
```

---

# 75. Definition of Done — Frontend

A frontend feature is complete only when:

```text
UI implemented
      ↓
Responsive
      ↓
API connected
      ↓
Loading state
      ↓
Success state
      ↓
Error state
      ↓
Empty state
      ↓
Authentication checked
      ↓
Role access checked
      ↓
Tested with real backend
```

A visually complete page with hard-coded data is NOT considered complete.

---

# 76. AI Coding Agent Instructions

Before modifying the frontend:

1. Read `PROJECT.md`.
2. Read `FRONTEND.md`.
3. Inspect the existing repository.
4. Inspect existing API service functions.
5. Inspect the backend API contract if available.
6. Do not invent endpoints.
7. Do not hard-code API responses.
8. Do not create fake AI predictions.
9. Reuse existing components.
10. Keep components modular.
11. Preserve existing functionality.
12. Test changes.

When an API does not exist yet:

> Clearly mark the integration point and coordinate with the backend instead of silently creating a fake API.

---

# 77. Important AI Agent Rule

If the backend returns a field that does not yet exist in the frontend:

```text
Do NOT assume its structure.
```

Instead:

```text
Inspect backend schema
OR
ask for the API contract
OR
use the documented contract in PROJECT.md
```

Frontend and backend must agree on a stable API response structure.

---

# 78. No Fake Data Rule

During development, temporary mock data may be used to build UI layouts.

However:

```text
Mock data
≠
Real application functionality
```

Before final demo:

```text
All important screens
        ↓
Real backend
        ↓
Real MongoDB
        ↓
Real YOLO model
```

The demo should not pretend that mock data is real.

---

# 79. Final Frontend Architecture

```text
                    USER
                      │
                      ▼
             React + Tailwind
                      │
              React Router
                      │
          ┌───────────┴───────────┐
          │                       │
       Public                  Dashboard
          │                       │
          │              ┌────────┼─────────┐
          │              │        │         │
          │          Identify   Batches   History
          │              │        │
          │              ▼        ▼
          │         Axios API Layer
          │              │
          └──────────────┼───────────────────────┐
                         ▼                       │
                    FastAPI Backend              │
                         │                       │
              ┌──────────┼───────────┐           │
              ▼          ▼           ▼           │
            Auth       YOLO       Business       │
                       + Risk       Logic         │
                         │           │            │
                         └─────┬─────┘            │
                               ▼                  │
                            MongoDB               │
                               │                  │
                               ▼                  │
                      Verification History        │
                               │                  │
                               └──────────────────┘
```

---

# 80. Final Frontend Goal

The final frontend should make the complete AyurVerify concept understandable **without requiring the user or judge to understand the underlying code**.

A judge should be able to see:

```text
Upload a medicinal material
          ↓
AI identifies it
          ↓
Confidence is shown
          ↓
Risk is assessed
          ↓
Uncertain cases go to experts
          ↓
Verified material becomes a batch
          ↓
Batch moves through the supply chain
          ↓
Every verification is recorded
```

The UI should make this journey obvious, simple, and trustworthy.

---

# 81. Final Instruction

**Do not build the frontend as a collection of disconnected pages.**

Build it as one connected workflow:

```text
AUTHENTICATION
      ↓
DASHBOARD
      ↓
IDENTIFICATION
      ↓
PREDICTION
      ↓
RISK
      ↓
EXPERT REVIEW
      ↓
BATCH
      ↓
SUPPLY CHAIN
      ↓
VERIFICATION HISTORY
```

Every screen should have a clear reason to exist, a clear backend connection, and a clear next action.

**The frontend is successful when the user can complete the entire AyurVerify workflow naturally from beginning to end.**
