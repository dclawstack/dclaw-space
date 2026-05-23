"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/context/AuthContext"

const PLANS: Record<string, {
  label: string; price: number; color: string;
  limits: string[]; badge?: string
}> = {
  free:       { label: "Free",       price: 0,   color: "#8888A0", limits: ["10 desks", "1 floor", "5 users", "Basic booking", "Community support"] },
  starter:    { label: "Starter",    price: 99,  color: "#7660A8", badge: "Most Popular", limits: ["50 desks", "3 floors", "25 users", "AI Copilot", "Analytics", "Email support"] },
  growth:     { label: "Growth",     price: 299, color: "#1A1A2E", limits: ["Unlimited desks/floors", "200 users", "Slack bot", "ESG reporting", "CSV export", "Priority support"] },
  enterprise: { label: "Enterprise", price: 0,   color: "#3B1F6B", limits: ["SSO & SAML", "Audit log", "Sensor API", "SLA", "Dedicated CSM", "Custom pricing"] },
}

function UsageBar({ label, value, max, unit }: { label: string; value: number; max: number; unit: string }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0
  const warn = pct >= 80
  return (
    <div>
      <div className="flex justify-between text-xs text-[#8888A0] mb-1">
        <span>{label}</span>
        <span className={warn ? "text-amber-600 font-medium" : ""}>{value} / {max} {unit}</span>
      </div>
      <div className="w-full h-2 bg-[#F3F1F9] rounded-full overflow-hidden">
        <div
          className="h-2 rounded-full transition-all"
          style={{ width: `${pct}%`, background: warn ? "#F59E0B" : "#7660A8" }}
        />
      </div>
    </div>
  )
}

