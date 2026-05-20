"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { listFloors, getMyDeskBookings, getMyRoomBookings, getDeskUtilization } from "@/lib/api"
import type { Floor, DeskBooking, RoomBooking } from "@/lib/api"

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-white rounded-xl border border-[#EBEBF0] p-5 shadow-sm">
      <p className="text-xs font-medium text-[#8888A0] uppercase tracking-wide">{label}</p>
      <p className="mt-1 text-3xl font-semibold text-[#1A1A2E]">{value}</p>
      {sub && <p className="mt-1 text-xs text-[#8888A0]">{sub}</p>}
    </div>
  )
}

function BookingRow({ booking }: { booking: DeskBooking }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-[#EBEBF0] last:border-0">
      <div>
        <p className="text-sm font-medium text-[#1A1A2E]">Desk booking</p>
        <p className="text-xs text-[#8888A0]">{booking.date}</p>
      </div>
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
        booking.status === "confirmed" ? "bg-[#EDE9F7] text-[#7660A8]"
        : booking.status === "checked_in" ? "bg-green-50 text-green-700"
        : "bg-gray-100 text-gray-500"
      }`}>
        {booking.status.replace("_", " ")}
      </span>
    </div>
  )
}

export default function DashboardPage() {
  const [floors, setFloors] = useState<Floor[]>([])
  const [deskBookings, setDeskBookings] = useState<DeskBooking[]>([])
  const [roomBookings, setRoomBookings] = useState<RoomBooking[]>([])
  const [utilization, setUtilization] = useState<{ date: string; bookings: number }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0]
    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0]

    Promise.allSettled([
      listFloors(),
      getMyDeskBookings(true),
      getMyRoomBookings(true),
      getDeskUtilization(sevenDaysAgo, today),
    ]).then(([f, db, rb, util]) => {
      if (f.status === "fulfilled") setFloors(f.value.items)
      if (db.status === "fulfilled") setDeskBookings(db.value.items)
      if (rb.status === "fulfilled") setRoomBookings(rb.value.items)
      if (util.status === "fulfilled") setUtilization(util.value.data)
      setLoading(false)
    })
  }, [])

  const totalBookingsThisWeek = utilization.reduce((s, d) => s + d.bookings, 0)
  const upcomingTotal = deskBookings.length + roomBookings.length

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[#1A1A2E]">Dashboard</h1>
        <p className="text-sm text-[#8888A0] mt-1">Workspace overview</p>
      </div>

      {loading ? (
        <div className="text-sm text-[#8888A0]">Loading…</div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard label="Active Floors" value={floors.length} />
            <StatCard label="Upcoming Desk Bookings" value={deskBookings.length} />
            <StatCard label="Upcoming Room Bookings" value={roomBookings.length} />
            <StatCard label="Desk Bookings (7d)" value={totalBookingsThisWeek} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-[#EBEBF0] p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-[#1A1A2E]">Upcoming Bookings</h2>
                <Link href="/bookings" className="text-xs text-[#7660A8] hover:underline">View all</Link>
              </div>
              {deskBookings.length === 0 ? (
                <p className="text-sm text-[#8888A0]">No upcoming desk bookings.</p>
              ) : (
                deskBookings.slice(0, 5).map((b) => <BookingRow key={b.id} booking={b} />)
              )}
            </div>

            <div className="bg-white rounded-xl border border-[#EBEBF0] p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-[#1A1A2E]">Floors</h2>
                <Link href="/floors" className="text-xs text-[#7660A8] hover:underline">View all</Link>
              </div>
              {floors.length === 0 ? (
                <p className="text-sm text-[#8888A0]">No floors configured yet.</p>
              ) : (
                floors.slice(0, 5).map((f) => (
                  <div key={f.id} className="flex items-center justify-between py-3 border-b border-[#EBEBF0] last:border-0">
                    <div>
                      <p className="text-sm font-medium text-[#1A1A2E]">{f.name}</p>
                      <p className="text-xs text-[#8888A0]">Level {f.level}</p>
                    </div>
                    <Link href={`/floors/${f.id}`} className="text-xs text-[#7660A8] hover:underline">View plan</Link>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
