# TestSprite AI Testing Report (MCP)

---

## 1️⃣ Document Metadata

| Field | Value |
|---|---|
| **Project Name** | dclaw-space |
| **Project Type** | Frontend — Next.js 14 App Router |
| **Test Date** | 2026-05-23 |
| **Prepared by** | TestSprite AI + Claude Code |
| **Test Mode** | Development (dev server, capped at 15 high-priority tests) |
| **Total Tests Run** | 15 of 24 planned |
| **Pass Rate** | 33.33% (5 passed / 15 run) |
| **Dashboard** | https://www.testsprite.com/dashboard/mcp/tests/f3c8f358-b009-4e98-a64f-4a9b82b9e147 |

---

## 2️⃣ Requirement Validation Summary

### REQ-01 · Authentication & Registration

> Users must be able to register a new workspace and log in with existing credentials.

#### TC002 — New user completes workspace setup and reaches the dashboard
- **Test Code:** [TC002_New_user_completes_workspace_setup_and_reaches_the_dashboard.py](./TC002_New_user_completes_workspace_setup_and_reaches_the_dashboard.py)
- **Result Link:** https://www.testsprite.com/dashboard/mcp/tests/f3c8f358-b009-4e98-a64f-4a9b82b9e147/f5471340-e2e9-4ca0-8bff-a1a7997eb31f
- **Status:** ✅ Passed
- **Analysis:** Registration → onboarding → dashboard flow works end-to-end. The workspace creation form accepts all required fields and the app correctly redirects to onboarding, then the dashboard after completion.

---

#### TC003 — New user creates a workspace account and reaches onboarding
- **Test Code:** [TC003_New_user_creates_a_workspace_account_and_reaches_onboarding.py](./TC003_New_user_creates_a_workspace_account_and_reaches_onboarding.py)
- **Result Link:** https://www.testsprite.com/dashboard/mcp/tests/f3c8f358-b009-4e98-a64f-4a9b82b9e147/9a3dbba9-27ba-4f05-96ac-2a9f9cb02707
- **Status:** ✅ Passed
- **Analysis:** The registration form successfully creates a new account and lands the user on the onboarding flow. Form validation and the redirect to `/onboarding` behave correctly.

---

#### TC001 — Returning user logs in and reaches the dashboard
- **Test Code:** [TC001_Returning_user_logs_in_and_reaches_the_dashboard.py](./TC001_Returning_user_logs_in_and_reaches_the_dashboard.py)
- **Result Link:** https://www.testsprite.com/dashboard/mcp/tests/f3c8f358-b009-4e98-a64f-4a9b82b9e147/7f91f28d-c57f-423d-8d27-4bc928a81d54
- **Status:** 🚫 BLOCKED
- **Analysis:** No registered test credentials were provided to TestSprite. The AI agent fell back to example@gmail.com / password123 which are not valid accounts in this environment. The login form stays on-screen after submission. **Root cause: missing `{{LOGIN_USER}}` / `{{LOGIN_PASSWORD}}` environment variables in TestSprite config.** All other login-dependent tests are blocked for the same reason.

---

#### TC004 — Returning employee logs in and sees their dashboard overview
- **Result Link:** https://www.testsprite.com/dashboard/mcp/tests/f3c8f358-b009-4e98-a64f-4a9b82b9e147/dd153647-98d3-442a-98b5-fb2d2a715023
- **Status:** 🚫 BLOCKED
- **Analysis:** Same root cause as TC001 — fallback credentials rejected, no UI error message exposed to the test agent, login hangs at "Signing in…".

---

### REQ-02 · Desk Booking

> Users must be able to browse available desks by floor/date and create a desk booking.

#### TC006 — Employee books a desk from the desks page
- **Test Code:** [TC006_Employee_books_a_desk_from_the_desks_page.py](./TC006_Employee_books_a_desk_from_the_desks_page.py)
- **Result Link:** https://www.testsprite.com/dashboard/mcp/tests/f3c8f358-b009-4e98-a64f-4a9b82b9e147/29432c6e-6512-40a5-8f50-2950f4b4c6de
- **Status:** ✅ Passed
- **Analysis:** The test agent successfully registered a fresh account, navigated to `/desks`, selected a floor and date, booked an available desk, and confirmed the booking appears in the list. The full booking flow is functional.

