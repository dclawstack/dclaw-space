"use client"

import { useEffect, useState } from "react"
import { listFloors, getAvailableRooms, createRoomBooking } from "@/lib/api"
import type { Floor, Room } from "@/lib/api"

function toLocalDateTimeString(offset: number) {
  const d = new Date(Date.now() + offset)
  return d.toISOString().slice(0, 16)
}

export default function RoomsPage() {
  const [floors, setFloors] = useState<Floor[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [selectedFloor, setSelectedFloor] = useState<string>("")
  const [startDt, setStartDt] = useState(toLocalDateTimeString(0))
  const [endDt, setEndDt] = useState(toLocalDateTimeString(3600000))
  const [capacityMin, setCapacityMin] = useState(1)
  const [loading, setLoading] = useState(false)
  const [bookingRoom, setBookingRoom] = useState<string | null>(null)
  const [bookingTitle, setBookingTitle] = useState<Record<string, string>>({})
  const [attendees, setAttendees] = useState<Record<string, number>>({})
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    listFloors().then((r) => setFloors(r.items))
  }, [])

  function search() {
    if (!startDt || !endDt) return
    setLoading(true)
    getAvailableRooms(
      new Date(startDt).toISOString(),
      new Date(endDt).toISOString(),
      capacityMin,
      selectedFloor || undefined
    )
      .then((r) => setRooms(r.items))
      .finally(() => setLoading(false))
  }

  async function handleBook(room: Room) {
    const title = bookingTitle[room.id] || "Meeting"
    const count = attendees[room.id] || 1
    setBookingRoom(room.id)
    setMessage(null)
    try {
      await createRoomBooking({
        room_id: room.id,
        title,
        start_dt: new Date(startDt).toISOString(),
        end_dt: new Date(endDt).toISOString(),
        attendee_count: count,
      })
      setMessage({ type: "success", text: `"${room.name}" booked!` })
      search()
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Booking failed"
      setMessage({ type: "error", text: msg })
    } finally {
      setBookingRoom(null)
    }
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-[#1A1A2E]">Meeting Rooms</h1>
        <p className="text-sm text-[#8888A0] mt-1">Find and book an available meeting room</p>
      </div>

      <div className="bg-white rounded-xl border border-[#EBEBF0] p-5 shadow-sm mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-xs font-medium text-[#8888A0] mb-1">Start</label>
            <input type="datetime-local" value={startDt} onChange={(e) => setStartDt(e.target.value)}
              className="border border-[#EBEBF0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7660A8]" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#8888A0] mb-1">End</label>
            <input type="datetime-local" value={endDt} onChange={(e) => setEndDt(e.target.value)}
              className="border border-[#EBEBF0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7660A8]" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#8888A0] mb-1">Min capacity</label>
            <input type="number" min={1} value={capacityMin} onChange={(e) => setCapacityMin(Number(e.target.value))}
              className="border border-[#EBEBF0] rounded-lg px-3 py-2 text-sm w-20 focus:outline-none focus:ring-2 focus:ring-[#7660A8]" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#8888A0] mb-1">Floor</label>
            <select value={selectedFloor} onChange={(e) => setSelectedFloor(e.target.value)}
              className="border border-[#EBEBF0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7660A8]">
              <option value="">All floors</option>
              {floors.map((f) => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </div>
          <button onClick={search}
            className="px-5 py-2 bg-[#7660A8] text-white rounded-lg text-sm font-medium hover:bg-[#5E4B8B] transition-colors">
            Search
          </button>
        </div>
      </div>

      {message && (
        <div className={`mb-4 px-4 py-3 rounded-lg text-sm ${
          message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"
        }`}>{message.text}</div>
      )}

      {loading ? (
        <p className="text-sm text-[#8888A0]">Searching…</p>
      ) : rooms.length === 0 ? (
        <p className="text-sm text-[#8888A0]">No rooms available. Try different times.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rooms.map((room) => (
            <div key={room.id} className="bg-white rounded-xl border border-[#EBEBF0] p-5 shadow-sm">
              <p className="font-semibold text-[#1A1A2E]">{room.name}</p>
              <p className="text-xs text-[#8888A0] mt-0.5">Capacity: {room.capacity}</p>
              <div className="mt-3 space-y-2">
                <input
                  type="text"
                  placeholder="Meeting title"
                  value={bookingTitle[room.id] || ""}
                  onChange={(e) => setBookingTitle((p) => ({ ...p, [room.id]: e.target.value }))}
                  className="w-full border border-[#EBEBF0] rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7660A8]"
                />
                <input
                  type="number"
                  placeholder="Attendees"
                  min={1}
                  max={room.capacity}
                  value={attendees[room.id] || 1}
                  onChange={(e) => setAttendees((p) => ({ ...p, [room.id]: Number(e.target.value) }))}
                  className="w-full border border-[#EBEBF0] rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7660A8]"
                />
                <button
                  onClick={() => handleBook(room)}
                  disabled={bookingRoom === room.id}
                  className="w-full py-2 bg-[#7660A8] text-white rounded-lg text-sm font-medium hover:bg-[#5E4B8B] disabled:opacity-50 transition-colors"
                >
                  {bookingRoom === room.id ? "Booking…" : "Book Room"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
