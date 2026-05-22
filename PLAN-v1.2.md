# DClaw Space — YC B2B SaaS Roadmap v1.2 (Updated 2026-05-23)

> **For coding agents:** Pick features from this list, implement them fully, and update this doc with a checkmark.
> **Do NOT change the basic stack.** See `AGENTS.md` for architecture lock.

---

## YC Submission Gap Analysis

### What's Built (Current State)

| Feature | Status | Notes |
|---------|--------|-------|
| FastAPI + SQLAlchemy 2.0 + asyncpg backend | ✅ Done | Solid foundation |
| Floors / Desks / Rooms models + CRUD APIs | ✅ Done | No org scoping yet |
| Desk booking (create, checkin, cancel) | ✅ Done | Fake auth header |
| Room booking (create, cancel) | ✅ Done | Fake auth header |
| Floor plan page (SVG + occupancy overlay) | ✅ Done | No real SVGs yet |
| Visitor management (pre-register, checkin, checkout) | ✅ Done | Fixed tz bug |
| Analytics (utilization, summary, predictions) | ✅ Done | 4 endpoints |
| ESG dashboard (kWh, CO₂, trees) | ✅ Done | Computed from occupancy |
| AI Copilot (SSE streaming chat) | ✅ Done | OpenRouter + rule fallback |
| iCal export (.ics feed) | ✅ Done | |
| Ghost meeting prevention (APScheduler) | ✅ Done | 15-min no-show cancel |
| Frontend proxy (Next.js rewrites → backend) | ✅ Done | localhost:8001 |
| CI/CD (GitHub Actions) | ✅ Done | |

### Critical Gaps (Kill YC Submission Without These)

| # | Gap | Impact | Effort |
|---|-----|--------|--------|
| 1 | **No authentication** — hardcoded `X-User-ID: sureshOC` | 🔴 Fatal | M |
| 2 | **No multi-tenancy** — all data is global, no org isolation | 🔴 Fatal | L |
| 3 | **No user management** — can't invite teammates | 🔴 Fatal | M |
| 4 | **No landing page** — YC judges see broken app first | 🔴 Fatal | S |
| 5 | **No onboarding flow** — new org has nothing to do | 🔴 Fatal | M |
| 6 | **No admin UI** — floors/desks only addable via API | 🔴 Fatal | M |
| 7 | **No pricing/billing model** — can't explain revenue | 🔴 Fatal | S |

### High-Priority Gaps (Demo Killers)

| # | Gap | Impact | Effort |
|---|-----|--------|--------|
| 8 | **No Slack integration** — 2.4× higher booking completion | 🟠 High | M |
| 9 | **No email notifications** — visitors arrive with no alert | 🟠 High | S |
| 10 | **No team presence ("Who's in today")** — social hook | 🟠 High | S |
| 11 | **No QR code generation** — check-in is just a button | 🟠 High | S |
| 12 | **No mobile-responsive layout** — employees use phones | 🟠 High | M |
| 13 | **No real-time WebSocket** — floor plan polls every 30s | 🟠 High | M |
| 14 | **No waiting list** — booked desk = lost booking intent | 🟠 High | S |
| 15 | **No CSV/PDF export** — analytics not shareable | 🟠 High | S |

### B2B Enterprise Gaps (Blocks $10K+ ACV)

| # | Gap | Impact | Effort |
|---|-----|--------|--------|
| 16 | **No SSO / Google OAuth** — enterprises require it | 🟡 Med | M |
| 17 | **No audit log** — compliance requirement | 🟡 Med | S |
| 18 | **No outbound webhooks** — can't integrate with HRIS | 🟡 Med | M |
| 19 | **No sensor ingestion API** — Meraki/Verkada data | 🟡 Med | M |
| 20 | **No SAML 2.0** — Fortune 500 blocker | 🟡 Med | L |

### YC Differentiation Features (Get Top Position)

| # | Feature | Why It Matters | Effort |
|---|---------|----------------|--------|
| 21 | **AI that ACTS** (books, cancels via Copilot) | YC RFS: agentic AI | M |
| 22 | **Neighborhood booking** (sit near your team) | Viral B2B loop | M |
| 23 | **Predictive team scheduling** ("87% of your team is in Tue") | Behavioural moat | M |
| 24 | **ESG API export** (CSV, SEC-ready report) | Regulatory moat | S |
| 25 | **Carbon credit marketplace stub** | Future revenue line | L |
| 26 | **Sensor-agnostic occupancy ingestion** | Hardware distribution flywheel | M |
| 27 | **Hybrid work policy enforcement** (min days/week per team) | HR → IT sell motion | M |
| 28 | **Desk hoteling waitlist with smart notify** | Delight feature | S |

