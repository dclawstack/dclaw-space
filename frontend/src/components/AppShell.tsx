"use client"
import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/context/AuthContext"
import CopilotPanel from "@/components/CopilotPanel"

const AUTH_ROUTES = ["/login", "/register"]

const navLinks = [
  { href: "/", label: "Dashboard" },
  { href: "/desks", label: "Desks" },
  { href: "/rooms", label: "Rooms" },
  { href: "/bookings", label: "My Bookings" },
  { href: "/floors", label: "Floor Plans" },
  { href: "/presence", label: "Who's In" },
  { href: "/visitors", label: "Visitors" },
  { href: "/analytics", label: "Analytics" },
]

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  const isAuthRoute = AUTH_ROUTES.includes(pathname)

  useEffect(() => {
    if (!loading && !user && !isAuthRoute) {
      router.replace("/login")
    }
  }, [loading, user, isAuthRoute, router])

  // On auth routes: just render children (auth layout handles its own shell)
  if (isAuthRoute) {
    return <>{children}</>
  }

  // While checking stored token
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9F8FC]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#7660A8] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-[#8888A0]">Loading…</p>
        </div>
      </div>
    )
  }

  // Not authenticated and not on auth route — redirect is in-flight
  if (!user) {
    return null
  }

  const displayName = `${user.first_name} ${user.last_name}`.trim() || user.email

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 border-r border-[#EBEBF0] bg-white flex flex-col">
        <div className="px-5 py-5 border-b border-[#EBEBF0]">
          <span className="text-lg font-semibold text-[#7660A8]">DClaw Space</span>
          <p className="text-[10px] text-[#8888A0] mt-0.5">Workspace OS</p>
        </div>
        <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-[#3D3D4E] hover:bg-[#F3F1F9] hover:text-[#7660A8] transition-colors"
            >
              {link.label}
            </Link>
          ))}
          {user.role === "admin" && (
            <Link
              href="/admin"
              className="block px-3 py-2 rounded-lg text-sm font-medium text-[#3D3D4E] hover:bg-[#F3F1F9] hover:text-[#7660A8] transition-colors"
            >
              Admin
            </Link>
          )}
          <Link
            href="/settings"
            className="block px-3 py-2 rounded-lg text-sm font-medium text-[#3D3D4E] hover:bg-[#F3F1F9] hover:text-[#7660A8] transition-colors"
          >
            Settings
          </Link>
        </nav>
        <div className="px-4 py-4 border-t border-[#EBEBF0] space-y-2">
          <p className="text-[11px] text-[#1A1A2E] font-medium truncate">{displayName}</p>
          <p className="text-[10px] text-[#8888A0] truncate">{user.email}</p>
          <button
            onClick={logout}
            className="mt-1 w-full text-left text-[11px] text-[#8888A0] hover:text-red-500 transition-colors"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">{children}</main>

      {/* AI Copilot — always visible when logged in */}
      <CopilotPanel />
    </div>
  )
}
