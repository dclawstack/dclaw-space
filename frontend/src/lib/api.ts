const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function fetchJson<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${path}`;
  const { headers: extraHeaders, ...restOptions } = options ?? {};

  // Auto-inject auth token if present (client-side only)
  const token = typeof window !== "undefined" ? localStorage.getItem("dclaw_token") : null;
  const authHeader: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...authHeader,
      ...(extraHeaders as Record<string, string>),
    },
    ...restOptions,
  });
  if (!res.ok) {
    if (res.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("dclaw_token");
      window.location.href = "/login";
      throw new Error("Session expired");
    }
    const err = await res.text();
    throw new ApiError(`API error ${res.status}: ${err}`, res.status);
  }
  const contentType = res.headers.get("content-type") ?? "";
  if (res.status === 204 || !contentType.includes("json")) {
    return undefined as T;
  }
  return res.json();
}

function userHeader(userId?: string): Record<string, string> {
  return userId ? { "X-User-ID": userId } : {};
}

// ── Types ──────────────────────────────────────────────────────────────────────

export interface Floor {
  id: string; name: string; level: number;
  svg_data: string | null; width: number; height: number;
  is_active: boolean; created_at: string; updated_at: string;
}
export interface FloorList { items: Floor[]; total: number }

export interface Desk {
  id: string; floor_id: string; label: string; zone: string | null;
  x: number; y: number; amenities: Record<string, unknown>;
  is_active: boolean; created_at: string; updated_at: string;
}
export interface DeskList { items: Desk[]; total: number }

export interface Room {
  id: string; floor_id: string; name: string; capacity: number;
  equipment: Record<string, unknown>; x: number; y: number;
  is_active: boolean; created_at: string; updated_at: string;
}
export interface RoomList { items: Room[]; total: number }

export type BookingStatus = "confirmed" | "cancelled" | "checked_in" | "no_show";

export interface DeskBooking {
  id: string; desk_id: string; user_id: string; date: string;
  status: BookingStatus; checked_in_at: string | null;
  created_at: string; updated_at: string;
}
export interface DeskBookingList { items: DeskBooking[]; total: number }

export interface RoomBooking {
  id: string; room_id: string; user_id: string; title: string;
  start_dt: string; end_dt: string; attendee_count: number;
  status: BookingStatus; created_at: string; updated_at: string;
}
export interface RoomBookingList { items: RoomBooking[]; total: number }

export interface FloorOccupancy {
  floor_id: string; date: string; total_desks: number;
  available: number; booked: number; occupancy: Record<string, string>;
}

export type VisitorStatus = "expected" | "checked_in" | "checked_out" | "cancelled";
export interface Visitor {
  id: string; host_user_id: string; name: string; email: string;
  company: string | null; expected_at: string; status: VisitorStatus;
  badge_token: string; notes: string | null;
  checked_in_at: string | null; checked_out_at: string | null; created_at: string;
}
export interface VisitorList { items: Visitor[]; total: number }

export interface UtilizationDay { date: string; bookings: number }
export interface EsgMetrics {
  date_from: string; date_to: string; total_desk_days: number;
  booked_desk_days: number; unused_desk_days: number;
  utilization_pct: number; kwh_saved: number;
  co2_kg_saved: number; trees_equivalent: number; note: string;
}
export interface PredictionDay { date: string; predicted_bookings: number; day: string }

// ── Health ─────────────────────────────────────────────────────────────────────
export function getHealth() { return fetchJson<{ status: string }>("/health/"); }

// ── Floors ─────────────────────────────────────────────────────────────────────
export function listFloors(activeOnly = true) {
  return fetchJson<FloorList>(`/api/v1/floors/?active_only=${activeOnly}`);
}
export function getFloor(id: string) { return fetchJson<Floor>(`/api/v1/floors/${id}`); }
export function getFloorOccupancy(floorId: string, date: string) {
  return fetchJson<FloorOccupancy>(`/api/v1/floors/${floorId}/occupancy?date=${date}`);
}
export function createFloor(body: { name: string; level: number; width?: number; height?: number }) {
  return fetchJson<Floor>("/api/v1/floors/", { method: "POST", body: JSON.stringify(body) });
}

// ── Desks ──────────────────────────────────────────────────────────────────────
export function listDesks(params?: { floor_id?: string; limit?: number; offset?: number }) {
  const q = new URLSearchParams(params as Record<string, string>).toString();
  return fetchJson<DeskList>(`/api/v1/desks/${q ? `?${q}` : ""}`);
}
export function getAvailableDesks(date: string, floorId?: string) {
  const q = new URLSearchParams({ date, ...(floorId ? { floor_id: floorId } : {}) }).toString();
  return fetchJson<DeskList>(`/api/v1/desks/available?${q}`);
}

// ── Rooms ──────────────────────────────────────────────────────────────────────
export function listRooms(params?: { floor_id?: string; capacity_min?: number; limit?: number }) {
  const q = new URLSearchParams(params as Record<string, string>).toString();
  return fetchJson<RoomList>(`/api/v1/rooms/${q ? `?${q}` : ""}`);
}
export function getAvailableRooms(startDt: string, endDt: string, capacityMin = 1, floorId?: string) {
  const q = new URLSearchParams({
    start_dt: startDt, end_dt: endDt, capacity_min: String(capacityMin),
    ...(floorId ? { floor_id: floorId } : {}),
  }).toString();
  return fetchJson<RoomList>(`/api/v1/rooms/available?${q}`);
}

// ── Desk Bookings ──────────────────────────────────────────────────────────────
export function getMyDeskBookings(upcomingOnly = true, userId?: string) {
  return fetchJson<DeskBookingList>(
    `/api/v1/bookings/desks/mine?upcoming_only=${upcomingOnly}`,
    { headers: userHeader(userId) }
  );
}
export function createDeskBooking(body: { desk_id: string; date: string }, userId?: string) {
  return fetchJson<DeskBooking>("/api/v1/bookings/desks/", {
    method: "POST", body: JSON.stringify(body), headers: userHeader(userId),
  });
}
export function checkInDesk(bookingId: string, userId?: string) {
  return fetchJson<DeskBooking>(`/api/v1/bookings/desks/${bookingId}/checkin`, {
    method: "POST", headers: userHeader(userId),
  });
}
export function cancelDeskBooking(bookingId: string, userId?: string) {
  return fetchJson<void>(`/api/v1/bookings/desks/${bookingId}`, {
    method: "DELETE", headers: userHeader(userId),
  });
}

// ── Room Bookings ──────────────────────────────────────────────────────────────
export function getMyRoomBookings(upcomingOnly = true, userId?: string) {
  return fetchJson<RoomBookingList>(
    `/api/v1/bookings/rooms/mine?upcoming_only=${upcomingOnly}`,
    { headers: userHeader(userId) }
  );
}
export function createRoomBooking(
  body: { room_id: string; title: string; start_dt: string; end_dt: string; attendee_count: number },
  userId?: string
) {
  return fetchJson<RoomBooking>("/api/v1/bookings/rooms/", {
    method: "POST", body: JSON.stringify(body), headers: userHeader(userId),
  });
}
export function cancelRoomBooking(bookingId: string, userId?: string) {
  return fetchJson<void>(`/api/v1/bookings/rooms/${bookingId}`, {
    method: "DELETE", headers: userHeader(userId),
  });
}

// ── Visitors ───────────────────────────────────────────────────────────────────
export function listVisitors(date?: string) {
  const q = date ? `?date=${date}` : "";
  return fetchJson<VisitorList>(`/api/v1/visitors/${q}`);
}
export function createVisitor(
  body: { name: string; email: string; company?: string; expected_at: string; notes?: string },
  userId?: string
) {
  return fetchJson<Visitor>("/api/v1/visitors/", {
    method: "POST", body: JSON.stringify(body), headers: userHeader(userId),
  });
}
export function checkinVisitor(id: string) {
  return fetchJson<Visitor>(`/api/v1/visitors/${id}/checkin`, { method: "POST" });
}
export function checkoutVisitor(id: string) {
  return fetchJson<Visitor>(`/api/v1/visitors/${id}/checkout`, { method: "POST" });
}

// ── Analytics ──────────────────────────────────────────────────────────────────
export function getDeskUtilization(dateFrom: string, dateTo: string) {
  return fetchJson<{ date_from: string; date_to: string; data: UtilizationDay[] }>(
    `/api/v1/analytics/utilization?date_from=${dateFrom}&date_to=${dateTo}`
  );
}
export function getUtilizationSummary(dateFrom: string, dateTo: string) {
  return fetchJson<{ date_from: string; date_to: string; total_capacity: number; by_floor: { floor_id: string; floor_name: string; bookings: number }[] }>(
    `/api/v1/analytics/summary?date_from=${dateFrom}&date_to=${dateTo}`
  );
}
export function getAttendancePredictions(daysAhead = 14) {
  return fetchJson<{ predictions: PredictionDay[]; model: string }>(
    `/api/v1/analytics/predictions?days_ahead=${daysAhead}`
  );
}
export function getEsgMetrics(dateFrom: string, dateTo: string) {
  return fetchJson<EsgMetrics>(`/api/v1/analytics/esg?date_from=${dateFrom}&date_to=${dateTo}`);
}

// ── Admin CRUD ─────────────────────────────────────────────────────────────────
export function updateFloor(id: string, body: Partial<{name: string; level: number; is_active: boolean}>) {
  return fetchJson<Floor>(`/api/v1/floors/${id}`, { method: "PATCH", body: JSON.stringify(body) });
}
export function deleteFloor(id: string) {
  return fetchJson<void>(`/api/v1/floors/${id}`, { method: "DELETE" });
}
export function createDesk(body: {floor_id: string; label: string; zone?: string; x?: number; y?: number}) {
  return fetchJson<Desk>("/api/v1/desks/", { method: "POST", body: JSON.stringify(body) });
}
export function updateDesk(id: string, body: Partial<{label: string; zone: string; x: number; y: number; is_active: boolean}>) {
  return fetchJson<Desk>(`/api/v1/desks/${id}`, { method: "PATCH", body: JSON.stringify(body) });
}
export function deleteDesk(id: string) {
  return fetchJson<void>(`/api/v1/desks/${id}`, { method: "DELETE" });
}
export function createRoom(body: {floor_id: string; name: string; capacity: number; x?: number; y?: number}) {
  return fetchJson<Room>("/api/v1/rooms/", { method: "POST", body: JSON.stringify(body) });
}
export function updateRoom(id: string, body: Partial<{name: string; capacity: number; is_active: boolean}>) {
  return fetchJson<Room>(`/api/v1/rooms/${id}`, { method: "PATCH", body: JSON.stringify(body) });
}
export function deleteRoom(id: string) {
  return fetchJson<void>(`/api/v1/rooms/${id}`, { method: "DELETE" });
}

// ── iCal export ────────────────────────────────────────────────────────────────
export function icalExportUrl(userId?: string) {
  const base = process.env.NEXT_PUBLIC_API_URL || "";
  return `${base}/api/v1/bookings/export.ics${userId ? `?x_user_id=${userId}` : ""}`;
}

// ── Auth ───────────────────────────────────────────────────────────────────────
export interface AuthUser {
  id: string; org_id: string; email: string;
  first_name: string; last_name: string; role: string; is_active: boolean;
}

export function register(body: { org_name: string; first_name: string; last_name: string; email: string; password: string }) {
  return fetchJson<{ access_token: string; token_type: string }>("/auth/register", {
    method: "POST", body: JSON.stringify(body),
  });
}

export function login(body: { email: string; password: string }) {
  return fetchJson<{ access_token: string; token_type: string }>("/auth/login", {
    method: "POST", body: JSON.stringify(body),
  });
}

export function getMe(token: string) {
  return fetchJson<AuthUser>("/auth/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
}
