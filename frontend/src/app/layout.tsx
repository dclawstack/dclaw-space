import type { Metadata } from "next"
import { Poppins } from "next/font/google"
import Link from "next/link"
import "./globals.css"

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
})

export const metadata: Metadata = {
  title: "DClaw Space",
  description: "AI-native workspace optimization — desk booking, rooms, and floor plans",
}

const navLinks = [
  { href: "/", label: "Dashboard" },
  { href: "/desks", label: "Desks" },
  { href: "/rooms", label: "Rooms" },
  { href: "/bookings", label: "My Bookings" },
  { href: "/floors", label: "Floor Plans" },
]

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={poppins.variable}>
      <body className="min-h-screen bg-[#F8F8FA] font-sans antialiased">
        <div className="flex h-screen overflow-hidden">
          {/* Sidebar */}
          <aside className="w-56 shrink-0 border-r border-[#EBEBF0] bg-white flex flex-col">
            <div className="px-5 py-5 border-b border-[#EBEBF0]">
              <span className="text-lg font-semibold text-[#7660A8]">DClaw Space</span>
            </div>
            <nav className="flex-1 py-4 px-3 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block px-3 py-2 rounded-lg text-sm font-medium text-[#3D3D4E] hover:bg-[#F3F1F9] hover:text-[#7660A8] transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </aside>

          {/* Main content */}
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </body>
    </html>
  )
}
