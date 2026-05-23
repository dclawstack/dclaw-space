"use client"

import { useEffect, useRef, useState } from "react"
import { useParams } from "next/navigation"
import { getFloor, getFloorOccupancy, createDeskBooking } from "@/lib/api"
import type { Floor, FloorOccupancy } from "@/lib/api"

function today() {
  return new Date().toISOString().split("T")[0]
}

const STATUS_COLORS: Record<string, string> = {
  available: "#7660A8",
  confirmed: "#F59E0B",
  checked_in: "#10B981",
  inactive: "#D1D1DB",
  no_show: "#EF4444",
}

export default function FloorPlanPage() {
  const { id } = useParams<{ id: string }>()
  const [floor, setFloor] = useState<Floor | null>(null)
  const [occupancy, setOccupancy] = useState<FloorOccupancy | null>(null)
  const [date, setDate] = useState(today())
  const [loading, setLoading] = useState(true)
  const [booking, setBooking] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [wsConnected, setWsConnected] = useState(false)
  const wsRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    getFloor(id).then(setFloor)
  }, [id])

  // HTTP occupancy fetch for non-today dates
  useEffect(() => {
    if (!id || !date) return
    if (date !== today()) {
      setLoading(true)
      getFloorOccupancy(id, date)
        .then(setOccupancy)
        .finally(() => setLoading(false))
    }
  }, [id, date])

  // WebSocket for today's real-time occupancy
  useEffect(() => {
    if (!id || date !== today()) return
    const proto = window.location.protocol === "https:" ? "wss" : "ws"
    const host = window.location.host
    const ws = new WebSocket(`${proto}://${host}/api/v1/floors/${id}/ws`)
    wsRef.current = ws
    ws.onopen = () => setWsConnected(true)
    ws.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data)
        // Map WS payload to FloorOccupancy shape
        setOccupancy(prev => prev ? {
          ...prev,
          occupancy: Object.fromEntries(
            Object.entries(data.occupancy as Record<string, { status: string }>).map(([k, v]) => [k, v.status])
          )
        } : prev)
        setLoading(false)
      } catch { /* ignore */ }
    }
    ws.onclose = () => setWsConnected(false)
    ws.onerror = () => {
      // Fallback to HTTP if WS fails
      setLoading(true)
      getFloorOccupancy(id, date).then(setOccupancy).finally(() => setLoading(false))
    }
    return () => ws.close()
  }, [id, date])

  async function handleBook(deskId: string) {
    setBooking(deskId)
    setMessage(null)
    try {
      await createDeskBooking({ desk_id: deskId, date })
      setMessage({ type: "success", text: "Desk booked!" })
      const occ = await getFloorOccupancy(id, date)
      setOccupancy(occ)
    } catch (e: unknown) {
      setMessage({ type: "error", text: e instanceof Error ? e.message : "Failed" })
    } finally {
      setBooking(null)
    }
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#1A1A2E]">
            {floor ? floor.name : "Floor Plan"}
          </h1>
          {floor && <p className="text-sm text-[#8888A0] mt-1">Level {floor.level}</p>}
        </div>
        {date === today() && (
          <span className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ${
            wsConnected ? "bg-green-50 text-green-700" : "bg-[#F3F1F9] text-[#8888A0]"
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${wsConnected ? "bg-green-500 animate-pulse" : "bg-[#D1D1DB]"}`} />
            {wsConnected ? "Live" : "Connecting…"}
          </span>
        )}
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div>
          <label className="block text-xs font-medium text-[#8888A0] mb-1">Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
            className="border border-[#EBEBF0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7660A8]" />
        </div>
        {occupancy && (
          <div className="flex gap-4 text-sm mt-5">
            <span className="text-[#7660A8] font-medium">{occupancy.available} available</span>
            <span className="text-[#8888A0]">{occupancy.booked} booked</span>
            <span className="text-[#8888A0]">{occupancy.total_desks} total</span>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex gap-4 mb-5 flex-wrap">
        {Object.entries(STATUS_COLORS).map(([s, c]) => (
          <div key={s} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ background: c }} />
            <span className="text-xs text-[#8888A0] capitalize">{s.replace("_", " ")}</span>
          </div>
        ))}
      </div>

      {message && (
        <div className={`mb-4 px-4 py-3 rounded-lg text-sm ${
          message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"
        }`}>{message.text}</div>
      )}

      {loading ? (
        <p className="text-sm text-[#8888A0]">Loading occupancy…</p>
      ) : !occupancy ? null : floor?.svg_data ? (
        /* SVG floor plan with overlaid desk markers */
        <div className="relative bg-white rounded-xl border border-[#EBEBF0] shadow-sm overflow-hidden"
          style={{ width: floor.width, height: floor.height, maxWidth: "100%" }}>
          <div dangerouslySetInnerHTML={{ __html: floor.svg_data }} className="absolute inset-0" />
        </div>
      ) : (
        /* Fallback: grid of desk cards */
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
          {Object.entries(occupancy.occupancy).map(([deskId, status]) => (
            <div key={deskId}
              className="bg-white rounded-xl border border-[#EBEBF0] p-3 text-center shadow-sm">
              <div className="w-4 h-4 rounded-full mx-auto mb-2"
                style={{ background: STATUS_COLORS[status] ?? "#D1D1DB" }} />
              <p className="text-xs text-[#1A1A2E] font-medium truncate">{deskId.slice(0, 6)}</p>
              <p className="text-xs text-[#8888A0] capitalize">{status.replace("_", " ")}</p>
              {status === "available" && (
                <button
                  onClick={() => handleBook(deskId)}
                  disabled={booking === deskId}
                  className="mt-2 w-full text-xs py-1 rounded-lg bg-[#7660A8] text-white hover:bg-[#5E4B8B] disabled:opacity-50 transition-colors">
                  {booking === deskId ? "…" : "Book"}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
