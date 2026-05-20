# DClaw Space — v1.2 Feature Roadmap

> **For coding agents:** Pick features from this list, implement them fully, and update this doc with a checkmark.
> **Do NOT change the basic stack.** See `AGENTS.md` for architecture lock.

---

## Market Analysis — YC-Aligned Feature Prioritization

> Completed before feature selection. Read this before picking features.

### Competitor Landscape

| Product | Strength | Weakness | What We Beat |
|---------|----------|----------|---------------|
| **Envoy** (YC S12, $1.4B) | Visitor mgmt, hardware integrations | No AI copilot, no floor visualization | AI-native copilot + real-time floor plan |
| **Robin** | Hybrid work scheduling, Slack bot | No analytics depth, weak floor maps | Predictive attendance + ESG analytics |
| **Eden** (YC W20) | Employee experience, UX | No AI recommendations, limited analytics | AI that takes actions, not just answers |
| **Condeco** | Enterprise sales | Legacy UX, no AI, expensive | Modern UX + AI-first at SMB price |
| **OfficeSpace** | FM integrations | Legacy stack, no AI | 10x faster to value, agentic AI |

### YC RFS Alignment (S25/W26)

1. **AI-native, not AI-bolted-on** — Every P0 feature must have an AI layer that *acts*, not just advises. The copilot should book desks, cancel ghost meetings, and predict attendance autonomously.
2. **Agentic workflows** — AI Copilot must complete multi-step tasks (e.g. "Book a room for my team on Tuesday" → finds best room → creates booking → notifies team → blocks calendar).
3. **Real-time data over batch** — Occupancy must update via WebSocket, not polling. Live floor plan = moat vs legacy tools.
4. **ESG as a growth moat** — Sustainability reporting from real space data is greenfield. No YC company has dominated it. DClaw Space can own "workspace carbon analytics" for free.
5. **API-first for sensor ingestion** — Don't build sensors; build the abstraction layer that ingests Cisco Meraki, Verkada, badge data. Sensor-agnostic = distribution flywheel.
6. **Integration depth over breadth** — Google Calendar + Slack deep integrations drive 2x engagement (Envoy proved this). Ship these before parking management.

### Key Market Facts (2025-2026)

- Average office utilization: **40%** despite paying for 100% (JLL 2025 Global Occupancy Report)
- 67% of companies now have formal hybrid work policies (Microsoft Work Trend Index 2025)
- AI space recommendations reduce no-shows by **31%** (Robin customer data)
- Desk booking via Slack/chat has **2.4x** higher completion rate vs web form (Eden data)
- ESG reporting tied to real estate is now required by SEC for large companies (2025 rule)

### Feature Priority Rationale

Based on the above, the ordering is: **AI Copilot → Desk Booking → Floor Plan → Room Booking → Analytics → Calendar Sync → Visitor → Amenity → ESG**.

Floor plan goes before room booking because it provides the visual context that makes all bookings feel real and trustworthy — this is DClaw Space's primary visual differentiator.

---

## Pre-Flight Checklist — Do This First

Before implementing any v1.2 feature, verify:

- [ ] `frontend/package-lock.json` is committed after any `npm install` / dependency change
- [ ] `frontend/next-env.d.ts` exists and is committed (required for Next.js TypeScript builds)
- [ ] `frontend/.gitignore` excludes `node_modules/` and `.next/`
- [ ] `docker-compose.yml` healthchecks use `python urllib.request.urlopen()` (backend) and `wget -q --spider` (frontend)
- [ ] `frontend/Dockerfile` declares `ARG NEXT_PUBLIC_API_URL` before `RUN npm run build`
- [ ] `frontend/public/dclaw-manifest.json` exists (required for DPanel registration)
- [ ] Health endpoint `/health` returns `{"status":"ok"}`

---

## v1.0 Feature Inventory (Current State)

- [x] FastAPI backend scaffold with lifespan, health check (`/health`)
- [x] SQLAlchemy 2.0 + asyncpg database setup
- [x] `BaseRepository` generic async CRUD pattern
- [x] Alembic migrations scaffold
- [x] Backend tests (pytest + pytest-asyncio)
- [x] Docker + Helm deployment manifests
- [x] Next.js 14 frontend with shadcn/ui components
- [x] Dashboard + Header + Floor heatmap placeholder
- [x] CI/CD: GitHub Actions + Claude Code integration
- [ ] Domain models (Desk, Room, Floor, Booking) — stub only
- [ ] Real booking API endpoints
- [ ] AI Copilot
- [ ] `dclaw-manifest.json` for DPanel

