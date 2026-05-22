"use client"

import { useEffect, useState } from "react"
import {
  listFloors, createFloor, updateFloor, deleteFloor,
  listDesks, createDesk, updateDesk, deleteDesk,
  listRooms, createRoom, updateRoom, deleteRoom,
} from "@/lib/api"
import type { Floor, Desk, Room } from "@/lib/api"

type Tab = "floors" | "desks" | "rooms"

function Msg({ msg }: { msg: { type: "success" | "error"; text: string } | null }) {
  if (!msg) return null
  return (
    <div className={`mb-4 px-4 py-3 rounded-lg text-sm ${msg.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
      {msg.text}
    </div>
  )
}

// ── Floors Tab ─────────────────────────────────────────────────────────────────

function FloorsTab() {
  const [floors, setFloors] = useState<Floor[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: "", level: "0" })
  const [saving, setSaving] = useState(false)
  const [actionId, setActionId] = useState<string | null>(null)
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const load = () => {
    setLoading(true)
    listFloors(false).then(r => setFloors(r.items)).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMsg(null)
    try {
      await createFloor({ name: form.name, level: Number(form.level) })
      setMsg({ type: "success", text: "Floor created." })
      setForm({ name: "", level: "0" })
      setShowForm(false)
      load()
    } catch (err: unknown) {
      setMsg({ type: "error", text: err instanceof Error ? err.message : "Failed to create floor" })
    } finally { setSaving(false) }
  }

  async function handleDeactivate(id: string) {
    setActionId(id)
    setMsg(null)
    try {
      await updateFloor(id, { is_active: false })
      setMsg({ type: "success", text: "Floor deactivated." })
      load()
    } catch (err: unknown) {
      setMsg({ type: "error", text: err instanceof Error ? err.message : "Failed" })
    } finally { setActionId(null) }
  }

  async function handleDelete(id: string, name: string) {
    if (!window.confirm(`Delete floor "${name}"? This cannot be undone.`)) return
    setActionId(id)
    setMsg(null)
    try {
      await deleteFloor(id)
      setMsg({ type: "success", text: "Floor deleted." })
      load()
    } catch (err: unknown) {
      setMsg({ type: "error", text: err instanceof Error ? err.message : "Failed" })
    } finally { setActionId(null) }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-[#1A1A2E]">Floors</h2>
        <button onClick={() => setShowForm(s => !s)}
          className="px-4 py-2 rounded-full bg-[#7660A8] text-white text-sm font-medium hover:bg-[#5E4B8B] transition-colors">
          + Add Floor
        </button>
      </div>

      <Msg msg={msg} />

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-xl border border-[#EBEBF0] p-5 shadow-sm mb-5">
          <h3 className="text-sm font-semibold text-[#1A1A2E] mb-4">New Floor</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#8888A0] mb-1">Floor Name</label>
              <input required type="text" placeholder="e.g. Ground Floor"
                value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                className="w-full border border-[#EBEBF0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7660A8]" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#8888A0] mb-1">Level</label>
              <input required type="number"
                value={form.level} onChange={e => setForm(p => ({ ...p, level: e.target.value }))}
                className="w-full border border-[#EBEBF0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7660A8]" />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button type="submit" disabled={saving}
              className="px-5 py-2 bg-[#7660A8] text-white rounded-full text-sm font-medium hover:bg-[#5E4B8B] disabled:opacity-50 transition-colors">
              {saving ? "Saving…" : "Create"}
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="px-5 py-2 border border-[#EBEBF0] rounded-full text-sm font-medium text-[#8888A0] hover:bg-[#F3F1F9] transition-colors">
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? <p className="text-sm text-[#8888A0]">Loading…</p> : floors.length === 0 ? (
        <p className="text-sm text-[#8888A0]">No floors found.</p>
      ) : (
        <div className="bg-white rounded-xl border border-[#EBEBF0] shadow-sm divide-y divide-[#EBEBF0]">
          {floors.map(f => (
            <div key={f.id} className="px-5 py-4 flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#1A1A2E]">{f.name}</p>
                <p className="text-xs text-[#8888A0]">Level {f.level}</p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${f.is_active ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                {f.is_active ? "Active" : "Inactive"}
              </span>
              <div className="flex gap-2 shrink-0">
                {f.is_active && (
                  <button onClick={() => handleDeactivate(f.id)} disabled={actionId === f.id}
                    className="text-xs px-3 py-1.5 rounded-lg border border-[#EBEBF0] text-[#8888A0] hover:bg-[#F3F1F9] disabled:opacity-50 transition-colors">
                    Deactivate
                  </button>
                )}
                <button onClick={() => handleDelete(f.id, f.name)} disabled={actionId === f.id}
                  className="px-4 py-2 rounded-full bg-red-500 text-white text-sm hover:bg-red-600 disabled:opacity-50 transition-colors">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Desks Tab ──────────────────────────────────────────────────────────────────

function DesksTab() {
  const [floors, setFloors] = useState<Floor[]>([])
  const [selectedFloorId, setSelectedFloorId] = useState<string>("")
  const [desks, setDesks] = useState<Desk[]>([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ label: "", zone: "", x: "0", y: "0" })
  const [saving, setSaving] = useState(false)
  const [actionId, setActionId] = useState<string | null>(null)
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    listFloors(false).then(r => {
      setFloors(r.items)
      if (r.items.length > 0) setSelectedFloorId(r.items[0].id)
    })
  }, [])

  useEffect(() => {
    if (!selectedFloorId) return
    setLoading(true)
    listDesks({ floor_id: selectedFloorId }).then(r => setDesks(r.items)).finally(() => setLoading(false))
  }, [selectedFloorId])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedFloorId) return
    setSaving(true)
    setMsg(null)
    try {
      await createDesk({ floor_id: selectedFloorId, label: form.label, zone: form.zone || undefined, x: Number(form.x), y: Number(form.y) })
      setMsg({ type: "success", text: "Desk created." })
      setForm({ label: "", zone: "", x: "0", y: "0" })
      setShowForm(false)
      listDesks({ floor_id: selectedFloorId }).then(r => setDesks(r.items))
    } catch (err: unknown) {
      setMsg({ type: "error", text: err instanceof Error ? err.message : "Failed to create desk" })
    } finally { setSaving(false) }
  }

  async function handleDeactivate(id: string) {
    setActionId(id)
    setMsg(null)
    try {
      await updateDesk(id, { is_active: false })
      setMsg({ type: "success", text: "Desk deactivated." })
      listDesks({ floor_id: selectedFloorId }).then(r => setDesks(r.items))
    } catch (err: unknown) {
      setMsg({ type: "error", text: err instanceof Error ? err.message : "Failed" })
    } finally { setActionId(null) }
  }

  async function handleDelete(id: string, label: string) {
    if (!window.confirm(`Delete desk "${label}"? This cannot be undone.`)) return
    setActionId(id)
    setMsg(null)
    try {
      await deleteDesk(id)
      setMsg({ type: "success", text: "Desk deleted." })
      listDesks({ floor_id: selectedFloorId }).then(r => setDesks(r.items))
    } catch (err: unknown) {
      setMsg({ type: "error", text: err instanceof Error ? err.message : "Failed" })
    } finally { setActionId(null) }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-[#1A1A2E]">Desks</h2>
        <button onClick={() => setShowForm(s => !s)} disabled={!selectedFloorId}
          className="px-4 py-2 rounded-full bg-[#7660A8] text-white text-sm font-medium hover:bg-[#5E4B8B] disabled:opacity-50 transition-colors">
          + Add Desk
        </button>
      </div>

      <div className="mb-4">
        <label className="block text-xs font-medium text-[#8888A0] mb-1">Floor</label>
        <select value={selectedFloorId} onChange={e => setSelectedFloorId(e.target.value)}
          className="border border-[#EBEBF0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7660A8] bg-white">
          {floors.map(f => <option key={f.id} value={f.id}>{f.name} (Level {f.level})</option>)}
        </select>
      </div>

      <Msg msg={msg} />

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-xl border border-[#EBEBF0] p-5 shadow-sm mb-5">
          <h3 className="text-sm font-semibold text-[#1A1A2E] mb-4">New Desk</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-[#8888A0] mb-1">Label</label>
              <input required type="text" placeholder="e.g. A-01"
                value={form.label} onChange={e => setForm(p => ({ ...p, label: e.target.value }))}
                className="w-full border border-[#EBEBF0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7660A8]" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-[#8888A0] mb-1">Zone (optional)</label>
              <input type="text" placeholder="e.g. Main"
                value={form.zone} onChange={e => setForm(p => ({ ...p, zone: e.target.value }))}
                className="w-full border border-[#EBEBF0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7660A8]" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#8888A0] mb-1">X</label>
              <input type="number" value={form.x} onChange={e => setForm(p => ({ ...p, x: e.target.value }))}
                className="w-full border border-[#EBEBF0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7660A8]" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#8888A0] mb-1">Y</label>
              <input type="number" value={form.y} onChange={e => setForm(p => ({ ...p, y: e.target.value }))}
                className="w-full border border-[#EBEBF0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7660A8]" />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button type="submit" disabled={saving}
              className="px-5 py-2 bg-[#7660A8] text-white rounded-full text-sm font-medium hover:bg-[#5E4B8B] disabled:opacity-50 transition-colors">
              {saving ? "Saving…" : "Create"}
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="px-5 py-2 border border-[#EBEBF0] rounded-full text-sm font-medium text-[#8888A0] hover:bg-[#F3F1F9] transition-colors">
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? <p className="text-sm text-[#8888A0]">Loading…</p> : desks.length === 0 ? (
        <p className="text-sm text-[#8888A0]">No desks on this floor yet.</p>
      ) : (
        <div className="bg-white rounded-xl border border-[#EBEBF0] shadow-sm divide-y divide-[#EBEBF0]">
          {desks.map(d => (
            <div key={d.id} className="px-5 py-4 flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#1A1A2E]">{d.label}</p>
                <p className="text-xs text-[#8888A0]">{d.zone ? `Zone: ${d.zone} · ` : ""}x:{d.x} y:{d.y}</p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${d.is_active ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                {d.is_active ? "Active" : "Inactive"}
              </span>
              <div className="flex gap-2 shrink-0">
                {d.is_active && (
                  <button onClick={() => handleDeactivate(d.id)} disabled={actionId === d.id}
                    className="text-xs px-3 py-1.5 rounded-lg border border-[#EBEBF0] text-[#8888A0] hover:bg-[#F3F1F9] disabled:opacity-50 transition-colors">
                    Deactivate
                  </button>
                )}
                <button onClick={() => handleDelete(d.id, d.label)} disabled={actionId === d.id}
                  className="px-4 py-2 rounded-full bg-red-500 text-white text-sm hover:bg-red-600 disabled:opacity-50 transition-colors">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Rooms Tab ──────────────────────────────────────────────────────────────────

function RoomsTab() {
  const [floors, setFloors] = useState<Floor[]>([])
  const [selectedFloorId, setSelectedFloorId] = useState<string>("")
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: "", capacity: "4", x: "0", y: "0" })
  const [saving, setSaving] = useState(false)
  const [actionId, setActionId] = useState<string | null>(null)
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    listFloors(false).then(r => {
      setFloors(r.items)
      if (r.items.length > 0) setSelectedFloorId(r.items[0].id)
    })
  }, [])

  useEffect(() => {
    if (!selectedFloorId) return
    setLoading(true)
    listRooms({ floor_id: selectedFloorId }).then(r => setRooms(r.items)).finally(() => setLoading(false))
  }, [selectedFloorId])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedFloorId) return
    setSaving(true)
    setMsg(null)
    try {
      await createRoom({ floor_id: selectedFloorId, name: form.name, capacity: Number(form.capacity), x: Number(form.x), y: Number(form.y) })
      setMsg({ type: "success", text: "Room created." })
      setForm({ name: "", capacity: "4", x: "0", y: "0" })
      setShowForm(false)
      listRooms({ floor_id: selectedFloorId }).then(r => setRooms(r.items))
    } catch (err: unknown) {
      setMsg({ type: "error", text: err instanceof Error ? err.message : "Failed to create room" })
    } finally { setSaving(false) }
  }

  async function handleDeactivate(id: string) {
    setActionId(id)
    setMsg(null)
    try {
      await updateRoom(id, { is_active: false })
      setMsg({ type: "success", text: "Room deactivated." })
      listRooms({ floor_id: selectedFloorId }).then(r => setRooms(r.items))
    } catch (err: unknown) {
      setMsg({ type: "error", text: err instanceof Error ? err.message : "Failed" })
    } finally { setActionId(null) }
  }

  async function handleDelete(id: string, name: string) {
    if (!window.confirm(`Delete room "${name}"? This cannot be undone.`)) return
    setActionId(id)
    setMsg(null)
    try {
      await deleteRoom(id)
      setMsg({ type: "success", text: "Room deleted." })
      listRooms({ floor_id: selectedFloorId }).then(r => setRooms(r.items))
    } catch (err: unknown) {
      setMsg({ type: "error", text: err instanceof Error ? err.message : "Failed" })
    } finally { setActionId(null) }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-[#1A1A2E]">Rooms</h2>
        <button onClick={() => setShowForm(s => !s)} disabled={!selectedFloorId}
          className="px-4 py-2 rounded-full bg-[#7660A8] text-white text-sm font-medium hover:bg-[#5E4B8B] disabled:opacity-50 transition-colors">
          + Add Room
        </button>
      </div>

      <div className="mb-4">
        <label className="block text-xs font-medium text-[#8888A0] mb-1">Floor</label>
        <select value={selectedFloorId} onChange={e => setSelectedFloorId(e.target.value)}
          className="border border-[#EBEBF0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7660A8] bg-white">
          {floors.map(f => <option key={f.id} value={f.id}>{f.name} (Level {f.level})</option>)}
        </select>
      </div>

      <Msg msg={msg} />

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-xl border border-[#EBEBF0] p-5 shadow-sm mb-5">
          <h3 className="text-sm font-semibold text-[#1A1A2E] mb-4">New Room</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-[#8888A0] mb-1">Room Name</label>
              <input required type="text" placeholder="e.g. Conference Room A"
                value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                className="w-full border border-[#EBEBF0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7660A8]" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#8888A0] mb-1">Capacity</label>
              <input required type="number" min="1"
                value={form.capacity} onChange={e => setForm(p => ({ ...p, capacity: e.target.value }))}
                className="w-full border border-[#EBEBF0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7660A8]" />
            </div>
            <div />
            <div>
              <label className="block text-xs font-medium text-[#8888A0] mb-1">X</label>
              <input type="number" value={form.x} onChange={e => setForm(p => ({ ...p, x: e.target.value }))}
                className="w-full border border-[#EBEBF0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7660A8]" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#8888A0] mb-1">Y</label>
              <input type="number" value={form.y} onChange={e => setForm(p => ({ ...p, y: e.target.value }))}
                className="w-full border border-[#EBEBF0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7660A8]" />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button type="submit" disabled={saving}
              className="px-5 py-2 bg-[#7660A8] text-white rounded-full text-sm font-medium hover:bg-[#5E4B8B] disabled:opacity-50 transition-colors">
              {saving ? "Saving…" : "Create"}
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="px-5 py-2 border border-[#EBEBF0] rounded-full text-sm font-medium text-[#8888A0] hover:bg-[#F3F1F9] transition-colors">
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? <p className="text-sm text-[#8888A0]">Loading…</p> : rooms.length === 0 ? (
        <p className="text-sm text-[#8888A0]">No rooms on this floor yet.</p>
      ) : (
        <div className="bg-white rounded-xl border border-[#EBEBF0] shadow-sm divide-y divide-[#EBEBF0]">
          {rooms.map(r => (
            <div key={r.id} className="px-5 py-4 flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#1A1A2E]">{r.name}</p>
                <p className="text-xs text-[#8888A0]">Capacity: {r.capacity} · x:{r.x} y:{r.y}</p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${r.is_active ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                {r.is_active ? "Active" : "Inactive"}
              </span>
              <div className="flex gap-2 shrink-0">
                {r.is_active && (
                  <button onClick={() => handleDeactivate(r.id)} disabled={actionId === r.id}
                    className="text-xs px-3 py-1.5 rounded-lg border border-[#EBEBF0] text-[#8888A0] hover:bg-[#F3F1F9] disabled:opacity-50 transition-colors">
                    Deactivate
                  </button>
                )}
                <button onClick={() => handleDelete(r.id, r.name)} disabled={actionId === r.id}
                  className="px-4 py-2 rounded-full bg-red-500 text-white text-sm hover:bg-red-600 disabled:opacity-50 transition-colors">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────

const TABS: { id: Tab; label: string }[] = [
  { id: "floors", label: "Floors" },
  { id: "desks", label: "Desks" },
  { id: "rooms", label: "Rooms" },
]

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>("floors")

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-[#1A1A2E]">Admin Panel</h1>
        <p className="text-sm text-[#8888A0] mt-1">Manage floors, desks, and rooms</p>
      </div>

      <div className="flex gap-1 mb-6 border-b border-[#EBEBF0]">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              tab === t.id
                ? "border-[#7660A8] text-[#7660A8]"
                : "border-transparent text-[#8888A0] hover:text-[#1A1A2E]"
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "floors" && <FloorsTab />}
      {tab === "desks" && <DesksTab />}
      {tab === "rooms" && <RoomsTab />}
    </div>
  )
}
