"use client"

import { useEffect, useState } from "react"
import { listVisitors, createVisitor, checkinVisitor, checkoutVisitor } from "@/lib/api"
import type { Visitor } from "@/lib/api"

const STATUS_STYLE: Record<string, string> = {
  expected: "bg-[#EDE9F7] text-[#7660A8]",
  checked_in: "bg-green-50 text-green-700",
  checked_out: "bg-gray-100 text-gray-500",
  cancelled: "bg-red-50 text-red-400",
}

function today() { return new Date().toISOString().split("T")[0] }

export default function VisitorsPage() {
  const [visitors, setVisitors] = useState<Visitor[]>([])
  const [loading, setLoading] = useState(true)
  const [date, setDate] = useState(today())
  const [showForm, setShowForm] = useState(false)
  const [actionId, setActionId] = useState<string | null>(null)
  const [form, setForm] = useState({ name: "", email: "", company: "", expected_at: `${today()}T09:00`, notes: "" })
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const load = () => {
    setLoading(true)
    listVisitors(date).then(r => setVisitors(r.items)).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [date])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setMessage(null)
    try {
      await createVisitor({ ...form, expected_at: new Date(form.expected_at).toISOString() }, "sureshOC")
      setMessage({ type: "success", text: "Visitor registered!" })
      setShowForm(false)
      setForm({ name: "", email: "", company: "", expected_at: `${today()}T09:00`, notes: "" })
      load()
    } catch (e: unknown) {
      setMessage({ type: "error", text: e instanceof Error ? e.message : "Failed" })
    }
  }

  async function handleCheckin(id: string) {
    setActionId(id)
    try { await checkinVisitor(id); load() }
    catch (e: unknown) { setMessage({ type: "error", text: e instanceof Error ? e.message : "Failed" }) }
    finally { setActionId(null) }
  }

  async function handleCheckout(id: string) {
    setActionId(id)
    try { await checkoutVisitor(id); load() }
    catch (e: unknown) { setMessage({ type: "error", text: e instanceof Error ? e.message : "Failed" }) }
    finally { setActionId(null) }
  }

  const stats = {
    expected: visitors.filter(v => v.status === "expected").length,
    checked_in: visitors.filter(v => v.status === "checked_in").length,
    total: visitors.length,
  }

  return (
    <div className="p-8">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-[#1A1A2E]">Visitor Management</h1>
          <p className="text-sm text-[#8888A0] mt-1">Reception dashboard</p>
        </div>
        <button onClick={() => setShowForm(s => !s)}
          className="px-4 py-2 rounded-full bg-[#7660A8] text-white text-sm font-medium hover:bg-[#5E4B8B] transition-colors">
          + Pre-register Visitor
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total Today", value: stats.total },
          { label: "Expected", value: stats.expected },
          { label: "Checked In", value: stats.checked_in },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-[#EBEBF0] p-4 shadow-sm text-center">
            <p className="text-2xl font-semibold text-[#1A1A2E]">{s.value}</p>
            <p className="text-xs text-[#8888A0] mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Date filter */}
      <div className="mb-4 flex items-center gap-3">
        <label className="text-xs font-medium text-[#8888A0]">Date</label>
        <input type="date" value={date} onChange={e => setDate(e.target.value)}
          className="border border-[#EBEBF0] rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7660A8]" />
      </div>

      {message && (
        <div className={`mb-4 px-4 py-3 rounded-lg text-sm ${message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
          {message.text}
        </div>
      )}

      {/* Pre-registration form */}
      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-xl border border-[#EBEBF0] p-5 shadow-sm mb-6">
          <h3 className="text-sm font-semibold text-[#1A1A2E] mb-4">New Visitor</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { key: "name", label: "Full Name", required: true, type: "text" },
              { key: "email", label: "Email", required: true, type: "email" },
              { key: "company", label: "Company", required: false, type: "text" },
              { key: "expected_at", label: "Expected At", required: true, type: "datetime-local" },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-xs font-medium text-[#8888A0] mb-1">{f.label}</label>
                <input
                  type={f.type}
                  required={f.required}
                  value={(form as Record<string, string>)[f.key]}
                  onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  className="w-full border border-[#EBEBF0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7660A8]"
                />
              </div>
            ))}
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-[#8888A0] mb-1">Notes</label>
              <input type="text" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                className="w-full border border-[#EBEBF0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7660A8]" />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button type="submit" className="px-5 py-2 bg-[#7660A8] text-white rounded-full text-sm font-medium hover:bg-[#5E4B8B] transition-colors">
              Register
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="px-5 py-2 border border-[#EBEBF0] rounded-full text-sm font-medium text-[#8888A0] hover:bg-[#F3F1F9] transition-colors">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Visitor list */}
      {loading ? <p className="text-sm text-[#8888A0]">Loading…</p>
        : visitors.length === 0 ? <p className="text-sm text-[#8888A0]">No visitors expected today.</p>
        : (
          <div className="bg-white rounded-xl border border-[#EBEBF0] shadow-sm divide-y divide-[#EBEBF0]">
            {visitors.map(v => (
              <div key={v.id} className="px-5 py-4 flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#1A1A2E] truncate">{v.name}</p>
                  <p className="text-xs text-[#8888A0]">{v.email}{v.company ? ` · ${v.company}` : ""}</p>
                  <p className="text-xs text-[#8888A0]">{new Date(v.expected_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLE[v.status]}`}>
                    {v.status.replace("_", " ")}
                  </span>
                  {v.status === "expected" && (
                    <button onClick={() => handleCheckin(v.id)} disabled={actionId === v.id}
                      className="text-xs px-3 py-1 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 disabled:opacity-50 transition-colors">
                      Check In
                    </button>
                  )}
                  {v.status === "checked_in" && (
                    <button onClick={() => handleCheckout(v.id)} disabled={actionId === v.id}
                      className="text-xs px-3 py-1 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 disabled:opacity-50 transition-colors">
                      Check Out
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
    </div>
  )
}
