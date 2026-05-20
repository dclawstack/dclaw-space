"use client"

import { useEffect, useState } from "react"
import { listFloors, getAvailableDesks, createDeskBooking } from "@/lib/api"
import type { Floor, Desk } from "@/lib/api"

function today() {
  return new Date().toISOString().split("T")[0]
}

export default function DesksPage() {
  const [floors, setFloors] = useState<Floor[]>([])
  const [desks, setDesks] = useState<Desk[]>([])
  const [selectedFloor, setSelectedFloor] = useState<string>("")
  const [selectedDate, setSelectedDate] = useState(today())
  const [loading, setLoading] = useState(false)
  const [booking, setBooking] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    listFloors().then((r) => {
      setFloors(r.items)
      if (r.items.length > 0) setSelectedFloor(r.items[0].id)
    })
  }, [])

  useEffect(() => {
    if (!selectedDate) return
    setLoading(true)
    getAvailableDesks(selectedDate, selectedFloor || undefined)
      .then((r) => setDesks(r.items))
      .finally(() => setLoading(false))
  }, [selectedDate, selectedFloor])

  async function handleBook(deskId: string) {
    setBooking(deskId)
    setMessage(null)
    try {
      await createDeskBooking({ desk_id: deskId, date: selectedDate })
      setMessage({ type: "success", text: "Desk booked successfully!" })
      // Refresh availability
      const r = await getAvailableDesks(selectedDate, selectedFloor || undefined)
      setDesks(r.items)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Booking failed"
      setMessage({ type: "error", text: msg })
    } finally {
      setBooking(null)
    }
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-[#1A1A2E]">Available Desks</h1>
        <p className="text-sm text-[#8888A0] mt-1">Select a date and floor to see available desks</p>
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        <div>
          <label className="block text-xs font-medium text-[#8888A0] mb-1">Date</label>
          <input
            type="date"
            value={selectedDate}
            min={today()}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border border-[#EBEBF0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7660A8]"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#8888A0] mb-1">Floor</label>
          <select
            value={selectedFloor}
            onChange={(e) => setSelectedFloor(e.target.value)}
            className="border border-[#EBEBF0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7660A8]"
          >
            <option value="">All floors</option>
            {floors.map((f) => (
              <option key={f.id} value={f.id}>{f.name} (Level {f.level})</option>
            ))}
          </select>
        </div>
      </div>

      {message && (
        <div className={`mb-4 px-4 py-3 rounded-lg text-sm ${
          message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"
        }`}>
          {message.text}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-[#8888A0]">Loading available desks…</p>
      ) : desks.length === 0 ? (
        <p className="text-sm text-[#8888A0]">No desks available for this date.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {desks.map((desk) => (
            <div key={desk.id} className="bg-white rounded-xl border border-[#EBEBF0] p-4 shadow-sm">
              <p className="font-semibold text-[#1A1A2E]">{desk.label}</p>
              {desk.zone && <p className="text-xs text-[#8888A0] mt-0.5">{desk.zone}</p>}
              <button
                onClick={() => handleBook(desk.id)}
                disabled={booking === desk.id}
                className="mt-3 w-full py-1.5 rounded-lg text-xs font-medium bg-[#7660A8] text-white hover:bg-[#5E4B8B] disabled:opacity-50 transition-colors"
              >
                {booking === desk.id ? "Booking…" : "Book"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
