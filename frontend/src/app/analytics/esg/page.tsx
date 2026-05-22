"use client"

import { useEffect, useState } from "react"
import { getEsgMetrics } from "@/lib/api"
import type { EsgMetrics } from "@/lib/api"

function nDaysAgo(n: number) {
  return new Date(Date.now() - n * 86400000).toISOString().split("T")[0]
}
const today = () => new Date().toISOString().split("T")[0]

function MetricCard({ label, value, unit, sub, highlight }: {
  label: string; value: string | number; unit: string; sub?: string; highlight?: boolean
}) {
  return (
    <div className={`rounded-xl border p-5 shadow-sm ${highlight ? "bg-[#F3F1F9] border-[#7660A8]" : "bg-white border-[#EBEBF0]"}`}>
      <p className="text-xs font-medium text-[#8888A0] uppercase tracking-wide">{label}</p>
      <p className="mt-1 text-3xl font-semibold text-[#1A1A2E]">{value} <span className="text-base font-normal text-[#8888A0]">{unit}</span></p>
      {sub && <p className="mt-1 text-xs text-[#8888A0]">{sub}</p>}
    </div>
  )
}

export default function EsgPage() {
  const [metrics, setMetrics] = useState<EsgMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [range, setRange] = useState("30")

  useEffect(() => {
    const days = parseInt(range)
    getEsgMetrics(nDaysAgo(days), today())
      .then(setMetrics)
      .finally(() => setLoading(false))
  }, [range])

  return (
    <div className="p-8">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-[#1A1A2E]">ESG Dashboard</h1>
          <p className="text-sm text-[#8888A0] mt-1">Carbon offset from unused workspace</p>
        </div>
        <select
          value={range}
          onChange={e => { setLoading(true); setRange(e.target.value) }}
          className="border border-[#EBEBF0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7660A8]"
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
        </select>
      </div>

      {loading ? <p className="text-sm text-[#8888A0]">Loading…</p> : !metrics ? null : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <MetricCard label="Utilization" value={metrics.utilization_pct} unit="%" sub="of total capacity booked" />
            <MetricCard label="kWh Saved" value={metrics.kwh_saved} unit="kWh" sub="from unused desk-days" highlight />
            <MetricCard label="CO₂ Offset" value={metrics.co2_kg_saved} unit="kg" sub="estimated carbon saved" highlight />
            <MetricCard label="Trees Equivalent" value={metrics.trees_equivalent} unit="trees/yr" sub="annual absorption equiv." />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-[#EBEBF0] p-6 shadow-sm">
              <h2 className="text-sm font-semibold text-[#1A1A2E] mb-4">Capacity Breakdown</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs text-[#8888A0] mb-1">
                    <span>Booked</span>
                    <span>{metrics.booked_desk_days} desk-days</span>
                  </div>
                  <div className="w-full h-3 bg-[#F3F1F9] rounded-full overflow-hidden">
                    <div className="h-3 bg-[#7660A8] rounded-full"
                      style={{ width: `${metrics.utilization_pct}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs text-[#8888A0] mb-1">
                    <span>Unused (offset)</span>
                    <span>{metrics.unused_desk_days} desk-days</span>
                  </div>
                  <div className="w-full h-3 bg-[#F3F1F9] rounded-full overflow-hidden">
                    <div className="h-3 bg-[#10B981] rounded-full"
                      style={{ width: `${100 - metrics.utilization_pct}%` }} />
                  </div>
                </div>
              </div>
              <p className="text-xs text-[#8888A0] mt-4">{metrics.note}</p>
            </div>

            <div className="bg-white rounded-xl border border-[#EBEBF0] p-6 shadow-sm">
              <h2 className="text-sm font-semibold text-[#1A1A2E] mb-4">Impact Summary</h2>
              <div className="space-y-3">
                {[
                  { label: "Total desk capacity", value: `${metrics.total_desk_days} desk-days` },
                  { label: "Desks booked", value: `${metrics.booked_desk_days} desk-days` },
                  { label: "Energy saved", value: `${metrics.kwh_saved} kWh` },
                  { label: "CO₂ not emitted", value: `${metrics.co2_kg_saved} kg` },
                  { label: "Equivalent trees/yr", value: `${metrics.trees_equivalent}` },
                ].map(row => (
                  <div key={row.label} className="flex justify-between py-1.5 border-b border-[#EBEBF0] last:border-0">
                    <span className="text-sm text-[#8888A0]">{row.label}</span>
                    <span className="text-sm font-medium text-[#1A1A2E]">{row.value}</span>
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
