"use client"

import { useEffect, useState, useCallback } from "react"

interface PresenceUser {
  user_id: string
  desk_label: string
  zone: string | null
  floor_name: string
  floor_id: string
}

interface PresenceData {
  date: string
  total_in_office: number
  checked_in: number
  expected: number
  users: PresenceUser[]
}

function today() { return new Date().toISOString().split("T")[0] }

function Avatar({ userId }: { userId: string }) {
  const initials = userId.slice(0, 2).toUpperCase()
  const colors = ["bg-[#EDE9F7] text-[#7660A8]", "bg-blue-50 text-blue-600", "bg-green-50 text-green-600", "bg-amber-50 text-amber-600"]
  const color = colors[userId.charCodeAt(0) % colors.length]
  return (
    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold ${color}`}>
      {initials}
    </div>
  )
}

export default function PresencePage() {
  const [data, setData] = useState<PresenceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [date, setDate] = useState(today())
  const [search, setSearch] = useState("")

  const load = useCallback(() => {
    setLoading(true)
    fetch(`/api/v1/presence/today?target_date=${date}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => d && setData(d))
      .finally(() => setLoading(false))
  }, [date])

  useEffect(() => { load() }, [load])

  const filtered = data?.users.filter(u =>
    u.user_id.toLowerCase().includes(search.toLowerCase()) ||
    u.floor_name.toLowerCase().includes(search.toLowerCase()) ||
    (u.zone ?? "").toLowerCase().includes(search.toLowerCase())
  ) ?? []

  // Group by floor
  const byFloor = filtered.reduce((acc, u) => {
    acc[u.floor_name] = acc[u.floor_name] ?? []
    acc[u.floor_name].push(u)
    return acc
  }, {} as Record<string, PresenceUser[]>)

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-[#1A1A2E]">Who's In Today</h1>
          <p className="text-sm text-[#8888A0] mt-1">Real-time office presence — see where your team is sitting</p>
        </div>
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          className="border border-[#EBEBF0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7660A8]"
        />
      </div>

      {/* Stats */}
      {data && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: "In Office", value: data.total_in_office, color: "#7660A8" },
            { label: "Checked In", value: data.checked_in, color: "#059669" },
            { label: "Expected", value: data.expected, color: "#F59E0B" },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-[#EBEBF0] p-5 shadow-sm">
              <p className="text-xs text-[#8888A0] font-medium">{s.label}</p>
              <p className="text-3xl font-bold mt-1" style={{ color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Search */}
      <div className="mb-5">
        <input
          type="text"
          placeholder="Search by name, floor, or zone..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full max-w-sm border border-[#EBEBF0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7660A8]"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-7 h-7 border-2 border-[#7660A8] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : !data || data.total_in_office === 0 ? (
        <div className="bg-white rounded-xl border border-[#EBEBF0] p-12 text-center shadow-sm">
          <p className="text-4xl mb-3">🏢</p>
          <p className="text-[#1A1A2E] font-medium">Office is empty</p>
          <p className="text-sm text-[#8888A0] mt-1">No desk bookings for {date}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(byFloor).map(([floor, users]) => (
            <div key={floor} className="bg-white rounded-xl border border-[#EBEBF0] shadow-sm overflow-hidden">
              <div className="px-5 py-3 bg-[#F9F8FC] border-b border-[#EBEBF0] flex items-center justify-between">
                <span className="text-sm font-semibold text-[#1A1A2E]">{floor}</span>
                <span className="text-xs text-[#8888A0]">{users.length} {users.length === 1 ? "person" : "people"}</span>
              </div>
              <div className="divide-y divide-[#F3F1F9]">
                {users.map(u => (
                  <div key={u.user_id} className="flex items-center gap-3 px-5 py-3">
                    <Avatar userId={u.user_id} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#1A1A2E] truncate">{u.user_id}</p>
                      <p className="text-xs text-[#8888A0]">
                        {u.desk_label}{u.zone ? ` · ${u.zone}` : ""}
                      </p>
                    </div>
                    <span className="text-xs bg-[#EDE9F7] text-[#7660A8] px-2 py-0.5 rounded-full font-medium shrink-0">
                      {u.floor_name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
