"use client"
import { useState, FormEvent } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { login } from "@/lib/api"
import { useAuth } from "@/context/AuthContext"

export default function LoginPage() {
  const { setToken } = useAuth()
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError("")
    setSubmitting(true)
    try {
      const { access_token } = await login({ email, password })
      setToken(access_token)
      router.replace("/")
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Login failed"
      setError(msg.includes("401") || msg.includes("400") ? "Invalid email or password." : msg)
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
        <h1 className="text-2xl font-semibold text-[#1A1A2E]">Welcome back</h1>
        <p className="text-sm text-[#8888A0] mt-1">Sign in to DClaw Space</p>
      </div>

      {/* Card */}
      <div className="bg-white border border-[#EBEBF0] shadow-sm rounded-2xl p-8">
        {error && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 text-red-600 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#8888A0] mb-1.5" htmlFor="email">
              Email address
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

          <div>
            <label className="block text-xs font-medium text-[#8888A0] mb-1.5" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full border border-[#EBEBF0] rounded-lg px-3 py-2.5 text-sm text-[#1A1A2E] placeholder:text-[#C0C0CC] focus:outline-none focus:ring-2 focus:ring-[#7660A8] focus:border-transparent transition"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-full bg-[#7660A8] text-white font-medium py-2.5 text-sm hover:bg-[#5E4B8B] transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-2"
          >
            {submitting ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>

      <p className="text-center text-sm text-[#8888A0] mt-6">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-[#7660A8] font-medium hover:underline">
          Create workspace
        </Link>
      </p>
    </div>
  )
}