---

## v1.2 Roadmap

### P0 — Must Have (Demo Ready)

#### P0.1 AI Space Copilot
**Description:** Floating AI assistant accessible from every page. Answers questions about space availability, makes bookings via natural language, and proactively surfaces insights ("Your team's preferred floor is 78% booked Thursday — want me to find alternatives?"). Uses RAG over booking/occupancy data. Falls back to local Ollama when cloud is unavailable.

- **Backend:**
  - `POST /api/v1/copilot/chat` — streaming SSE endpoint (JSON `{role, content}` chunks)
  - `GET /api/v1/copilot/context` — returns current user's upcoming bookings + floor utilization snapshot for RAG priming
  - `backend/app/services/copilot_service.py` — LLM orchestration (OpenRouter primary, Ollama fallback), tool-calling for booking actions
  - `backend/app/api/routes/copilot.py`
- **Frontend:**
  - `frontend/app/components/CopilotPanel.tsx` — slide-over panel with chat UI, streaming token display
  - `frontend/app/components/CopilotButton.tsx` — floating trigger button (bottom-right, every page)
  - Inline action buttons in copilot responses (e.g. "Book This Desk" CTA inside a message)
- **AI tools the copilot can call:** `search_desks`, `book_desk`, `book_room`, `get_floor_occupancy`, `get_my_bookings`, `cancel_booking`
- **Files to touch:** `backend/app/api/routes/copilot.py`, `backend/app/services/copilot_service.py`, `frontend/app/components/CopilotPanel.tsx`, `frontend/app/layout.tsx`

---

#### P0.2 Desk Booking
**Description:** Hot-desk and hoteling reservation. Book a desk by date, floor, or zone. AI recommends desk based on team proximity and past preferences. QR code check-in. Preference learning (favorite desk/zone auto-surfaces first).

- **Backend:**
  - `backend/app/models/desk.py` — `Desk(id, floor_id, zone, label, x, y, is_active, amenities: JSON)`
  - `backend/app/models/desk_booking.py` — `DeskBooking(id, desk_id, user_id, date, start_time, end_time, checked_in_at, status)`
  - `GET/POST /api/v1/desks/` — list/create desks (admin)
  - `GET /api/v1/desks/available?date=&floor_id=` — returns available desks with AI-ranked recommendations
  - `POST /api/v1/bookings/desks/` — create booking
  - `GET /api/v1/bookings/desks/mine` — user's own bookings
  - `POST /api/v1/bookings/desks/{id}/checkin` — QR check-in
  - `DELETE /api/v1/bookings/desks/{id}` — cancel
  - Alembic migration for `desks` + `desk_bookings` tables
- **Frontend:**
  - `frontend/app/desks/page.tsx` — desk browser with floor selector + date picker + availability grid
  - `frontend/app/desks/[id]/page.tsx` — desk detail + booking form
  - `frontend/app/bookings/page.tsx` — "My Bookings" list with check-in QR and cancel button
  - `frontend/app/components/DeskGrid.tsx` — visual desk availability grid (available/booked/mine color coding)
- **Files to touch:** `backend/app/models/desk.py`, `backend/app/models/desk_booking.py`, `backend/app/api/routes/desks.py`, `backend/app/api/routes/bookings.py`, `backend/alembic/versions/`

---

#### P0.3 Floor Plan Management
**Description:** Interactive SVG floor plan showing real-time desk/room occupancy. Click a desk to book it directly. Color-coded heatmap overlay (green=available, amber=busy, red=full). This is DClaw Space's primary visual differentiator — make it great.

- **Backend:**
  - `backend/app/models/floor.py` — `Floor(id, building_id, level, name, svg_data: Text, width, height)`
  - `backend/app/models/zone.py` — `Zone(id, floor_id, name, color, polygon_coords: JSON)` (optional grouping)
  - `GET /api/v1/floors/` — list floors
  - `GET /api/v1/floors/{id}` — floor detail with SVG
  - `GET /api/v1/floors/{id}/occupancy?date=&time=` — returns `{desk_id: status}` map for overlay
  - `GET /api/v1/floors/{id}/heatmap?date_from=&date_to=` — time-averaged heatmap data