---

#### TC005 — User books a desk from the desk browser
- **Result Link:** https://www.testsprite.com/dashboard/mcp/tests/f3c8f358-b009-4e98-a64f-4a9b82b9e147/65e828ef-94eb-4da7-9fa7-f83b2c55d555
- **Status:** 🚫 BLOCKED
- **Analysis:** Login with pre-existing credentials failed (no valid test account). Desk browser unreachable without authentication.

---

### REQ-03 · Room Booking

> Users must be able to search for available meeting rooms by time range and book one.

#### TC007 — User books a room from the room browser
- **Result Link:** https://www.testsprite.com/dashboard/mcp/tests/f3c8f358-b009-4e98-a64f-4a9b82b9e147/228b3b07-fc32-4e98-9b0d-b96ae33a5f2b
- **Status:** 🚫 BLOCKED
- **Analysis:** The rooms page returned "No rooms available. Try different times." across 6 different search permutations (various dates, times, and floor filters). **Root cause: no rooms have been seeded in the test environment.** The booking UI itself may be functional but cannot be verified without room data.

---

#### TC008 — Employee books a room from the rooms page
- **Result Link:** https://www.testsprite.com/dashboard/mcp/tests/f3c8f358-b009-4e98-a64f-4a9b82b9e147/04361ffd-4316-4995-a249-2ac691b0a8e9
- **Status:** 🚫 BLOCKED
- **Analysis:** Same dual blockers: no valid login credentials and no rooms in the environment.

---

### REQ-04 · Booking Management (Check-in & Cancellation)

> Users must be able to check in to a confirmed booking and cancel existing bookings.

#### TC009 — User cancels an existing desk or room booking
- **Result Link:** https://www.testsprite.com/dashboard/mcp/tests/f3c8f358-b009-4e98-a64f-4a9b82b9e147/70d845c3-76ad-41db-a594-45c03c1a4cc0
- **Status:** 🚫 BLOCKED
- **Analysis:** Could not authenticate. Bookings page unreachable.

---

#### TC010 — Employee checks in to a desk booking
- **Result Link:** https://www.testsprite.com/dashboard/mcp/tests/f3c8f358-b009-4e98-a64f-4a9b82b9e147/0973ea3e-6969-49ad-b86d-6b2b2d63a396
- **Status:** 🚫 BLOCKED
- **Analysis:** The test agent landed on the workspace creation page instead of a login page, indicating the environment had no prior session and required onboarding before access.

---

#### TC011 — User checks in to a confirmed booking
- **Result Link:** https://www.testsprite.com/dashboard/mcp/tests/f3c8f358-b009-4e98-a64f-4a9b82b9e147/0a54d3eb-54fd-4bf3-889e-cf7324f8ac07
- **Status:** 🚫 BLOCKED
- **Analysis:** Same credential blocker. "Signing in…" spinner visible but no navigation occurs.

---

#### TC012 — Employee cancels a desk or room booking
- **Result Link:** https://www.testsprite.com/dashboard/mcp/tests/f3c8f358-b009-4e98-a64f-4a9b82b9e147/2e9a55b7-de33-486b-82a6-f965ce1a5185
- **Status:** 🚫 BLOCKED
- **Analysis:** Login stuck. Email pre-filled but Sign in does not progress. Consistent with the credential gap across all returning-user tests.

---

### REQ-05 · Floor Plan & Presence

> Users must be able to view floor plans with desk occupancy and book directly from the floor view.

#### TC014 — User inspects floor availability and books a desk from the floor plan
- **Test Code:** [TC014_User_inspects_floor_availability_and_books_a_desk_from_the_floor_plan.py](./TC014_User_inspects_floor_availability_and_books_a_desk_from_the_floor_plan.py)
- **Result Link:** https://www.testsprite.com/dashboard/mcp/tests/f3c8f358-b009-4e98-a64f-4a9b82b9e147/6af2e48f-9f54-4236-9f4d-678aa7521091
- **Status:** ✅ Passed
- **Analysis:** The floor detail page correctly renders desk availability and the test agent was able to select an available desk and confirm the booking. The booking subsequently appeared in My Bookings.

---