---

## Competitor Landscape

| Product | Strength | Weakness | DClaw Space Edge |
|---------|----------|----------|-----------------|
| **Envoy** (YC S12, $1.4B) | Visitor mgmt, hardware | No AI copilot, no floor viz | AI that ACTS + real-time floor |
| **Robin** | Hybrid scheduling, Slack bot | No analytics depth, weak floor | Predictive attendance + ESG analytics |
| **Eden** (YC W20) | Employee UX | No AI actions, limited analytics | Copilot that books, not just answers |
| **Condeco** | Enterprise sales | Legacy UX, no AI, expensive | Modern UX + AI-first at SMB price |
| **OfficeSpace** | FM integrations | Legacy stack, no AI | 10× faster to value, agentic AI |

---

## YC B2B SaaS Revenue Model

```
Free          — up to 1 floor, 10 desks, 1 room, 5 users
Starter       — $99/month — 3 floors, 50 desks, 10 rooms, 25 users, email support
Growth        — $299/month — unlimited floors/desks/rooms, 200 users, Slack bot, analytics export, ESG
Enterprise    — Custom — SSO, SAML, audit log, SLA, dedicated CSM, sensor ingestion API
```

Annual discount: 20% off. Target ACV: $3,600 (Starter) → $10,800 (Growth) → $50K+ (Enterprise).
Market: 650,000 companies globally with 50-5,000 employees in hybrid work. TAM $8B.

---

## Implementation Status

### Phase 0 — Foundation ✅ Complete

- [x] FastAPI backend scaffold with lifespan, health check
- [x] SQLAlchemy 2.0 + asyncpg database setup
- [x] BaseRepository generic async CRUD pattern
- [x] Alembic migrations (3 versions: domain, visitors/prefs, auth/org)
- [x] Backend tests (pytest + pytest-asyncio)
- [x] Docker + Helm deployment manifests
- [x] CI/CD: GitHub Actions

---

### Phase 1 — Core Workspace Features ✅ Complete

- [x] **P0.1** Domain models: Floor, Desk, Room, DeskBooking, RoomBooking
- [x] **P0.2** Desk booking (list available, book, checkin, cancel)
- [x] **P0.3** Floor plan page (SVG renderer, occupancy overlay, click-to-book)
- [x] **P0.4** Meeting room booking (availability, book, cancel)
- [x] **P0.5** AI Space Copilot (SSE streaming, OpenRouter + rule fallback)
- [x] **P0.6** Ghost meeting prevention (APScheduler, 15-min auto-cancel)
- [x] **P0.7** iCal export (.ics personal feed)
- [x] **P1.1** Visitor management (pre-register, checkin, checkout, reception dashboard)
- [x] **P1.2** Utilization analytics (30-day chart, floor breakdown, 14-day forecast)
- [x] **P1.3** ESG dashboard (kWh, CO₂, trees equivalent)

---

### Phase 2 — YC B2B SaaS Layer 🚧 In Progress

#### P2.0 Authentication + Multi-Tenancy (Critical Path)

- [ ] `Organization` model (id, name, slug, plan, seat_count, created_at)
- [ ] `User` model (id, org_id, email, hashed_password, role, first_name, last_name)
- [ ] JWT auth service (python-jose, bcrypt, 24h access token)
- [ ] `POST /auth/register` — create org + first admin user
- [ ] `POST /auth/login` — return JWT access token
- [ ] `GET /auth/me` — current user profile
- [ ] `PUT /auth/me` — update profile
- [ ] Alembic migration: `organizations`, `users` tables
- [ ] `org_id` added to Floor, Desk, Room, DeskBooking, RoomBooking, Visitor
- [ ] All list queries filtered by `org_id` from JWT
- [ ] Admin role enforcement on create/delete endpoints
- [ ] `AuthContext.tsx` — React context, localStorage token storage
- [ ] `useAuth.ts` — hook wrapping context
- [ ] `/login` page — email + password, redirect after login
- [ ] `/register` page — name + email + password + org name
- [ ] `api.ts` updated — `Authorization: Bearer` token on all requests, 401 → redirect login
- [ ] `layout.tsx` updated — auth guard, redirect unauthenticated to /login