- **Frontend:**
  - `frontend/app/floors/[id]/page.tsx` — floor plan page
  - `frontend/app/components/FloorPlan.tsx` — SVG renderer with `<foreignObject>` desk badges, click-to-book, zoom/pan
  - `frontend/app/components/OccupancyHeatmap.tsx` — heatmap color overlay on floor plan
  - Real-time via polling `/occupancy` every 30s (upgrade to WebSocket in P1)
- **Files to touch:** `backend/app/models/floor.py`, `backend/app/api/routes/floors.py`, `frontend/app/floors/`, `frontend/app/components/FloorPlan.tsx`

---

#### P0.4 Meeting Room Booking
**Description:** Find and book meeting rooms filtered by capacity, floor, and equipment. AI recommends the best room based on attendee count, duration, and equipment needs. Back-to-back room prevention (10-min gap auto-enforced).

- **Backend:**
  - `backend/app/models/room.py` — `Room(id, floor_id, name, capacity, equipment: JSON, is_active)`
  - `backend/app/models/room_booking.py` — `RoomBooking(id, room_id, user_id, title, start_dt, end_dt, attendee_count, status)`
  - `GET /api/v1/rooms/available?date=&start=&end=&capacity_min=` — availability with AI ranking
  - `POST /api/v1/bookings/rooms/` — create room booking
  - `GET /api/v1/bookings/rooms/mine` — user's room bookings
  - `DELETE /api/v1/bookings/rooms/{id}` — cancel
  - Auto-release: cron job cancels rooms with no check-in after 15 min (ghost meeting prevention)
- **Frontend:**
  - `frontend/app/rooms/page.tsx` — room browser with filters (capacity, equipment, floor)
  - `frontend/app/rooms/[id]/page.tsx` — room detail with booking calendar
  - `frontend/app/components/RoomCard.tsx` — room card with capacity badge, equipment icons, availability strip
  - `frontend/app/components/TimeSlotPicker.tsx` — visual time slot grid for a given room+day
- **Files to touch:** `backend/app/models/room.py`, `backend/app/models/room_booking.py`, `backend/app/api/routes/rooms.py`, `frontend/app/rooms/`

---

### P1 — Should Have (v1.1–v1.2)

#### P1.1 Visitor Management
**Description:** Pre-register visitors, auto-notify host on arrival, print badge data. Watchlist check (name match against blocked-visitor list). Reception dashboard.

- **Backend:** `Visitor(id, host_user_id, name, email, company, expected_at, status, badge_token)`. Endpoints: `POST /api/v1/visitors/`, `POST /api/v1/visitors/{id}/checkin`, `GET /api/v1/visitors/today` (reception view).
- **Frontend:** `frontend/app/visitors/page.tsx` — reception dashboard. `frontend/app/visitors/new/page.tsx` — pre-registration form. Badge data display for printing.

---

#### P1.2 Calendar Integration
**Description:** Export desk/room bookings as `.ics`. Google Calendar OAuth2 webhook sync (booking creates calendar event; event deletion cancels booking). Deep link from calendar invite back to DClaw Space booking.

- **Backend:** `GET /api/v1/bookings/export.ics?token=` (personal calendar feed URL). `POST /api/v1/webhooks/google-calendar` (OAuth2 push notifications). `backend/app/services/calendar_service.py`.
- **Frontend:** "Add to Calendar" button on all booking confirmations. Settings page for Google Calendar OAuth connection.

---

#### P1.3 Utilization Analytics Dashboard
**Description:** Track space utilization by floor, zone, day-of-week, and team. Predictive attendance chart ("next 14 days expected occupancy"). This data fuels the AI Copilot's recommendations.

- **Backend:** `GET /api/v1/analytics/utilization?floor_id=&date_from=&date_to=&granularity=day` — aggregated booking data. `GET /api/v1/analytics/predictions?date_from=&date_to=` — ML-predicted attendance (simple moving average + day-of-week model as v1).
- **Frontend:** `frontend/app/analytics/page.tsx` — chart dashboard. Line chart (utilization over time), bar chart (by floor), heatmap calendar (utilization by day). Uses shadcn charts or recharts.