#### TC015 — Employee views a floor plan and books a desk from it
- **Test Code:** [TC015_Employee_views_a_floor_plan_and_books_a_desk_from_it.py](./TC015_Employee_views_a_floor_plan_and_books_a_desk_from_it.py)
- **Result Link:** https://www.testsprite.com/dashboard/mcp/tests/f3c8f358-b009-4e98-a64f-4a9b82b9e147/779c611b-df18-43c7-acd1-14db1af13e45
- **Status:** ✅ Passed
- **Analysis:** Confirms floor plan booking is reproducible. Floor occupancy data is displayed correctly and the booking flow from floor view to My Bookings is consistent.

---

### REQ-06 · Dashboard Overview

> The dashboard must show workspace stats, upcoming bookings, and team presence.

#### TC013 — User reviews dashboard overview content
- **Result Link:** https://www.testsprite.com/dashboard/mcp/tests/f3c8f358-b009-4e98-a64f-4a9b82b9e147/8ad530eb-5102-495f-982c-8b9a0522d7dc
- **Status:** 🚫 BLOCKED
- **Analysis:** Dashboard unreachable without a working returning-user login. Dashboard content (stats cards, team presence widget, bookings list) could not be verified for an existing user account.

---

## 3️⃣ Coverage & Matching Metrics

| Requirement | Total Tests | ✅ Passed | 🚫 Blocked |
|---|---|---|---|
| REQ-01 Authentication & Registration | 4 | 2 | 2 |
| REQ-02 Desk Booking | 2 | 1 | 1 |
| REQ-03 Room Booking | 2 | 0 | 2 |
| REQ-04 Booking Management | 4 | 0 | 4 |
| REQ-05 Floor Plan & Presence | 2 | 2 | 0 |
| REQ-06 Dashboard Overview | 1 | 0 | 1 |
| **Total** | **15** | **5 (33%)** | **10 (67%)** |

> **Note:** Tests TC016–TC024 were deferred — dev server mode caps execution at 15 high-priority tests to prevent overload. Run in production mode (`npm run build && npm run start`) to execute all 24 tests.

---

## 4️⃣ Key Gaps / Risks

### 🔴 Critical — Test Credentials Not Configured
**Impact:** 10 of 15 tests blocked.  
**Detail:** TestSprite could not resolve `{{LOGIN_USER}}` / `{{LOGIN_PASSWORD}}` placeholders. The agent fell back to `example@gmail.com / password123` which are not valid accounts in this environment.  
**Fix:** Set `LOGIN_USER` and `LOGIN_PASSWORD` in the TestSprite project environment variables (project settings → env vars) with a real seeded test account.

---

### 🔴 Critical — No Rooms Seeded in Test Environment
**Impact:** All room booking tests (TC007, TC008) blocked; TC003 and TC023 (medium priority) will also fail.  
**Detail:** The Rooms page returns "No rooms available" for every floor/date/time combination tried. Without room data, room booking UI cannot be exercised.  
**Fix:** Seed at least one meeting room via the Admin panel or a fixture script before running tests.

---

### 🟡 Medium — Login Error Messaging Not Surfaced to Test Agent
**Impact:** Root cause of login failures is opaque — the app shows "Signing in…" indefinitely without displaying an error, making automated diagnosis harder.  
**Detail:** The test agent found no `role=alert` or visible error text after failed login attempts. The error state in `LoginPage` sets `error` state but only when a `401`/`400` response is caught — a network timeout or backend unavailability silently hangs.  
**Fix:** Add a request timeout in the `login()` API call and display a fallback error ("Something went wrong, try again") when the promise neither resolves nor rejects with a known error code.

---

### 🟡 Medium — Dev Server Instability Under Concurrent Test Load
**Impact:** Potential false failures when running all 24 tests.  
**Detail:** Next.js dev server is single-threaded. TestSprite limits to 15 concurrent tests in dev mode but longer-running tests may still cause race conditions.  
**Fix:** For full test coverage, build and serve in production mode: `npm run build && npm run start`. This also lifts the 15-test cap to 30.

---

### 🟢 Low — No iCal Export or QR Code Tests Executed
**Impact:** TC021 (iCal export) not run in this batch (deferred to the 16–24 group).  
**Detail:** These medium-priority tests cover bookings export functionality which could not be verified.  
**Fix:** Re-run in production mode with credentials configured to cover the full 24-test plan.
