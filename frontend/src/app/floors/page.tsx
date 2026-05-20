"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { listFloors } from "@/lib/api"
import type { Floor } from "@/lib/api"

export default function FloorsPage() {
  const [floors, setFloors] = useState<Floor[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    listFloors(false)
      .then((r) => setFloors(r.items))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-[#1A1A2E]">Floor Plans</h1>
        <p className="text-sm text-[#8888A0] mt-1">Browse all floors and their occupancy</p>
      </div>

      {loading ? (
        <p className="text-sm text-[#8888A0]">Loading…</p>
      ) : floors.length === 0 ? (
        <p className="text-sm text-[#8888A0]">No floors configured.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {floors.map((f) => (
            <Link key={f.id} href={`/floors/${f.id}`}
              className="bg-white rounded-xl border border-[#EBEBF0] p-5 shadow-sm hover:border-[#7660A8] hover:shadow-md transition-all block">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-[#1A1A2E]">{f.name}</p>
                  <p className="text-xs text-[#8888A0] mt-0.5">Level {f.level}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  f.is_active ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-400"
                }`}>
                  {f.is_active ? "Active" : "Inactive"}
                </span>
              </div>
              <p className="mt-3 text-xs text-[#7660A8] font-medium">View floor plan →</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
