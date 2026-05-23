"use client"

import { useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"

export default function JoinPage() {
  const { code } = useParams<{ code: string }>()
  const router = useRouter()

  // Auto-redirect to register after a brief splash so the invite code can be shown
  useEffect(() => {
    const t = setTimeout(() => {
      router.replace(`/register?invite=${code}`)
    }, 2000)
    return () => clearTimeout(t)
  }, [code, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9F8FC]">
      <div className="bg-white rounded-2xl border border-[#EBEBF0] shadow-sm p-10 max-w-sm w-full mx-4 text-center">
        <div className="w-12 h-12 rounded-full bg-[#EDE9F7] flex items-center justify-center mx-auto mb-4">
          <span className="text-[#7660A8] text-xl">🏢</span>
        </div>
        <h1 className="text-xl font-semibold text-[#1A1A2E] mb-2">You're invited!</h1>
        <p className="text-sm text-[#8888A0] mb-6">
          Someone shared access to their DClaw Space workspace.
          Create your account to get started.
        </p>
        <p className="text-xs font-mono bg-[#F3F1F9] text-[#7660A8] px-3 py-2 rounded-lg mb-6">
          Invite code: {code}
        </p>
        <Link
          href={`/register?invite=${code}`}
          className="block w-full py-2.5 rounded-full bg-[#7660A8] text-white text-sm font-medium hover:bg-[#5E4B8B] transition-colors text-center"
        >
          Create Account
        </Link>
        <p className="text-xs text-[#8888A0] mt-4">
          Already have an account?{" "}
          <Link href="/login" className="text-[#7660A8] hover:underline">Sign in</Link>
        </p>
        <p className="text-xs text-[#D1D1DB] mt-6">Redirecting automatically…</p>
      </div>
    </div>
  )
}
