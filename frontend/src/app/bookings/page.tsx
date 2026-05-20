"use client"

import { useEffect, useState, useCallback } from "react"
import {
  getMyDeskBookings, getMyRoomBookings,
  checkInDesk, cancelDeskBooking, cancelRoomBooking,
} from "@/lib/api"
import type { DeskBooking, RoomBooking } from "@/lib/api"

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    confirmed: "bg-[#EDE9F7] text-[#7660A8]",
    checked_in: "bg-green-50 text-green-700",
    cancelled: "bg-gray-100 text-gray-400",
    no_show: "bg-red-50 text-red-500",
  }
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${map[status] ?? "bg-gray-100 text-gray-500"}`}>
      {status.replace("_", " ")}
    </span>
  )
}

export default function BookingsPage() {
  const [deskBookings, setDeskBookings] = useState<DeskBooking[]>([])
  const [roomBookings, setRoomBookings] = useState<RoomBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [upcomingOnly, setUpcomingOnly] = useState(true)
  const [actionId, setActionId] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    Promise.allSettled([
      getMyDeskBookings(upcomingOnly),
      getMyRoomBookings(upcomingOnly),
    ]).then(([db, rb]) => {
      if (db.status === "fulfilled") setDeskBookings(db.value.items)
      if (rb.status === "fulfilled") setRoomBookings(rb.value.items)
      setLoading(false)
    })
  }, [upcomingOnly])

  useEffect(() => { load() }, [load])

  async function handleCheckIn(id: string) {
    setActionId(id)
    try {
      await checkInDesk(id)
      setMessage({ type: "success", text: "Checked in!" })
      load()
    } catch (e: unknown) {
      setMessage({ type: "error", text: e instanceof Error ? e.message : "Failed" })
    } finally {
      setActionId(null)
    }
  }

  async function handleCancelDesk(id: string) {
    setActionId(id)
    try {
      await cancelDeskBooking(id)
      setMessage({ type: "success", text: "Booking cancelled." })
      load()
    } catch (e: unknown) {
      setMessage({ type: "error", text: e instanceof Error ? e.message : "Failed" })
    } finally {
      setActionId(null)
    }
  }

  async function handleCancelRoom(id: string) {
    setActionId(id)
    try {
      await cancelRoomBooking(id)
      setMessage({ type: "success", text: "Room booking cancelled." })
      load()
    } catch (e: unknown) {
      setMessage({ type: "error", text: e instanceof Error ? e.message : "Failed" })
    } finally {
      setActionId(null)
    }
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-[#1A1A2E]">My Bookings</h1>
          <p className="text-sm text-[#8888A0] mt-1">Manage your desk and room reservations</p>
        </div>
        <label className="flex items-center gap-2 text-sm text-[#3D3D4E]">
          <input
            type="checkbox"
            checked={upcomingOnly}
            onChange={(e) => setUpcomingOnly(e.target.checked)}
            className="accent-[#7660A8]"
          />
          Upcoming only
        </label>
      </div>

      {message && (
        <div className={`mb-4 px-4 py-3 rounded-lg text-sm ${
          message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"
        }`}>{message.text}</div>
      )}

      {loading ? (
        <p className="text-sm text-[#8888A0]">Loading…</p>
      ) : (
        <div className="space-y-8">
          {/* Desk bookings */}
          <section>
            <h2 className="text-sm font-semibold text-[#8888A0] uppercase tracking-wide mb-3">Desk Bookings</h2>
            {deskBookings.length === 0 ? (
              <p className="text-sm text-[#8888A0]">No desk bookings.</p>
            ) : (
              <div className="bg-white rounded-xl border border-[#EBEBF0] shadow-sm divide-y divide-[#EBEBF0]">
                {deskBookings.map((b) => (
                  <div key={b.id} className="flex items-center justify-between px-5 py-4">
                    <div>
                      <p className="text-sm font-medium text-[#1A1A2E]">{b.date}</p>
                      <p className="text-xs text-[#8888A0] mt-0.5">Desk ID: {b.desk_id.slice(0, 8)}…</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={b.status} />
                      {b.status === "confirmed" && (
                        <>
                          <button onClick={() => handleCheckIn(b.id)} disabled={actionId === b.id}
                            className="text-xs px-3 py-1 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 disabled:opacity-50 transition-colors">
                            Check In
                          </button>
                          <button onClick={() => handleCancelDesk(b.id)} disabled={actionId === b.id}
                            className="text-xs px-3 py-1 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 disabled:opacity-50 transition-colors">
                            Cancel
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Room bookings */}
          <section>
            <h2 className="text-sm font-semibold text-[#8888A0] uppercase tracking-wide mb-3">Room Bookings</h2>
            {roomBookings.length === 0 ? (
              <p className="text-sm text-[#8888A0]">No room bookings.</p>
            ) : (
              <div className="bg-white rounded-xl border border-[#EBEBF0] shadow-sm divide-y divide-[#EBEBF0]">
                {roomBookings.map((b) => (
                  <div key={b.id} className="flex items-center justify-between px-5 py-4">
                    <div>
                      <p className="text-sm font-medium text-[#1A1A2E]">{b.title}</p>
                      <p className="text-xs text-[#8888A0] mt-0.5">
                        {new Date(b.start_dt).toLocaleString()} → {new Date(b.end_dt).toLocaleString()}
                      </p>
                      <p className="text-xs text-[#8888A0]">{b.attendee_count} attendees</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={b.status} />
                      {b.status === "confirmed" && (
                        <button onClick={() => handleCancelRoom(b.id)} disabled={actionId === b.id}
                          className="text-xs px-3 py-1 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 disabled:opacity-50 transition-colors">
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  )
}