---

#### P1.4 Amenity Booking
**Description:** Reserve gym time slots, cafeteria tables, event spaces, phone booths. Capacity limits enforced. Notification when favorite amenity becomes available.

- **Backend:** `Amenity(id, name, type, capacity, floor_id, booking_type: slot|duration)`. Endpoints: `GET/POST /api/v1/amenities/`, `GET /api/v1/amenities/{id}/availability`, `POST /api/v1/bookings/amenities/`.
- **Frontend:** `frontend/app/amenities/page.tsx` — amenity browser with type filter. Time slot picker for gym-style bookings.

---

### P2 — Could Have (v1.3+)

#### P2.1 Workplace Analytics + ESG Dashboard
**Description:** Carbon footprint reduction tracking from space consolidation (fewer HVAC zones running, fewer floors lit). Seat-per-employee ratio. Energy consumption proxy via occupancy data. SEC ESG disclosure-ready export. This is DClaw Space's long-term growth moat.

- Track: `kWh saved per unused desk-day`, `CO₂ offset estimate`, `utilization vs lease cost`
- Frontend: `frontend/app/analytics/esg/page.tsx` — ESG metrics with targets and actuals. PDF/CSV export.

---

#### P2.2 Employee Preferences & Auto-Configuration
**Description:** Learn preferred desk, floor, zone, and team proximity. On booking, auto-surface preferred desk first. Over time, auto-book recurring preferred desk (opt-in).

- Backend: `UserPreference(user_id, preferred_floor_id, preferred_zone, preferred_desk_id, team_proximity_weight)`. Updated after each booking via lightweight feedback loop.

---

#### P2.3 Hybrid Work Scheduling
**Description:** AI coordinates in-office days for teams. Shows "87% of your team is in Tuesday — want to come in?" Integrates with calendar to suggest optimal days based on team meeting patterns.

- Backend: Team-level attendance aggregation. `GET /api/v1/teams/{id}/recommended-days?weeks=2` — returns ranked days with reasoning.
- Frontend: Team presence strip on the dashboard ("People you work with" section).

---

#### P2.4 Health & Wellness Integration
**Description:** Air quality feed integration (CO₂, PM2.5 from supported sensors). Ergonomics reminders (desk height, break prompts). Wellness room booking (nap pods, meditation rooms). Biophilic zone proximity suggestions.

- Backend: `SensorReading(sensor_id, floor_id, type, value, recorded_at)`. Ingest-only REST endpoint for external sensor pushes: `POST /api/v1/sensors/ingest`.

---

## Implementation Priority

Implement in this order:
1. Domain models + Alembic migrations (Desk, Room, Floor, DeskBooking, RoomBooking)
2. P0.2 Desk Booking (backend + frontend) — first real user value
3. P0.3 Floor Plan (backend + SVG frontend) — primary visual differentiator
4. P0.4 Room Booking (backend + frontend)
5. P0.1 AI Space Copilot (depends on booking data existing)
6. P1.3 Analytics (depends on booking data volume)
7. P1.2 Calendar Integration
8. P1.1 Visitor Management
9. P1.4 Amenity Booking
10. P2 features in order

## Design System

All frontend components MUST use the DKube design tokens from `colors_and_type.css`:
- **Font:** Poppins (all weights — see `@font-face` declarations)
- **Brand color:** `--dk-purple-700: #7660A8` (buttons, links, primary actions)
- **Background:** `--dk-white` / `--dk-gray-50` (page wash)
- **Body text:** `--dk-gray-700: #404049`
- **Meta/secondary text:** `--dk-gray-500: #7A7A85`
- **Cards:** `border-radius: --dk-radius-lg (16px)`, shadow `--dk-shadow-sm`
- **CTA buttons:** `border-radius: --dk-radius-pill (999px)`, bg `--dk-purple-700`
- **Status colors:** success `--dk-success`, warning `--dk-warning`, danger `--dk-danger`, info `--dk-info`
- **Light mode only** — no `.dark` class override

Tailwind classes that map to these tokens are defined in `frontend/tailwind.config.ts`.