export default function SettingsPage() {
  const { user } = useAuth()
  const [tab, setTab] = useState<"profile" | "billing" | "integrations">("profile")
  const [usage, setUsage] = useState<{ plan: string; members: number; floors: number; desks: number; rooms: number; seat_limit: number } | null>(null)
  const [annual, setAnnual] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetch("/api/v1/org/usage")
      .then(r => r.ok ? r.json() : null)
      .then(d => d && setUsage(d))
      .catch(() => {})
  }, [])

  const currentPlan = usage?.plan ?? "free"
  const planInfo = PLANS[currentPlan] ?? PLANS.free

  const TABS = [
    { id: "profile", label: "Profile" },
    { id: "billing", label: "Billing & Plan" },
    { id: "integrations", label: "Integrations" },
  ] as const

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-[#1A1A2E]">Settings</h1>
        <p className="text-sm text-[#8888A0] mt-1">Manage your workspace and account</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 bg-[#F3F1F9] rounded-xl p-1 w-fit">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t.id ? "bg-white text-[#1A1A2E] shadow-sm" : "text-[#8888A0] hover:text-[#1A1A2E]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {tab === "profile" && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-[#EBEBF0] p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-[#1A1A2E] mb-4">Your Profile</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#8888A0] mb-1">First Name</label>
                <input defaultValue={user?.first_name} className="w-full border border-[#EBEBF0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7660A8]" />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#8888A0] mb-1">Last Name</label>
                <input defaultValue={user?.last_name} className="w-full border border-[#EBEBF0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7660A8]" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-[#8888A0] mb-1">Email</label>
                <input defaultValue={user?.email} type="email" className="w-full border border-[#EBEBF0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7660A8]" />
              </div>
            </div>
            <div className="mt-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#EDE9F7] text-[#7660A8]">
                Role: {user?.role?.replace("_", " ") ?? "employee"}
              </span>
            </div>
            <button className="mt-4 px-5 py-2 rounded-full bg-[#7660A8] text-white text-sm font-medium hover:bg-[#5E4B8B] transition-colors">
              Save Changes
            </button>
          </div>

          <div className="bg-white rounded-xl border border-[#EBEBF0] p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-[#1A1A2E] mb-4">Notification Preferences</h2>
            {[
              { label: "Booking confirmations", checked: true },
              { label: "Booking reminders (day before)", checked: true },
              { label: "Visitor arrival alerts", checked: true },
              { label: "Weekly utilization digest", checked: false },
            ].map(n => (
              <label key={n.label} className="flex items-center gap-3 py-2 cursor-pointer">
                <input type="checkbox" defaultChecked={n.checked} className="w-4 h-4 accent-[#7660A8]" />
                <span className="text-sm text-[#1A1A2E]">{n.label}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Billing Tab */}
      {tab === "billing" && (
        <div className="space-y-6">
          {/* Current Plan */}
          <div className="bg-white rounded-xl border border-[#EBEBF0] p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-sm font-semibold text-[#1A1A2E] mb-1">Current Plan</h2>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-2xl font-bold" style={{ color: planInfo.color }}>{planInfo.label}</span>
                  {planInfo.price > 0 && (
                    <span className="text-sm text-[#8888A0]">${planInfo.price}/month</span>
                  )}
                </div>
              </div>
              <button className="px-4 py-2 rounded-full border border-[#7660A8] text-[#7660A8] text-sm font-medium hover:bg-[#EDE9F7] transition-colors">
                Upgrade Plan
              </button>
            </div>
            {usage && (
              <div className="mt-5 space-y-3">
                <UsageBar label="Users" value={usage.members} max={currentPlan === "free" ? 5 : currentPlan === "starter" ? 25 : 200} unit="seats" />
                <UsageBar label="Desks" value={usage.desks} max={currentPlan === "free" ? 10 : currentPlan === "starter" ? 50 : 9999} unit="desks" />
                <UsageBar label="Floors" value={usage.floors} max={currentPlan === "free" ? 1 : currentPlan === "starter" ? 3 : 9999} unit="floors" />
              </div>
            )}
          </div>

          {/* Pricing Toggle */}
          <div className="flex items-center gap-3 mb-2">
            <span className="text-sm text-[#8888A0]">Monthly</span>
            <button
              onClick={() => setAnnual(a => !a)}
              className={`relative w-12 h-6 rounded-full transition-colors ${annual ? "bg-[#7660A8]" : "bg-[#EBEBF0]"}`}
            >
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${annual ? "translate-x-7" : "translate-x-1"}`} />
            </button>
            <span className="text-sm text-[#8888A0]">Annual <span className="text-green-600 font-medium">–20%</span></span>
          </div>

          {/* Plan Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(PLANS).map(([key, plan]) => (
              <div
                key={key}
                className={`rounded-xl p-5 border ${key === currentPlan ? "border-[#7660A8] bg-[#F3F1F9]" : "border-[#EBEBF0] bg-white"} shadow-sm`}
              >
                {plan.badge && (
                  <span className="text-xs font-medium bg-[#7660A8] text-white px-2 py-0.5 rounded-full mb-2 inline-block">{plan.badge}</span>
                )}
                <p className="text-lg font-bold text-[#1A1A2E]">{plan.label}</p>
                <p className="text-2xl font-semibold mt-1 text-[#7660A8]">
                  {plan.price === 0 && key === "free" ? "Free" : plan.price === 0 ? "Custom" : `$${annual ? Math.round(plan.price * 0.8) : plan.price}/mo`}
                </p>
                {annual && plan.price > 0 && (
                  <p className="text-xs text-green-600">Billed ${Math.round(plan.price * 0.8 * 12)}/year</p>
                )}
                <ul className="mt-3 space-y-1">
                  {plan.limits.map(l => (
                    <li key={l} className="text-xs text-[#8888A0] flex items-center gap-1.5">
                      <span className="text-[#7660A8]">✓</span> {l}
                    </li>
                  ))}
                </ul>
                {key !== currentPlan && (
                  <button className="mt-4 w-full py-2 rounded-full text-sm font-medium border border-[#7660A8] text-[#7660A8] hover:bg-[#EDE9F7] transition-colors">
                    {key === "enterprise" ? "Contact Sales" : "Upgrade"}
                  </button>
                )}
                {key === currentPlan && (
                  <p className="mt-4 text-xs text-[#7660A8] font-medium text-center">Current Plan</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Integrations Tab */}
      {tab === "integrations" && (
        <div className="space-y-4">
          {[
            {
              name: "Slack",
              desc: "Book desks (/desk-book) and see who's in (/who-is-in). POST to /api/v1/slack/commands",
              icon: "💬",
              connected: false,
            },
            {
              name: "Google Calendar",
              desc: "Sync desk and room bookings with Google Calendar. Two-way sync.",
              icon: "📅",
              connected: false,
            },
            {
              name: "Microsoft Teams",
              desc: "Book spaces and see floor plans directly in Teams channels.",
              icon: "🔵",
              connected: false,
            },
            {
              name: "Webhooks",
              desc: "Send booking events to your own systems via HTTP POST.",
              icon: "🔗",
              connected: false,
            },
          ].map(integration => (
            <div key={integration.name} className="bg-white rounded-xl border border-[#EBEBF0] p-5 shadow-sm flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#F3F1F9] flex items-center justify-center text-xl">
                  {integration.icon}
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#1A1A2E]">{integration.name}</p>
                  <p className="text-xs text-[#8888A0] mt-0.5">{integration.desc}</p>
                </div>
              </div>
              <button className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                integration.connected
                  ? "bg-green-50 text-green-700 border border-green-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                  : "bg-[#7660A8] text-white hover:bg-[#5E4B8B]"
              }`}>
                {integration.connected ? "Connected" : "Connect"}
              </button>
            </div>
          ))}

          {/* Webhook URL config */}
          <div className="bg-white rounded-xl border border-[#EBEBF0] p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-[#1A1A2E] mb-3">Outbound Webhook URL</h3>
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="https://your-system.com/webhooks/dclaw"
                className="flex-1 border border-[#EBEBF0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7660A8]"
              />
              <button className="px-4 py-2 rounded-full bg-[#7660A8] text-white text-sm font-medium hover:bg-[#5E4B8B] transition-colors">
                Save
              </button>
            </div>
            <p className="text-xs text-[#8888A0] mt-2">Events: booking.created, booking.cancelled, visitor.checked_in</p>
          </div>

          {/* API Key */}
          <div className="bg-white rounded-xl border border-[#EBEBF0] p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-[#1A1A2E] mb-3">API Key</h3>
            <div className="flex gap-2">
              <input
                readOnly
                value="dcs_live_•••••••••••••••••••••••••••••••"
                className="flex-1 border border-[#EBEBF0] rounded-lg px-3 py-2 text-sm font-mono text-[#8888A0] bg-[#F9F8FC]"
              />
              <button
                onClick={() => { navigator.clipboard.writeText("dcs_live_demo_key"); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
                className="px-4 py-2 rounded-full border border-[#EBEBF0] text-[#8888A0] text-sm hover:bg-[#F3F1F9] transition-colors"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            <p className="text-xs text-[#8888A0] mt-2">Use this key to call the DClaw Space API from external systems. Keep it secret.</p>
          </div>
        </div>
      )}
    </div>
  )
}
