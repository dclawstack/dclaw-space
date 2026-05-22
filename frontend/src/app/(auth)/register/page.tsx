"use client"
import { useState, FormEvent } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { register } from "@/lib/api"
import { useAuth } from "@/context/AuthContext"

export default function RegisterPage() {
  const { setToken } = useAuth()
  const router = useRouter()

  const [orgName, setOrgName] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError("")

    if (password.length < 8) {
      setError("Password must be at least 8 characters.")
      return
    }

    setSubmitting(true)
    try {
      const { access_token } = await register({
        org_name: orgName,
        first_name: firstName,
        last_name: lastName,
        email,
        password,
      })
      setToken(access_token)
      router.replace("/onboarding")
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Registration failed"
      if (msg.includes("409")) {
        setError("An account with this email already exists.")
      } else {
        setError(msg)
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="w-full max-w-sm">
      {/* Logo */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#7660A8] mb-4">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="3" y="3" width="8" height="8" rx="1.5" fill="white" fillOpacity="0.9" />
            <rect x="13" y="3" width="8" height="8" rx="1.5" fill="white" fillOpacity="0.6" />
            <rect x="3" y="13" width="8" height="8" rx="1.5" fill="white" fillOpacity="0.6" />
            <rect x="13" y="13" width="8" height="8" rx="1.5" fill="white" fillOpacity="0.9" />
          </svg>
        </div>
        <h1 className="text-2xl font-semibold text-[#1A1A2E]">Create your workspace</h1>
        <p className="text-sm text-[#8888A0] mt-1">Set up DClaw Space for your team</p>
      </div>

      {/* Card */}
      <div className="bg-white border border-[#EBEBF0] shadow-sm rounded-2xl p-8">
        {error && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 text-red-600 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Org name */}
          <div>
            <label className="block text-xs font-medium text-[#8888A0] mb-1.5" htmlFor="org-name">
              Organisation name
            </label>
            <input
              id="org-name"
              type="text"
              required
              value={orgName}
              onChange={e => setOrgName(e.target.value)}
              placeholder="Acme Corp"
              className="w-full border border-[#EBEBF0] rounded-lg px-3 py-2.5 text-sm text-[#1A1A2E] placeholder:text-[#C0C0CC] focus:outline-none focus:ring-2 focus:ring-[#7660A8] focus:border-transparent transition"
            />
          </div>

          {/* First + Last name on same row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#8888A0] mb-1.5" htmlFor="first-name">
                First name
              </label>
              <input
                id="first-name"
                type="text"
                required
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                placeholder="Jane"
                className="w-full border border-[#EBEBF0] rounded-lg px-3 py-2.5 text-sm text-[#1A1A2E] placeholder:text-[#C0C0CC] focus:outline-none focus:ring-2 focus:ring-[#7660A8] focus:border-transparent transition"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#8888A0] mb-1.5" htmlFor="last-name">
                Last name
              </label>
              <input
                id="last-name"
                type="text"
                required
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                placeholder="Smith"
                className="w-full border border-[#EBEBF0] rounded-lg px-3 py-2.5 text-sm text-[#1A1A2E] placeholder:text-[#C0C0CC] focus:outline-none focus:ring-2 focus:ring-[#7660A8] focus:border-transparent transition"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-medium text-[#8888A0] mb-1.5" htmlFor="email">
              Work email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="w-full border border-[#EBEBF0] rounded-lg px-3 py-2.5 text-sm text-[#1A1A2E] placeholder:text-[#C0C0CC] focus:outline-none focus:ring-2 focus:ring-[#7660A8] focus:border-transparent transition"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-medium text-[#8888A0] mb-1.5" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="new-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Min. 8 characters"
              className="w-full border border-[#EBEBF0] rounded-lg px-3 py-2.5 text-sm text-[#1A1A2E] placeholder:text-[#C0C0CC] focus:outline-none focus:ring-2 focus:ring-[#7660A8] focus:border-transparent transition"
            />
            <p className="mt-1 text-[11px] text-[#8888A0]">Use at least 8 characters</p>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-full bg-[#7660A8] text-white font-medium py-2.5 text-sm hover:bg-[#5E4B8B] transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-2"
          >
            {submitting ? "Creating workspace…" : "Create workspace"}
          </button>
        </form>
      </div>

      <p className="text-center text-sm text-[#8888A0] mt-6">
        Already have an account?{" "}
        <Link href="/login" className="text-[#7660A8] font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}
