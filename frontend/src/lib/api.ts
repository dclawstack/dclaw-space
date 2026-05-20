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
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });
  if (!response.ok) {
    const error = await response.text();
    throw new ApiError(`API error ${response.status}: ${error}`, response.status);
  }
  return response.json();
}

// ── Types ──────────────────────────────────────────────────────────────────────

export interface Floor {
  id: string;
  name: string;
  level: number;
  svg_data: string | null;
  width: number;
  height: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface FloorList { items: Floor[]; total: number }

export interface Desk {
  id: string;
  floor_id: string;
  label: string;
  zone: string | null;
  x: number;
  y: number;
  amenities: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DeskList { items: Desk[]; total: number }

export interface Room {
  id: string;
  floor_id: string;
  name: string;
  capacity: number;
  equipment: Record<string, unknown>;
  x: number;
  y: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RoomList { items: Room[]; total: number }

export type BookingStatus = "confirmed" | "cancelled" | "checked_in" | "no_show";

export interface DeskBooking {
  id: string;
  desk_id: string;
  user_id: string;
  date: string;
  status: BookingStatus;
  checked_in_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface DeskBookingList { items: DeskBooking[]; total: number }

export interface RoomBooking {
  id: string;
  room_id: string;
  user_id: string;
  title: string;
  start_dt: string;
  end_dt: string;
  attendee_count: number;
  status: BookingStatus;
  created_at: string;
  updated_at: string;
}

export interface RoomBookingList { items: RoomBooking[]; total: number }

export interface FloorOccupancy {
  floor_id: string;
  date: string;
  total_desks: number;
  available: number;
  booked: number;
  occupancy: Record<string, string>;
}

function userHeader(userId?: string): Record<string, string> {
  return userId ? { "X-User-ID": userId } : {}
}

// ── Health ─────────────────────────────────────────────────────────────────────

export function getHealth() {
  return fetchJson<{ status: string }>("/health/");
}

// ── Floors ─────────────────────────────────────────────────────────────────────

export function listFloors(activeOnly = true) {
  return fetchJson<FloorList>(`/api/v1/floors/?active_only=${activeOnly}`);
}

export function getFloor(id: string) {
  return fetchJson<Floor>(`/api/v1/floors/${id}`);
}

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
    start_dt: startDt,
    end_dt: endDt,
    capacity_min: String(capacityMin),
    ...(floorId ? { floor_id: floorId } : {}),
  }).toString();
  return fetchJson<RoomList>(`/api/v1/rooms/available?${q}`);
}

// ── Desk Bookings ──────────────────────────────────────────────────────────────

export function getMyDeskBookings(upcomingOnly = true, userId?: string) {
  const headers = userHeader(userId);
  return fetchJson<DeskBookingList>(
    `/api/v1/bookings/desks/mine?upcoming_only=${upcomingOnly}`,
    { headers }
  );
}

export function createDeskBooking(body: { desk_id: string; date: string }, userId?: string) {
  const headers = userHeader(userId);
  return fetchJson<DeskBooking>("/api/v1/bookings/desks/", {
    method: "POST",
    body: JSON.stringify(body),
    headers,
  });
}

export function checkInDesk(bookingId: string, userId?: string) {
  const headers = userHeader(userId);
  return fetchJson<DeskBooking>(`/api/v1/bookings/desks/${bookingId}/checkin`, {
    method: "POST",
    headers,
  });
}

export function cancelDeskBooking(bookingId: string, userId?: string) {
  const headers = userHeader(userId);
  return fetchJson<void>(`/api/v1/bookings/desks/${bookingId}`, { method: "DELETE", headers });
}

// ── Room Bookings ──────────────────────────────────────────────────────────────

export function getMyRoomBookings(upcomingOnly = true, userId?: string) {
  const headers = userHeader(userId);
  return fetchJson<RoomBookingList>(
    `/api/v1/bookings/rooms/mine?upcoming_only=${upcomingOnly}`,
    { headers }
  );
}

export function createRoomBooking(
  body: { room_id: string; title: string; start_dt: string; end_dt: string; attendee_count: number },
  userId?: string
) {
  const headers = userHeader(userId);
  return fetchJson<RoomBooking>("/api/v1/bookings/rooms/", {
    method: "POST",
    body: JSON.stringify(body),
    headers,
  });
}

export function cancelRoomBooking(bookingId: string, userId?: string) {
  const headers = userHeader(userId);
  return fetchJson<void>(`/api/v1/bookings/rooms/${bookingId}`, { method: "DELETE", headers });
}

// ── Analytics ──────────────────────────────────────────────────────────────────

export function getDeskUtilization(dateFrom: string, dateTo: string) {
  return fetchJson<{ date_from: string; date_to: string; data: { date: string; bookings: number }[] }>(
    `/api/v1/bookings/analytics/utilization?date_from=${dateFrom}&date_to=${dateTo}`
  );
}
