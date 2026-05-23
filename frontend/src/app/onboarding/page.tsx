"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createFloor, createDesk } from "@/lib/api"

type OfficeType = "hybrid" | "remote" | "full"
type EmployeeRange = "1-10" | "11-50" | "51-200" | "201-1000" | "1000+"

const TOTAL_STEPS = 5

function StepDots({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
        <div key={i} className={`rounded-full transition-all ${
          i + 1 === current
            ? "w-6 h-2 bg-[#7660A8]"
            : i + 1 < current
            ? "w-2 h-2 bg-[#7660A8] opacity-60"
            : "w-2 h-2 bg-[#EBEBF0]"
        }`} />
      ))}
    </div>
  )
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-[#EBEBF0] shadow-sm p-8 w-full max-w-lg mx-auto">
      {children}
    </div>
  )
}

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)

  // Step 1
  const [officeType, setOfficeType] = useState<OfficeType>("hybrid")
  const [employeeRange, setEmployeeRange] = useState<EmployeeRange>("11-50")

  // Step 2
  const [floorName, setFloorName] = useState("")
  const [floorLevel, setFloorLevel] = useState("0")
  const [floorId, setFloorId] = useState<string | null>(null)
  const [createdFloorName, setCreatedFloorName] = useState("")
  const [step2Loading, setStep2Loading] = useState(false)
  const [step2Error, setStep2Error] = useState<string | null>(null)

  // Step 3
  const [deskCount, setDeskCount] = useState("10")
  const [deskZone, setDeskZone] = useState("Main")
  const [deskProgress, setDeskProgress] = useState(0)
  const [deskTotal, setDeskTotal] = useState(0)
  const [desksCreated, setDesksCreated] = useState(0)
  const [step3Loading, setStep3Loading] = useState(false)
  const [step3Error, setStep3Error] = useState<string | null>(null)

  // Step 4 — invite link uses current origin so it works locally and in prod
  const inviteCode = "dcl-" + Math.random().toString(36).slice(2, 8).toUpperCase()
  const inviteLink = typeof window !== "undefined"
    ? `${window.location.origin}/join/${inviteCode}`
    : `/join/${inviteCode}`
  const [copied, setCopied] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteSent, setInviteSent] = useState(false)

  async function handleStep2Next() {
    if (!floorName.trim()) return
    setStep2Loading(true)
    setStep2Error(null)
    try {
      const floor = await createFloor({ name: floorName.trim(), level: Number(floorLevel) })
      setFloorId(floor.id)
      setCreatedFloorName(floor.name)
      setStep(3)
    } catch (err: unknown) {
      setStep2Error(err instanceof Error ? err.message : "Failed to create floor")
    } finally { setStep2Loading(false) }
  }

  async function handleCreateDesks() {
    if (!floorId) { setStep(4); return }
    const count = Math.max(1, Math.min(100, Number(deskCount) || 10))
    const zone = deskZone.trim() || "Main"
    setStep3Loading(true)
    setStep3Error(null)
    setDeskProgress(0)
    setDeskTotal(count)
    setDesksCreated(0)
    try {
      for (let i = 1; i <= count; i++) {
        const label = `${zone}-${String(i).padStart(2, "0")}`
        await createDesk({ floor_id: floorId, label, zone })
        setDeskProgress(i)
        setDesksCreated(i)
      }
      setStep(4)
    } catch (err: unknown) {
      setStep3Error(err instanceof Error ? err.message : "Failed to create desks")
    } finally { setStep3Loading(false) }
  }

  function handleCopy() {
    navigator.clipboard.writeText(inviteLink).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  function handleSendInvite() {
    if (!inviteEmail.trim()) return
    setInviteSent(true)
    setInviteEmail("")
    setTimeout(() => setInviteSent(false), 3000)
  }

  const stepPercent = step2Loading ? 0 : deskTotal > 0 ? Math.round((deskProgress / deskTotal) * 100) : 0

  return (
    <div className="min-h-screen bg-[#F9F8FC] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <p className="text-center text-xs font-medium text-[#8888A0] mb-4">
          Step {step} of {TOTAL_STEPS}
        </p>
        <StepDots current={step} />

        {/* Step 1 */}
        {step === 1 && (
          <Card>
            <h1 className="text-2xl font-semibold text-[#1A1A2E] mb-1">Welcome to DClaw Space!</h1>
            <p className="text-sm text-[#8888A0] mb-6">Let&apos;s set up your workspace in a few steps.</p>

            <div className="mb-5">
              <label className="block text-xs font-semibold text-[#8888A0] uppercase tracking-wide mb-3">
                What is your office type?
              </label>
              <div className="flex flex-col gap-2">
                {([
                  { value: "hybrid", label: "Hybrid Work", desc: "Mix of remote and in-office" },
                  { value: "remote", label: "Remote-First", desc: "Primarily remote with occasional office use" },
                  { value: "full", label: "Full In-Office", desc: "Everyone works from the office" },
                ] as const).map(opt => (
                  <label key={opt.value}
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      officeType === opt.value
                        ? "border-[#7660A8] bg-[#EDE9F7]"
                        : "border-[#EBEBF0] hover:bg-[#F9F8FC]"
                    }`}>
                    <input type="radio" name="officeType" value={opt.value}
                      checked={officeType === opt.value}
                      onChange={() => setOfficeType(opt.value)}
                      className="mt-0.5 accent-[#7660A8]" />
                    <div>
                      <p className="text-sm font-medium text-[#1A1A2E]">{opt.label}</p>
                      <p className="text-xs text-[#8888A0]">{opt.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-xs font-semibold text-[#8888A0] uppercase tracking-wide mb-2">
                How many employees?
              </label>
              <select value={employeeRange} onChange={e => setEmployeeRange(e.target.value as EmployeeRange)}
                className="w-full border border-[#EBEBF0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7660A8] bg-white">
                {(["1-10", "11-50", "51-200", "201-1000", "1000+"] as const).map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <button onClick={() => setStep(2)}
              className="w-full px-4 py-2.5 rounded-full bg-[#7660A8] text-white text-sm font-medium hover:bg-[#5E4B8B] transition-colors">
              Next →
            </button>
          </Card>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <Card>
            <h1 className="text-xl font-semibold text-[#1A1A2E] mb-1">Set up your first floor</h1>
            <p className="text-sm text-[#8888A0] mb-6">Give your first floor a name and level number.</p>

            {step2Error && (
              <div className="mb-4 px-4 py-3 rounded-lg text-sm bg-red-50 text-red-600">{step2Error}</div>
            )}

            <div className="flex flex-col gap-4 mb-6">
              <div>
                <label className="block text-xs font-medium text-[#8888A0] mb-1">Floor Name</label>
                <input type="text" required placeholder="e.g. Ground Floor, HQ Level 1"
                  value={floorName} onChange={e => setFloorName(e.target.value)}
                  className="w-full border border-[#EBEBF0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7660A8]" />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#8888A0] mb-1">Floor Level</label>
                <input type="number" value={floorLevel} onChange={e => setFloorLevel(e.target.value)}
                  className="w-full border border-[#EBEBF0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7660A8]" />
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(1)}
                className="px-4 py-2 rounded-full border border-[#EBEBF0] text-sm font-medium text-[#8888A0] hover:bg-[#F3F1F9] transition-colors">
                Back
              </button>
              <button onClick={handleStep2Next} disabled={!floorName.trim() || step2Loading}
                className="flex-1 px-4 py-2.5 rounded-full bg-[#7660A8] text-white text-sm font-medium hover:bg-[#5E4B8B] disabled:opacity-50 transition-colors">
                {step2Loading ? "Creating floor…" : "Next →"}
              </button>
            </div>
          </Card>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <Card>
            <h1 className="text-xl font-semibold text-[#1A1A2E] mb-1">Add desks to your floor</h1>
            <p className="text-sm text-[#8888A0] mb-1">
              You&apos;re adding desks to <span className="font-medium text-[#7660A8]">{createdFloorName}</span>.
            </p>

            {step3Error && (
              <div className="mb-4 px-4 py-3 rounded-lg text-sm bg-red-50 text-red-600">{step3Error}</div>
            )}

            <div className="flex flex-col gap-4 mb-5 mt-5">
              <div>
                <label className="block text-xs font-medium text-[#8888A0] mb-1">How many desks?</label>
                <input type="number" min="1" max="100" value={deskCount}
                  onChange={e => setDeskCount(e.target.value)} disabled={step3Loading}
                  className="w-full border border-[#EBEBF0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7660A8] disabled:opacity-50" />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#8888A0] mb-1">Zone name (optional)</label>
                <input type="text" placeholder="Main" value={deskZone}
                  onChange={e => setDeskZone(e.target.value)} disabled={step3Loading}
                  className="w-full border border-[#EBEBF0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7660A8] disabled:opacity-50" />
                <p className="text-xs text-[#8888A0] mt-1">Desks will be labeled {(deskZone.trim() || "Main")}-01, {(deskZone.trim() || "Main")}-02…</p>
              </div>
            </div>

            {step3Loading && (
              <div className="mb-5">
                <div className="flex justify-between text-xs text-[#8888A0] mb-1">
                  <span>Creating desks…</span>
                  <span>{deskProgress} / {deskTotal}</span>
                </div>
                <div className="w-full h-2 bg-[#EBEBF0] rounded-full overflow-hidden">
                  <div className="h-full bg-[#7660A8] rounded-full transition-all"
                    style={{ width: `${stepPercent}%` }} />
                </div>
              </div>
            )}

            {desksCreated > 0 && !step3Loading && (
              <p className="text-sm text-green-700 bg-green-50 rounded-lg px-4 py-2 mb-4">
                {desksCreated} desks created successfully.
              </p>
            )}

            <div className="flex gap-3">
              <button onClick={handleCreateDesks} disabled={step3Loading}
                className="flex-1 px-4 py-2.5 rounded-full bg-[#7660A8] text-white text-sm font-medium hover:bg-[#5E4B8B] disabled:opacity-50 transition-colors">
                {step3Loading ? "Creating…" : "Create Desks"}
              </button>
            </div>
            <button onClick={() => setStep(4)} disabled={step3Loading}
              className="w-full mt-3 text-xs text-[#8888A0] hover:text-[#1A1A2E] transition-colors">
              I&apos;ll do this later →
            </button>
          </Card>
        )}

        {/* Step 4 */}
        {step === 4 && (
          <Card>
            <h1 className="text-xl font-semibold text-[#1A1A2E] mb-1">Invite your team</h1>
            <p className="text-sm text-[#8888A0] mb-6">Share your workspace with your team members.</p>

            <div className="mb-5">
              <p className="text-xs font-medium text-[#8888A0] mb-2">Share this link with your team:</p>
              <div className="flex items-center gap-2 bg-[#F9F8FC] border border-[#EBEBF0] rounded-lg px-3 py-2">
                <span className="text-xs text-[#1A1A2E] flex-1 truncate font-mono">{inviteLink}</span>
                <button onClick={handleCopy}
                  className="text-xs px-3 py-1 rounded-lg bg-[#7660A8] text-white hover:bg-[#5E4B8B] shrink-0 transition-colors">
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>

            <div className="border-t border-[#EBEBF0] pt-5 mb-6">
              <p className="text-xs font-medium text-[#8888A0] mb-2">Or invite by email:</p>
              <div className="flex gap-2">
                <input type="email" placeholder="colleague@company.com"
                  value={inviteEmail} onChange={e => setInviteEmail(e.target.value)}
                  className="flex-1 border border-[#EBEBF0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7660A8]" />
                <button onClick={handleSendInvite} disabled={!inviteEmail.trim()}
                  className="px-4 py-2 rounded-full bg-[#7660A8] text-white text-sm font-medium hover:bg-[#5E4B8B] disabled:opacity-50 transition-colors">
                  Send
                </button>
              </div>
              {inviteSent && (
                <p className="text-xs text-green-700 mt-2">Invite sent!</p>
              )}
            </div>

            <button onClick={() => setStep(5)}
              className="w-full px-4 py-2.5 rounded-full bg-[#7660A8] text-white text-sm font-medium hover:bg-[#5E4B8B] transition-colors">
              Next →
            </button>
            <button onClick={() => setStep(5)}
              className="w-full mt-3 text-xs text-[#8888A0] hover:text-[#1A1A2E] transition-colors">
              I&apos;ll do this later →
            </button>
          </Card>
        )}

        {/* Step 5 */}
        {step === 5 && (
          <Card>
            <div className="text-center mb-6">
              <div className="text-4xl mb-3">🎉</div>
              <h1 className="text-2xl font-semibold text-[#1A1A2E] mb-1">You&apos;re ready!</h1>
              <p className="text-sm text-[#8888A0]">
                Your workspace is configured
                {createdFloorName ? ` with ${createdFloorName}` : ""}
                {desksCreated > 0 ? ` and ${desksCreated} desks` : ""}.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 mb-6">
              {[
                { label: "Book your first desk", href: "/bookings", icon: "🪑" },
                { label: "View floor plan", href: "/floors", icon: "🗺️" },
                { label: "Explore AI Copilot", href: "/analytics", icon: "✨" },
              ].map(action => (
                <a key={action.href} href={action.href}
                  className="flex items-center gap-3 p-4 rounded-xl border border-[#EBEBF0] hover:border-[#7660A8] hover:bg-[#EDE9F7] transition-colors group">
                  <span className="text-xl">{action.icon}</span>
                  <span className="text-sm font-medium text-[#1A1A2E] flex-1">{action.label}</span>
                  <span className="text-[#7660A8] text-sm group-hover:translate-x-0.5 transition-transform">→</span>
                </a>
              ))}
            </div>

            <button onClick={() => router.push("/")}
              className="w-full px-4 py-3 rounded-full bg-[#7660A8] text-white text-sm font-semibold hover:bg-[#5E4B8B] transition-colors">
              Go to Dashboard →
            </button>
          </Card>
        )}
      </div>
    </div>
  )
}