#### P2.1 Landing Page + Pricing

- [ ] `/` (public) — hero, features, social proof, pricing, CTA
- [ ] Pricing page embedded in landing — Free/Starter/Growth/Enterprise tiers
- [ ] "Start Free Trial" → `/register`
- [ ] "Book a Demo" → mailto/Calendly link
- [ ] Logo strip: "Trusted by..." (mock logos for demo)
- [ ] `/pricing` standalone pricing page

#### P2.2 Admin Panel

- [ ] `/admin` page — tabs: Floors, Desks, Rooms, Members
- [ ] Floor management: add floor (name + level), deactivate floor
- [ ] Desk management: add desks to floor (label, zone, x/y), bulk CSV import
- [ ] Room management: add room (name, capacity, equipment), deactivate
- [ ] Member management: list all users in org, change role, deactivate
- [ ] Backend: `PATCH /api/v1/floors/{id}`, `DELETE /api/v1/floors/{id}`
- [ ] Backend: `PATCH /api/v1/desks/{id}`, `DELETE /api/v1/desks/{id}`
- [ ] Backend: `PATCH /api/v1/rooms/{id}`, `DELETE /api/v1/rooms/{id}`
- [ ] Backend: `GET /api/v1/org/members`, `PATCH /api/v1/org/members/{id}`

#### P2.3 Onboarding Wizard

- [ ] `/onboarding` — multi-step wizard (auto-redirect for new orgs)
- [ ] Step 1: Org profile (name, size, industry)
- [ ] Step 2: Add first floor (name + level)
- [ ] Step 3: Add desks to floor (quick-add by count + zone)
- [ ] Step 4: Invite teammates (email invite)
- [ ] Step 5: Connect calendar (optional, skip button)
- [ ] Step 6: "Your workspace is ready!" → dashboard
- [ ] Progress saved in `UserPreference` (onboarding_step)

#### P2.4 Team Presence ("Who's In Today")

- [ ] `GET /api/v1/presence/today` — returns list of user_ids booked for today per floor
- [ ] Dashboard widget: "People In Today" — avatar + name + floor
- [ ] `/presence` page: full team presence view by floor, searchable
- [ ] Desk page: show "Name is sitting at GF-03" per booked desk
- [ ] Update `User` model to include display_name, avatar_url (optional)

#### P2.5 Email Notifications

- [ ] `app/services/email_service.py` — SMTP via SendGrid or local SMTP relay
- [ ] Templates: visitor arrival, booking confirmation, booking reminder (day before), booking cancelled
- [ ] Hook visitor check-in → email to host
- [ ] Hook desk booking creation → confirmation email to user
- [ ] Hook room booking creation → confirmation email with ICS attachment
- [ ] Hook booking reminder → APScheduler job runs daily at 8am

#### P2.6 Slack Bot Integration

- [ ] `POST /api/v1/integrations/slack/events` — Slack Events API webhook
- [ ] `POST /api/v1/integrations/slack/commands` — Slash commands handler
- [ ] Commands: `/desk book [date]`, `/desk cancel`, `/desk status`, `/room book [time]`
- [ ] OAuth flow: Settings → "Connect to Slack" → Slack app install
- [ ] Notify host via Slack DM on visitor check-in
- [ ] Backend: `SlackConfig` table (org_id, bot_token, webhook_url)
- [ ] Frontend: Settings → Integrations tab → Slack connect button

#### P2.7 QR Code Check-In

- [ ] `GET /api/v1/bookings/desks/{id}/qr` — returns QR code PNG (base64) encoding checkin URL
- [ ] Public checkin endpoint: `POST /api/v1/checkin/{token}` — no auth required, validates token
- [ ] Frontend: Booking detail shows QR code image
- [ ] Frontend: `/checkin/{token}` public page — confirms check-in with nice UI
- [ ] Backend: `DeskBooking.checkin_token` field (UUID, generated on creation)
- [ ] `qrcode` library for generation

#### P2.8 Settings + Billing Page

