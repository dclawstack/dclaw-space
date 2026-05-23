"use client"

import { useEffect, useState } from "react"
import { getDeskUtilization, getUtilizationSummary, getAttendancePredictions, analyticsCsvUrl } from "@/lib/api"
import type { UtilizationDay, PredictionDay } from "@/lib/api"

function nDaysAgo(n: number) {
  const d = new Date(Date.now() - n * 86400000)
  return d.toISOString().split("T")[0]
}
const today = () => new Date().toISOString().split("T")[0]

function BarRow({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div className="flex items-center gap-3 py-2">
      <span className="text-xs text-[#8888A0] w-24 truncate">{label}</span>
      <div className="flex-1 bg-[#F3F1F9] rounded-full h-2 overflow-hidden">
        <div className="h-2 rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-xs font-medium text-[#1A1A2E] w-8 text-right">{value}</span>
    </div>
  )
}

export default function AnalyticsPage() {
  const [utilization, setUtilization] = useState<UtilizationDay[]>([])
  const [predictions, setPredictions] = useState<PredictionDay[]>([])
  const [floorBreakdown, setFloorBreakdown] = useState<{ floor_name: string; bookings: number }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const from = nDaysAgo(30)
    const to = today()
    Promise.allSettled([
      getDeskUtilization(from, to),
      getUtilizationSummary(from, to),
      getAttendancePredictions(14),
    ]).then(([util, summary, pred]) => {
      if (util.status === "fulfilled") setUtilization(util.value.data)
      if (summary.status === "fulfilled") setFloorBreakdown(summary.value.by_floor)
      if (pred.status === "fulfilled") setPredictions(pred.value.predictions)
      setLoading(false)
    })
  }, [])

  const maxBookings = Math.max(...utilization.map(d => d.bookings), 1)
  const maxPred = Math.max(...predictions.map(d => d.predicted_bookings), 1)
  const totalBookings = utilization.reduce((s, d) => s + d.bookings, 0)
  const avgBookings = utilization.length > 0 ? (totalBookings / utilization.length).toFixed(1) : "0"

  return (
    <div className="p-8">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#1A1A2E]">Analytics</h1>
          <p className="text-sm text-[#8888A0] mt-1">Space utilization for the last 30 days</p>
        </div>
        <a
          href={analyticsCsvUrl(nDaysAgo(30), today())}
          download
          className="px-4 py-2 rounded-full border border-[#EBEBF0] text-[#8888A0] text-xs hover:bg-[#F3F1F9] transition-colors shrink-0"
        >
          Export CSV
        </a>
      </div>

      {loading ? <p className="text-sm text-[#8888A0]">Loading…</p> : (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label: "Total Bookings (30d)", value: totalBookings },
              { label: "Daily Average", value: avgBookings },
              { label: "Active Floors", value: floorBreakdown.length },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-xl border border-[#EBEBF0] p-5 shadow-sm">
                <p className="text-xs font-medium text-[#8888A0] uppercase tracking-wide">{s.label}</p>
                <p className="text-3xl font-semibold text-[#1A1A2E] mt-1">{s.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Daily chart */}
            <div className="bg-white rounded-xl border border-[#EBEBF0] p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-[#1A1A2E] mb-4">Daily Desk Bookings (30d)</h2>
              <div className="flex items-end gap-0.5 h-32">
                {utilization.slice(-30).map((d) => (
                  <div key={d.date} className="flex-1 flex flex-col items-center justify-end h-full" title={`${d.date}: ${d.bookings}`}>
                    <div
                      className="w-full rounded-t-sm"
                      style={{
                        height: `${maxBookings > 0 ? (d.bookings / maxBookings) * 100 : 0}%`,
                        background: d.bookings > maxBookings * 0.7 ? "#7660A8" : d.bookings > 0 ? "#B8A9D9" : "#EBEBF0",
                        minHeight: d.bookings > 0 ? 2 : 0,
                      }}
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-1 text-[10px] text-[#8888A0]">
                <span>{utilization[0]?.date?.slice(5) || ""}</span>
                <span>{utilization[utilization.length - 1]?.date?.slice(5) || ""}</span>
              </div>
            </div>

            {/* Predictions */}
            <div className="bg-white rounded-xl border border-[#EBEBF0] p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-[#1A1A2E] mb-4">Predicted Attendance (14d)</h2>
              <div className="space-y-1">
                {predictions.slice(0, 7).map(p => (
                  <BarRow key={p.date} label={`${p.day.slice(0, 3)} ${p.date.slice(5)}`}
                    value={p.predicted_bookings} max={maxPred} color="#7660A8" />
                ))}
              </div>
            </div>

            {/* Floor breakdown */}
            <div className="bg-white rounded-xl border border-[#EBEBF0] p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-[#1A1A2E] mb-4">By Floor (30d)</h2>
              {floorBreakdown.length === 0
                ? <p className="text-sm text-[#8888A0]">No booking data yet.</p>
                : floorBreakdown.map(f => (
                  <BarRow key={f.floor_name} label={f.floor_name}
                    value={f.bookings} max={Math.max(...floorBreakdown.map(x => x.bookings))} color="#5E4B8B" />
                ))}
            </div>

            {/* Day of week */}
            <div className="bg-white rounded-xl border border-[#EBEBF0] p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-[#1A1A2E] mb-4">Next 14 Days Forecast</h2>
              <div className="flex items-end gap-1 h-28">
                {predictions.map(p => (
                  <div key={p.date} className="flex-1 flex flex-col items-center justify-end h-full gap-0.5" title={`${p.date}: ${p.predicted_bookings}`}>
                    <div className="w-full rounded-t-sm bg-[#B8A9D9]"
                      style={{ height: `${maxPred > 0 ? (p.predicted_bookings / maxPred) * 100 : 5}%`, minHeight: 2 }} />
                    <span className="text-[9px] text-[#8888A0]">{p.day.slice(0, 1)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