- [ ] `/settings` — tabs: Profile, Organization, Members, Integrations, Billing
- [ ] Profile tab: name, email, notification preferences
- [ ] Organization tab: org name, logo, seat count, plan display
- [ ] Members tab: invite by email, change role, remove member
- [ ] Integrations tab: Slack (connect/disconnect), Google Calendar (connect/disconnect), Webhook URLs
- [ ] Billing tab: current plan card, usage meters (users/desks/floors), upgrade CTA
- [ ] `POST /api/v1/org/invite` — send email invite
- [ ] `PATCH /api/v1/org/` — update org settings

#### P2.9 Analytics Export

- [ ] `GET /api/v1/analytics/export/csv?date_from=&date_to=` — CSV download of all bookings
- [ ] `GET /api/v1/analytics/export/esg-report` — ESG PDF summary (or structured JSON for now)
- [ ] Frontend: Analytics page "Export" button → triggers CSV download
- [ ] Frontend: ESG page "Download Report" → triggers ESG JSON/CSV

---

### Phase 3 — Enterprise + Growth Features (v1.3)

#### P3.1 Google Calendar OAuth Integration
- [ ] Bidirectional sync: desk/room bookings ↔ Google Calendar events
- [ ] `POST /api/v1/webhooks/google-calendar` — push notification handler
- [ ] `app/services/calendar_service.py` — OAuth2 token management

#### P3.2 Real-Time WebSocket Floor Plan
- [ ] WebSocket endpoint: `WS /ws/floors/{id}/occupancy`
- [ ] Server pushes occupancy updates when bookings change
- [ ] Frontend floor plan switches from 30s polling to WebSocket

#### P3.3 Neighborhood Booking (AI Team Proximity)
- [ ] AI suggests desks based on where teammates are sitting
- [ ] "Your team cluster: Zone B, Ground Floor" displayed on Desks page
- [ ] Copilot tool: `suggest_desk_near_team` — finds desk cluster of user's colleagues
- [ ] Backend: team-level attendance aggregation from user_id patterns

#### P3.4 Hybrid Work Policy Enforcement
- [ ] `Policy` model: org_id, min_days_in_office/week, max_wfh_streak, teams_scope
- [ ] Policy check runs on booking creation — warns if under target
- [ ] Manager dashboard: team compliance view (who is on track vs. lagging)
- [ ] Nudge emails: "You haven't booked a desk this week"

#### P3.5 Sensor Ingestion API
- [ ] `POST /api/v1/sensors/ingest` — accept occupancy events from Cisco Meraki, Verkada, badge readers
- [ ] `SensorReading` model: sensor_id, floor_id, type (motion/badge/CO2), value, recorded_at
- [ ] Sensor data blended with booking data for real occupancy (vs booked occupancy)
- [ ] Webhooks: Meraki scanning API format supported

#### P3.6 Waiting List
- [ ] `DeskWaitlist` model: desk_id, user_id, date, notified_at
- [ ] `POST /api/v1/waitlist/desks/` — join waitlist for a booked desk
- [ ] When booking cancelled: notify next person on waitlist via email + Slack
- [ ] Frontend: "Join Waitlist" button on booked desks

---

## Design System (Non-Negotiable)

All frontend components MUST use the DKube design tokens:
- **Font:** Poppins (all weights)
- **Brand color:** `--dk-purple-700: #7660A8` (buttons, links, primary CTA)
- **Background:** `#F9F8FC` page wash, `#FFFFFF` cards
- **Body text:** `#404049`, Secondary: `#8888A0`
- **Cards:** `border-radius: 12–16px`, `border: 1px solid #EBEBF0`, `box-shadow: 0 1px 3px rgba(0,0,0,0.06)`
- **CTA buttons:** `border-radius: 999px`, bg `#7660A8`, hover `#5E4B8B`
- **Light mode only**

---

## Architecture Lock

- **Backend:** FastAPI + SQLAlchemy 2.0 async + asyncpg + PostgreSQL 16
- **Frontend:** Next.js 14 app router + TypeScript + Tailwind CSS
- **Auth:** JWT (python-jose) + bcrypt — NO sessions, NO cookies (except refresh token httponly cookie)
- **Queue/Scheduler:** APScheduler (no Celery for v1)
- **Email:** SendGrid SDK or SMTP (configurable via env)
- **Realtime:** WebSocket for Phase 3, SSE for Copilot (already done)
- **Never:** timezone-aware datetimes in DB (always naive UTC)
